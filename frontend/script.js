const API_URL = 'http://localhost:5000/api';

let currentUser = null;
let currentToken = null;

// Загружаем данные из localStorage при запуске
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        currentToken = savedToken;
        showMainApp();
    } else {
        showAuth();
    }
    
    // Устанавливаем текущую дату и время
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;
    
    const now = new Date();
    document.getElementById('startTime').value = now.toTimeString().substr(0, 5);
    
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    document.getElementById('endTime').value = endTime.toTimeString().substr(0, 5);
    
    // Заполняем тестовую ссылку на задачу
    document.getElementById('taskUrl').value = 'https://leetcode.com/problems/two-sum/';
});

// Показать форму авторизации
function showAuth() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('message').innerHTML = '';
}

// Показать основное приложение
function showMainApp() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userGreeting').textContent = `Привет, ${currentUser.username}!`;
    loadSessions();
    loadTasks();
}

// Общие функции для сообщений
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.className = type;
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${text}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
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
            showMainApp();
            showMessage('Регистрация успешна!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

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
            showMainApp();
            showMessage('Вход выполнен!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Тестовый вход (использует заполненные данные)
function testLogin() {
    login();
}

// Выход
function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showAuth();
    showMessage('Вы вышли из системы', 'info');
}

// Добавить сессию
async function addSession() {
    if (!currentToken) {
        showMessage('Сначала войдите в систему', 'error');
        return;
    }
    
    const sessionDate = document.getElementById('sessionDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const tasksCompleted = document.getElementById('tasksCompleted').value;
    const comments = document.getElementById('comments').value;
    
    if (!sessionDate || !startTime || !endTime) {
        showMessage('Заполните дату и время', 'error');
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
                session_date: sessionDate,
                start_time: startTime,
                end_time: endTime,
                tasks_completed: parseInt(tasksCompleted) || 0,
                comments: comments
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Сессия добавлена!', 'success');
            loadSessions();
            
            // Очистить форму
            document.getElementById('tasksCompleted').value = 0;
            document.getElementById('comments').value = '';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Добавить тестовую сессию
async function addTestSession() {
    if (!currentToken) {
        showMessage('Сначала войдите в систему', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startTime = now.toTimeString().substr(0, 5);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    
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
                comments: 'Тестовая сессия работы'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Тестовая сессия добавлена!', 'success');
            loadSessions();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Загрузить сессии
async function loadSessions() {
    if (!currentToken) return;
    
    document.getElementById('sessionsList').innerHTML = '<div class="loading">Загрузка сессий</div>';
    
    try {
        const response = await fetch(`${API_URL}/sessions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const sessions = await response.json();
            displaySessions(sessions);
            updateStats(sessions);
        } else {
            document.getElementById('sessionsList').innerHTML = '<div class="error">Ошибка загрузки сессий</div>';
        }
    } catch (error) {
        document.getElementById('sessionsList').innerHTML = '<div class="error">Ошибка подключения</div>';
    }
}

// Отобразить сессии
function displaySessions(sessions) {
    const sessionsList = document.getElementById('sessionsList');
    
    if (sessions.length === 0) {
        sessionsList.innerHTML = '<div class="info">Нет сессий. Добавьте первую!</div>';
        return;
    }
    
    sessionsList.innerHTML = sessions.map(session => `
        <div class="session-card">
            <div class="session-header">
                <div class="session-date">${formatDate(session.session_date)}</div>
                <div class="session-duration">${session.duration}</div>
            </div>
            <div class="session-time">
                ⏰ ${session.start_time} - ${session.end_time}
            </div>
            <div class="session-tasks">
                ✅ Выполнено задач: ${session.tasks_completed}
            </div>
            ${session.comments ? `
                <div class="session-comments">
                    💭 ${session.comments}
                </div>
            ` : ''}
            <div class="session-date-small">
                <small><i class="far fa-calendar"></i> ${formatDateShort(session.created_at)}</small>
            </div>
        </div>
    `).join('');
}

// Обновить статистику
function updateStats(sessions) {
    const totalSessions = sessions.length;
    const totalTasks = sessions.reduce((sum, session) => sum + (session.tasks_completed || 0), 0);
    
    // Расчет общего времени
    let totalHours = 0;
    let totalMinutes = 0;
    
    sessions.forEach(session => {
        const [hours, minutes] = session.duration.split(':').map(Number);
        totalHours += hours;
        totalMinutes += minutes;
    });
    
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
    
    // Средняя продолжительность
    const avgHours = totalSessions > 0 ? Math.round(totalHours / totalSessions * 10) / 10 : 0;
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalTime').textContent = `${totalHours}ч ${totalMinutes}м`;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('avgDuration').textContent = `${avgHours}ч`;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('ru-RU', options);
}

// Форматирование короткой даты
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// === ФУНКЦИИ ДЛЯ ЗАДАЧ ===

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
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                task_url: taskUrl,
                difficulty: difficulty ? parseInt(difficulty) : null,
                comment: taskComment
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Задача добавлена!', 'success');
            loadTasks();
            
            // Очистить форму
            document.getElementById('taskUrl').value = '';
            document.getElementById('difficulty').value = '';
            document.getElementById('taskComment').value = '';
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
            comment: 'Классическая задача на хэш-таблицы'
        },
        {
            url: 'https://leetcode.com/problems/valid-parentheses/',
            difficulty: 2,
            comment: 'Проверка правильности скобок'
        },
        {
            url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
            difficulty: 4,
            comment: 'Слияние двух отсортированных списков'
        },
        {
            url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
            difficulty: 5,
            comment: 'Максимальная прибыль от акций'
        }
    ];
    
    const task = testTasks[Math.floor(Math.random() * testTasks.length)];
    
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                task_url: task.url,
                difficulty: task.difficulty,
                comment: task.comment
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Тестовая задача добавлена!', 'success');
            loadTasks();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка подключения к серверу', 'error');
    }
}

// Загрузить задачи
async function loadTasks() {
    if (!currentToken) return;
    
    document.getElementById('taskList').innerHTML = '<div class="loading">Загрузка задач...</div>';
    document.getElementById('taskStats').innerHTML = '<div class="loading">Загрузка статистики...</div>';
    
    try {
        // Загружаем задачи
        const tasksResponse = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            displayTasks(tasks);
        }
        
        // Загружаем статистику
        const statsResponse = await fetch(`${API_URL}/tasks/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            displayTaskStats(stats);
        }
        
    } catch (error) {
        document.getElementById('taskList').innerHTML = '<div class="error">Ошибка загрузки задач</div>';
        document.getElementById('taskStats').innerHTML = '<div class="error">Ошибка загрузки статистики</div>';
    }
}

// Отобразить задачи
function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="info">Нет задач. Добавьте первую!</div>';
        return;
    }
    
    taskList.innerHTML = tasks.map(task => `
        <div class="task-card" id="task-${task.id}">
            <div class="task-header">
                <div class="task-link">
                    <a href="${task.task_url}" target="_blank" title="Открыть задачу">
                        <i class="fas fa-external-link-alt"></i> Задача
                    </a>
                </div>
                <div class="task-actions">
                    ${task.difficulty ? 
                        `<span class="difficulty-badge difficulty-${task.difficulty}">
                            Сложность: ${task.difficulty}/10
                        </span>` : 
                        '<span class="difficulty-badge">Сложность не указана</span>'
                    }
                    <button class="btn-delete" onclick="deleteTask(${task.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.comment ? `
                <div class="task-comment">
                    💬 ${task.comment}
                </div>
            ` : ''}
            <div class="task-date">
                <small><i class="far fa-calendar"></i> Добавлено: ${formatDateShort(task.created_at)}</small>
            </div>
        </div>
    `).join('');
}

// Отобразить статистику задач
function displayTaskStats(stats) {
    const taskStats = document.getElementById('taskStats');
    
    let statsHTML = `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${stats.total_tasks || 0}</div>
                <div class="stat-label">Всего задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avg_difficulty || 0}</div>
                <div class="stat-label">Средняя сложность</div>
            </div>
    `;
    
    // Распределение по сложности
    if (stats.difficulty_distribution && stats.difficulty_distribution.length > 0) {
        statsHTML += `
            <div class="stat-card">
                <div class="stat-value">${stats.difficulty_distribution.length}</div>
                <div class="stat-label">Уровней сложности</div>
            </div>
        `;
        
        // Гистограмма сложности
        let histogram = '<div class="difficulty-histogram">';
        stats.difficulty_distribution.forEach(item => {
            const maxCount = Math.max(...stats.difficulty_distribution.map(d => d.count));
            const height = maxCount > 0 ? (item.count / maxCount * 60) : 0;
            
            histogram += `
                <div class="histogram-bar" title="Сложность ${item.difficulty}: ${item.count} задач">
                    <div class="bar" style="height: ${height}px"></div>
                    <div class="bar-label">${item.difficulty}</div>
                    <div class="bar-count">${item.count}</div>
                </div>
            `;
        });
        histogram += '</div>';
        
        taskStats.innerHTML = statsHTML + '</div>' + histogram;
    } else {
        taskStats.innerHTML = statsHTML + '</div><div class="info">Нет данных о распределении сложности</div>';
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
            document.getElementById(`task-${taskId}`).remove();
            showMessage('Задача удалена', 'success');
            loadTasks(); // Перезагружаем статистику
        } else {
            const data = await response.json();
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Ошибка удаления задачи', 'error');
    }
}