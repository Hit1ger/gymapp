// Массив для хранения тренировок (данные сохраняются в localStorage)
let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let editingIndex = null;
let exerciseContainer = null; // Будет создан при выборе упражнения через модальное окно
let selectedExercises = new Set(); // Для модального окна выбора упражнения

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector("#modal .close");
    const addWorkoutBtn = document.getElementById("addWorkout");
    const saveWorkoutBtn = document.getElementById("saveWorkout");
    const workoutNameInput = document.getElementById("workoutName");
    const workoutList = document.getElementById("workoutList");
    const downloadWorkoutsBtn = document.getElementById("downloadWorkouts");
    const uploadWorkoutsBtn = document.getElementById("uploadWorkoutsBtn");

    renderWorkouts();

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    addWorkoutBtn.addEventListener("click", () => {
        editingIndex = null;
        workoutNameInput.value = "";
        if (exerciseContainer) {
            exerciseContainer.remove();
            exerciseContainer = null;
        }
        // Очищаем набор выбранных упражнений при создании новой тренировки
        selectedExercises.clear();
        modal.style.display = "flex";
    });

    // Логика добавления упражнения вручную через кнопку "Добавить упражнение" удалена

    function renderWorkouts() {
        workoutList.innerHTML = "";
        workouts.forEach((workout, index) => {
            const div = document.createElement("div");
            div.classList.add("workout-item");

            const span = document.createElement("span");
            span.textContent = workout.name;

            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "10px";

            const editButton = document.createElement("button");
            editButton.classList.add("edit-workout");
            editButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      <path d="m15 5 3 3" />
    </svg>
  `;
            editButton.addEventListener("click", (event) => {
                event.stopPropagation();
                openEditWorkout(index);
            });

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-workout");
            deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    </svg>
  `;
            deleteButton.addEventListener("click", (event) => {
                event.stopPropagation();
                const confirmDelete = confirm(`Удалить тренировку "${workout.name}"?`);
                if (confirmDelete) {
                    workouts.splice(index, 1);
                    localStorage.setItem("workouts", JSON.stringify(workouts));
                    renderWorkouts();
                }
            });

            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            div.appendChild(span);
            div.appendChild(buttonContainer);
            workoutList.appendChild(div);
        });
    }

    function openEditWorkout(index) {
        editingIndex = index;
        const workout = workouts[index];
        workoutNameInput.value = workout.name;
        if (exerciseContainer) {
            exerciseContainer.remove();
            exerciseContainer = null;
        }
        // При редактировании тренировки заполняем selectedExercises и создаем контейнер для упражнений
        if (workout.exercises && workout.exercises.length > 0) {
            exerciseContainer = document.createElement("div");
            exerciseContainer.id = "exerciseContainer";
            exerciseContainer.classList.add("exercise-list");
            const modalBody = document.querySelector("#modal .modal-body");
            modalBody.insertBefore(exerciseContainer, modalBody.querySelector(".bottom-buttons"));
            workout.exercises.forEach(ex => {
                selectedExercises.add(ex.name);
                const exerciseDiv = document.createElement("div");
                exerciseDiv.classList.add("exercise-item");
                exerciseDiv.innerHTML = `
      <input type="text" placeholder="Название упражнения" value="${ex.name}" required readonly>
      <div style="display: flex; gap: 10px;">
        <label>Повторения: <input type="number" placeholder="Повторения" value="${ex.reps}" required></label>
        <label>Подходы: <input type="number" placeholder="Подходы" value="${ex.sets}" required></label>
      </div>
      <div style="display: flex; gap: 10px;">
        <label>Вес: <input type="number" placeholder="Вес" value="${ex.weight}" required></label>
        <label>Перерыв (сек): <input type="number" placeholder="Перерыв (сек)" value="${ex.rest}" required></label>
      </div>
      <button class="delete-exercise" style="width: 100%; background: red; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px; margin-top: 10px;">Удалить упражнение</button>
    `;
                const deleteButton = exerciseDiv.querySelector(".delete-exercise");
                deleteButton.addEventListener("click", () => {
                    exerciseDiv.remove();
                    selectedExercises.delete(ex.name);
                });
                exerciseContainer.appendChild(exerciseDiv);
            });
        }
        modal.style.display = "flex";
    }

    saveWorkoutBtn.addEventListener("click", () => {
        const workoutName = workoutNameInput.value.trim();
        if (!workoutName) {
            alert("Введите название тренировки");
            return;
        }
        if (!exerciseContainer || exerciseContainer.children.length === 0) {
            alert("Добавьте хотя бы одно упражнение");
            return;
        }
        const exercises = [...exerciseContainer.children].map(div => {
            const inputs = div.querySelectorAll("input");
            return {
                name: inputs[0].value.trim(),
                reps: inputs[1].value.trim(),
                sets: inputs[2].value.trim(),
                weight: inputs[3].value.trim(),
                rest: inputs[4].value.trim()
            };
        });
        for (const ex of exercises) {
            if (!ex.name || !ex.reps || !ex.sets || !ex.weight || !ex.rest) {
                alert("Заполните все поля упражнения");
                return;
            }
        }
        const workout = {
            name: workoutName,
            exercises
        };
        if (editingIndex === null) {
            workouts.push(workout);
        } else {
            workouts[editingIndex] = workout;
        }
        localStorage.setItem("workouts", JSON.stringify(workouts));
        modal.style.display = "none";
        renderWorkouts();
    });

    // downloadWorkoutsBtn.addEventListener("click", downloadWorkouts);
    // uploadWorkoutsBtn.addEventListener("click", () => {
    //     document.getElementById("uploadWorkouts").click();
    // });
});

// Функции для работы с модальным окном выбора упражнения
document.getElementById("chooseExerciseBtn").addEventListener("click", function() {
    document.getElementById("exerciseSelectModal").style.display = "flex";
    loadExercisesFromBase();
    // После загрузки упражнений сразу применяем фильтрацию
    if (typeof window.filterExerciseList === "function") {
        window.filterExerciseList();
    }
});

function closeExerciseModal() {
    document.getElementById("exerciseSelectModal").style.display = "none";
}

// Функция показа модального окна описания упражнения
function showExerciseDescription(exercise) {
    document.getElementById("exerciseDescriptionText").textContent = exercise.description || "Описание отсутствует";
    document.getElementById("exerciseDescriptionModal").style.display = "flex";
}

function closeExerciseDescriptionModal() {
    document.getElementById("exerciseDescriptionModal").style.display = "none";
}

function loadExercisesFromBase() {
    const exercises = JSON.parse(localStorage.getItem("exercises")) || [];
    const exerciseList = document.getElementById("exerciseListModal");
    const searchInput = document.getElementById("exerciseSearch");
    const muscleSelect = document.getElementById("muscleFilterSelect");

    // Функция обновления селекта групп мышц в зависимости от поискового запроса
    function updateMuscleSelect() {
        const currentSelection = muscleSelect.value; // сохраняем текущее значение
        const searchTerm = searchInput.value.toLowerCase();
        const filteredExercises = exercises.filter(ex => ex.title.toLowerCase().includes(searchTerm));
        const muscleGroups = new Set();
        filteredExercises.forEach(ex => {
            if (ex.muscle_group && Array.isArray(ex.muscle_group)) {
                ex.muscle_group.forEach(m => muscleGroups.add(m));
            }
        });
        muscleSelect.innerHTML = `<option value="">Все группы мышц</option>`;
        muscleGroups.forEach(muscle => {
            const option = document.createElement("option");
            option.value = muscle;
            option.textContent = muscle;
            muscleSelect.appendChild(option);
        });
        // Если ранее выбранная группа присутствует, восстановим её
        const options = Array.from(muscleSelect.options).map(opt => opt.value);
        if (options.includes(currentSelection)) {
            muscleSelect.value = currentSelection;
        }
    }

    // Функция фильтрации списка упражнений
    function filterExerciseList() {
        updateMuscleSelect();
        const searchTerm = searchInput.value.toLowerCase();
        const muscleFilter = muscleSelect.value;
        let visibleCount = 0;
        exerciseList.querySelectorAll(".exercise-item-block").forEach(item => {
            const title = item.getAttribute("data-title").toLowerCase();
            const muscle = item.getAttribute("data-muscle");
            let matches = title.includes(searchTerm);
            if (muscleFilter) {
                matches = matches && muscle.includes(muscleFilter.toLowerCase());
            }
            item.style.display = matches ? "flex" : "none";
            if (matches) visibleCount++;
        });
        const resultSpan = document.getElementById("searchResultCount");
        if (searchTerm.trim() !== "") {
            resultSpan.textContent = "Результаты поиска: " + visibleCount;
            resultSpan.style.display = "block";
        } else {
            resultSpan.textContent = "";
            resultSpan.style.display = "none";
        }
    }
    // Делаем функцию filterExerciseList доступной глобально для сброса поиска
    window.filterExerciseList = filterExerciseList;

    // Первоначальное обновление селекта
    updateMuscleSelect();

    // Очищаем список перед загрузкой
    exerciseList.innerHTML = "";
    exercises.forEach(exercise => {
        const item = document.createElement("div");
        item.classList.add("exercise-item-block");
        item.setAttribute("data-title", exercise.title);
        item.setAttribute("data-muscle", (exercise.muscle_group || []).join(" ").toLowerCase());

        // Добавляем обработчик клика на весь блок для добавления упражнения
        item.addEventListener("click", () => selectExercise(exercise));

        // Создаем элемент для названия упражнения
        const titleSpan = document.createElement("span");
        titleSpan.textContent = exercise.title;

        // Кнопка-инфо для открытия описания упражнения
        const infoButton = document.createElement("button");
        infoButton.classList.add("info-btn");
        infoButton.innerHTML = "ℹ️";
        infoButton.addEventListener("click", (e) => {
            e.stopPropagation();
            showExerciseDescription(exercise);
        });

        item.appendChild(titleSpan);
        item.appendChild(infoButton);

        // Если упражнение уже выбрано, выделяем его
        if (selectedExercises.has(exercise.title)) {
            item.style.backgroundColor = "lightgreen";
        }
        exerciseList.appendChild(item);
    });

    searchInput.addEventListener("input", filterExerciseList);
    muscleSelect.addEventListener("change", filterExerciseList);
}

function selectExercise(exercise) {
    if (selectedExercises.has(exercise.title)) return;
    selectedExercises.add(exercise.title);
    document.querySelectorAll("#exerciseListModal .exercise-item-block").forEach(item => {
        if (item.getAttribute("data-title") === exercise.title) {
            item.style.backgroundColor = "lightgreen";
        }
    });
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise-item");
    exerciseDiv.innerHTML = `
<input type="text" placeholder="Название упражнения" value="${exercise.title}" required readonly>
<div style="display: flex; gap: 10px;">
  <label>Повторения: <input type="number" placeholder="Повторения" value="${exercise.reps}" required></label>
  <label>Подходы: <input type="number" placeholder="Подходы" value="${exercise.sets}" required></label>
</div>
<div style="display: flex; gap: 10px;">
  <label>Вес (кг): <input type="number" placeholder="Вес (кг)" value="" required></label>
  <label>Перерыв (сек): <input type="number" placeholder="Перерыв (сек)" value="${exercise.rest_time || 60}" required></label>
</div>
<button class="delete-exercise" style="width: 100%; background: red; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px; margin-top: 10px;">
  Удалить упражнение
</button>
`;
    const deleteButton = exerciseDiv.querySelector(".delete-exercise");
    deleteButton.addEventListener("click", () => {
        exerciseDiv.remove();
        selectedExercises.delete(exercise.title);
        document.querySelectorAll("#exerciseListModal .exercise-item-block").forEach(item => {
            if (item.getAttribute("data-title") === exercise.title) {
                item.style.backgroundColor = "";
            }
        });
    });
    if (!document.getElementById("exerciseContainer")) {
        const modalBody = document.querySelector("#modal .modal-body");
        exerciseContainer = document.createElement("div");
        exerciseContainer.id = "exerciseContainer";
        exerciseContainer.classList.add("exercise-list");
        modalBody.insertBefore(exerciseContainer, modalBody.querySelector(".bottom-buttons"));
    }
    document.getElementById("exerciseContainer").appendChild(exerciseDiv);
    closeExerciseModal();
}

// Глобальная функция сброса поиска
function resetSearch() {
    const searchInput = document.getElementById("exerciseSearch");
    searchInput.value = "";
    if (typeof filterExerciseList === 'function') {
        filterExerciseList();
    }
}

// Функция обработки загрузки файла и сохранения данных в localStorage
function uploadData(event, key) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            // Проверяем тип данных по необходимости, здесь просто сохраняем
            localStorage.setItem(key, JSON.stringify(loadedData));
            alert("JSON загружен успешно");
            // При необходимости можно перезагрузить страницу или обновить отображение
        } catch (error) {
            alert("Ошибка загрузки файла! Убедитесь, что это корректный JSON.");
        }
    };
    reader.readAsText(file);
}