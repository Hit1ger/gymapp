// Глобальные переменные
let currentRest = 90;
let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let currentWorkout = null;
let currentExerciseIndex = 0;
let setCount = 0;
let exerciseSets = [];

document.addEventListener("DOMContentLoaded", () => {
    // При загрузке, привязываем обработчик на кнопку "Начать тренировку"
    document.getElementById("startWorkout").addEventListener("click", () => {
        loadWorkouts();
        document.getElementById("workoutModal").style.display = "flex";
    });
});

// Функция закрытия модальных окон
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Функция загрузки списка тренировок (для выбора)
function loadWorkouts() {
    const workoutList = document.getElementById("workoutList");
    workoutList.innerHTML = "";
    if (workouts.length === 0) {
        workoutList.innerHTML = "<span>Нет сохраненных тренировок</span>";
        return;
    }
    workouts.forEach((workout, index) => {
        const div = document.createElement("div");
        div.classList.add("workout-item");
        div.textContent = workout.name;
        div.addEventListener("click", () => startWorkout(index));
        workoutList.appendChild(div);
    });
}

// Функция запуска тренировки (выбирается тренировка из списка)
function startWorkout(index) {
    currentWorkout = workouts[index];
    currentWorkout.startTime = null;
    currentExerciseIndex = 0;
    currentWorkout.exercises.forEach(e => e.setsDetails = []);
    document.getElementById("workoutTitle").textContent = currentWorkout.name;
    loadExercise();
    closeModal("workoutModal");
    document.getElementById("exerciseModal").style.display = "flex";
}

// Функция отображения текущего упражнения
function loadExercise() {
    const exercise = currentWorkout.exercises[currentExerciseIndex];
    setCount = exercise.setsDetails.length;
    document.getElementById("setCount").textContent = setCount;
    const exerciseContainer = document.getElementById("exerciseContainer");
    exerciseContainer.innerHTML = `
         <p><strong>Упражнение:</strong> ${exercise.name}</p>
         <label>Повторений:</label>
         <div style="display: flex; align-items: center; gap: 10px;">
             <button type="button" id="decreaseReps">−</button>
             <input type="number" id="reps" value="${exercise.reps}" style="text-align: center; width: 120px;">
             <button type="button" id="increaseReps">+</button>
         </div>
         <label>Вес (кг):</label>
         <div style="display: flex; align-items: center; gap: 10px;">
             <button type="button" id="decreaseWeight">−</button>
             <input type="number" id="weight" value="${exercise.weight}" step="0.5" style="text-align: center; width: 120px;">
             <button type="button" id="increaseWeight">+</button>
         </div>
     `;
    currentRest = exercise.rest || 30;
    addExerciseControls();
    updateNavigationButtons();
}

// Обработчик кнопки "Подход"
document.getElementById("addSetButton").addEventListener("click", () => {
    if (!currentWorkout.startTime) {
        currentWorkout.startTime = Date.now();
    }
    const reps = document.getElementById("reps").value;
    const weight = document.getElementById("weight").value;
    currentWorkout.exercises[currentExerciseIndex].setsDetails.push({ reps, weight });
    setCount = currentWorkout.exercises[currentExerciseIndex].setsDetails.length;
    document.getElementById("setCount").textContent = setCount;
    startTimer(currentRest);
});

// Функция таймера (с дыхательным циклом)
function startTimer(seconds) {
    const timerElement = document.getElementById("timer");
    // const breathTextElement = document.getElementById("breathText"); // логика фаз дыхания закомментирована
    // Вместо этого создаём или получаем элемент для подсказок:
    let tipTextElement = document.getElementById("tipText");
    if (!tipTextElement) {
        tipTextElement = document.createElement("div");
        tipTextElement.id = "tipText";
        tipTextElement.style.color = "white";
        tipTextElement.style.textAlign = "center";
        tipTextElement.style.marginTop = "10px";
        // Предположим, что он должен располагаться под таймером внутри оверлея:
        document.getElementById("overlay").appendChild(tipTextElement);
    }

    const overlay = document.getElementById("overlay");
    overlay.style.display = "flex";

    // Загружаем подсказки из localStorage (если нет, используем дефолтный массив)
    const tips = JSON.parse(localStorage.getItem("tips")) || [
        "Не забывайте дышать глубоко",
        "Сосредоточьтесь на качестве повторений",
        "Держите спину ровной",
        "Контролируйте каждое движение"
    ];

    let elapsed = 0;
    let remaining = seconds;
    timerElement.textContent = `${remaining}`;

    // Первоначальная установка подсказки
    tipTextElement.textContent = tips[Math.floor(Math.random() * tips.length)];

    const interval = setInterval(() => {
        remaining--;
        elapsed++;

        if (remaining > 0) {
            timerElement.textContent = `${remaining}`;
        } else {
            clearInterval(interval);
            timerElement.textContent = "GO!";
            tipTextElement.textContent = "";
            overlay.style.display = "none";
            return;
        }

        // Закомментированная логика фаз дыхательного цикла:
        /*
        const phases = [
            { text: "Вдох", duration: 3 },
            { text: "Пауза", duration: 2 },
            { text: "Выдох", duration: 5 },
            { text: "Пауза", duration: 2 }
        ];
        const totalCycle = phases.reduce((sum, phase) => sum + phase.duration, 0);
        const currentPhaseTime = elapsed % totalCycle;
        let phaseStart = 0;
        for (let i = 0; i < phases.length; i++) {
            if (currentPhaseTime < phaseStart + phases[i].duration) {
                breathTextElement.textContent = phases[i].text;
                break;
            }
            phaseStart += phases[i].duration;
        }
        */

        // Новая логика умных подсказок: меняем текст каждые 30 секунд
        if (elapsed % 30 === 0) {
            const randomIndex = Math.floor(Math.random() * tips.length);
            tipTextElement.textContent = tips[randomIndex];
        }
    }, 1000);
}


// Обработчики кнопок перехода между упражнениями
document.getElementById("nextExercise").addEventListener("click", () => {
    const newWeight = parseFloat(document.getElementById("weight").value);
    const newReps = parseInt(document.getElementById("reps").value);
    currentWorkout.exercises[currentExerciseIndex].weight = newWeight;
    currentWorkout.exercises[currentExerciseIndex].reps = newReps;
    workouts = workouts.map(workout => workout.name === currentWorkout.name ? currentWorkout : workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
        currentExerciseIndex++;
        loadExercise();
    } else {
        saveWorkoutHistory();
        closeModal("exerciseModal");
    }
});

document.getElementById("prevExercise").addEventListener("click", () => {
    if (currentExerciseIndex > 0) {
        currentExerciseIndex--;
        loadExercise();
    }
});

document.getElementById("saveProgress").addEventListener("click", () => {
    const newWeight = parseFloat(document.getElementById("weight").value);
    const newReps = parseInt(document.getElementById("reps").value);
    currentWorkout.exercises[currentExerciseIndex].weight = newWeight;
    currentWorkout.exercises[currentExerciseIndex].reps = newReps;
    workouts = workouts.map(workout => workout.name === currentWorkout.name ? currentWorkout : workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    saveWorkoutHistory();
    alert("Тренировка сохранена!");
    closeModal("exerciseModal");
});

// Функция сохранения истории тренировки
function saveWorkoutHistory() {
    const now = new Date();
    let durationFormatted = "0 мин 0 сек";
    if (currentWorkout.startTime) {
        const duration = now.getTime() - currentWorkout.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        durationFormatted = `${minutes} мин ${seconds} сек`;
    }
    let exercisesData = JSON.parse(localStorage.getItem("exercises")) || [];
    history.push({
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        name: currentWorkout.name,
        duration: durationFormatted,
        exercises: currentWorkout.exercises.map(e => {
            let exerciseInfo = exercisesData.find(item =>
                item.title.toLowerCase().trim() === e.name.toLowerCase().trim()
            );
            return {
                name: e.name,
                muscle_group: exerciseInfo ? exerciseInfo.muscle_group : null,
                setsDetails: e.setsDetails
            };
        })
    });
    localStorage.setItem("history", JSON.stringify(history));
    
    // Вызываем функцию обновления цвета SVG сразу после сохранения тренировки
    if (typeof updateMuscleColors === "function") {
        updateMuscleColors(history);
    }
}


// Функция обновления отображения кнопок навигации (Следующее/Назад)
function updateNavigationButtons() {
    const prevButton = document.getElementById("prevExercise");
    const nextButton = document.getElementById("nextExercise");
    prevButton.style.display = currentExerciseIndex > 0 ? "block" : "none";
    if (currentExerciseIndex >= currentWorkout.exercises.length - 1) {
        nextButton.style.display = "none";
        prevButton.style.flex = "1 1 100%";
    } else {
        nextButton.style.display = "block";
        prevButton.style.flex = "1";
    }
}

// Функция для управления кнопками изменения повторений и веса
function addExerciseControls() {
    document.getElementById("increaseReps").addEventListener("click", () => {
        const repsInput = document.getElementById("reps");
        repsInput.value = parseInt(repsInput.value) + 1;
    });
    document.getElementById("decreaseReps").addEventListener("click", () => {
        const repsInput = document.getElementById("reps");
        repsInput.value = Math.max(0, parseInt(repsInput.value) - 1);
    });
    document.getElementById("increaseWeight").addEventListener("click", () => {
        const weightInput = document.getElementById("weight");
        weightInput.value = (parseFloat(weightInput.value) + 0.5).toFixed(1);
    });
    document.getElementById("decreaseWeight").addEventListener("click", () => {
        const weightInput = document.getElementById("weight");
        weightInput.value = Math.max(0, parseFloat(weightInput.value) - 0.5).toFixed(1);
    });
}
