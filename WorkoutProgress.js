// Сопоставление мышц и id SVG-элементов с поддержкой нескольких ID
const muscleMapping = {
    "Ноги": ["quads"],
    "Ягодицы": ["glutes"],
    "Грудь": ["chest"],
    "Трицепс": ["triceps"],
    "Плечи": ["front-shoulders", "rear-shoulders"],
    "Бицепс": ["biceps"],
    "Пресс": ["abdominals"],
    "Спина": ["obliques", "lats", "traps-middle", "lowerback"],
    "Икры": ["calves", "calves2"],
    "Внутренняя поверхность бедра": ["hamstrings"],
    "Трапеция": ["traps", "traps2"]
};

function parseDate(dateStr) {
    const parts = dateStr.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function daysDiff(dateStr) {
    const now = new Date();
    const workoutDate = parseDate(dateStr);
    return (now - workoutDate) / (1000 * 60 * 60 * 24);
}

function muscleWorkedRecently(muscle, workoutData, days) {
    return workoutData.some(entry =>
        daysDiff(entry.date) <= days &&
        entry.exercises.some(ex => ex.muscle_group.includes(muscle))
    );
}

function noWorkoutForMuscleDays(muscle, workoutData, days) {
    return !muscleWorkedRecently(muscle, workoutData, days);
}

// Полностью исправленная функция проверки прогресса
function isProgressive(muscle, workoutData) {
    const relevantWorkouts = workoutData
        .filter(entry => entry.exercises.some(ex => ex.muscle_group.includes(muscle)))
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    if (relevantWorkouts.length < 2) return false;

    const [latestWorkout, previousWorkout] = relevantWorkouts;

    for (let latestExercise of latestWorkout.exercises.filter(ex => ex.muscle_group.includes(muscle))) {
        const previousExercise = previousWorkout.exercises.find(ex => ex.name === latestExercise.name);
        if (!previousExercise) continue;

        const latestMaxWeight = Math.max(...latestExercise.setsDetails.map(set => parseFloat(set.weight) || 0));
        const previousMaxWeight = Math.max(...previousExercise.setsDetails.map(set => parseFloat(set.weight) || 0));

        const latestTotalReps = latestExercise.setsDetails.reduce((sum, set) => sum + parseInt(set.reps || 0), 0);
        const previousTotalReps = previousExercise.setsDetails.reduce((sum, set) => sum + parseInt(set.reps || 0), 0);

        const latestSetsCount = latestExercise.setsDetails.length;
        const previousSetsCount = previousExercise.setsDetails.length;

        if (latestMaxWeight > previousMaxWeight || latestTotalReps > previousTotalReps || latestSetsCount > previousSetsCount) {
            return 'progress';
        } else if (latestMaxWeight < previousMaxWeight || latestTotalReps < previousTotalReps || latestSetsCount < previousSetsCount) {
            return 'regress';
        }
    }
    return false;
}


// Основная функция для обновления цветов мышц
function updateMuscleColors(workoutData) {
    Object.entries(muscleMapping).forEach(([muscle, svgIds]) => {
        const ids = Array.isArray(svgIds) ? svgIds : [svgIds];

        const progressStatus = isProgressive(muscle, workoutData);
        const workedRecently = muscleWorkedRecently(muscle, workoutData, 7);
        const noWorkoutLongTime = noWorkoutForMuscleDays(muscle, workoutData, 10);

        ids.forEach(id => {
            const svgElement = document.getElementById(id);
            if (!svgElement) return;

            if (progressStatus === 'progress') {
                svgElement.style.color = "green";  // Рост показателей
            } else if (progressStatus === 'regress') {
                svgElement.style.color = "blue";   // Снижение показателей
            } else if (workedRecently) {
                svgElement.style.color = "yellow"; // Просто была тренировка
            } else if (noWorkoutLongTime || workoutData.length === 0) {
                svgElement.style.color = "red";    // Нет тренировок давно
            } else {
                svgElement.style.color = "";       // Стандартный цвет
            }
        });
    });
}

// Получение данных из localStorage
const workoutData = JSON.parse(localStorage.getItem("history")) || [];

// Вызов функции
updateMuscleColors(workoutData);

function loadSVG(fileName, containerId) {
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки ${fileName}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(svgContent => {
            document.getElementById(containerId).innerHTML = svgContent;
        })
        .catch(error => console.error(error));
}

// Функция, вызывающая логику обновления цвета мышц
function initializeMuscleLogic() {
    const workoutData = JSON.parse(localStorage.getItem("history")) || [];
    updateMuscleColors(workoutData);
}

document.addEventListener("DOMContentLoaded", () => {
    // Загрузка обоих SVG-файлов, которые расположены в корне проекта
    loadSVG('svg1.svg', 'svgFile1');
    loadSVG('svg2.svg', 'svgFile2');

    // Для корректного обновления цвета мышц убедитесь, что оба SVG загружены.
    // Можно установить задержку или отследить завершение загрузки каждого файла.
    // В данном примере вызываем логику с небольшой задержкой.
    setTimeout(initializeMuscleLogic, 100);
});
