// Если функции updateMuscleFilterOptions и filterExercises не определены в других файлах,
// добавляем базовые заглушки, чтобы избежать ошибок.
function updateMuscleFilterOptions() {
  // Заглушка: если нужна более сложная логика, реализуйте её здесь.
  // Например, можно оставить пустым, если фильтрация не требуется.
}
function filterExercises() {
  // Заглушка: можно оставить пустым.
}

let exercises = [];

// Функция рендеринга списка упражнений
function renderExercises() {
  const exerciseContainer = document.getElementById("exerciseContainer");
  const exerciseCount = document.getElementById("exerciseCount");
  exerciseContainer.innerHTML = "";
  exerciseCount.textContent = `(${exercises.length})`;

  // Перебираем упражнения и для каждого создаём элемент
  exercises.forEach((exercise, index) => {
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise-item");

    // Основной блок с заголовком и информацией о группе мышц
    exerciseDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
        <div>
          <p style="font-size: 17px; color: black;">${exercise.title}</p>
          <p>Группа мышц: ${exercise.muscle_group.join(", ")}</p>
        </div>
        <span class="exercise-rating">${exercise.rating.toFixed(1)} ★</span>
      </div>
    `;

    // Скрытая часть с подробностями упражнения и кнопками
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
      <!-- Кнопка удаления упражнения -->
      <button class="delete-exercise" style="margin-top: 10px; width: 100%; background: red; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px;">
        Удалить упражнение
      </button>
    `;

    // Обработчик для кнопки "Удалить упражнение"
    const deleteButton = detailsDiv.querySelector(".delete-exercise");
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation(); // чтобы не срабатывал клик по всему блоку
      if (confirm("Удалить упражнение?")) {
        exercises.splice(index, 1); // удаляем упражнение из массива
        localStorage.setItem("exercises", JSON.stringify(exercises));
        renderExercises(); // перерисовываем список
      }
    });

    // Обработчик для кнопки "Сделать упражнение"
    const doExerciseButton = detailsDiv.querySelector(".do-exercise");
    doExerciseButton.addEventListener("click", (event) => {
      event.stopPropagation();
      startSingleExerciseWorkout(exercise);
    });

    exerciseDiv.appendChild(detailsDiv);

    // Переключение отображения деталей по клику на весь блок упражнения
    exerciseDiv.addEventListener("click", () => {
      detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
    });

    // Добавляем атрибут для фильтрации по группам мышц
    exerciseDiv.setAttribute("data-muscle-group", exercise.muscle_group.map(m => m.trim()).join(","));
    exerciseContainer.appendChild(exerciseDiv);
  });

  // Сохраняем обновлённый список упражнений в localStorage
  localStorage.setItem("exercises", JSON.stringify(exercises));
}

// Функция для запуска тренировки с одним упражнением
function startSingleExerciseWorkout(exercise) {
  // Формируем имя тренировки как имя упражнения (без префикса, если нужно)
  const workoutName = exercise.title; // или "Тренировка: " + exercise.title

  // Создаём объект тренировки с одним упражнением
  currentWorkout = {
    name: workoutName,
    exercises: [{
      name: exercise.title,
      reps: exercise.reps,
      weight: 0, // начальное значение веса
      rest: exercise.rest_time,
      setsDetails: [] // массив для хранения выполненных подходов
    }]
  };
  currentExerciseIndex = 0; // начинаем с первого (единственного) упражнения

  // Пытаемся установить заголовок модального окна
  const workoutTitleEl = document.getElementById("workoutTitle");
  if (workoutTitleEl) {
    workoutTitleEl.textContent = currentWorkout.name;
  } else {
    console.error("Элемент с id='workoutTitle' не найден. Добавьте модальное окно с этим элементом в HTML.");
    return;
  }

  // Вызываем функцию loadExercise() из WorkoutSaver.js для загрузки упражнения в модальное окно
  if (typeof loadExercise === "function") {
    loadExercise();
  } else {
    console.error("Функция loadExercise не найдена. Убедитесь, что файл WorkoutSaver.js подключён.");
    return;
  }

  // Открываем модальное окно тренировки
  const exerciseModal = document.getElementById("exerciseModal");
  if (exerciseModal) {
    exerciseModal.style.display = "flex";
  } else {
    console.error("Элемент с id='exerciseModal' не найден. Добавьте модальное окно в HTML.");
  }
}

// Пример: загрузка упражнений и навешивание обработчиков после загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
  // Попытка загрузить упражнения из localStorage
  const storedExercises = localStorage.getItem("exercises");
  if (storedExercises) {
    exercises = JSON.parse(storedExercises);
  }
  renderExercises();
  updateMuscleFilterOptions();

  // Если присутствует поле поиска, восстанавливаем его значение
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

  // Если есть селектор фильтра по мышечным группам, навешиваем обработчик
  const muscleFilter = document.getElementById("muscleFilter");
  if (muscleFilter) {
    muscleFilter.addEventListener("change", function () {
      localStorage.setItem("muscleFilterValue", this.value);
      filterExercises();
    });
  }
});
