let currentRest = 90;
let workouts = [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let currentWorkout = null;
let currentExerciseIndex = 0;
let setCount = 0;
let exerciseSets = [];

document.addEventListener("DOMContentLoaded", () => {
    workouts = JSON.parse(localStorage.getItem("workouts")) || [];
    console.log("Тренировки при загрузке страницы:", workouts);
    loadHistory();
});

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function loadHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;
    historyList.innerHTML = history.map((h, index) =>
        `<div class="history-item" onclick="toggleHistoryDetails(this, ${index})">
    <div>
      <div class="history-name">${h.name}</div>
      <div class="history-datetime">${h.date} ${h.time}</div>
    </div>
    <div class="history-duration">${h.duration || "0 мин 0 сек"}</div>
    <div class="history-details"></div>
  </div>`
    ).join("");
}

function toggleHistoryDetails(itemElement, index) {
    const detailsElement = itemElement.querySelector('.history-details');
    if (detailsElement.style.display === "none" || detailsElement.style.display === "") {
        const h = history[index];
        let details = ``;
        h.exercises.forEach(exercise => {
            details += `<p style="margin-bottom: 6px; font-size: 16px; letter-spacing: 0; line-height: 1; color: #000000;">${exercise.name}</p>`;
            exercise.setsDetails.forEach((set, i) => {
                details += `<span style="display: block; color: #666; font-size: 14px; margin-bottom: 3px;">Подход ${i + 1}: Вес - ${set.weight} кг, Повторения - ${set.reps}</span>`;
            });
        });
        // Вставляем кнопку удаления тренировки:
        details += `<button style="margin-top: 10px; padding: 5px 10px;" onclick="deleteWorkout(${index}, event)">Удалить тренировку</button>`;
        detailsElement.innerHTML = details;
        detailsElement.style.display = "block";
        itemElement.classList.add("open");
    } else {
        detailsElement.style.display = "none";
        itemElement.classList.remove("open");
    }
}

function deleteWorkout(index, event) {
    event.stopPropagation();
    if (confirm("Вы действительно хотите удалить тренировку?")) {
        history.splice(index, 1);
        localStorage.setItem("history", JSON.stringify(history));
        loadHistory();
    }
}

// Функция для скачивания данных из localStorage в виде JSON-файла
function downloadData(key, filename) {
    const data = localStorage.getItem(key) || "[]";
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

// Функция обработки загрузки файла и сохранения данных в localStorage
function uploadData(event, key) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
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

// Обработчики для секции История тренировок (ключ "history")
document.getElementById("downloadWorkoutHistoryJSON").addEventListener("click", () => {
    downloadData("history", "history.json");

});
document.getElementById("uploadWorkoutHistoryJSON").addEventListener("click", () => {
    document.getElementById("uploadHistoryInput").click();
});
document.getElementById("uploadHistoryInput").addEventListener("change", (e) => {
    uploadData(e, "history");
});