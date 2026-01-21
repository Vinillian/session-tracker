const API_URL = 'https://session-tracker.up.railway.app/api';

let currentUser = null;
let currentToken = null;
let allSessions = []; // Для хранения всех сессий (на странице sessions.html)
let filteredSessions = []; // Отфильтрованные сессии

// Определяем на какой странице находимся
const currentPage = window.location.pathname.split('/').pop();

// ==================== ОБЩИЕ ФУНКЦИИ ====================

// Загружаем данные из localStorage при запуске
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        currentToken = savedToken;
        initPage();
    } else {
        showAuth();
    }
    
    // Устанавливаем текущее время для форм
    setupTimeInputs();
});

// Инициализация страницы
function initPage() {
    if (currentPage === 'index.html' || currentPage === '') {
        initDashboard();
    } else if (currentPage === 'sessions.html') {
        initSessionsPage();
    }
    showMainApp();
}

// Показать форму авторизации
function showAuth() {
    const authSection = document.getElementById('authSection');
    const mainApp = document.getElementById('mainApp');
    
    if (authSection) authSection.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    
    if (currentPage === 'sessions.html') {
        // На странице сессий показываем специальное сообщение
        const authMessage = document.getElementById('authMessage');
        if (authMessage) {
            authMessage.innerHTML = `
                <div class="auth-message">
                    <h2><i class="fas fa-lock"></i> Требуется авторизация</h2>
                    <p>Пожалуйста, войдите в систему чтобы просматривать сессии</p>
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">
                        <i class="fas fa-sign-in-alt"></i> Перейти ко входу
                    </button>
                </div>
            `;
        }
    }
}

// Показать основное приложение
function showMainApp() {
    const authSection = document.getElementById('authSection');
    const mainApp = document.getElementById('mainApp');
    
    if (authSection) authSection.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // Обновляем приветствие
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting && currentUser) {
        userGreeting.textContent = `Привет, ${currentUser.username}!`;
    }
}

// Общие функции для сообщений
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.className = type;
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${text}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

// Установка времени в формах
function setupTimeInputs() {
    const now = new Date();
    const currentTime = now.toTimeString().substr(0, 5);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    
    // Для dashboard
    const quickStartTime = document.getElementById('quickStartTime');
    const quickEndTime = document.getElementById('quickEndTime');
    
    if (quickStartTime) quickStartTime.value = currentTime;
    if (quickEndTime) quickEndTime.value = endTime;
    
    // Устанавливаем текущую дату
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });
}

// ==================== АУТЕНТИФИКАЦИЯ ====================

// Вход
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            currentToken = data.token;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', currentToken);
            initPage();
            showMessage('Вход выполнен!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Регистрация
async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!username || !email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            currentToken = data.token;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', currentToken);
            initPage();
            showMessage('Регистрация успешна!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Показать форму регистрации
function showRegister() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.classList.toggle('hidden');
    }
}

// Выход
function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ==================== DASHBOARD ФУНКЦИИ ====================

function initDashboard() {
    loadDashboardStats();
    loadRecentSessions();
}

// Загрузить статистику для dashboard
async function loadDashboardStats() {
    if (!currentToken) return;
    
    try {
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const sessions = await response.json();
            updateDashboardStats(sessions);
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Обновить статистику на dashboard
function updateDashboardStats(sessions) {
    if (!sessions || sessions.length === 0) {
        updateStatsUI(0, 0, 0, 0);
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Фильтруем сессии
    const todaySessions = sessions.filter(s => s.session_date === today);
    const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.session_date);
        return sessionDate >= oneWeekAgo;
    });
    
    // Рассчитываем время
    const todayTime = calculateTotalTime(todaySessions);
    const weekTime = calculateTotalTime(weekSessions);
    const totalSessions = sessions.length;
    const totalTasks = sessions.reduce((sum, session) => sum + (session.tasks_completed || 0), 0);
    
    // Обновляем UI
    document.getElementById('todayTime').textContent = todayTime;
    document.getElementById('weekTime').textContent = weekTime;
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalTasksCompleted').textContent = totalTasks;
}

// Рассчитать общее время из сессий
function calculateTotalTime(sessions) {
    let totalMinutes = 0;
    
    sessions.forEach(session => {
        const [hours, minutes] = session.duration.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
        return `${minutes}м`;
    } else if (minutes === 0) {
        return `${hours}ч`;
    } else {
        return `${hours}ч ${minutes}м`;
    }
}

// Обновить UI статистики (заглушка)
function updateStatsUI(todayTime, weekTime, totalSessions, totalTasks) {
    const elements = {
        'todayTime': todayTime,
        'weekTime': weekTime,
        'totalSessions': totalSessions,
        'totalTasksCompleted': totalTasks
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 0;
        }
    });
}

// Загрузить последние сессии для dashboard
async function loadRecentSessions() {
    if (!currentToken) return;
    
    const recentSessionsDiv = document.getElementById('recentSessions');
    const noRecentSessionsDiv = document.getElementById('noRecentSessions');
    const loadingDiv = document.getElementById('loadingRecentSessions');
    
    if (recentSessionsDiv) recentSessionsDiv.innerHTML = '<div class="loading">Загрузка...</div>';
    if (noRecentSessionsDiv) noRecentSessionsDiv.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const sessions = await response.json();
            displayRecentSessions(sessions.slice(0, 5)); // Показываем только 5 последних
        }
    } catch (error) {
        if (recentSessionsDiv) {
            recentSessionsDiv.innerHTML = '<div class="error">Ошибка загрузки</div>';
        }
    }
}

// Отобразить последние сессии на dashboard
function displayRecentSessions(sessions) {
    const recentSessionsDiv = document.getElementById('recentSessions');
    const noRecentSessionsDiv = document.getElementById('noRecentSessions');
    
    if (!recentSessionsDiv) return;
    
    if (sessions.length === 0) {
        recentSessionsDiv.innerHTML = '';
        if (noRecentSessionsDiv) noRecentSessionsDiv.classList.remove('hidden');
        return;
    }
    
    if (noRecentSessionsDiv) noRecentSessionsDiv.classList.add('hidden');
    
    recentSessionsDiv.innerHTML = sessions.map(session => `
        <div class="session-item-compact" id="session-${session.id}">
            <div class="session-info-compact">
                <div class="session-date-compact">${formatDateShort(session.session_date)}</div>
                <div class="session-time-compact">${session.start_time} - ${session.end_time} (${session.duration})</div>
                <div class="session-tasks-compact">✅ ${session.tasks_completed}</div>
            </div>
            <div class="session-actions-compact">
                <button class="btn-expand" onclick="toggleSessionDetails(${session.id})" title="Подробнее">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="session-details hidden" id="details-${session.id}">
                ${session.comments ? `
                    <div class="session-comment">
                        <strong>Комментарий:</strong> ${session.comments}
                    </div>
                ` : '<div class="session-comment"><em>Нет комментария</em></div>'}
                <div class="session-actions">
                    <small>Добавлено: ${formatDateTime(session.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Добавить быструю сессию с dashboard
async function addQuickSession() {
    if (!currentToken) {
        showMessage('Сначала войдите в систему', 'error');
        return;
    }
    
    const startTime = document.getElementById('quickStartTime').value;
    const endTime = document.getElementById('quickEndTime').value;
    const tasksCompleted = document.getElementById('quickTasks').value;
    const comment = document.getElementById('quickComment').value;
    const today = new Date().toISOString().split('T')[0];
    
    if (!startTime || !endTime) {
        showMessage('Укажите время начала и окончания', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                session_date: today,
                start_time: startTime,
                end_time: endTime,
                tasks_completed: parseInt(tasksCompleted) || 0,
                comments: comment
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Сессия добавлена!', 'success');
            loadDashboardStats();
            loadRecentSessions();
            
            // Очистить форму
            document.getElementById('quickTasks').value = 0;
            document.getElementById('quickComment').value = '';
            
            // Установить новое время по умолчанию
            const now = new Date();
            document.getElementById('quickStartTime').value = now.toTimeString().substr(0, 5);
            document.getElementById('quickEndTime').value = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Начать быструю сессию (текущее время + 2 часа)
function startQuickSession() {
    const now = new Date();
    const startTime = now.toTimeString().substr(0, 5);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    
    document.getElementById('quickStartTime').value = startTime;
    document.getElementById('quickEndTime').value = endTime;
    document.getElementById('quickTasks').value = 0;
    document.getElementById('quickComment').value = 'Работа над проектом';
    
    showMessage('Заполнена форма быстрой сессии', 'info');
}

// Добавить тестовую сессию
async function addTestSession() {
    if (!currentToken) {
        showMessage('Сначала войдите в систему', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    const endTime = now.toTimeString().substr(0, 5);
    
    const testComments = [
        'Изучал Python и Flask',
        'Работал над фронтендом проекта',
        'Оптимизировал базу данных',
        'Написал документацию',
        'Проходил онлайн-курс'
    ];
    
    const randomComment = testComments[Math.floor(Math.random() * testComments.length)];
    
    try {
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                session_date: today,
                start_time: startTime,
                end_time: endTime,
                tasks_completed: Math.floor(Math.random() * 10) + 1,
                comments: randomComment
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Тестовая сессия добавлена!', 'success');
            loadDashboardStats();
            loadRecentSessions();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// ==================== SESSIONS PAGE ФУНКЦИИ ====================

function initSessionsPage() {
    loadSessions();
}

// Загрузить все сессии
async function loadSessions() {
    if (!currentToken) return;
    
    const sessionsList = document.getElementById('sessionsList');
    const loadingDiv = document.getElementById('loadingSessions');
    const noSessionsDiv = document.getElementById('noSessionsMessage');
    
    if (sessionsList) sessionsList.innerHTML = '';
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (noSessionsDiv) noSessionsDiv.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            allSessions = await response.json();
            filteredSessions = [...allSessions];
            
            displayAllSessions();
            updateSessionsStats();
            
            // Активируем фильтр "Все" по умолчанию
            setActiveFilter('all');
        }
    } catch (error) {
        if (sessionsList) {
            sessionsList.innerHTML = '<div class="error">Ошибка загрузки сессий</div>';
        }
    } finally {
        if (loadingDiv) loadingDiv.classList.add('hidden');
    }
}

// Отобразить все сессии
function displayAllSessions() {
    const sessionsList = document.getElementById('sessionsList');
    const noSessionsDiv = document.getElementById('noSessionsMessage');
    
    if (!sessionsList) return;
    
    if (filteredSessions.length === 0) {
        sessionsList.innerHTML = '';
        if (noSessionsDiv) noSessionsDiv.classList.remove('hidden');
        return;
    }
    
    if (noSessionsDiv) noSessionsDiv.classList.add('hidden');
    
    sessionsList.innerHTML = filteredSessions.map(session => `
        <div class="session-item-compact" id="session-${session.id}">
            <div class="session-info-compact">
                <div class="session-date-compact">${formatDateShort(session.session_date)}</div>
                <div class="session-time-compact">${session.start_time} - ${session.end_time} (${session.duration})</div>
                <div class="session-tasks-compact">✅ ${session.tasks_completed}</div>
            </div>
            <div class="session-actions-compact">
                <button class="btn-expand" onclick="toggleSessionDetails(${session.id})" title="Подробнее">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="session-details hidden" id="details-${session.id}">
                ${session.comments ? `
                    <div class="session-comment">
                        <strong>Комментарий:</strong> ${session.comments}
                    </div>
                ` : '<div class="session-comment"><em>Нет комментария</em></div>'}
                <div class="session-actions">
                    <small>Добавлено: ${formatDateTime(session.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Обновить статистику на странице сессий
function updateSessionsStats() {
    if (!filteredSessions || filteredSessions.length === 0) {
        updateSessionsStatsUI(0, '0ч', 0, '0ч');
        return;
    }
    
    const totalSessions = filteredSessions.length;
    const totalTime = calculateTotalTime(filteredSessions);
    const totalTasks = filteredSessions.reduce((sum, session) => sum + (session.tasks_completed || 0), 0);
    
    // Средняя продолжительность сессии
    let totalMinutes = 0;
    filteredSessions.forEach(session => {
        const [hours, minutes] = session.duration.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
    });
    
    const avgMinutes = Math.round(totalMinutes / totalSessions);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    const avgTime = avgHours > 0 ? `${avgHours}ч ${avgMins}м` : `${avgMins}м`;
    
    updateSessionsStatsUI(totalSessions, totalTime, totalTasks, avgTime);
}

// Обновить UI статистики сессий
function updateSessionsStatsUI(totalSessions, totalTime, totalTasks, avgTime) {
    const elements = {
        'totalSessionsCount': totalSessions,
        'totalTimeCount': totalTime,
        'totalTasksCount': totalTasks,
        'avgSessionTime': avgTime
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 0;
        }
    });
}

// Фильтрация сессий
function filterSessions(filterType) {
    if (!allSessions || allSessions.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    switch (filterType) {
        case 'today':
            filteredSessions = allSessions.filter(s => s.session_date === today);
            break;
            
        case 'week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            filteredSessions = allSessions.filter(s => {
                const sessionDate = new Date(s.session_date);
                return sessionDate >= oneWeekAgo;
            });
            break;
            
        case 'month':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            filteredSessions = allSessions.filter(s => {
                const sessionDate = new Date(s.session_date);
                return sessionDate >= oneMonthAgo;
            });
            break;
            
        default: // 'all'
            filteredSessions = [...allSessions];
    }
    
    setActiveFilter(filterType);
    displayAllSessions();
    updateSessionsStats();
}

// Установить активный фильтр
function setActiveFilter(filterType) {
    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filterType)) {
            btn.classList.add('active');
        }
    });
}

// Поиск сессий
function searchSessions() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput || !allSessions) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredSessions = [...allSessions];
    } else {
        filteredSessions = allSessions.filter(session => {
            const comment = session.comments ? session.comments.toLowerCase() : '';
            return comment.includes(searchTerm);
        });
    }
    
    displayAllSessions();
    updateSessionsStats();
}

// Сортировка сессий
function sortSessions() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect || !filteredSessions) return;
    
    const sortBy = sortSelect.value;
    
    switch (sortBy) {
        case 'date-asc':
            filteredSessions.sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
            break;
            
        case 'date-desc':
            filteredSessions.sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
            break;
            
        case 'duration-desc':
            filteredSessions.sort((a, b) => {
                const [aHours, aMins] = a.duration.split(':').map(Number);
                const [bHours, bMins] = b.duration.split(':').map(Number);
                return (bHours * 60 + bMins) - (aHours * 60 + aMins);
            });
            break;
            
        case 'duration-asc':
            filteredSessions.sort((a, b) => {
                const [aHours, aMins] = a.duration.split(':').map(Number);
                const [bHours, bMins] = b.duration.split(':').map(Number);
                return (aHours * 60 + aMins) - (bHours * 60 + bMins);
            });
            break;
            
        case 'tasks-desc':
            filteredSessions.sort((a, b) => (b.tasks_completed || 0) - (a.tasks_completed || 0));
            break;
    }
    
    displayAllSessions();
}

// ==================== ОБЩИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

// Переключить детали сессии
function toggleSessionDetails(sessionId) {
    const detailsDiv = document.getElementById(`details-${sessionId}`);
    const button = document.querySelector(`#session-${sessionId} .btn-expand i`);
    
    if (detailsDiv.classList.contains('hidden')) {
        detailsDiv.classList.remove('hidden');
        button.className = 'fas fa-chevron-up';
    } else {
        detailsDiv.classList.add('hidden');
        button.className = 'fas fa-chevron-down';
    }
}

// Форматирование короткой даты
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

// Форматирование даты и времени
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Перейти на страницу всех сессий
function goToAllSessions() {
    window.location.href = 'sessions.html';
}

// Перейти на dashboard
function goToDashboard() {
    window.location.href = 'index.html';
}

// Заглушка для задач (если нужно будет добавить позже)
function loadTasks() {
    showMessage('Функционал задач будет добавлен позже', 'info');
}

// ==================== TASKS PAGE ФУНКЦИИ ====================

// Определяем на какой странице находимся (дополнение)
if (currentPage === 'tasks.html') {
    initTasksPage();
}

function initTasksPage() {
    // Устанавливаем связь между полем ввода и слайдером
    const difficultyInput = document.getElementById('difficulty');
    const difficultySlider = document.getElementById('difficultySlider');
    
    if (difficultyInput && difficultySlider) {
        difficultyInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            this.value = value;
            difficultySlider.value = value;
        });
        
        difficultySlider.addEventListener('input', function() {
            difficultyInput.value = this.value;
        });
    }
    
    loadTasks();
    loadTaskStats();
}

// Очистить форму задачи
function clearTaskForm() {
    document.getElementById('taskUrl').value = '';
    document.getElementById('difficulty').value = '';
    document.getElementById('difficultySlider').value = 5;
    document.getElementById('taskComment').value = '';
    showMessage('Форма очищена', 'info');
}

// Добавить задачу
async function addTask() {
    if (!currentToken) {
        showMessage('Сначала войдите в систему', 'error');
        return;
    }
    
    const taskUrl = document.getElementById('taskUrl').value;
    const difficulty = document.getElementById('difficulty').value;
    const taskComment = document.getElementById('taskComment').value;
    
    if (!taskUrl) {
        showMessage('Введите ссылку на задачу', 'error');
        return;
    }
    
    // Проверка URL
    if (!isValidUrl(taskUrl)) {
        showMessage('Введите корректную ссылку (начинается с http:// или https://)', 'error');
        return;
    }
    
    // Проверка сложности
    let difficultyNum = null;
    if (difficulty) {
        difficultyNum = parseInt(difficulty);
        if (difficultyNum < 1 || difficultyNum > 10) {
            showMessage('Сложность должна быть от 1 до 10', 'error');
            return;
        }
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                task_url: taskUrl,
                difficulty: difficultyNum,
                comment: taskComment
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Задача успешно добавлена!', 'success');
            clearTaskForm();
            loadTasks();
            loadTaskStats();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Добавить тестовую задачу
async function addTestTask() {
    if (!currentToken) {
        showMessage('Сначала войдите в систему', 'error');
        return;
    }
    
    const testTasks = [
        {
            url: 'https://leetcode.com/problems/two-sum/',
            difficulty: 3,
            comment: 'Классическая задача на хэш-таблицы. Нужно найти два числа, сумма которых равна target.'
        },
        {
            url: 'https://leetcode.com/problems/valid-parentheses/',
            difficulty: 2,
            comment: 'Проверка правильности скобок с использованием стека.'
        },
        {
            url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
            difficulty: 4,
            comment: 'Слияние двух отсортированных связных списков в один отсортированный список.'
        },
        {
            url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
            difficulty: 5,
            comment: 'Найти максимальную прибыль от покупки и продажи акций.'
        },
        {
            url: 'https://leetcode.com/problems/container-with-most-water/',
            difficulty: 6,
            comment: 'Найти два столбца, которые вмещают максимальное количество воды.'
        }
    ];
    
    const randomTask = testTasks[Math.floor(Math.random() * testTasks.length)];
    
    // Заполняем форму
    document.getElementById('taskUrl').value = randomTask.url;
    document.getElementById('difficulty').value = randomTask.difficulty;
    document.getElementById('difficultySlider').value = randomTask.difficulty;
    document.getElementById('taskComment').value = randomTask.comment;
    
    showMessage('Форма заполнена тестовыми данными', 'info');
}

// Проверка валидности URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Загрузить задачи
async function loadTasks() {
    if (!currentToken) return;
    
    const tasksList = document.getElementById('tasksList');
    const loadingDiv = document.getElementById('loadingTasks');
    const noTasksDiv = document.getElementById('noTasksMessage');
    
    if (tasksList) tasksList.innerHTML = '';
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (noTasksDiv) noTasksDiv.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const tasks = await response.json();
            window.allTasks = tasks || [];
            window.filteredTasks = [...window.allTasks];
            displayTasks();
        }
    } catch (error) {
        if (tasksList) {
            tasksList.innerHTML = '<div class="error">Ошибка загрузки задач</div>';
        }
        console.error('Ошибка загрузки задач:', error);
    } finally {
        if (loadingDiv) loadingDiv.classList.add('hidden');
    }
}

// Отобразить задачи
function displayTasks() {
    const tasksList = document.getElementById('tasksList');
    const noTasksDiv = document.getElementById('noTasksMessage');
    
    if (!tasksList) return;
    
    if (!window.filteredTasks || window.filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        if (noTasksDiv) noTasksDiv.classList.remove('hidden');
        return;
    }
    
    if (noTasksDiv) noTasksDiv.classList.add('hidden');
    
    tasksList.innerHTML = window.filteredTasks.map(task => `
        <div class="task-card" id="task-${task.id}">
            <div class="task-header">
                <div class="task-title">
                    <a href="${task.task_url}" target="_blank" class="task-link">
                        <i class="fas fa-external-link-alt"></i> Задача
                    </a>
                </div>
                <div class="task-actions">
                    ${task.difficulty ? 
                        `<span class="difficulty-indicator difficulty-${task.difficulty}">
                            Сложность: ${task.difficulty}/10
                        </span>` : 
                        '<span class="difficulty-indicator" style="background: #a0aec0;">Сложность не указана</span>'
                    }
                    <button class="btn-delete-task" onclick="deleteTask(${task.id})" title="Удалить задачу">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
            
            <div class="task-meta">
                <div class="task-date">
                    <i class="far fa-calendar"></i> Добавлено: ${formatDateTime(task.created_at)}
                </div>
            </div>
            
            ${task.comment ? `
                <div class="task-comment">
                    <strong><i class="fas fa-comment"></i> Комментарий:</strong><br>
                    ${task.comment}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Загрузить статистику задач
async function loadTaskStats() {
    if (!currentToken) return;
    
    const taskStatsDiv = document.getElementById('taskStats');
    if (!taskStatsDiv) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            displayTaskStats(stats);
        }
    } catch (error) {
        taskStatsDiv.innerHTML = '<div class="error">Ошибка загрузки статистики</div>';
        console.error('Ошибка загрузки статистики задач:', error);
    }
}

// Отобразить статистику задач
function displayTaskStats(stats) {
    const taskStatsDiv = document.getElementById('taskStats');
    if (!taskStatsDiv) return;
    
    let statsHTML = `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${stats.total_tasks || 0}</div>
                <div class="stat-label">Всего задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avg_difficulty ? stats.avg_difficulty.toFixed(1) : 0}</div>
                <div class="stat-label">Средняя сложность</div>
            </div>
    `;
    
    if (stats.difficulty_distribution && stats.difficulty_distribution.length > 0) {
        statsHTML += `
            <div class="stat-card">
                <div class="stat-value">${stats.difficulty_distribution.length}</div>
                <div class="stat-label">Уровней сложности</div>
            </div>
        `;
        
        // Диаграмма распределения сложности
        let chartHTML = '<div class="difficulty-chart">';
        stats.difficulty_distribution.forEach(item => {
            const maxCount = Math.max(...stats.difficulty_distribution.map(d => d.count));
            const height = maxCount > 0 ? (item.count / maxCount * 80) : 0;
            
            chartHTML += `
                <div class="chart-bar" title="Сложность ${item.difficulty}: ${item.count} задач">
                    <div class="bar-fill" style="height: ${height}px"></div>
                    <div class="bar-label">${item.difficulty}</div>
                    <div class="bar-count">${item.count}</div>
                </div>
            `;
        });
        chartHTML += '</div>';
        
        taskStatsDiv.innerHTML = statsHTML + '</div>' + chartHTML;
    } else {
        taskStatsDiv.innerHTML = statsHTML + '</div><div class="info">Нет данных для статистики</div>';
    }
}

// Удалить задачу
async function deleteTask(taskId) {
    if (!confirm('Удалить эту задачу?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            // Удаляем из локальных массивов
            if (window.allTasks) {
                window.allTasks = window.allTasks.filter(task => task.id !== taskId);
            }
            if (window.filteredTasks) {
                window.filteredTasks = window.filteredTasks.filter(task => task.id !== taskId);
            }
            
            // Обновляем отображение
            displayTasks();
            loadTaskStats();
            showMessage('Задача удалена', 'success');
        } else {
            const data = await response.json();
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка удаления задачи', 'error');
    }
}

// Фильтрация задач по сложности
function filterTasks(filterType) {
    if (!window.allTasks || window.allTasks.length === 0) return;
    
    switch (filterType) {
        case 'easy':
            window.filteredTasks = window.allTasks.filter(task => 
                task.difficulty && task.difficulty >= 1 && task.difficulty <= 3
            );
            break;
            
        case 'medium':
            window.filteredTasks = window.allTasks.filter(task => 
                task.difficulty && task.difficulty >= 4 && task.difficulty <= 7
            );
            break;
            
        case 'hard':
            window.filteredTasks = window.allTasks.filter(task => 
                task.difficulty && task.difficulty >= 8 && task.difficulty <= 10
            );
            break;
            
        default: // 'all'
            window.filteredTasks = [...window.allTasks];
    }
    
    // Обновляем активную кнопку фильтра
    setActiveTaskFilter(filterType);
    displayTasks();
}

// Установить активный фильтр задач
function setActiveTaskFilter(filterType) {
    const filterButtons = document.querySelectorAll('.task-filter .btn-filter, .filters .btn-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filterType)) {
            btn.classList.add('active');
        }
    });
}

// Поиск задач
function searchTasks() {
    const searchInput = document.getElementById('taskSearchInput');
    if (!searchInput || !window.allTasks) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        window.filteredTasks = [...window.allTasks];
    } else {
        window.filteredTasks = window.allTasks.filter(task => {
            const comment = task.comment ? task.comment.toLowerCase() : '';
            const url = task.task_url ? task.task_url.toLowerCase() : '';
            return comment.includes(searchTerm) || url.includes(searchTerm);
        });
    }
    
    displayTasks();
}

// Сортировка задач
function sortTasks() {
    const sortSelect = document.getElementById('taskSortSelect');
    if (!sortSelect || !window.filteredTasks) return;
    
    const sortBy = sortSelect.value;
    
    switch (sortBy) {
        case 'newest':
            window.filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
            
        case 'oldest':
            window.filteredTasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
            
        case 'difficulty-desc':
            window.filteredTasks.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
            break;
            
        case 'difficulty-asc':
            window.filteredTasks.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
            break;
    }
    
    displayTasks();
}

// Экспорт задач (заглушка)
function exportTasks() {
    if (!window.filteredTasks || window.filteredTasks.length === 0) {
        showMessage('Нет задач для экспорта', 'info');
        return;
    }
    
    // Простой экспорт в CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ссылка,Сложность,Комментарий,Дата добавления\n";
    
    window.filteredTasks.forEach(task => {
        const row = [
            `"${task.task_url}"`,
            task.difficulty || 'Не указана',
            `"${(task.comment || '').replace(/"/g, '""')}"`,
            task.created_at
        ].join(',');
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('Задачи экспортированы в CSV', 'success');
}