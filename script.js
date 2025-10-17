document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando aplicación.");

    // --- ESTADO Y BASE DE DATOS SIMULADA ---
    let currentUser = null;
    let allUsers = [];
    let currentTestState = { type: null, questions: [], answers: {}, currentIndex: 0, timeRemaining: 0, timerInterval: null };

    // --- DATOS DE PREGUNTAS (AHORA INCLUIDOS DIRECTAMENTE EN SCRIPT.JS) ---
    // Este objeto simula el contenido que estaría en questions.json
    const allQuestions = {
        "lectora": [
            { "question": "¿Cuál es la idea principal de un texto?", "options": ["El título", "La primera oración", "El mensaje central", "Las palabras clave"], "correctOption": 2 },
            { "question": "¿Qué tipo de texto busca persuadir al lector?", "options": ["Narrativo", "Expositivo", "Argumentativo", "Descriptivo"], "correctOption": 2 },
            { "question": "¿Qué figura literaria consiste en atribuir cualidades humanas a objetos inanimados?", "options": ["Metáfora", "Símil", "Personificación", "Hipérbole"], "correctOption": 2 },
            { "question": "¿Cuál es la función principal de un adverbio?", "options": ["Nombrar objetos", "Describir sustantivos", "Modificar verbos, adjetivos u otros adverbios", "Conectar oraciones"], "correctOption": 2 },
            { "question": "¿Qué elemento no pertenece a la estructura de una noticia?", "options": ["Titular", "Cuerpo", "Conclusión personal del autor", "Epígrafe"], "correctOption": 2 }
        ],
        "m1": [
            { "question": "Si x + 5 = 12, ¿cuál es el valor de x?", "options": ["5", "7", "12", "17"], "correctOption": 1 },
            { "question": "¿Cuál es el resultado de 3 * (4 + 2)?", "options": ["10", "12", "18", "24"], "correctOption": 2 },
            { "question": "Si un auto viaja a 60 km/h, ¿cuántos kilómetros recorrerá en 3 horas?", "options": ["20", "60", "120", "180"], "correctOption": 3 },
            { "question": "¿Cuál es el valor de Pi (aproximado)?", "options": ["3.0", "3.14", "3.25", "3.5"], "correctOption": 1 },
            { "question": "Calcula el área de un cuadrado con lado de 5 cm.", "options": ["10 cm²", "15 cm²", "20 cm²", "25 cm²"], "correctOption": 3 }
        ],
        "m2": [
            { "question": "¿Cuál es la derivada de f(x) = x²?", "options": ["x", "2x", "x³", "1"], "correctOption": 1 },
            { "question": "¿Qué representa la integral definida de una función?", "options": ["Pendiente", "Área bajo la curva", "Tangente", "Volumen"], "correctOption": 1 },
            { "question": "Resuelve la ecuación cuadrática x² - 4 = 0.", "options": ["x = 2", "x = -2", "x = ±2", "No tiene solución real"], "correctOption": 2 },
            { "question": "¿Cuál es el límite de (sin x) / x cuando x tiende a 0?", "options": ["0", "1", "infinito", "indefinido"], "correctOption": 1 },
            { "question": "Si f(x) = 3x, ¿cuál es f'(x)?", "options": ["x", "3", "3x", "1"], "correctOption": 1 }
        ],
        "ciencias": [
            { "question": "¿Cuál es la fórmula química del agua?", "options": ["H2O", "CO2", "O2", "N2"], "correctOption": 0 },
            { "question": "¿Qué planeta es conocido como el 'Planeta Rojo'?", "options": ["Tierra", "Marte", "Júpiter", "Venus"], "correctOption": 1 },
            { "question": "¿Cuál es el hueso más largo del cuerpo humano?", "options": ["Radio", "Fémur", "Tibia", "Peroné"], "correctOption": 1 },
            { "question": "¿Cuál es la unidad básica de la vida?", "options": ["Átomo", "Molécula", "Célula", "Tejido"], "correctOption": 2 },
            { "question": "¿Qué gas es el más abundante en la atmósfera terrestre?", "options": ["Oxígeno", "Dióxido de carbono", "Nitrógeno", "Argón"], "correctOption": 2 }
        ],
        "historia": [
            { "question": "¿En qué año llegó Cristóbal Colón a América?", "options": ["1490", "1492", "1500", "1521"], "correctOption": 1 },
            { "question": "¿Quién fue el primer presidente de Chile?", "options": ["Bernardo O'Higgins", "Manuel Blanco Encalada", "Ramón Freire", "José Miguel Carrera"], "correctOption": 1 },
            { "question": "¿Cuál fue la causa principal de la Primera Guerra Mundial?", "options": ["Crisis económica", "Asesinato del Archiduque Francisco Fernando", "Revolución Rusa", "Expansión colonial"], "correctOption": 1 },
            { "question": "¿Qué civilización construyó las pirámides de Giza?", "options": ["Romanos", "Griegos", "Egipcios", "Mayas"], "correctOption": 2 },
            { "question": "¿En qué año se firmó la Declaración de Independencia de Chile?", "options": ["1810", "1818", "1823", "1833"], "correctOption": 1 }
        ]
    };

    const testConfig = {
        lectora: { name: 'Competencia Lectora', type: 'obligatoria', questionsCount: 5, duration: 15 },
        m1: { name: 'Competencia Matemática 1 (M1)', type: 'obligatoria', questionsCount: 5, duration: 15 },
        m2: { name: 'Competencia Matemática 2 (M2)', type: 'electiva', questionsCount: 5, duration: 15 },
        ciencias: { name: 'Ciencias', type: 'electiva', questionsCount: 5, duration: 15 },
        historia: { name: 'Historia y Cs. Sociales', type: 'electiva', questionsCount: 5, duration: 15 }
    };

    // --- INICIALIZACIÓN ---
    function init() {
        // Cargar usuarios (o inicializar si no existen)
        const storedUsers = localStorage.getItem('paesAppUsers');
        if (storedUsers) {
            allUsers = JSON.parse(storedUsers);
        } else {
            allUsers = [
                { user: 'admin', password: 'admin', role: 'admin', name: 'Administrador', history: [] },
                { user: 'estudiante', password: '1234', role: 'student', name: 'Juan Pérez', history: [] }
            ];
            localStorage.setItem('paesAppUsers', JSON.stringify(allUsers));
        }

        // Restaurar sesión de usuario
        const storedCurrentUser = localStorage.getItem('currentUser');
        if (storedCurrentUser) {
            const parsedUser = JSON.parse(storedCurrentUser);
            currentUser = allUsers.find(u => u.user === parsedUser.user); // Encontrar el objeto completo del usuario
            if (currentUser) {
                if (currentUser.role === 'admin') showAdminDashboard();
                else showStudentDashboard();
            } else {
                localStorage.removeItem('currentUser'); // Usuario no encontrado, limpiar sesión
                showView('welcome-view');
            }
        } else {
            showView('welcome-view');
        }

        setupEventListeners();
        renderViewsContainer(); // Renderiza todas las vistas dinámicamente
    }

    // --- Elementos DOM comunes ---
    const viewContainer = document.getElementById('view-container');
    const headerTimerDisplay = document.getElementById('fixed-time-display'); // Asumiendo que existe en el HTML de test-view
    const adminNavBar = document.getElementById('admin-nav-bar');

    // --- Renderizado Dinámico de Vistas ---
    function renderViewsContainer() {
        viewContainer.innerHTML = `
            <section id="welcome-view" class="view active">
                <div class="card">
                    <div class="welcome-card-header">
                        <h2>Bienvenido a las Pruebas PAES 2026</h2>
                        <p>Las Pruebas de Acceso a la Educación Superior evaluarán tus competencias en áreas fundamentales. Selecciona una prueba y completa tu inscripción.</p>
                    </div>
                    <div class="tests-grid">
                        ${Object.keys(testConfig).map(key => `
                            <div class="test-card">
                                <span class="test-label label-${testConfig[key].type}">${testConfig[key].type.toUpperCase()}</span>
                                <h4>${testConfig[key].name}</h4>
                                <span>${testConfig[key].questionsCount} preguntas • ${testConfig[key].duration} min</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="welcome-view-buttons d-flex justify-content-center mt-4">
                        <button class="btn btn-secondary me-3" id="show-inscription-btn"><i class="fas fa-user-plus"></i> Inscribirme</button>
                        <button class="btn btn-primary" id="show-login-btn"><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</button>
                    </div>
                </div>
            </section>

            <section id="login-view" class="view">
                <div class="card p-4 text-center">
                    <h2 class="mb-4">Iniciar Sesión</h2>
                    <form id="login-form">
                        <div class="mb-3">
                            <label for="login-user" class="form-label hidden">Usuario</label>
                            <input type="text" class="form-control mx-auto" id="login-user" placeholder="Usuario" required>
                        </div>
                        <div class="mb-3">
                            <label for="login-pass" class="form-label hidden">Contraseña</label>
                            <input type="password" class="form-control mx-auto" id="login-pass" placeholder="Contraseña" required>
                        </div>
                        <p id="login-error" class="text-danger hidden"></p>
                        <button type="submit" class="btn btn-primary w-100 mb-3">Acceder</button>
                    </form>
                    <button class="btn btn-link" id="back-to-welcome-from-login">Volver</button>
                </div>
            </section>

            <section id="inscription-view" class="view">
                <div class="card p-4 text-center">
                    <h2 class="mb-4">Inscripción</h2>
                    <p>Funcionalidad de inscripción real no implementada. Usa "estudiante" / "1234" para acceder.</p>
                    <button class="btn btn-primary mb-3" id="back-to-welcome-from-inscription">Volver a Inicio</button>
                </div>
            </section>

            <section id="user-dashboard-view" class="view">
                <div class="card">
                    <h2 class="mb-4">Bienvenido, <span id="user-display-name" class="fw-bold"></span>!</h2>
                    <div class="student-dashboard-grid">
                        <div class="dashboard-card">
                            <h4 class="card-title">Mis Pruebas</h4>
                            <div class="list-group" id="user-tests-container">
                                </div>
                        </div>
                        <div class="dashboard-card">
                            <h4 class="card-title">Mi Progreso</h4>
                            <div id="user-progress-container">
                                </div>
                            <button class="btn btn-secondary mt-3 w-100" id="view-history-btn"><i class="fas fa-history"></i> Ver Historial de Intentos</button>
                        </div>
                    </div>
                    <button class="btn btn-danger mt-4 ms-auto" id="logout-btn-student"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button>
                </div>
            </section>

            <section id="test-view" class="view">
                <div class="card">
                    <div class="fixed-header-test">
                        <h3 id="test-title-display" class="mb-0">Nombre de la Prueba</h3>
                        <div class="timer"><i class="fas fa-clock"></i> <span id="fixed-time-display">00:00:00</span></div>
                    </div>
                    <div id="questions-container">
                        <p class="text-center">Cargando pregunta...</p>
                    </div>
                    <div class="test-navigation-buttons">
                        <button class="btn btn-secondary" id="prev-btn" disabled><i class="fas fa-arrow-left"></i> Anterior</button>
                        <button class="btn btn-primary" id="next-btn">Siguiente <i class="fas fa-arrow-right"></i></button>
                        <button class="btn btn-warning hidden" id="finish-attempt-btn"><i class="fas fa-pause-circle"></i> Guardar y Salir</button>
                        <button class="btn btn-success hidden" id="finish-test-btn"><i class="fas fa-check-circle"></i> Finalizar Prueba</button>
                    </div>
                </div>
            </section>

            <div id="history-modal-overlay" class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close-btn" id="history-modal-close-btn">&times;</button>
                    <div class="modal-header">
                        <h3>Historial de Intentos</h3>
                    </div>
                    <div id="history-list-container">
                        <p class="text-center text-muted">No hay historial disponible.</p>
                    </div>
                </div>
            </div>


            <section id="admin-dashboard-view" class="view">
                <div class="card p-4">
                    <h2 class="mb-4">Dashboard de Administrador</h2>
                    <p class="mb-4">Bienvenido, <span class="fw-bold">${currentUser ? currentUser.name : 'Administrador'}</span>!</p>
                    <div class="admin-dashboard-grid">
                        <div class="admin-stat-card">
                            <h5>Usuarios Registrados</h5>
                            <p class="stat-value" id="total-users-count"></p>
                        </div>
                        <div class="admin-stat-card">
                            <h5>Módulos de Prueba</h5>
                            <p class="stat-value" id="total-modules-count"></p>
                        </div>
                        <div class="admin-stat-card">
                            <h5>Intentos de Prueba</h5>
                            <p class="stat-value" id="total-attempts-count"></p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="admin-users-view" class="view">
                <div class="card p-4">
                    <h3 class="mb-4">Gestión de Usuarios</h3>
                    <button class="btn btn-success mb-3" id="add-user-btn"><i class="fas fa-plus-circle"></i> Añadir Nuevo Usuario</button>
                    <div class="card p-3 mb-3 hidden" id="add-user-form-card">
                        <h5>Añadir Usuario</h5>
                        <form id="add-user-form">
                            <div class="mb-3">
                                <label for="new-username" class="form-label">Usuario</label>
                                <input type="text" class="form-control" id="new-username" required>
                            </div>
                            <div class="mb-3">
                                <label for="new-password" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="new-password" required>
                            </div>
                            <div class="mb-3">
                                <label for="new-role" class="form-label">Rol</label>
                                <select class="form-control" id="new-role">
                                    <option value="student">Estudiante</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary me-2"><i class="fas fa-save"></i> Guardar Usuario</button>
                            <button type="button" class="btn btn-secondary" id="cancel-add-user-btn"><i class="fas fa-times"></i> Cancelar</button>
                        </form>
                    </div>
                    <div class="list-group" id="users-list-container"></div>
                </div>
            </section>

            <section id="admin-modules-view" class="view">
                <div class="card p-4">
                    <h3 class="mb-4">Gestión de Módulos de Pruebas</h3>
                    <button class="btn btn-success mb-3" id="add-module-btn"><i class="fas fa-plus-circle"></i> Añadir Nuevo Módulo</button>
                    <div class="card p-3 mb-3 hidden" id="add-module-form-card">
                        <h5>Añadir Módulo</h5>
                        <form id="add-module-form">
                            <div class="mb-3">
                                <label for="new-module-id" class="form-label">ID del Módulo (ej: m3)</label>
                                <input type="text" class="form-control" id="new-module-id" required>
                            </div>
                            <div class="mb-3">
                                <label for="new-module-name" class="form-label">Nombre del Módulo</label>
                                <input type="text" class="form-control" id="new-module-name" required>
                            </div>
                            <div class="mb-3">
                                <label for="new-module-type" class="form-label">Tipo</label>
                                <select class="form-control" id="new-module-type">
                                    <option value="obligatoria">Obligatoria</option>
                                    <option value="electiva">Electiva</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="new-module-questions" class="form-label">Cantidad de Preguntas</label>
                                <input type="number" class="form-control" id="new-module-questions" required min="1" value="5">
                            </div>
                            <div class="mb-3">
                                <label for="new-module-duration" class="form-label">Duración (minutos)</label>
                                <input type="number" class="form-control" id="new-module-duration" required min="1" value="15">
                            </div>
                            <button type="submit" class="btn btn-primary me-2"><i class="fas fa-save"></i> Guardar Módulo</button>
                            <button type="button" class="btn btn-secondary" id="cancel-add-module-btn"><i class="fas fa-times"></i> Cancelar</button>
                        </form>
                    </div>
                    <div class="list-group" id="modules-list-container"></div>
                    <p class="text-muted mt-3">Nota: Para añadir o editar las preguntas de un módulo, debes modificar el objeto `allQuestions` directamente en `script.js`.</p>
                </div>
            </section>

            <section id="admin-stats-view" class="view">
                <div class="card p-4">
                    <h3 class="mb-4">Estadísticas Generales</h3>
                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <h4>Puntajes Promedio por Módulo</h4>
                            <div id="avg-scores-container"></div>
                        </div>
                        <div class="col-md-6 mb-4">
                            <h4>Intentos de Prueba por Módulo</h4>
                            <div id="attempts-per-module-container"></div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }


    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        document.getElementById('show-login-btn').addEventListener('click', () => showView('login-view'));
        document.getElementById('show-inscription-btn').addEventListener('click', () => showView('inscription-view'));
        document.getElementById('back-to-welcome-from-login').addEventListener('click', () => showView('welcome-view'));
        document.getElementById('back-to-welcome-from-inscription').addEventListener('click', () => showView('welcome-view'));
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('logout-btn-student').addEventListener('click', logout);
        document.getElementById('logout-btn-admin').addEventListener('click', logout);

        // Test navigation buttons
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const finishTestBtn = document.getElementById('finish-test-btn');
        const finishAttemptBtn = document.getElementById('finish-attempt-btn');

        if (nextBtn) nextBtn.addEventListener('click', navigateNext);
        if (prevBtn) prevBtn.addEventListener('click', navigatePrev);
        if (finishTestBtn) finishTestBtn.addEventListener('click', () => { if (confirm('¿Estás seguro de que quieres finalizar la prueba?')) submitTest(); });
        if (finishAttemptBtn) finishAttemptBtn.addEventListener('click', () => { if (confirm('¿Deseas guardar tu progreso y salir de la prueba?')) finishAttempt(); });

        // Event delegation para botones de iniciar prueba en el dashboard del estudiante
        const userTestsContainer = document.getElementById('user-tests-container');
        if (userTestsContainer) {
            userTestsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('start-test-btn')) {
                    startTest(e.target.dataset.testType);
                }
            });
        }
        
        // Historial de intentos
        const viewHistoryBtn = document.getElementById('view-history-btn');
        if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', showHistoryModal);
        const historyModalCloseBtn = document.getElementById('history-modal-close-btn');
        if (historyModalCloseBtn) historyModalCloseBtn.addEventListener('click', () => document.getElementById('history-modal-overlay').classList.remove('active'));

        // Admin Navigation buttons
        document.querySelectorAll('.admin-nav-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const viewToShow = e.currentTarget.dataset.view;
                showView(viewToShow);
                if (viewToShow === 'admin-dashboard-view') updateAdminStats();
                if (viewToShow === 'admin-users-view') renderAdminUsersView(); // Llama a la función de renderizado para usuarios
                if (viewToShow === 'admin-modules-view') renderAdminModulesView(); // Llama a la función de renderizado para módulos
                if (viewToShow === 'admin-stats-view') renderAdminStatsView(); // Llama a la función de renderizado para estadísticas
            });
        });

        // Event listeners para la gestión de usuarios en admin-users-view (dinámicos, requieren la vista renderizada)
        // Se configuran dentro de renderAdminUsersView para asegurar que los elementos existan.
    }

    // --- LÓGICA DE NAVEGACIÓN ---
    function showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        // Mostrar/ocultar barra de admin
        if (adminNavBar) { // Asegurarse de que adminNavBar existe
            adminNavBar.style.display = (currentUser && currentUser.role === 'admin' && viewId.startsWith('admin-')) ? 'flex' : 'none';
        }
        window.scrollTo(0, 0); // Scroll to top when changing view
    }

    // --- LÓGICA DE USUARIOS Y AUTENTICACIÓN ---
    function handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const loginError = document.getElementById('login-error');
        const foundUser = allUsers.find(u => u.user === user && u.password === pass);

        if (foundUser) {
            currentUser = foundUser;
            localStorage.setItem('currentUser', JSON.stringify({ user: currentUser.user, role: currentUser.role }));
            loginError.classList.add('hidden');
            if (currentUser.role === 'admin') showAdminDashboard();
            else showStudentDashboard();
        } else {
            loginError.textContent = 'Usuario o contraseña incorrectos.';
            loginError.classList.remove('hidden');
        }
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        stopTimer();
        currentTestState = { type: null, questions: [], answers: {}, currentIndex: 0, timeRemaining: 0, timerInterval: null };
        if (adminNavBar) adminNavBar.style.display = 'none'; // Asegurarse de que adminNavBar existe
        showView('welcome-view');
    }

    // --- DASHBOARDS ---
    function showAdminDashboard() {
        showView('admin-dashboard-view');
        updateAdminStats();
        // Asegurarse de que el botón de dashboard esté activo
        const dashboardBtn = document.querySelector('.admin-nav-btn[data-view="admin-dashboard-view"]');
        if (dashboardBtn) {
            document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
            dashboardBtn.classList.add('active');
        }
    }

    function showStudentDashboard() {
        showView('user-dashboard-view');
        document.getElementById('user-display-name').textContent = currentUser.name;
        renderStudentTests();
        renderStudentProgress();
    }

    function renderStudentTests() {
        const container = document.getElementById('user-tests-container');
        if (!container) return; // Salir si el contenedor no existe
        container.innerHTML = '';
        Object.keys(testConfig).forEach(testKey => {
            const config = testConfig[testKey];
            const testHistory = currentUser.history.filter(h => h.testId === testKey);
            const lastAttempt = testHistory.length > 0 ? testHistory[testHistory.length - 1] : null;

            let buttonHtml = `<button class="btn btn-primary start-test-btn" data-test-type="${testKey}"><i class="fas fa-play"></i> Iniciar Prueba</button>`;
            let statusBadge = '';

            if (lastAttempt) {
                if (lastAttempt.status === 'incompleto') {
                    buttonHtml = `<button class="btn btn-warning start-test-btn" data-test-type="${testKey}" data-resume="true"><i class="fas fa-play"></i> Reanudar Prueba</button>`;
                    statusBadge = `<span class="badge bg-warning ms-2">Incompleta</span>`;
                } else if (lastAttempt.status === 'completado') {
                    statusBadge = `<span class="badge bg-success ms-2">Último puntaje: ${lastAttempt.score}/${lastAttempt.totalQuestions}</span>`;
                }
            }

            const card = document.createElement('div');
            card.className = 'list-item'; // Usamos list-item para el estilo
            card.innerHTML = `
                <div>
                    <h5>${config.name} ${statusBadge}</h5>
                    <small class="text-muted">${config.questionsCount} preguntas • ${config.duration} min</small>
                </div>
                <div>${buttonHtml}</div>
            `;
            container.appendChild(card);
        });
    }

    function renderStudentProgress() {
        const container = document.getElementById('user-progress-container');
        if (!container) return; // Salir si el contenedor no existe
        container.innerHTML = '';

        if (currentUser.history.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No hay pruebas completadas para mostrar el progreso.</p>';
            return;
        }

        const progressMap = {};
        Object.keys(testConfig).forEach(key => {
            progressMap[key] = {
                name: testConfig[key].name,
                totalScore: 0,
                totalQuestions: testConfig[key].questionsCount,
                attempts: 0
            };
        });

        currentUser.history.forEach(item => {
            if (item.status === 'completado' && progressMap[item.testId]) {
                progressMap[item.testId].totalScore += item.score;
                progressMap[item.testId].attempts++;
            }
        });

        let hasProgress = false;
        for (const testId in progressMap) {
            const stats = progressMap[testId];
            if (stats.attempts > 0) {
                hasProgress = true;
                const avgScore = (stats.totalScore / stats.attempts);
                const percentage = ((avgScore / stats.totalQuestions) * 100).toFixed(0);

                const progressItem = document.createElement('div');
                progressItem.classList.add('mb-3');
                progressItem.innerHTML = `
                    <h6>${stats.name} (${stats.attempts} intentos)</h6>
                    <div class="progress" role="progressbar" aria-label="${stats.name} Progress" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                    </div>
                    <small class="text-muted">Promedio: ${avgScore.toFixed(1)} de ${stats.totalQuestions} correctas</small>
                `;
                container.appendChild(progressItem);
            }
        }
        if (!hasProgress) {
            container.innerHTML = '<p class="text-muted text-center">No hay pruebas completadas para mostrar el progreso.</p>';
        }
    }

    // --- Historial de Intentos (Modal) ---
    function showHistoryModal() {
        const modalOverlay = document.getElementById('history-modal-overlay');
        const historyListContainer = document.getElementById('history-list-container');
        
        if (!modalOverlay || !historyListContainer) {
            console.error("Elementos del modal de historial no encontrados.");
            return;
        }

        historyListContainer.innerHTML = ''; // Limpiar contenido anterior

        if (currentUser.history.length === 0) {
            historyListContainer.innerHTML = '<p class="text-center text-muted">No has realizado ningún intento de prueba.</p>';
            modalOverlay.classList.add('active');
            return;
        }

        // Ordenar historial por fecha, más reciente primero
        const sortedHistory = [...currentUser.history].sort((a, b) => new Date(b.date) - new Date(a.date));

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
            historyItem.classList.add('list-group-item'); // Reutiliza estilo de lista
            historyItem.innerHTML = `
                <div>
                    <strong>${item.testName}</strong>
                    <br>
                    <small class="text-muted">Fecha: ${item.date}</small>
                </div>
                <span class="badge ${statusBadgeClass}">${statusText}</span>
            `;
            historyListContainer.appendChild(historyItem);
        });

        modalOverlay.classList.add('active'); // Mostrar el modal
    }

    // --- LÓGICA DE PRUEBA ---
    function startTest(testType, resume = false) {
        const config = testConfig[testType];
        if (!config || !allQuestions[testType]) {
            alert('Prueba no encontrada o sin preguntas.');
            showStudentDashboard();
            return;
        }

        currentTestState.type = testType;
        currentTestState.questions = shuffleArray([...allQuestions[testType]]); // Clonar y mezclar preguntas
        currentTestState.answers = Array(currentTestState.questions.length).fill(null);
        currentTestState.currentIndex = 0;
        
        const lastAttempt = currentUser.history.find(h => h.testId === testType && h.status === 'incompleto');

        if (resume && lastAttempt) {
            currentTestState.answers = lastAttempt.answers;
            currentTestState.currentIndex = lastAttempt.lastQuestionIndex || 0;
            currentTestState.timeRemaining = lastAttempt.timeRemaining;
        } else {
            currentTestState.timeRemaining = config.duration * 60;
            // Eliminar cualquier intento incompleto previo al iniciar una nueva prueba completa
            currentUser.history = currentUser.history.filter(h => !(h.testId === testType && h.status === 'incompleto'));
        }
        
        showView('test-view');
        document.getElementById('test-title-display').textContent = config.name;
        loadQuestion();
        startTimer();
    }

    function loadQuestion() {
        const questionContainer = document.getElementById('questions-container');
        const questionCounter = document.getElementById('question-counter'); // Necesitas agregar un id="question-counter" a tu HTML
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishTestBtn = document.getElementById('finish-test-btn');
        const finishAttemptBtn = document.getElementById('finish-attempt-btn');


        if (!questionContainer) return;

        const currentQuestion = currentTestState.questions[currentTestState.currentIndex];
        
        // Actualizar contador de preguntas (asegúrate de que existe un elemento con id="question-counter" en tu HTML)
        if (questionCounter) {
            questionCounter.textContent = `Pregunta ${currentTestState.currentIndex + 1} de ${currentTestState.questions.length}`;
        }
        
        let questionHtml = `
            <div class="mb-4">
                <p class="question-text">${currentTestState.currentIndex + 1}. ${currentQuestion.question}</p>
                <div class="options-container">
        `;

        currentQuestion.options.forEach((option, index) => {
            const optionId = `q${currentTestState.currentIndex}-opt${index}`;
            const isChecked = currentTestState.answers[currentTestState.currentIndex] === index ? 'checked' : '';
            questionHtml += `
                <div class="custom-radio">
                    <input class="form-check-input" type="radio" name="question-${currentTestState.currentIndex}" id="${optionId}" value="${index}" ${isChecked}>
                    <label class="form-check-label" for="${optionId}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </label>
                </div>
            `;
        });
        questionHtml += `</div></div>`;
        questionContainer.innerHTML = questionHtml;

        // Actualizar estado de botones
        prevBtn.disabled = currentTestState.currentIndex === 0;
        nextBtn.classList.toggle('hidden', currentTestState.currentIndex === currentTestState.questions.length - 1);
        finishTestBtn.classList.toggle('hidden', currentTestState.currentIndex !== currentTestState.questions.length - 1);
        finishAttemptBtn.classList.toggle('hidden', currentTestState.currentIndex === currentTestState.questions.length - 1); // Siempre visible excepto en la última
        
        // Listener para guardar la respuesta al cambiar de opción
        document.querySelectorAll(`input[name="question-${currentTestState.currentIndex}"]`).forEach(input => {
            input.addEventListener('change', (e) => {
                currentTestState.answers[currentTestState.currentIndex] = parseInt(e.target.value);
            });
        });
    }

    function saveCurrentAnswer() {
        const selectedOption = document.querySelector(`input[name="question-${currentTestState.currentIndex}"]:checked`);
        if (selectedOption) {
            currentTestState.answers[currentTestState.currentIndex] = parseInt(selectedOption.value);
        } else {
            currentTestState.answers[currentTestState.currentIndex] = null; // No respondió
        }
    }

    function navigateNext() {
        saveCurrentAnswer();
        if (currentTestState.currentIndex < currentTestState.questions.length - 1) {
            currentTestState.currentIndex++;
            loadQuestion();
        }
    }

    function navigatePrev() {
        saveCurrentAnswer();
        if (currentTestState.currentIndex > 0) {
            currentTestState.currentIndex--;
            loadQuestion();
        }
    }

    function finishAttempt() {
        stopTimer();
        saveCurrentAnswer(); // Asegurarse de guardar la respuesta actual

        const totalQuestions = currentTestState.questions.length;
        const answeredCount = currentTestState.answers.filter(answer => answer !== null).length;

        // Actualizar o añadir historial
        let existingAttemptIndex = currentUser.history.findIndex(h => h.testId === currentTestState.type && h.status === 'incompleto');

        const attemptData = {
            testId: currentTestState.type,
            testName: testConfig[currentTestState.type].name,
            date: new Date().toISOString().split('T')[0],
            status: 'incompleto',
            answered: answeredCount,
            totalQuestions: totalQuestions,
            timeRemaining: currentTestState.timeRemaining,
            lastQuestionIndex: currentTestState.currentIndex,
            answers: currentTestState.answers // Guardar las respuestas completas
        };

        if (existingAttemptIndex !== -1) {
            currentUser.history[existingAttemptIndex] = attemptData;
        } else {
            currentUser.history.push(attemptData);
        }
        
        localStorage.setItem('paesAppUsers', JSON.stringify(allUsers)); // Guardar todos los usuarios
        alert('Intento de prueba guardado. Puedes retomarlo desde el dashboard.');
        showStudentDashboard();
    }

    function submitTest() {
        stopTimer();
        saveCurrentAnswer(); // Asegurarse de guardar la última respuesta

        const questions = currentTestState.questions;
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;

        currentTestState.answers.forEach((userAnswer, index) => {
            if (userAnswer === null) {
                unansweredCount++;
            } else if (questions[index].correctOption === userAnswer) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        });

        const totalQuestions = questions.length;
        const score = correctCount;

        // Eliminar cualquier intento incompleto previo para esta prueba
        currentUser.history = currentUser.history.filter(h => !(h.testId === currentTestState.type && h.status === 'incompleto'));

        currentUser.history.push({
            testId: currentTestState.type,
            testName: testConfig[currentTestState.type].name,
            date: new Date().toISOString().split('T')[0],
            status: 'completado',
            correct: correctCount,
            incorrect: incorrectCount,
            unanswered: unansweredCount,
            score: score,
            totalQuestions: totalQuestions,
            answers: currentTestState.answers
        });

        localStorage.setItem('paesAppUsers', JSON.stringify(allUsers));
        alert(`Prueba finalizada!\nCorrectas: ${correctCount}\nIncorrectas: ${incorrectCount}\nSin responder: ${unansweredCount}\nPuntaje: ${score}/${totalQuestions}`);
        showStudentDashboard();
    }

    // --- Funciones de Temporizador ---
    function startTimer() {
        if (currentTestState.timerInterval) {
            clearInterval(currentTestState.timerInterval);
        }
        updateTimerDisplay(); // Mostrar el tiempo inicial

        currentTestState.timerInterval = setInterval(() => {
            currentTestState.timeRemaining--;
            updateTimerDisplay();
            if (currentTestState.timeRemaining <= 0) {
                clearInterval(currentTestState.timerInterval);
                alert('¡El tiempo ha terminado! Tu prueba se ha finalizado y guardado automáticamente.');
                submitTest(); // Finaliza y corrige la prueba automáticamente
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const hours = Math.floor(currentTestState.timeRemaining / 3600);
        const minutes = Math.floor((currentTestState.timeRemaining % 3600) / 60);
        const seconds = currentTestState.timeRemaining % 60;

        const formattedTime = [hours, minutes, seconds]
            .map(unit => unit < 10 ? '0' + unit : unit)
            .join(':');

        if (headerTimerDisplay) { // Asegurarse de que el elemento existe
            headerTimerDisplay.textContent = formattedTime;
        }
    }

    function stopTimer() {
        clearInterval(currentTestState.timerInterval);
        currentTestState.timerInterval = null;
    }

    // --- Admin Views Render Functions ---
    function renderAdminUsersView() {
        const adminUsersView = document.getElementById('admin-users-view');
        if (!adminUsersView) return; // Asegurar que la vista exista
        adminUsersView.innerHTML = `
            <div class="card p-4">
                <h3 class="mb-4">Gestión de Usuarios</h3>
                <button class="btn btn-success mb-3" id="add-user-btn"><i class="fas fa-plus-circle"></i> Añadir Nuevo Usuario</button>
                <div class="card p-3 mb-3 hidden" id="add-user-form-card">
                    <h5>Añadir Usuario</h5>
                    <form id="add-user-form">
                        <div class="mb-3">
                            <label for="new-username" class="form-label">Usuario</label>
                            <input type="text" class="form-control" id="new-username" required>
                        </div>
                        <div class="mb-3">
                            <label for="new-password" class="form-label">Contraseña</label>
                            <input type="password" class="form-control" id="new-password" required>
                        </div>
                        <div class="mb-3">
                            <label for="new-role" class="form-label">Rol</label>
                            <select class="form-control" id="new-role">
                                <option value="student">Estudiante</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary me-2"><i class="fas fa-save"></i> Guardar Usuario</button>
                        <button type="button" class="btn btn-secondary" id="cancel-add-user-btn"><i class="fas fa-times"></i> Cancelar</button>
                    </form>
                </div>
                <div class="list-group" id="users-list-container"></div>
            </div>
        `;
        // Configurar event listeners después de renderizar la vista
        document.getElementById('add-user-btn').addEventListener('click', () => {
            document.getElementById('add-user-form-card').classList.remove('hidden');
        });
        document.getElementById('cancel-add-user-btn').addEventListener('click', () => {
            document.getElementById('add-user-form-card').classList.add('hidden');
            document.getElementById('add-user-form').reset();
        });
        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('new-role').value;

            if (allUsers.some(u => u.user === username)) {
                alert('Este nombre de usuario ya existe.');
                return;
            }

            allUsers.push({ user: username, password: password, role: role, name: username, history: [] });
            localStorage.setItem('paesAppUsers', JSON.stringify(allUsers));
            document.getElementById('add-user-form').reset();
            document.getElementById('add-user-form-card').classList.add('hidden');
            renderUsersList(); // Actualizar la lista de usuarios
            updateAdminStats();
            alert('Usuario añadido con éxito.');
        });
        renderUsersList();
    }

    function renderUsersList() {
        const container = document.getElementById('users-list-container');
        if (!container) return;
        container.innerHTML = '';
        allUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('list-group-item', 'admin-list-item');
            userItem.innerHTML = `
                <div>
                    <strong>${user.name} (${user.user})</strong> - <span class="badge bg-secondary">${user.role}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-danger delete-user-btn" data-username="${user.user}"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            `;
            container.appendChild(userItem);
        });

        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const usernameToDelete = e.currentTarget.dataset.username;
                if (currentUser && currentUser.user === usernameToDelete) {
                    alert('No puedes eliminar tu propia cuenta.');
                    return;
                }
                if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${usernameToDelete}?`)) {
                    allUsers = allUsers.filter(u => u.user !== usernameToDelete);
                    localStorage.setItem('paesAppUsers', JSON.stringify(allUsers));
                    renderUsersList();
                    updateAdminStats();
                }
            });
        });
    }

    function renderAdminModulesView() {
        const adminModulesView = document.getElementById('admin-modules-view');
        if (!adminModulesView) return;
        adminModulesView.innerHTML = `
            <div class="card p-4">
                <h3 class="mb-4">Gestión de Módulos de Pruebas</h3>
                <button class="btn btn-success mb-3" id="add-module-btn"><i class="fas fa-plus-circle"></i> Añadir Nuevo Módulo</button>
                <div class="card p-3 mb-3 hidden" id="add-module-form-card">
                    <h5>Añadir Módulo</h5>
                    <form id="add-module-form">
                        <div class="mb-3">
                            <label for="new-module-id" class="form-label">ID del Módulo (ej: m3)</label>
                            <input type="text" class="form-control" id="new-module-id" required>
                        </div>
                        <div class="mb-3">
                            <label for="new-module-name" class="form-label">Nombre del Módulo</label>
                            <input type="text" class="form-control" id="new-module-name" required>
                        </div>
                        <div class="mb-3">
                            <label for="new-module-type" class="form-label">Tipo</label>
                            <select class="form-control" id="new-module-type">
                                <option value="obligatoria">Obligatoria</option>
                                <option value="electiva">Electiva</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="new-module-questions" class="form-label">Cantidad de Preguntas (Solo referencia)</label>
                            <input type="number" class="form-control" id="new-module-questions" required min="1" value="5">
                        </div>
                        <div class="mb-3">
                            <label for="new-module-duration" class="form-label">Duración (minutos)</label>
                            <input type="number" class="form-control" id="new-module-duration" required min="1" value="15">
                        </div>
                        <button type="submit" class="btn btn-primary me-2"><i class="fas fa-save"></i> Guardar Módulo</button>
                        <button type="button" class="btn btn-secondary" id="cancel-add-module-btn"><i class="fas fa-times"></i> Cancelar</button>
                    </form>
                </div>
                <div class="list-group" id="modules-list-container"></div>
                <p class="text-muted mt-3">Nota: Para añadir o editar las preguntas de un módulo, debes modificar el objeto `allQuestions` directamente en `script.js`.</p>
            </div>
        `;
        // Configurar event listeners
        document.getElementById('add-module-btn').addEventListener('click', () => {
            document.getElementById('add-module-form-card').classList.remove('hidden');
        });
        document.getElementById('cancel-add-module-btn').addEventListener('click', () => {
            document.getElementById('add-module-form-card').classList.add('hidden');
            document.getElementById('add-module-form').reset();
        });
        document.getElementById('add-module-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('new-module-id').value;
            const name = document.getElementById('new-module-name').value;
            const type = document.getElementById('new-module-type').value;
            const questionsCount = parseInt(document.getElementById('new-module-questions').value); // Esto es solo referencial
            const duration = parseInt(document.getElementById('new-module-duration').value);

            if (testConfig[id]) {
                alert('Ya existe un módulo con este ID.');
                return;
            }
            if (isNaN(questionsCount) || questionsCount <= 0 || isNaN(duration) || duration <= 0) {
                alert('Cantidad de preguntas y duración deben ser números positivos.');
                return;
            }
            // Añadir al testConfig
            testConfig[id] = { name, type, questionsCount, duration };
            allQuestions[id] = []; // Inicializar array de preguntas vacío para el nuevo módulo

            // No hay necesidad de guardar allTests o allQuestions en localStorage si están hardcodeados.
            // Si quieres que los cambios persistan en sesiones, deberíamos adaptar allTests para ser una variable que se guarde.
            // Por ahora, solo se guarda en la sesión actual.
            alert('Módulo añadido con éxito (temporalmente). Reinicia para perderlo si no lo añades a script.js.');
            document.getElementById('add-module-form').reset();
            document.getElementById('add-module-form-card').classList.add('hidden');
            renderModulesList();
            updateAdminStats();
        });
        renderModulesList();
    }

    function renderModulesList() {
        const container = document.getElementById('modules-list-container');
        if (!container) return;
        container.innerHTML = '';
        Object.keys(testConfig).forEach(id => {
            const module = testConfig[id];
            const moduleItem = document.createElement('div');
            moduleItem.classList.add('list-group-item', 'admin-list-item');
            moduleItem.innerHTML = `
                <div>
                    <strong>${module.name}</strong> (${id}) - <span class="badge ${module.type === 'obligatoria' ? 'bg-danger' : 'bg-info'}">${module.type}</span>
                    <br>
                    <small class="text-muted">${allQuestions[id] ? allQuestions[id].length : 0} preguntas • ${module.duration} min</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-danger delete-module-btn" data-module-id="${id}"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            `;
            container.appendChild(moduleItem);
        });

        document.querySelectorAll('.delete-module-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const moduleIdToDelete = e.currentTarget.dataset.moduleId;
                if (confirm(`¿Estás seguro de que quieres eliminar el módulo "${testConfig[moduleIdToDelete].name}"? Esto también afectará el historial de los usuarios que hayan realizado esta prueba (no se eliminarán los registros, pero el módulo ya no existirá).`)) {
                    delete testConfig[moduleIdToDelete];
                    delete allQuestions[moduleIdToDelete]; // Eliminar sus preguntas asociadas

                    // Limpiar historial de usuarios para este módulo (opcional, pero buena práctica)
                    allUsers.forEach(user => {
                        user.history = user.history.filter(h => h.testId !== moduleIdToDelete);
                    });
                    localStorage.setItem('paesAppUsers', JSON.stringify(allUsers)); // Guardar cambios en usuarios

                    alert('Módulo y sus datos asociados eliminados. Recuerda que este cambio es temporal a menos que lo hagas en el código fuente.');
                    renderModulesList();
                    updateAdminStats();
                }
            });
        });
    }

    function renderAdminStatsView() {
        const adminStatsView = document.getElementById('admin-stats-view');
        if (!adminStatsView) return;
        adminStatsView.innerHTML = `
            <div class="card p-4">
                <h3 class="mb-4">Estadísticas Generales</h3>
                <div class="admin-dashboard-grid">
                    <div class="dashboard-card">
                        <h4 class="card-title">Puntajes Promedio por Módulo</h4>
                        <div id="avg-scores-container"></div>
                    </div>
                    <div class="dashboard-card">
                        <h4 class="card-title">Intentos de Prueba por Módulo</h4>
                        <div id="attempts-per-module-container"></div>
                    </div>
                </div>
            </div>
        `;
        updateAdminStatsContainers();
    }

    function updateAdminStats() {
        // Esta función actualiza los contadores en el dashboard principal
        const totalUsersCount = document.getElementById('total-users-count');
        const totalModulesCount = document.getElementById('total-modules-count');
        const totalAttemptsCount = document.getElementById('total-attempts-count');

        if (totalUsersCount) totalUsersCount.textContent = allUsers.length;
        if (totalModulesCount) totalModulesCount.textContent = Object.keys(testConfig).length;
        
        let totalAttempts = 0;
        allUsers.forEach(user => {
            totalAttempts += user.history.length;
        });
        if (totalAttemptsCount) totalAttemptsCount.textContent = totalAttempts;
    }

    function updateAdminStatsContainers() {
        const avgScoresContainer = document.getElementById('avg-scores-container');
        const attemptsPerModuleContainer = document.getElementById('attempts-per-module-container');
        if (!avgScoresContainer || !attemptsPerModuleContainer) return;

        avgScoresContainer.innerHTML = '';
        attemptsPerModuleContainer.innerHTML = '';

        const moduleStats = {}; // { testId: { name: '', totalScore: 0, completedAttempts: 0, totalAttempts: 0 } }
        Object.keys(testConfig).forEach(id => {
            moduleStats[id] = {
                name: testConfig[id].name,
                totalScore: 0,
                completedAttempts: 0,
                totalQuestions: testConfig[id].questionsCount,
                totalAttempts: 0
            };
        });

        allUsers.forEach(user => {
            user.history.forEach(item => {
                if (moduleStats[item.testId]) {
                    moduleStats[item.testId].totalAttempts++;
                    if (item.status === 'completado') {
                        moduleStats[item.testId].completedAttempts++;
                        moduleStats[item.testId].totalScore += item.score;
                    }
                }
            });
        });

        let hasAvgScores = false;
        for (const id in moduleStats) {
            const stats = moduleStats[id];
            if (stats.completedAttempts > 0) {
                hasAvgScores = true;
                const avg = (stats.totalScore / stats.completedAttempts);
                const percentage = ((avg / stats.totalQuestions) * 100).toFixed(0);
                avgScoresContainer.innerHTML += `
                    <div class="mb-2">
                        <h6>${stats.name}</h6>
                        <div class="progress" role="progressbar" aria-label="${stats.name} Average Score" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar bg-info" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                        <small class="text-muted">Promedio: ${avg.toFixed(1)} de ${stats.totalQuestions} en ${stats.completedAttempts} intentos completados</small>
                    </div>
                `;
            }
        }
        if (!hasAvgScores) {
            avgScoresContainer.innerHTML = '<p class="text-muted">No hay datos de puntajes promedio disponibles.</p>';
        }

        let hasAttemptsData = false;
        for (const id in moduleStats) {
            const stats = moduleStats[id];
            if (stats.totalAttempts > 0) {
                hasAttemptsData = true;
                attemptsPerModuleContainer.innerHTML += `
                    <div class="mb-2">
                        <h6>${stats.name}</h6>
                        <p class="mb-0"><span class="badge bg-primary">${stats.totalAttempts}</span> Intentos totales</p>
                        <small class="text-muted">${stats.completedAttempts} completados, ${stats.totalAttempts - stats.completedAttempts} incompletos</small>
                    </div>
                `;
            }
        }
        if (!hasAttemptsData) {
            attemptsPerModuleContainer.innerHTML = '<p class="text-muted">No hay datos de intentos disponibles.</p>';
        }
    }


    // --- Utilidades ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Iniciar la aplicación ---
    init();
});