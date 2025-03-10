// Если функции updateMuscleFilterOptions и filterExercises не определены в других файлах,
// добавляем базовые заглушки, чтобы ошибки не возникали.
function updateMuscleFilterOptions() {
  // Если нужна логика обновления фильтров – добавьте её здесь.
}
function filterExercises() {
  // Если нужна логика поиска – добавьте её здесь.
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
    exerciseContainer.appendChild(exerciseDiv);
  });

  // Сохраняем обновлённый список упражнений
  localStorage.setItem("exercises", JSON.stringify(exercises));
}

// Функция для запуска тренировки с одним упражнением
function startSingleExerciseWorkout(exercise) {
  // Название тренировки будет совпадать с названием упражнения
  const workoutName = exercise.title;

  // Формируем объект тренировки
  currentWorkout = {
    name: workoutName,
    exercises: [{
      name: exercise.title,
      reps: exercise.reps,
      weight: 0,         // начальное значение веса; можно изменить по необходимости
      rest: exercise.rest_time,
      setsDetails: []    // для хранения выполненных подходов
    }]
  };
  currentExerciseIndex = 0; // Единственное упражнение

  // Устанавливаем заголовок модального окна тренировки
  const workoutTitleEl = document.getElementById("workoutTitle");
  if (workoutTitleEl) {
    workoutTitleEl.textContent = currentWorkout.name;
  } else {
    console.error("Элемент с id='workoutTitle' не найден. Проверьте HTML-модальное окно.");
    return;
  }

  // Вызываем функцию loadExercise() из WorkoutSaver.js – она заполнит modal содержимым:
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

  // Если используется поиск, добавьте обработчики ниже (или удалите, если не нужно)
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
