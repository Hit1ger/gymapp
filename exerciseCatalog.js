// Функция обновления опций фильтра (группы мышц)
function updateMuscleFilterOptions() {
  const muscleFilter = document.getElementById("muscleFilter");
  const searchInput = document.getElementById("searchInput");
  if (!muscleFilter || !searchInput) return;
  
  const searchValue = searchInput.value.toLowerCase();

  // Фильтруем упражнения, учитывая поисковый запрос
  const filtered = exercises.filter(exercise => {
    const allText = exercise.title + " " + exercise.description + " " + exercise.muscle_group.join(" ");
    return allText.toLowerCase().includes(searchValue);
  });

  // Собираем группы мышц из отфильтрованных упражнений
  const muscleGroups = new Set();
  filtered.forEach(ex => {
    ex.muscle_group.forEach(m => muscleGroups.add(m.trim()));
  });

  // Восстанавливаем выбранное значение из localStorage
  const storedMuscleFilter = localStorage.getItem("muscleFilterValue") || "";

  // Обновляем содержимое селектора
  muscleFilter.innerHTML = `<option value="">Все группы мышц</option>`;
  muscleGroups.forEach(muscle => {
    const option = document.createElement("option");
    option.value = muscle;
    option.textContent = muscle;
    muscleFilter.appendChild(option);
  });

  // Если в localStorage хранится выбранная группа и она есть в множестве, то устанавливаем её
  if (storedMuscleFilter && muscleGroups.has(storedMuscleFilter)) {
    muscleFilter.value = storedMuscleFilter;
  } else {
    muscleFilter.value = "";
    localStorage.setItem("muscleFilterValue", "");
  }
}

// Функция фильтрации упражнений по поисковому запросу и выбранной группе мышц
function filterExercises() {
  const searchInput = document.getElementById("searchInput");
  const muscleFilter = document.getElementById("muscleFilter");
  if (!searchInput || !muscleFilter) return;
  
  const searchValue = searchInput.value.toLowerCase();
  const selectedMuscle = muscleFilter.value.trim();

  document.querySelectorAll(".exercise-item").forEach(item => {
    // Текст внутри элемента включает заголовок, описание и прочее
    const text = item.textContent.toLowerCase();
    // Проверяем соответствие поисковому запросу
    const matchesSearch = text.includes(searchValue);
    // Проверяем, если выбрана группа мышц – есть ли она в data-атрибуте
    const itemMuscles = item.getAttribute("data-muscle-group")?.split(",").map(m => m.trim()) || [];
    const matchesMuscle = selectedMuscle === "" || itemMuscles.includes(selectedMuscle);

    if (matchesSearch && matchesMuscle) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });

  // Обновляем счетчик результатов поиска (если требуется)
  const visibleCount = document.querySelectorAll(".exercise-item[style*='display: block']").length;
  const searchResultCount = document.getElementById("searchResultCount");
  if (searchResultCount) {
    if (searchValue.trim() !== "") {
      searchResultCount.textContent = "Результаты поиска: " + visibleCount;
      searchResultCount.style.display = "block";
    } else {
      searchResultCount.textContent = "";
      searchResultCount.style.display = "none";
    }
}



// Если функции updateMuscleFilterOptions и filterExercises не определены в других файлах,
// добавляем базовые заглушки, чтобы ошибки не возникали.
function updateMuscleFilterOptions() {
  // Добавьте логику, если необходимо.
}
function filterExercises() {
  // Добавьте логику, если необходимо.
}

let exercises = [];

// Функция рендеринга списка упражнений
function renderExercises() {
  const exerciseList = document.getElementById("exerciseList");
  const exerciseCount = document.getElementById("exerciseCount");
  exerciseList.innerHTML = "";
  exerciseCount.textContent = `(${exercises.length})`;

  // Перебираем упражнения и для каждого создаём элемент
  exercises.forEach((exercise, index) => {
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise-item");

    // Основной блок с информацией об упражнении
    exerciseDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
        <div>
          <p style="font-size: 17px; color: black;">${exercise.title}</p>
          <p>Группа мышц: ${exercise.muscle_group.join(", ")}</p>
        </div>
        <span class="exercise-rating">${exercise.rating.toFixed(1)} ★</span>
      </div>
    `;

    // Скрытая часть с подробностями и кнопками
    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("exercise-details");
    detailsDiv.style.display = "none";
    detailsDiv.innerHTML = `
      <p>${exercise.description}</p>
      <p>Подходы: ${exercise.sets}</p>
      <p>Повторения: ${exercise.reps}</p>
      <p>Перерыв: ${exercise.rest_time} секунд</p>
      <p>Оборудование: ${exercise.equipment}</p>
      <!-- Кнопка "Сделать упражнение" -->
      <button class="do-exercise" style="margin-bottom: 5px; width: 100%; background: green; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px;">
        Сделать упражнение
      </button>
      <!-- Кнопка "Удалить упражнение" -->
      <button class="delete-exercise" style="margin-top: 10px; width: 100%; background: red; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px;">
        Удалить упражнение
      </button>
    `;

    // Обработчик для кнопки "Удалить упражнение"
    const deleteButton = detailsDiv.querySelector(".delete-exercise");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (confirm("Удалить упражнение?")) {
        exercises.splice(index, 1);
        localStorage.setItem("exercises", JSON.stringify(exercises));
        renderExercises();
      }
    });

    // Обработчик для кнопки "Сделать упражнение"
    const doExerciseButton = detailsDiv.querySelector(".do-exercise");
    doExerciseButton.addEventListener("click", (event) => {
      event.stopPropagation();
      startSingleExerciseWorkout(exercise);
    });

    exerciseDiv.appendChild(detailsDiv);

    // Переключение отображения деталей по клику на элемент упражнения
    exerciseDiv.addEventListener("click", () => {
      detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
    });

    // Добавляем атрибут для фильтрации по группам мышц (если используется)
    exerciseDiv.setAttribute("data-muscle-group", exercise.muscle_group.map(m => m.trim()).join(","));
    exerciseList.appendChild(exerciseDiv);
  });

  // Сохраняем обновлённый список упражнений
  localStorage.setItem("exercises", JSON.stringify(exercises));
}

function startSingleExerciseWorkout(exercise) {
  // Получаем список упражнений из localStorage
  const storedExercises = JSON.parse(localStorage.getItem("exercises")) || [];
  // Ищем упражнение по названию (без учета регистра и лишних пробелов)
  const currentExerciseData = storedExercises.find(item =>
    item.title.toLowerCase().trim() === exercise.title.toLowerCase().trim()
  );
  if (!currentExerciseData) {
    console.error("Упражнение не найдено в localStorage.");
    return;
  }

  // Формируем объект тренировки, используя данные из localStorage
  currentWorkout = {
    name: currentExerciseData.title,
    exercises: [{
      name: currentExerciseData.title,
      reps: currentExerciseData.reps,
      weight: 0, // начальное значение веса
      rest: currentExerciseData.rest_time,
      setsDetails: []
    }]
  };
  currentExerciseIndex = 0; // единственное упражнение

  // Устанавливаем заголовок модального окна тренировки
  const workoutTitleEl = document.getElementById("workoutTitle");
  if (workoutTitleEl) {
    workoutTitleEl.textContent = currentWorkout.name;
  } else {
    console.error("Элемент с id='workoutTitle' не найден. Проверьте HTML-модальное окно.");
    return;
  }

  // Вызываем функцию loadExercise() из WorkoutSaver.js, чтобы сформировать интерфейс тренировки
  if (typeof loadExercise === "function") {
    loadExercise();
  } else {
    console.error("Функция loadExercise не найдена. Проверьте подключение файла WorkoutSaver.js.");
    return;
  }

  // Открываем модальное окно тренировки
  const exerciseModal = document.getElementById("exerciseModal");
  if (exerciseModal) {
    exerciseModal.style.display = "flex";
  } else {
    console.error("Элемент с id='exerciseModal' не найден. Проверьте HTML-модальное окно.");
  }
}

// Загрузка упражнений и установка обработчиков при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  // Загрузка упражнений из localStorage, если они там есть
  const storedExercises = localStorage.getItem("exercises");
  if (storedExercises) {
    exercises = JSON.parse(storedExercises);
  }
  renderExercises();
  updateMuscleFilterOptions();

  // Обработчик для поля поиска, если используется
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    const storedSearchValue = localStorage.getItem("searchInputValue");
    if (storedSearchValue !== null) {
      searchInput.value = storedSearchValue;
    }
    searchInput.addEventListener("input", function () {
      localStorage.setItem("searchInputValue", this.value);
      filterExercises();
      updateMuscleFilterOptions();
    });
  }

  const muscleFilter = document.getElementById("muscleFilter");
  if (muscleFilter) {
    muscleFilter.addEventListener("change", function () {
      localStorage.setItem("muscleFilterValue", this.value);
      filterExercises();
    });
  }
});
