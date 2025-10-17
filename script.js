// Global variables
let currentUser = null;
let currentTestModule = null;
let currentQuestionIndex = 0;
let timeRemaining = 0; // in seconds
let timerInterval;
let userAnswers = []; // Stores user's answers for the current test

// --- DOM Element References ---
const views = document.querySelectorAll('.view');
const testTimerDisplay = document.getElementById('test-timer-display');
const fixedTimeDisplay = document.getElementById('fixed-time-display');
const platformSubtitle = document.getElementById('platform-subtitle');

// --- Helper Functions ---
function showView(id) {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0); // Scroll to top when changing view
}

function saveData() {
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
}

function updateHeaderForTest(isInTest) {
    if (isInTest) {
        platformSubtitle.classList.add('hidden');
        testTimerDisplay.classList.remove('hidden');
    } else {
        platformSubtitle.classList.remove('hidden');
        testTimerDisplay.classList.add('hidden');
    }
}

// --- Timer Functions ---
function startTimer(durationInMinutes) {
    if (timerInterval) {
        clearInterval(timerInterval); // Clear any existing timer
    }
    timeRemaining = durationInMinutes * 60; // Convert minutes to seconds
    updateTimerDisplay(); // Show initial time

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('¡El tiempo ha terminado! Tu prueba se ha finalizado y guardado automáticamente.');
            finishTest(true); // Automatically finishes and corrects the test
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    const formattedTime = [hours, minutes, seconds]
        .map(unit => unit < 10 ? '0' + unit : unit)
        .join(':');

    fixedTimeDisplay.textContent = formattedTime;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// --- Navigation Functions ---
document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        if (currentUser.role === 'student') {
            showUserDashboardView();
        } else if (currentUser.role === 'admin') {
            showAdminDashboardView();
        }
    } else {
        showView('welcome-view');
        updateHeaderForTest(false);
    }
});

document.getElementById('login-btn').addEventListener('click', () => showView('login-view'));
document.getElementById('register-btn').addEventListener('click', () => showView('register-view'));
document.getElementById('go-to-register').addEventListener('click', (e) => { e.preventDefault(); showView('register-view'); });
document.getElementById('go-to-login').addEventListener('click', (e) => { e.preventDefault(); showView('login-view'); });
document.getElementById('back-to-welcome-from-login').addEventListener('click', () => showView('welcome-view'));
document.getElementById('back-to-welcome-from-register').addEventListener('click', () => showView('welcome-view'));

// --- Authentication (Login/Register) ---
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const user = allUsers.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        if (currentUser.role === 'student') {
            showUserDashboardView();
        } else if (currentUser.role === 'admin') {
            showAdminDashboardView();
        }
    } else {
        alert('Usuario o contraseña incorrectos.');
    }
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    if (allUsers.some(u => u.username === username)) {
        alert('Este nombre de usuario ya existe.');
        return;
    }

    const newUser = { username, password, role, testHistory: [] };
    allUsers.push(newUser);
    saveData();
    alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
    showView('login-view');
});

document.getElementById('logout-btn').addEventListener('click', () => logout());
document.getElementById('admin-logout-btn').addEventListener('click', () => logout());

function logout() {
    currentUser = null;
    currentTestModule = null;
    currentQuestionIndex = 0;
    stopTimer();
    userAnswers = [];
    showView('welcome-view');
    updateHeaderForTest(false);
}

// --- Student Dashboard ---
function showUserDashboardView() {
    if (!currentUser || currentUser.role !== 'student') {
        alert('Acceso denegado.');
        showView('login-view');
        return;
    }
    showView('student-dashboard-view');
    document.getElementById('student-username-display').textContent = currentUser.username;
    updateHeaderForTest(false);
    renderUserTests();
    renderUserProgress();
}

function renderUserTests() {
    const container = document.getElementById('user-tests-container');
    container.innerHTML = ''; // Clear previous content

    const enrolledTests = allTests.filter(test =>
        currentUser.testHistory.some(historyItem => historyItem.testId === test.id) || !['m2', 'ciencias', 'historia'].includes(test.id) // Incluye obligatorias por defecto
    );

    if (enrolledTests.length === 0) {
        container.innerHTML = '<p class="text-muted text-center mt-3">No estás inscrito en ninguna prueba. Inscríbete desde la página de inicio.</p>';
        return;
    }

    enrolledTests.forEach(test => {
        const testStatus = currentUser.testHistory.find(h => h.testId === test.id && h.status === 'incompleto');
        const lastCompleted = currentUser.testHistory.filter(h => h.testId === test.id && h.status === 'completado').sort((a,b) => new Date(b.date) - new Date(a.date))[0];

        let buttonHtml = `<button class="btn btn-primary start-enrolled-test-btn" data-test-id="${test.id}">Iniciar Prueba</button>`;
        let statusText = '';
        if (testStatus) {
            buttonHtml = `<button class="btn btn-warning resume-test-btn" data-test-id="${test.id}">Reanudar Prueba</button>`;
            statusText = `<span class="badge bg-warning ms-2">Incompleta</span>`;
        } else if (lastCompleted) {
            statusText = `<span class="badge bg-success ms-2">Último puntaje: ${lastCompleted.score}/${lastCompleted.totalQuestions}</span>`;
        }


        const testItem = document.createElement('div');
        testItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'align-items-center');
        testItem.innerHTML = `
            <div>
                <h5 class="mb-1">${test.name}</h5>
                <small class="text-muted">${test.questionsCount} preguntas • ${test.duration / 60}h ${test.duration % 60}min</small>
                ${statusText}
            </div>
            ${buttonHtml}
        `;
        container.appendChild(testItem);
    });

    document.querySelectorAll('.start-enrolled-test-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            showTestView(e.target.dataset.testId);
        });
    });

    document.querySelectorAll('.resume-test-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            showTestView(e.target.dataset.testId, true); // Pasar true para indicar que es una reanudación
        });
    });
}

function renderUserProgress() {
    const container = document.getElementById('user-progress-container');
    container.innerHTML = ''; // Clear previous content

    const completedTests = currentUser.testHistory.filter(h => h.status === 'completado');

    if (completedTests.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No hay pruebas completadas para mostrar el progreso.</p>';
        return;
    }

    const progressMap = {}; // { testId: { totalScore: X, totalQuestions: Y, attempts: Z } }

    completedTests.forEach(item => {
        if (!progressMap[item.testId]) {
            progressMap[item.testId] = { totalScore: 0, totalQuestions: item.totalQuestions, attempts: 0 };
        }
        progressMap[item.testId].totalScore += item.score;
        progressMap[item.testId].attempts++;
    });

    for (const testId in progressMap) {
        const test = allTests.find(t => t.id === testId);
        if (!test) continue;

        const avgScore = (progressMap[testId].totalScore / progressMap[testId].attempts).toFixed(1);
        const percentage = ((avgScore / progressMap[testId].totalQuestions) * 100).toFixed(0);

        const progressItem = document.createElement('div');
        progressItem.classList.add('mb-3');
        progressItem.innerHTML = `
            <h6>${test.name} (${progressMap[testId].attempts} intentos)</h6>
            <div class="progress" role="progressbar" aria-label="${test.name} Progress" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
            </div>
            <small class="text-muted">Promedio: ${avgScore} de ${progressMap[testId].totalQuestions} correctas</small>
        `;
        container.appendChild(progressItem);
    }
}

document.getElementById('view-test-history-btn').addEventListener('click', () => showTestHistoryView());
document.getElementById('back-to-dashboard-from-history').addEventListener('click', () => showUserDashboardView());


function showTestHistoryView() {
    if (!currentUser || currentUser.role !== 'student') {
        alert('Acceso denegado.');
        showView('login-view');
        return;
    }
    showView('test-history-view');
    updateHeaderForTest(false);
    renderTestHistory();
}

function renderTestHistory() {
    const container = document.getElementById('history-list-container');
    container.innerHTML = '';

    if (currentUser.testHistory.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No has realizado ningún intento de prueba.</p>';
        return;
    }

    // Ordenar por fecha, más reciente primero
    const sortedHistory = [...currentUser.testHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedHistory.forEach(item => {
        let statusBadgeClass = '';
        let statusText = '';
        if (item.status === 'completado') {
            statusBadgeClass = 'bg-success';
            statusText = `Finalizada (${item.score}/${item.totalQuestions})`;
        } else {
            statusBadgeClass = 'bg-warning';
            statusText = `Incompleta (${item.answered}/${item.totalQuestions})`;
        }

        const historyItem = document.createElement('div');
        historyItem.classList.add('list-group-item', 'history-item');
        historyItem.innerHTML = `
            <div>
                <strong>${item.testName}</strong>
                <br>
                <small class="text-muted">Fecha: ${item.date}</small>
            </div>
            <span class="badge ${statusBadgeClass} status-badge">${statusText}</span>
        `;
        container.appendChild(historyItem);
    });
}


// --- Test View Logic ---
document.querySelectorAll('.start-test-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        if (!currentUser) {
            alert('Debes iniciar sesión para inscribirte y realizar una prueba.');
            showView('login-view');
            return;
        }
        if (currentUser.role === 'admin') {
            alert('Los administradores no pueden iniciar pruebas de estudiante.');
            return;
        }

        const testId = e.target.dataset.testId;
        // Check if student is already enrolled or if it's an obligatory test
        const isEnrolled = currentUser.testHistory.some(historyItem => historyItem.testId === testId);
        const test = allTests.find(t => t.id === testId);

        if (!isEnrolled) {
            if (confirm(`¿Deseas inscribirte en la prueba "${test.name}"?`)) {
                // No se agrega un registro aquí, se agrega al iniciar la prueba
                // Solo confirmamos que desea inscribirse.
            } else {
                return; // User cancelled enrollment
            }
        }
        showTestView(testId);
    });
});

function showTestView(testId, isResuming = false) {
    currentTestModule = allTests.find(test => test.id === testId);
    if (!currentTestModule) {
        alert('Prueba no encontrada.');
        showUserDashboardView();
        return;
    }

    showView('test-view');
    document.getElementById('test-title-display').textContent = currentTestModule.name;
    updateHeaderForTest(true);

    const questions = allQuestions[currentTestModule.id];
    if (!questions || questions.length === 0) {
        document.getElementById('questions-container').innerHTML = '<p class="text-center">No hay preguntas disponibles para este módulo.</p>';
        document.getElementById('prev-btn').classList.add('hidden');
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('finish-test-btn').classList.add('hidden');
        document.getElementById('finish-attempt-btn').classList.add('hidden');
        stopTimer();
        return;
    }

    // Initialize or load userAnswers for this test
    if (isResuming) {
        const incompleteAttempt = currentUser.testHistory.find(h => h.testId === testId && h.status === 'incompleto');
        if (incompleteAttempt) {
            userAnswers = incompleteAttempt.answers;
            timeRemaining = incompleteAttempt.timeRemaining || (currentTestModule.duration * 60); // Resume time
            currentQuestionIndex = incompleteAttempt.lastQuestionIndex || 0; // Resume from last question
        } else {
            // No incomplete attempt found, start fresh
            userAnswers = Array(questions.length).fill(null);
            currentQuestionIndex = 0;
            timeRemaining = currentTestModule.duration * 60;
        }
    } else {
        // Starting a new attempt
        userAnswers = Array(questions.length).fill(null);
        currentQuestionIndex = 0;
        timeRemaining = currentTestModule.duration * 60;
    }

    loadQuestion(currentTestModule, currentQuestionIndex);
    startTimer(timeRemaining / 60); // Start timer with remaining time
}

function loadQuestion(module, questionIndex) {
    const questions = allQuestions[module.id];
    if (!questions || questions.length === 0) {
        // This case should ideally be handled before calling loadQuestion
        return;
    }

    currentQuestionIndex = questionIndex;
    const question = questions[currentQuestionIndex];

    document.getElementById('question-counter').textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;

    let questionHtml = `
        <div class="mb-4">
            <p class="question-text fw-bold fs-5">${currentQuestionIndex + 1}. ${question.question}</p>
            <div class="options-container">
    `;

    question.options.forEach((option, index) => {
        const optionId = `q${currentQuestionIndex}-opt${index}`;
        const isChecked = userAnswers[currentQuestionIndex] === index ? 'checked' : '';
        questionHtml += `
            <div class="form-check custom-radio">
                <input class="form-check-input" type="radio" name="question-${currentQuestionIndex}" id="${optionId}" value="${index}" ${isChecked}>
                <label class="form-check-label" for="${optionId}">
                    ${String.fromCharCode(65 + index)}. ${option}
                </label>
            </div>
        `;
    });

    questionHtml += `
            </div>
        </div>
    `;
    document.getElementById('questions-container').innerHTML = questionHtml;

    // Update navigation buttons state
    document.getElementById('prev-btn').disabled = currentQuestionIndex === 0;

    // Control visibility of Next, Finish Attempt, and Finish Test buttons
    if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('finish-test-btn').classList.remove('hidden'); // Show Finish Test button
        document.getElementById('finish-attempt-btn').classList.add('hidden'); // Hide Finish Attempt if on last question
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('finish-test-btn').classList.add('hidden'); // Hide Finish Test button
        document.getElementById('finish-attempt-btn').classList.remove('hidden'); // Show Finish Attempt button
    }
}

function saveCurrentAnswer() {
    const selectedOption = document.querySelector(`input[name="question-${currentQuestionIndex}"]:checked`);
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
    } else {
        userAnswers[currentQuestionIndex] = null; // If no answer selected
    }
    // console.log(`Respuestas del usuario:`, userAnswers); // For debugging
}

document.getElementById('next-btn').addEventListener('click', () => {
    saveCurrentAnswer();
    const questions = allQuestions[currentTestModule.id];
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentTestModule, currentQuestionIndex);
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentTestModule, currentQuestionIndex);
    }
});

document.getElementById('finish-attempt-btn').addEventListener('click', () => {
    saveCurrentAnswer(); // Save current answer before exiting
    finishAttempt();
});

function finishAttempt() {
    stopTimer();

    const questions = allQuestions[currentTestModule.id];
    const totalQuestions = questions.length;
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const unansweredCount = totalQuestions - answeredCount;

    // Find existing incomplete attempt to update it, or create new
    let existingAttemptIndex = currentUser.testHistory.findIndex(h => h.testId === currentTestModule.id && h.status === 'incompleto');

    const attemptData = {
        testId: currentTestModule.id,
        testName: currentTestModule.name,
        date: new Date().toISOString().split('T')[0],
        status: 'incompleto',
        answered: answeredCount,
        unanswered: unansweredCount,
        timeRemaining: timeRemaining, // Save remaining time
        lastQuestionIndex: currentQuestionIndex, // Save last viewed question
        answers: userAnswers // Save partial answers
    };

    if (existingAttemptIndex !== -1) {
        currentUser.testHistory[existingAttemptIndex] = attemptData; // Update existing
    } else {
        currentUser.testHistory.push(attemptData); // Add new
    }

    saveData();
    alert('Intento de prueba guardado. Puedes retomarlo desde el dashboard.');
    showUserDashboardView();
}

document.getElementById('finish-test-btn').addEventListener('click', () => {
    saveCurrentAnswer(); // Ensure last answer is saved
    finishTest(false); // User initiated finish
});

function finishTest(isTimeUp) {
    stopTimer();

    const questions = allQuestions[currentTestModule.id];
    let correctCount = 0;
    let incorrectCount = 0;

    userAnswers.forEach((userAnswer, index) => {
        if (userAnswer !== null && questions[index] && questions[index].correctOption === userAnswer) {
            correctCount++;
        } else if (userAnswer !== null && questions[index] && questions[index].correctOption !== userAnswer) {
            incorrectCount++;
        }
    });

    const totalQuestions = questions.length;
    const unansweredCount = totalQuestions - correctCount - incorrectCount;
    const score = correctCount;

    // Remove any previous incomplete attempt for this test
    currentUser.testHistory = currentUser.testHistory.filter(h => !(h.testId === currentTestModule.id && h.status === 'incompleto'));

    currentUser.testHistory.push({
        testId: currentTestModule.id,
        testName: currentTestModule.name,
        date: new Date().toISOString().split('T')[0],
        status: 'completado',
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
        score: score,
        totalQuestions: totalQuestions,
        answers: userAnswers
    });

    saveData();

    let message = `Prueba finalizada!\nCorrectas: ${correctCount}\nIncorrectas: ${incorrectCount}\nSin responder: ${unansweredCount}\nPuntaje: ${score}/${totalQuestions}`;
    if (isTimeUp) {
        message = `¡Tiempo agotado!\n` + message;
    }
    alert(message);

    showUserDashboardView();
}


// --- Admin Dashboard ---
function showAdminDashboardView() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Acceso denegado.');
        showView('login-view');
        return;
    }
    showView('admin-dashboard-view');
    document.getElementById('admin-username-display').textContent = currentUser.username;
    updateHeaderForTest(false);
    updateAdminStats();
}

function updateAdminStats() {
    document.getElementById('total-users-count').textContent = allUsers.length;
    document.getElementById('total-modules-count').textContent = allTests.length;
    let totalAttempts = 0;
    allUsers.forEach(user => {
        totalAttempts += user.testHistory.length;
    });
    document.getElementById('total-attempts-count').textContent = totalAttempts;
    // Más lógica para estadísticas avanzadas si es necesario
}

document.getElementById('manage-users-btn').addEventListener('click', () => showAdminUsersView());
document.getElementById('manage-modules-btn').addEventListener('click', () => showAdminModulesView());
document.getElementById('view-stats-btn').addEventListener('click', () => showAdminStatsView());


// --- Admin: Manage Users ---
function showAdminUsersView() {
    if (!currentUser || currentUser.role !== 'admin') return;
    showView('admin-users-view');
    renderAdminUsers();
}
document.getElementById('back-to-admin-dashboard-from-users').addEventListener('click', () => showAdminDashboardView());
document.getElementById('add-user-btn').addEventListener('click', () => {
    document.getElementById('add-user-form-card').classList.remove('hidden');
});
document.getElementById('cancel-add-user-btn').addEventListener('click', () => {
    document.getElementById('add-user-form-card').classList.add('hidden');
    document.getElementById('add-user-form').reset();
});

function renderAdminUsers() {
    const container = document.getElementById('users-list-container');
    container.innerHTML = '';
    allUsers.forEach(user => {
        const userItem = document.createElement('div');
        userItem.classList.add('list-group-item', 'admin-list-item');
        userItem.innerHTML = `
            <div>
                <strong>${user.username}</strong> - <span class="badge bg-secondary">${user.role}</span>
            </div>
            <div>
                <button class="btn btn-sm btn-info me-2 edit-user-btn" data-username="${user.username}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-user-btn" data-username="${user.username}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(userItem);
    });

    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const usernameToDelete = e.target.dataset.username;
            if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${usernameToDelete}?`)) {
                allUsers = allUsers.filter(u => u.username !== usernameToDelete);
                saveData();
                renderAdminUsers();
                updateAdminStats();
            }
        });
    });

    // Edit user functionality (more complex, might open a modal or inline edit form)
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            alert('Funcionalidad de edición de usuario no implementada aún.');
            // Implement modal or inline form for editing username, password, role
        });
    });
}

document.getElementById('add-user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (allUsers.some(u => u.username === username)) {
        alert('Este nombre de usuario ya existe.');
        return;
    }

    allUsers.push({ username, password, role, testHistory: [] });
    saveData();
    document.getElementById('add-user-form').reset();
    document.getElementById('add-user-form-card').classList.add('hidden');
    renderAdminUsers();
    updateAdminStats();
    alert('Usuario añadido con éxito.');
});


// --- Admin: Manage Modules ---
function showAdminModulesView() {
    if (!currentUser || currentUser.role !== 'admin') return;
    showView('admin-modules-view');
    renderAdminModules();
}
document.getElementById('back-to-admin-dashboard-from-modules').addEventListener('click', () => showAdminDashboardView());
document.getElementById('add-module-btn').addEventListener('click', () => {
    document.getElementById('add-module-form-card').classList.remove('hidden');
});
document.getElementById('cancel-add-module-btn').addEventListener('click', () => {
    document.getElementById('add-module-form-card').classList.add('hidden');
    document.getElementById('add-module-form').reset();
});

function renderAdminModules() {
    const container = document.getElementById('modules-list-container');
    container.innerHTML = '';
    allTests.forEach(module => { // allTests es tu array de módulos
        const moduleItem = document.createElement('div');
        moduleItem.classList.add('list-group-item', 'admin-list-item');
        moduleItem.innerHTML = `
            <div>
                <strong>${module.name}</strong> (${module.id}) - <span class="badge bg-info">${module.type}</span>
                <br>
                <small class="text-muted">${module.questionsCount} preguntas • ${module.duration} min</small>
            </div>
            <div>
                <button class="btn btn-sm btn-info me-2 edit-module-btn" data-module-id="${module.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-module-btn" data-module-id="${module.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(moduleItem);
    });

    document.querySelectorAll('.delete-module-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const moduleIdToDelete = e.target.dataset.moduleId;
            if (confirm(`¿Estás seguro de que quieres eliminar el módulo ${moduleIdToDelete}? Esto también eliminará sus preguntas.`)) {
                // Remove module from allTests
                const moduleIndex = allTests.findIndex(m => m.id === moduleIdToDelete);
                if (moduleIndex !== -1) {
                    allTests.splice(moduleIndex, 1);
                }
                // Remove questions associated with this module
                if (allQuestions[moduleIdToDelete]) {
                    delete allQuestions[moduleIdToDelete];
                }
                // Note: Deleting modules/questions would also require updating test history of users
                // For simplicity, we'll keep the history records as they are or you can add cleanup logic.
                saveData(); // If allTests and allQuestions were saved in local storage, this would save changes.
                // Since they are static, you'd need a more robust storage solution for admin edits.
                alert('Módulo y sus preguntas eliminadas.');
                renderAdminModules();
                updateAdminStats();
            }
        });
    });

    document.querySelectorAll('.edit-module-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            alert('Funcionalidad de edición de módulo no implementada aún.');
        });
    });
}

document.getElementById('add-module-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('new-module-id').value;
    const name = document.getElementById('new-module-name').value;
    const type = document.getElementById('new-module-type').value;
    const duration = parseInt(document.getElementById('new-module-duration').value);

    if (allTests.some(m => m.id === id)) {
        alert('Ya existe un módulo con este ID.');
        return;
    }
    if (isNaN(duration) || duration <= 0) {
        alert('La duración debe ser un número positivo.');
        return;
    }

    // Add new module to allTests (this would usually go to a server for persistence)
    allTests.push({ id, name, type, questionsCount: 0, duration, temario: '' }); // questionsCount starts at 0
    allQuestions[id] = []; // Initialize an empty array for its questions

    // alert('Módulo añadido con éxito. Recuerda añadir preguntas a este módulo manualmente en data.js o a través de otra interfaz.');
    document.getElementById('add-module-form').reset();
    document.getElementById('add-module-form-card').classList.add('hidden');
    renderAdminModules();
    updateAdminStats();
    alert('Módulo añadido con éxito.');
    // To allow admin to add questions, a new interface/modal would be needed.
});

// --- Admin: View Stats ---
function showAdminStatsView() {
    if (!currentUser || currentUser.role !== 'admin') return;
    showView('admin-stats-view');
    renderAdminStats();
}
document.getElementById('back-to-admin-dashboard-from-stats').addEventListener('click', () => showAdminDashboardView());

function renderAdminStats() {
    const avgScoresContainer = document.getElementById('avg-scores-container');
    const attemptsPerModuleContainer = document.getElementById('attempts-per-module-container');
    avgScoresContainer.innerHTML = '';
    attemptsPerModuleContainer.innerHTML = '';

    const testStats = {}; // { testId: { totalScore: 0, totalQuestions: 0, completedAttempts: 0, totalAttempts: 0 } }

    allTests.forEach(test => {
        testStats[test.id] = {
            name: test.name,
            totalScore: 0,
            totalQuestions: test.questionsCount,
            completedAttempts: 0,
            totalAttempts: 0
        };
    });

    allUsers.forEach(user => {
        user.testHistory.forEach(historyItem => {
            if (testStats[historyItem.testId]) {
                testStats[historyItem.testId].totalAttempts++;
                if (historyItem.status === 'completado') {
                    testStats[historyItem.testId].completedAttempts++;
                    testStats[historyItem.testId].totalScore += historyItem.score;
                }
            }
        });
    });

    // Render Average Scores
    let hasCompletedTests = false;
    for (const testId in testStats) {
        const stats = testStats[testId];
        if (stats.completedAttempts > 0) {
            hasCompletedTests = true;
            const avgScore = (stats.totalScore / stats.completedAttempts).toFixed(1);
            const percentage = ((avgScore / stats.totalQuestions) * 100).toFixed(0);
            avgScoresContainer.innerHTML += `
                <div class="mb-2">
                    <h6>${stats.name}</h6>
                    <div class="progress" role="progressbar" aria-label="${stats.name} Avg Score" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar bg-info" style="width: ${percentage}%">${percentage}%</div>
                    </div>
                    <small class="text-muted">Promedio: ${avgScore} de ${stats.totalQuestions} en ${stats.completedAttempts} intentos completados</small>
                </div>
            `;
        }
    }
    if (!hasCompletedTests) {
        avgScoresContainer.innerHTML = '<p class="text-muted">No hay datos de pruebas completadas.</p>';
    }

    // Render Attempts per Module
    let hasAttempts = false;
    for (const testId in testStats) {
        const stats = testStats[testId];
        if (stats.totalAttempts > 0) {
            hasAttempts = true;
            attemptsPerModuleContainer.innerHTML += `
                <div class="mb-2">
                    <h6>${stats.name}</h6>
                    <p class="mb-0"><span class="badge bg-primary">${stats.totalAttempts}</span> Intentos totales</p>
                    <small class="text-muted">${stats.completedAttempts} completados, ${stats.totalAttempts - stats.completedAttempts} incompletos</small>
                </div>
            `;
        }
    }
    if (!hasAttempts) {
        attemptsPerModuleContainer.innerHTML = '<p class="text-muted">No hay datos de intentos.</p>';
    }
}


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (e.g., from previous session)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = allUsers.find(u => u.username === JSON.parse(storedUser).username);
        if (currentUser) {
            if (currentUser.role === 'student') {
                showUserDashboardView();
            } else if (currentUser.role === 'admin') {
                showAdminDashboardView();
            }
        } else {
            // User not found in allUsers (might have been deleted by admin), clear session
            localStorage.removeItem('currentUser');
            showView('welcome-view');
        }
    } else {
        showView('welcome-view');
    }
});