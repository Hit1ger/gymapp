// Функция для загрузки данных из localStorage (history)
function getHistoryData() {
    return JSON.parse(localStorage.getItem("history")) || [];
}

// Функция для заполнения селектов по данным из history
function loadFilters() {
    let historyData = getHistoryData();
    const workoutFilter = document.getElementById("workoutFilter");
    const exerciseFilter = document.getElementById("exerciseFilter");

    // Заполняем селект тренировок
    workoutFilter.innerHTML = '<option value="all">Все тренировки</option>';
    let workoutNames = new Set();
    historyData.forEach(entry => workoutNames.add(entry.name));
    workoutNames.forEach(name => {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        workoutFilter.appendChild(option);
    });

    updateExerciseFilter();
}

// Функция для обновления списка упражнений в зависимости от выбранной тренировки
function updateExerciseFilter() {
    let historyData = getHistoryData();
    const selectedWorkout = document.getElementById("workoutFilter").value;
    const exerciseFilter = document.getElementById("exerciseFilter");

    exerciseFilter.innerHTML = '<option value="all">Все упражнения</option>';
    let exerciseNames = new Set();

    if (selectedWorkout === "all") {
        historyData.forEach(entry => {
            entry.exercises.forEach(ex => exerciseNames.add(ex.name));
        });
    } else {
        historyData.filter(entry => entry.name === selectedWorkout)
            .forEach(entry => {
                entry.exercises.forEach(ex => exerciseNames.add(ex.name));
            });
    }

    exerciseNames.forEach(name => {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        exerciseFilter.appendChild(option);
    });

    loadAnalytics();
}

// Функция для построения аналитики по дням с данными из history
function loadAnalytics() {
    let historyData = getHistoryData();
    const selectedWorkout = document.getElementById("workoutFilter").value;
    const selectedExercise = document.getElementById("exerciseFilter").value;

    // Фильтруем историю по выбранным тренировке и упражнению
    let filteredHistory = historyData.filter(entry => {
        if (selectedWorkout !== "all" && entry.name !== selectedWorkout) return false;
        if (selectedExercise !== "all") {
            // Если ни одно упражнение в записи не совпадает с выбранным, запись не подходит
            return entry.exercises.some(ex => ex.name === selectedExercise);
        }
        return true;
    });

    // Группируем данные по дате
    // dailyData: { дата: { exerciseName: { totalSets, totalReps, totalWeight, weightCount } } }
    let dailyData = {};
    filteredHistory.forEach(entry => {
        let date = entry.date;
        if (!dailyData[date]) dailyData[date] = {};
        entry.exercises.forEach(exercise => {
            // Если выбран конкретный exercise, пропускаем остальные
            if (selectedExercise !== "all" && exercise.name !== selectedExercise) return;
            if (!dailyData[date][exercise.name]) {
                dailyData[date][exercise.name] = {
                    totalSets: 0,
                    totalReps: 0,
                    totalWeight: 0,
                    weightCount: 0
                };
            }
            // Обрабатываем каждый подход (set)
            (exercise.setsDetails || []).forEach(set => {
                dailyData[date][exercise.name].totalSets += 1;
                dailyData[date][exercise.name].totalReps += parseInt(set.reps) || 0;
                let weight = parseFloat(set.weight) || 0;
                if (weight > 0) {
                    dailyData[date][exercise.name].totalWeight += weight;
                    dailyData[date][exercise.name].weightCount += 1;
                }
            });
        });
    });

    // Определяем, какие упражнения присутствуют в отфильтрованных данных
    let exerciseNames = new Set();
    Object.values(dailyData).forEach(day => {
        Object.keys(day).forEach(exName => exerciseNames.add(exName));
    });
    exerciseNames = Array.from(exerciseNames);

    const chartsContainer = document.getElementById("chartsContainer");
    chartsContainer.innerHTML = "";

    exerciseNames.forEach(exName => {
        // Для каждого упражнения собираем данные по датам
        let dates = [];
        let avgWeights = [];
        let setsArray = [];
        let repsArray = [];

        let sortedDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
        sortedDates.forEach(date => {
            if (dailyData[date][exName]) {
                dates.push(date);
                let data = dailyData[date][exName];
                let avgWeight = data.weightCount ? data.totalWeight / data.weightCount : 0;
                avgWeights.push(avgWeight);
                setsArray.push(data.totalSets);
                repsArray.push(data.totalReps);
            }
        });

        // Создаем контейнер для графика
        let chartDiv = document.createElement("div");
        chartDiv.classList.add("chart-container");
        let canvas = document.createElement("canvas");
        canvas.id = `chart-${exName.replace(/\s+/g, "-")}`;
        chartDiv.appendChild(canvas);
        chartsContainer.appendChild(chartDiv);

        let ctx = canvas.getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: "Средний вес (кг)",
                    data: avgWeights,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 2,
                    yAxisID: 'y1'
                },
                {
                    label: "Количество подходов",
                    data: setsArray,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderWidth: 2,
                    yAxisID: 'y2'
                },
                {
                    label: "Общее число повторений",
                    data: repsArray,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderWidth: 2,
                    yAxisID: 'y2'
                }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y1: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Вес (кг)'
                        }
                    },
                    y2: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Подходы / Повторения'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: exName
                    }
                }
            }
        });
    });

    if (exerciseNames.length === 0) {
        chartsContainer.innerHTML = "<p>Нет данных для отображения</p>";
    }
}

// События изменения фильтров
document.getElementById("workoutFilter").addEventListener("change", updateExerciseFilter);
document.getElementById("exerciseFilter").addEventListener("change", loadAnalytics);

// Инициализация фильтров и аналитики
loadFilters();