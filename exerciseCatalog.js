let exercises = [];

function renderExercises() {
    const exerciseContainer = document.getElementById("exerciseContainer");
    const exerciseCount = document.getElementById("exerciseCount");
    exerciseContainer.innerHTML = "";
    exerciseCount.textContent = `(${exercises.length})`;

    // Проходим по списку и рендерим
    exercises.forEach(exercise => {
        const exerciseDiv = document.createElement("div");
        exerciseDiv.classList.add("exercise-item");

        // Основной блок
        exerciseDiv.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
    <div>
      <p style="font-size: 17px; color: black;">${exercise.title}</p>
      <p>Группа мышц: ${exercise.muscle_group.join(", ")}</p>
    </div>
    <span class="exercise-rating">${exercise.rating.toFixed(1)} ★</span>
  </div>
`;

        // Скрытая часть с деталями
        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("exercise-details");
        detailsDiv.style.display = "none";
        detailsDiv.innerHTML = `
  <p>${exercise.description}</p>
  <p>Подходы: ${exercise.sets}</p>
  <p>Повторения: ${exercise.reps}</p>
  <p>Перерыв: ${exercise.rest_time} секунд</p>
  <p>Оборудование: ${exercise.equipment}</p>
`;

        exerciseDiv.appendChild(detailsDiv);

        // По клику показываем/скрываем детали
        exerciseDiv.addEventListener("click", () => {
            detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
        });

        // Для фильтрации по muscleGroup
        exerciseDiv.setAttribute("data-muscle-group", exercise.muscle_group.map(m => m.trim()).join(","));
        exerciseContainer.appendChild(exerciseDiv);
    });

    // Сохраняем обновлённый список в localStorage
    localStorage.setItem("exercises", JSON.stringify(exercises));
}

// Обновляем опции фильтра (группы мышц)
function updateMuscleFilterOptions() {
    const muscleFilter = document.getElementById("muscleFilter");
    const searchValue = document.getElementById("searchInput").value.toLowerCase();

    // Фильтруем, чтобы находить только те упражнения, которые видны при текущем поиске
    const filtered = exercises.filter(exercise => {
        const allText = exercise.title + " " + exercise.description + " " + exercise.muscle_group.join(" ");
        return allText.toLowerCase().includes(searchValue);
    });
    const muscleGroups = new Set();
    filtered.forEach(ex => ex.muscle_group.forEach(m => muscleGroups.add(m)));

    const storedMuscleFilter = localStorage.getItem("muscleFilterValue") || "";
    muscleFilter.innerHTML = `<option value="">Все группы мышц</option>`;

    muscleGroups.forEach(muscle => {
        const option = document.createElement("option");
        option.value = muscle;
        option.textContent = muscle;
        muscleFilter.appendChild(option);
    });

    if (storedMuscleFilter && muscleGroups.has(storedMuscleFilter)) {
        muscleFilter.value = storedMuscleFilter;
    } else {
        muscleFilter.value = "";
        localStorage.setItem("muscleFilterValue", "");
    }
}

function filterExercises() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const muscleValue = document.getElementById("muscleFilter").value;
    let visibleCount = 0;

    document.querySelectorAll(".exercise-item").forEach(item => {
        const matchesSearch = item.textContent.toLowerCase().includes(searchValue);
        const muscleGroups = item.getAttribute("data-muscle-group") ?
            item.getAttribute("data-muscle-group").split(",") : [];
        const matchesMuscle = !muscleValue || muscleGroups.some(m => m.trim() === muscleValue.trim());

        if (matchesSearch && matchesMuscle) {
            item.style.display = "block";
            visibleCount++;
        } else {
            item.style.display = "none";
        }
    });

    const resultSpan = document.getElementById("searchResultCount");
    if (searchValue.trim() !== "") {
        resultSpan.textContent = "Результаты поиска: " + visibleCount;
        resultSpan.style.display = "block";
    } else {
        resultSpan.textContent = "";
        resultSpan.style.display = "none";
    }
}

function resetSearch() {
    document.getElementById("searchInput").value = "";
    localStorage.setItem("searchInputValue", "");
    filterExercises();
    updateMuscleFilterOptions();
}

// Загрузка / рендер + сортировка по убыванию
document.addEventListener("DOMContentLoaded", () => {
    const storedExercises = localStorage.getItem("exercises");
    if (storedExercises) {
        exercises = JSON.parse(storedExercises);
    } else {
        // Если в localStorage ничего нет, попробуем загрузить из "db/exercise.json" (если требуется)
        // Иначе можно сразу exercises = [];
        /*
        fetch("db/exercise.json")
            .then(response => response.json())
            .then(data => { exercises = data; ... })
            .catch(error => console.error("Ошибка загрузки:", error));
        */
    }

    // ВАЖНО: сортируем exercises по убыванию rating
    // exercises.sort((a, b) => b.rating - a.rating);

    renderExercises();
    updateMuscleFilterOptions();

    // Восстанавливаем поисковый запрос, если был
    const storedSearchValue = localStorage.getItem("searchInputValue");
    if (storedSearchValue !== null) {
        document.getElementById("searchInput").value = storedSearchValue;
    }

    filterExercises();
    updateMuscleFilterOptions();

    // Навешиваем обработчики
    document.getElementById("searchInput").addEventListener("input", function () {
        localStorage.setItem("searchInputValue", this.value);
        filterExercises();
        updateMuscleFilterOptions();
    });
    document.getElementById("muscleFilter").addEventListener("change", function () {
        localStorage.setItem("muscleFilterValue", this.value);
        filterExercises();
    });
});