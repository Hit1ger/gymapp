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
            localStorage.setItem(key, JSON.stringify(loadedData));
            alert("JSON загружен успешно");
        } catch (error) {
            alert("Ошибка загрузки файла! Убедитесь, что это корректный JSON.");
        }
    };
    reader.readAsText(file);
}

// Обработчики для секции «Тренировки» (ключ "workouts")
document.getElementById("downloadWorkoutsJSON").addEventListener("click", () => {
    downloadData("workouts", "workouts.json");
});
document.getElementById("uploadWorkoutsJSON").addEventListener("click", () => {
    document.getElementById("uploadWorkoutsInput").click();
});
document.getElementById("uploadWorkoutsInput").addEventListener("change", (e) => {
    uploadData(e, "workouts");
});

// Обработчики для секции «История тренировок» (ключ "history")
document.getElementById("downloadWorkoutHistoryJSON").addEventListener("click", () => {
    downloadData("history", "history.json");
});
document.getElementById("uploadWorkoutHistoryJSON").addEventListener("click", () => {
    document.getElementById("uploadHistoryInput").click();
});
document.getElementById("uploadHistoryInput").addEventListener("change", (e) => {
    uploadData(e, "history");
});

// Обработчики для секции «Упражнения» (ключ "exercises")
document.getElementById("downloadExercisesJSON").addEventListener("click", () => {
    downloadData("exercises", "exercises.json");
});
document.getElementById("uploadExercisesJSON").addEventListener("click", () => {
    document.getElementById("uploadExercisesInput").click();
});
document.getElementById("uploadExercisesInput").addEventListener("change", (e) => {
    uploadData(e, "exercises");
});

// Обработчики для секции «Подсказки» (ключ "tips")
document.getElementById("downloadTipsJSON").addEventListener("click", () => {
    downloadData("tips", "tips.json");
});
document.getElementById("uploadTipsJSON").addEventListener("click", () => {
    document.getElementById("uploadTipsInput").click();
});

document.getElementById("uploadTipsInput").addEventListener("change", (e) => {
    uploadData(e, "tips");
});


// Новая функция для загрузки JSON «exercises» с сервера
document.getElementById("fetchExercisesFromServer").addEventListener("click", () => {
    // Здесь берём JSON-файл из репозитория GitHub (папка db/exercises.json)
    fetch("https://raw.githubusercontent.com/Hit1ger/gymapp/main/db/exercises.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem("exercises", JSON.stringify(data));
            alert("JSON с упражнениями загружен успешно с сервера!");
        })
        .catch(error => {
            alert("Не удалось загрузить JSON с сервера. Подробности в консоли.");
            console.error(error);
        });
});


