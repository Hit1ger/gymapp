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
      <!-- Новая кнопка "Сделать упражнение" -->
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
  // Создаём объект тренировки с одним упражнением
  currentWorkout = {
    name: "Тренировка: " + exercise.title,
    exercises: [{
      name: exercise.title,
      reps: exercise.reps,
      weight: 0, // начальное значение, можно изменить
      rest: exercise.rest_time,
      setsDetails: [] // массив для хранения выполненных подходов
    }]
  };
  currentExerciseIndex = 0; // начинаем с первого (единственного) упражнения

  // Устанавливаем заголовок модального окна тренировки
  document.getElementById("workoutTitle").textContent = currentWorkout.name;

  // Вызываем функцию loadExercise() из файла WorkoutSaver.js для загрузки упражнения в модальное окно
  loadExercise();

  // Открываем модальное окно тренировки
  document.getElementById("exerciseModal").style.display = "flex";
}

// Остальной код файла (функции фильтрации, восстановления поиска и т.д.) оставьте без изменений

// Пример: загрузка упражнений и навешивание обработчиков после загрузки страницы
document.addEventListener("DOMContentLoaded", () => {
  const storedExercises = localStorage.getItem("exercises");
  if (storedExercises) {
    exercises = JSON.parse(storedExercises);
  }
  renderExercises();
  updateMuscleFilterOptions();

  // Восстанавливаем поисковый запрос, если был
  const storedSearchValue = localStorage.getItem("searchInputValue");
  if (storedSearchValue !== null) {
    document.getElementById("searchInput").value = storedSearchValue;
  }
  filterExercises();
  updateMuscleFilterOptions();

  // Обработчик для поля поиска
  document.getElementById("searchInput").addEventListener("input", function () {
    localStorage.setItem("searchInputValue", this.value);
    filterExercises();
    updateMuscleFilterOptions();
  });

  // Обработчик для выбора группы мышц
  document.getElementById("muscleFilter").addEventListener("change", function () {
    localStorage.setItem("muscleFilterValue", this.value);
    filterExercises();
  });
});
