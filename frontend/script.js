const API_URL = 'https://ВАШ_ПРОЕКТ.ВАШ_ЛОГИН.repl.co/api';

let currentUser = null;
let currentToken = null;
let allSessions = []; // Р”Р»СЏ С…СЂР°РЅРµРЅРёСЏ РІСЃРµС… СЃРµСЃСЃРёР№ (РЅР° СЃС‚СЂР°РЅРёС†Рµ sessions.html)
let filteredSessions = []; // РћС‚С„РёР»СЊС‚СЂРѕРІР°РЅРЅС‹Рµ СЃРµСЃСЃРёРё

// РћРїСЂРµРґРµР»СЏРµРј РЅР° РєР°РєРѕР№ СЃС‚СЂР°РЅРёС†Рµ РЅР°С…РѕРґРёРјСЃСЏ
const currentPage = window.location.pathname.split('/').pop();

// ==================== РћР‘Р©РР• Р¤РЈРќРљР¦РР ====================

// Р—Р°РіСЂСѓР¶Р°РµРј РґР°РЅРЅС‹Рµ РёР· localStorage РїСЂРё Р·Р°РїСѓСЃРєРµ
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
    
    // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј С‚РµРєСѓС‰РµРµ РІСЂРµРјСЏ РґР»СЏ С„РѕСЂРј
    setupTimeInputs();
});

// РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЃС‚СЂР°РЅРёС†С‹
function initPage() {
    if (currentPage === 'index.html' || currentPage === '') {
        initDashboard();
    } else if (currentPage === 'sessions.html') {
        initSessionsPage();
    }
    showMainApp();
}

// РџРѕРєР°Р·Р°С‚СЊ С„РѕСЂРјСѓ Р°РІС‚РѕСЂРёР·Р°С†РёРё
function showAuth() {
    const authSection = document.getElementById('authSection');
    const mainApp = document.getElementById('mainApp');
    
    if (authSection) authSection.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    
    if (currentPage === 'sessions.html') {
        // РќР° СЃС‚СЂР°РЅРёС†Рµ СЃРµСЃСЃРёР№ РїРѕРєР°Р·С‹РІР°РµРј СЃРїРµС†РёР°Р»СЊРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ
        const authMessage = document.getElementById('authMessage');
        if (authMessage) {
            authMessage.innerHTML = `
                <div class="auth-message">
                    <h2><i class="fas fa-lock"></i> РўСЂРµР±СѓРµС‚СЃСЏ Р°РІС‚РѕСЂРёР·Р°С†РёСЏ</h2>
                    <p>РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІРѕР№РґРёС‚Рµ РІ СЃРёСЃС‚РµРјСѓ С‡С‚РѕР±С‹ РїСЂРѕСЃРјР°С‚СЂРёРІР°С‚СЊ СЃРµСЃСЃРёРё</p>
                    <button class="btn btn-primary" onclick="window.location.href='index.html'">
                        <i class="fas fa-sign-in-alt"></i> РџРµСЂРµР№С‚Рё РєРѕ РІС…РѕРґСѓ
                    </button>
                </div>
            `;
        }
    }
}

// РџРѕРєР°Р·Р°С‚СЊ РѕСЃРЅРѕРІРЅРѕРµ РїСЂРёР»РѕР¶РµРЅРёРµ
function showMainApp() {
    const authSection = document.getElementById('authSection');
    const mainApp = document.getElementById('mainApp');
    
    if (authSection) authSection.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // РћР±РЅРѕРІР»СЏРµРј РїСЂРёРІРµС‚СЃС‚РІРёРµ
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting && currentUser) {
        userGreeting.textContent = `РџСЂРёРІРµС‚, ${currentUser.username}!`;
    }
}

// РћР±С‰РёРµ С„СѓРЅРєС†РёРё РґР»СЏ СЃРѕРѕР±С‰РµРЅРёР№
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

// РЈСЃС‚Р°РЅРѕРІРєР° РІСЂРµРјРµРЅРё РІ С„РѕСЂРјР°С…
function setupTimeInputs() {
    const now = new Date();
    const currentTime = now.toTimeString().substr(0, 5);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    
    // Р”Р»СЏ dashboard
    const quickStartTime = document.getElementById('quickStartTime');
    const quickEndTime = document.getElementById('quickEndTime');
    
    if (quickStartTime) quickStartTime.value = currentTime;
    if (quickEndTime) quickEndTime.value = endTime;
    
    // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј С‚РµРєСѓС‰СѓСЋ РґР°С‚Сѓ
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) input.value = today;
    });
}

// ==================== РђРЈРўР•РќРўРР¤РРљРђР¦РРЇ ====================

// Р’С…РѕРґ
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('Р—Р°РїРѕР»РЅРёС‚Рµ РІСЃРµ РїРѕР»СЏ', 'error');
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
            showMessage('Р’С…РѕРґ РІС‹РїРѕР»РЅРµРЅ!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('РћС€РёР±РєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ', 'error');
    }
}

// Р РµРіРёСЃС‚СЂР°С†РёСЏ
async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!username || !email || !password) {
        showMessage('Р—Р°РїРѕР»РЅРёС‚Рµ РІСЃРµ РїРѕР»СЏ', 'error');
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
            showMessage('Р РµРіРёСЃС‚СЂР°С†РёСЏ СѓСЃРїРµС€РЅР°!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('РћС€РёР±РєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ', 'error');
    }
}

// РџРѕРєР°Р·Р°С‚СЊ С„РѕСЂРјСѓ СЂРµРіРёСЃС‚СЂР°С†РёРё
function showRegister() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.classList.toggle('hidden');
    }
}

// Р’С‹С…РѕРґ
function logout() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ==================== DASHBOARD Р¤РЈРќРљР¦РР ====================

function initDashboard() {
    loadDashboardStats();
    loadRecentSessions();
}

// Р—Р°РіСЂСѓР·РёС‚СЊ СЃС‚Р°С‚РёСЃС‚РёРєСѓ РґР»СЏ dashboard
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
        console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃС‚Р°С‚РёСЃС‚РёРєРё:', error);
    }
}

// РћР±РЅРѕРІРёС‚СЊ СЃС‚Р°С‚РёСЃС‚РёРєСѓ РЅР° dashboard
function updateDashboardStats(sessions) {
    if (!sessions || sessions.length === 0) {
        updateStatsUI(0, 0, 0, 0);
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Р¤РёР»СЊС‚СЂСѓРµРј СЃРµСЃСЃРёРё
    const todaySessions = sessions.filter(s => s.session_date === today);
    const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.session_date);
        return sessionDate >= oneWeekAgo;
    });
    
    // Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РІСЂРµРјСЏ
    const todayTime = calculateTotalTime(todaySessions);
    const weekTime = calculateTotalTime(weekSessions);
    const totalSessions = sessions.length;
    const totalTasks = sessions.reduce((sum, session) => sum + (session.tasks_completed || 0), 0);
    
    // РћР±РЅРѕРІР»СЏРµРј UI
    document.getElementById('todayTime').textContent = todayTime;
    document.getElementById('weekTime').textContent = weekTime;
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalTasksCompleted').textContent = totalTasks;
}

// Р Р°СЃСЃС‡РёС‚Р°С‚СЊ РѕР±С‰РµРµ РІСЂРµРјСЏ РёР· СЃРµСЃСЃРёР№
function calculateTotalTime(sessions) {
    let totalMinutes = 0;
    
    sessions.forEach(session => {
        const [hours, minutes] = session.duration.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
        return `${minutes}Рј`;
    } else if (minutes === 0) {
        return `${hours}С‡`;
    } else {
        return `${hours}С‡ ${minutes}Рј`;
    }
}

// РћР±РЅРѕРІРёС‚СЊ UI СЃС‚Р°С‚РёСЃС‚РёРєРё (Р·Р°РіР»СѓС€РєР°)
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

// Р—Р°РіСЂСѓР·РёС‚СЊ РїРѕСЃР»РµРґРЅРёРµ СЃРµСЃСЃРёРё РґР»СЏ dashboard
async function loadRecentSessions() {
    if (!currentToken) return;
    
    const recentSessionsDiv = document.getElementById('recentSessions');
    const noRecentSessionsDiv = document.getElementById('noRecentSessions');
    const loadingDiv = document.getElementById('loadingRecentSessions');
    
    if (recentSessionsDiv) recentSessionsDiv.innerHTML = '<div class="loading">Р—Р°РіСЂСѓР·РєР°...</div>';
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
            displayRecentSessions(sessions.slice(0, 5)); // РџРѕРєР°Р·С‹РІР°РµРј С‚РѕР»СЊРєРѕ 5 РїРѕСЃР»РµРґРЅРёС…
        }
    } catch (error) {
        if (recentSessionsDiv) {
            recentSessionsDiv.innerHTML = '<div class="error">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</div>';
        }
    }
}

// РћС‚РѕР±СЂР°Р·РёС‚СЊ РїРѕСЃР»РµРґРЅРёРµ СЃРµСЃСЃРёРё РЅР° dashboard
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
                <div class="session-tasks-compact">вњ… ${session.tasks_completed}</div>
            </div>
            <div class="session-actions-compact">
                <button class="btn-expand" onclick="toggleSessionDetails(${session.id})" title="РџРѕРґСЂРѕР±РЅРµРµ">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="session-details hidden" id="details-${session.id}">
                ${session.comments ? `
                    <div class="session-comment">
                        <strong>РљРѕРјРјРµРЅС‚Р°СЂРёР№:</strong> ${session.comments}
                    </div>
                ` : '<div class="session-comment"><em>РќРµС‚ РєРѕРјРјРµРЅС‚Р°СЂРёСЏ</em></div>'}
                <div class="session-actions">
                    <small>Р”РѕР±Р°РІР»РµРЅРѕ: ${formatDateTime(session.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Р”РѕР±Р°РІРёС‚СЊ Р±С‹СЃС‚СЂСѓСЋ СЃРµСЃСЃРёСЋ СЃ dashboard
async function addQuickSession() {
    if (!currentToken) {
        showMessage('РЎРЅР°С‡Р°Р»Р° РІРѕР№РґРёС‚Рµ РІ СЃРёСЃС‚РµРјСѓ', 'error');
        return;
    }
    
    const startTime = document.getElementById('quickStartTime').value;
    const endTime = document.getElementById('quickEndTime').value;
    const tasksCompleted = document.getElementById('quickTasks').value;
    const comment = document.getElementById('quickComment').value;
    const today = new Date().toISOString().split('T')[0];
    
    if (!startTime || !endTime) {
        showMessage('РЈРєР°Р¶РёС‚Рµ РІСЂРµРјСЏ РЅР°С‡Р°Р»Р° Рё РѕРєРѕРЅС‡Р°РЅРёСЏ', 'error');
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
            showMessage('РЎРµСЃСЃРёСЏ РґРѕР±Р°РІР»РµРЅР°!', 'success');
            loadDashboardStats();
            loadRecentSessions();
            
            // РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ
            document.getElementById('quickTasks').value = 0;
            document.getElementById('quickComment').value = '';
            
            // РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РЅРѕРІРѕРµ РІСЂРµРјСЏ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
            const now = new Date();
            document.getElementById('quickStartTime').value = now.toTimeString().substr(0, 5);
            document.getElementById('quickEndTime').value = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('РћС€РёР±РєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ', 'error');
    }
}

// РќР°С‡Р°С‚СЊ Р±С‹СЃС‚СЂСѓСЋ СЃРµСЃСЃРёСЋ (С‚РµРєСѓС‰РµРµ РІСЂРµРјСЏ + 2 С‡Р°СЃР°)
function startQuickSession() {
    const now = new Date();
    const startTime = now.toTimeString().substr(0, 5);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    
    document.getElementById('quickStartTime').value = startTime;
    document.getElementById('quickEndTime').value = endTime;
    document.getElementById('quickTasks').value = 0;
    document.getElementById('quickComment').value = 'Р Р°Р±РѕС‚Р° РЅР°Рґ РїСЂРѕРµРєС‚РѕРј';
    
    showMessage('Р—Р°РїРѕР»РЅРµРЅР° С„РѕСЂРјР° Р±С‹СЃС‚СЂРѕР№ СЃРµСЃСЃРёРё', 'info');
}

// Р”РѕР±Р°РІРёС‚СЊ С‚РµСЃС‚РѕРІСѓСЋ СЃРµСЃСЃРёСЋ
async function addTestSession() {
    if (!currentToken) {
        showMessage('РЎРЅР°С‡Р°Р»Р° РІРѕР№РґРёС‚Рµ РІ СЃРёСЃС‚РµРјСѓ', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toTimeString().substr(0, 5);
    const endTime = now.toTimeString().substr(0, 5);
    
    const testComments = [
        'РР·СѓС‡Р°Р» Python Рё Flask',
        'Р Р°Р±РѕС‚Р°Р» РЅР°Рґ С„СЂРѕРЅС‚РµРЅРґРѕРј РїСЂРѕРµРєС‚Р°',
        'РћРїС‚РёРјРёР·РёСЂРѕРІР°Р» Р±Р°Р·Сѓ РґР°РЅРЅС‹С…',
        'РќР°РїРёСЃР°Р» РґРѕРєСѓРјРµРЅС‚Р°С†РёСЋ',
        'РџСЂРѕС…РѕРґРёР» РѕРЅР»Р°Р№РЅ-РєСѓСЂСЃ'
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
            showMessage('РўРµСЃС‚РѕРІР°СЏ СЃРµСЃСЃРёСЏ РґРѕР±Р°РІР»РµРЅР°!', 'success');
            loadDashboardStats();
            loadRecentSessions();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('РћС€РёР±РєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ', 'error');
    }
}

// ==================== SESSIONS PAGE Р¤РЈРќРљР¦РР ====================

function initSessionsPage() {
    loadSessions();
}

// Р—Р°РіСЂСѓР·РёС‚СЊ РІСЃРµ СЃРµСЃСЃРёРё
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
            
            // РђРєС‚РёРІРёСЂСѓРµРј С„РёР»СЊС‚СЂ "Р’СЃРµ" РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
            setActiveFilter('all');
        }
    } catch (error) {
        if (sessionsList) {
            sessionsList.innerHTML = '<div class="error">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃРµСЃСЃРёР№</div>';
        }
    } finally {
        if (loadingDiv) loadingDiv.classList.add('hidden');
    }
}

// РћС‚РѕР±СЂР°Р·РёС‚СЊ РІСЃРµ СЃРµСЃСЃРёРё
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
                <div class="session-tasks-compact">вњ… ${session.tasks_completed}</div>
            </div>
            <div class="session-actions-compact">
                <button class="btn-expand" onclick="toggleSessionDetails(${session.id})" title="РџРѕРґСЂРѕР±РЅРµРµ">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="session-details hidden" id="details-${session.id}">
                ${session.comments ? `
                    <div class="session-comment">
                        <strong>РљРѕРјРјРµРЅС‚Р°СЂРёР№:</strong> ${session.comments}
                    </div>
                ` : '<div class="session-comment"><em>РќРµС‚ РєРѕРјРјРµРЅС‚Р°СЂРёСЏ</em></div>'}
                <div class="session-actions">
                    <small>Р”РѕР±Р°РІР»РµРЅРѕ: ${formatDateTime(session.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// РћР±РЅРѕРІРёС‚СЊ СЃС‚Р°С‚РёСЃС‚РёРєСѓ РЅР° СЃС‚СЂР°РЅРёС†Рµ СЃРµСЃСЃРёР№
function updateSessionsStats() {
    if (!filteredSessions || filteredSessions.length === 0) {
        updateSessionsStatsUI(0, '0С‡', 0, '0С‡');
        return;
    }
    
    const totalSessions = filteredSessions.length;
    const totalTime = calculateTotalTime(filteredSessions);
    const totalTasks = filteredSessions.reduce((sum, session) => sum + (session.tasks_completed || 0), 0);
    
    // РЎСЂРµРґРЅСЏСЏ РїСЂРѕРґРѕР»Р¶РёС‚РµР»СЊРЅРѕСЃС‚СЊ СЃРµСЃСЃРёРё
    let totalMinutes = 0;
    filteredSessions.forEach(session => {
        const [hours, minutes] = session.duration.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
    });
    
    const avgMinutes = Math.round(totalMinutes / totalSessions);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    const avgTime = avgHours > 0 ? `${avgHours}С‡ ${avgMins}Рј` : `${avgMins}Рј`;
    
    updateSessionsStatsUI(totalSessions, totalTime, totalTasks, avgTime);
}

// РћР±РЅРѕРІРёС‚СЊ UI СЃС‚Р°С‚РёСЃС‚РёРєРё СЃРµСЃСЃРёР№
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

// Р¤РёР»СЊС‚СЂР°С†РёСЏ СЃРµСЃСЃРёР№
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

// РЈСЃС‚Р°РЅРѕРІРёС‚СЊ Р°РєС‚РёРІРЅС‹Р№ С„РёР»СЊС‚СЂ
function setActiveFilter(filterType) {
    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filterType)) {
            btn.classList.add('active');
        }
    });
}

// РџРѕРёСЃРє СЃРµСЃСЃРёР№
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

// РЎРѕСЂС‚РёСЂРѕРІРєР° СЃРµСЃСЃРёР№
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

// ==================== РћР‘Р©РР• Р’РЎРџРћРњРћР“РђРўР•Р›Р¬РќР«Р• Р¤РЈРќРљР¦РР ====================

// РџРµСЂРµРєР»СЋС‡РёС‚СЊ РґРµС‚Р°Р»Рё СЃРµСЃСЃРёРё
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

// Р¤РѕСЂРјР°С‚РёСЂРѕРІР°РЅРёРµ РєРѕСЂРѕС‚РєРѕР№ РґР°С‚С‹
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

// Р¤РѕСЂРјР°С‚РёСЂРѕРІР°РЅРёРµ РґР°С‚С‹ Рё РІСЂРµРјРµРЅРё
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

// РџРµСЂРµР№С‚Рё РЅР° СЃС‚СЂР°РЅРёС†Сѓ РІСЃРµС… СЃРµСЃСЃРёР№
function goToAllSessions() {
    window.location.href = 'sessions.html';
}

// РџРµСЂРµР№С‚Рё РЅР° dashboard
function goToDashboard() {
    window.location.href = 'index.html';
}

// Р—Р°РіР»СѓС€РєР° РґР»СЏ Р·Р°РґР°С‡ (РµСЃР»Рё РЅСѓР¶РЅРѕ Р±СѓРґРµС‚ РґРѕР±Р°РІРёС‚СЊ РїРѕР·Р¶Рµ)
function loadTasks() {
    showMessage('Р¤СѓРЅРєС†РёРѕРЅР°Р» Р·Р°РґР°С‡ Р±СѓРґРµС‚ РґРѕР±Р°РІР»РµРЅ РїРѕР·Р¶Рµ', 'info');
}

// ==================== TASKS PAGE Р¤РЈРќРљР¦РР ====================

// РћРїСЂРµРґРµР»СЏРµРј РЅР° РєР°РєРѕР№ СЃС‚СЂР°РЅРёС†Рµ РЅР°С…РѕРґРёРјСЃСЏ (РґРѕРїРѕР»РЅРµРЅРёРµ)
if (currentPage === 'tasks.html') {
    initTasksPage();
}

function initTasksPage() {
    // РЈСЃС‚Р°РЅР°РІР»РёРІР°РµРј СЃРІСЏР·СЊ РјРµР¶РґСѓ РїРѕР»РµРј РІРІРѕРґР° Рё СЃР»Р°Р№РґРµСЂРѕРј
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

// РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ Р·Р°РґР°С‡Рё
function clearTaskForm() {
    document.getElementById('taskUrl').value = '';
    document.getElementById('difficulty').value = '';
    document.getElementById('difficultySlider').value = 5;
    document.getElementById('taskComment').value = '';
    showMessage('Р¤РѕСЂРјР° РѕС‡РёС‰РµРЅР°', 'info');
}

// Р”РѕР±Р°РІРёС‚СЊ Р·Р°РґР°С‡Сѓ
async function addTask() {
    if (!currentToken) {
        showMessage('РЎРЅР°С‡Р°Р»Р° РІРѕР№РґРёС‚Рµ РІ СЃРёСЃС‚РµРјСѓ', 'error');
        return;
    }
    
    const taskUrl = document.getElementById('taskUrl').value;
    const difficulty = document.getElementById('difficulty').value;
    const taskComment = document.getElementById('taskComment').value;
    
    if (!taskUrl) {
        showMessage('Р’РІРµРґРёС‚Рµ СЃСЃС‹Р»РєСѓ РЅР° Р·Р°РґР°С‡Сѓ', 'error');
        return;
    }
    
    // РџСЂРѕРІРµСЂРєР° URL
    if (!isValidUrl(taskUrl)) {
        showMessage('Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅСѓСЋ СЃСЃС‹Р»РєСѓ (РЅР°С‡РёРЅР°РµС‚СЃСЏ СЃ http:// РёР»Рё https://)', 'error');
        return;
    }
    
    // РџСЂРѕРІРµСЂРєР° СЃР»РѕР¶РЅРѕСЃС‚Рё
    let difficultyNum = null;
    if (difficulty) {
        difficultyNum = parseInt(difficulty);
        if (difficultyNum < 1 || difficultyNum > 10) {
            showMessage('РЎР»РѕР¶РЅРѕСЃС‚СЊ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РѕС‚ 1 РґРѕ 10', 'error');
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
            showMessage('Р—Р°РґР°С‡Р° СѓСЃРїРµС€РЅРѕ РґРѕР±Р°РІР»РµРЅР°!', 'success');
            clearTaskForm();
            loadTasks();
            loadTaskStats();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('РћС€РёР±РєР° РїРѕРґРєР»СЋС‡РµРЅРёСЏ Рє СЃРµСЂРІРµСЂСѓ', 'error');
    }
}

// Р”РѕР±Р°РІРёС‚СЊ С‚РµСЃС‚РѕРІСѓСЋ Р·Р°РґР°С‡Сѓ
async function addTestTask() {
    if (!currentToken) {
        showMessage('РЎРЅР°С‡Р°Р»Р° РІРѕР№РґРёС‚Рµ РІ СЃРёСЃС‚РµРјСѓ', 'error');
        return;
    }
    
    const testTasks = [
        {
            url: 'https://leetcode.com/problems/two-sum/',
            difficulty: 3,
            comment: 'РљР»Р°СЃСЃРёС‡РµСЃРєР°СЏ Р·Р°РґР°С‡Р° РЅР° С…СЌС€-С‚Р°Р±Р»РёС†С‹. РќСѓР¶РЅРѕ РЅР°Р№С‚Рё РґРІР° С‡РёСЃР»Р°, СЃСѓРјРјР° РєРѕС‚РѕСЂС‹С… СЂР°РІРЅР° target.'
        },
        {
            url: 'https://leetcode.com/problems/valid-parentheses/',
            difficulty: 2,
            comment: 'РџСЂРѕРІРµСЂРєР° РїСЂР°РІРёР»СЊРЅРѕСЃС‚Рё СЃРєРѕР±РѕРє СЃ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµРј СЃС‚РµРєР°.'
        },
        {
            url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
            difficulty: 4,
            comment: 'РЎР»РёСЏРЅРёРµ РґРІСѓС… РѕС‚СЃРѕСЂС‚РёСЂРѕРІР°РЅРЅС‹С… СЃРІСЏР·РЅС‹С… СЃРїРёСЃРєРѕРІ РІ РѕРґРёРЅ РѕС‚СЃРѕСЂС‚РёСЂРѕРІР°РЅРЅС‹Р№ СЃРїРёСЃРѕРє.'
        },
        {
            url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
            difficulty: 5,
            comment: 'РќР°Р№С‚Рё РјР°РєСЃРёРјР°Р»СЊРЅСѓСЋ РїСЂРёР±С‹Р»СЊ РѕС‚ РїРѕРєСѓРїРєРё Рё РїСЂРѕРґР°Р¶Рё Р°РєС†РёР№.'
        },
        {
            url: 'https://leetcode.com/problems/container-with-most-water/',
            difficulty: 6,
            comment: 'РќР°Р№С‚Рё РґРІР° СЃС‚РѕР»Р±С†Р°, РєРѕС‚РѕСЂС‹Рµ РІРјРµС‰Р°СЋС‚ РјР°РєСЃРёРјР°Р»СЊРЅРѕРµ РєРѕР»РёС‡РµСЃС‚РІРѕ РІРѕРґС‹.'
        }
    ];
    
    const randomTask = testTasks[Math.floor(Math.random() * testTasks.length)];
    
    // Р—Р°РїРѕР»РЅСЏРµРј С„РѕСЂРјСѓ
    document.getElementById('taskUrl').value = randomTask.url;
    document.getElementById('difficulty').value = randomTask.difficulty;
    document.getElementById('difficultySlider').value = randomTask.difficulty;
    document.getElementById('taskComment').value = randomTask.comment;
    
    showMessage('Р¤РѕСЂРјР° Р·Р°РїРѕР»РЅРµРЅР° С‚РµСЃС‚РѕРІС‹РјРё РґР°РЅРЅС‹РјРё', 'info');
}

// РџСЂРѕРІРµСЂРєР° РІР°Р»РёРґРЅРѕСЃС‚Рё URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Р—Р°РіСЂСѓР·РёС‚СЊ Р·Р°РґР°С‡Рё
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
            tasksList.innerHTML = '<div class="error">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РґР°С‡</div>';
        }
        console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р·Р°РґР°С‡:', error);
    } finally {
        if (loadingDiv) loadingDiv.classList.add('hidden');
    }
}

// РћС‚РѕР±СЂР°Р·РёС‚СЊ Р·Р°РґР°С‡Рё
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
                        <i class="fas fa-external-link-alt"></i> Р—Р°РґР°С‡Р°
                    </a>
                </div>
                <div class="task-actions">
                    ${task.difficulty ? 
                        `<span class="difficulty-indicator difficulty-${task.difficulty}">
                            РЎР»РѕР¶РЅРѕСЃС‚СЊ: ${task.difficulty}/10
                        </span>` : 
                        '<span class="difficulty-indicator" style="background: #a0aec0;">РЎР»РѕР¶РЅРѕСЃС‚СЊ РЅРµ СѓРєР°Р·Р°РЅР°</span>'
                    }
                    <button class="btn-delete-task" onclick="deleteTask(${task.id})" title="РЈРґР°Р»РёС‚СЊ Р·Р°РґР°С‡Сѓ">
                        <i class="fas fa-trash"></i> РЈРґР°Р»РёС‚СЊ
                    </button>
                </div>
            </div>
            
            <div class="task-meta">
                <div class="task-date">
                    <i class="far fa-calendar"></i> Р”РѕР±Р°РІР»РµРЅРѕ: ${formatDateTime(task.created_at)}
                </div>
            </div>
            
            ${task.comment ? `
                <div class="task-comment">
                    <strong><i class="fas fa-comment"></i> РљРѕРјРјРµРЅС‚Р°СЂРёР№:</strong><br>
                    ${task.comment}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Р—Р°РіСЂСѓР·РёС‚СЊ СЃС‚Р°С‚РёСЃС‚РёРєСѓ Р·Р°РґР°С‡
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
        taskStatsDiv.innerHTML = '<div class="error">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃС‚Р°С‚РёСЃС‚РёРєРё</div>';
        console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃС‚Р°С‚РёСЃС‚РёРєРё Р·Р°РґР°С‡:', error);
    }
}

// РћС‚РѕР±СЂР°Р·РёС‚СЊ СЃС‚Р°С‚РёСЃС‚РёРєСѓ Р·Р°РґР°С‡
function displayTaskStats(stats) {
    const taskStatsDiv = document.getElementById('taskStats');
    if (!taskStatsDiv) return;
    
    let statsHTML = `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${stats.total_tasks || 0}</div>
                <div class="stat-label">Р’СЃРµРіРѕ Р·Р°РґР°С‡</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.avg_difficulty ? stats.avg_difficulty.toFixed(1) : 0}</div>
                <div class="stat-label">РЎСЂРµРґРЅСЏСЏ СЃР»РѕР¶РЅРѕСЃС‚СЊ</div>
            </div>
    `;
    
    if (stats.difficulty_distribution && stats.difficulty_distribution.length > 0) {
        statsHTML += `
            <div class="stat-card">
                <div class="stat-value">${stats.difficulty_distribution.length}</div>
                <div class="stat-label">РЈСЂРѕРІРЅРµР№ СЃР»РѕР¶РЅРѕСЃС‚Рё</div>
            </div>
        `;
        
        // Р”РёР°РіСЂР°РјРјР° СЂР°СЃРїСЂРµРґРµР»РµРЅРёСЏ СЃР»РѕР¶РЅРѕСЃС‚Рё
        let chartHTML = '<div class="difficulty-chart">';
        stats.difficulty_distribution.forEach(item => {
            const maxCount = Math.max(...stats.difficulty_distribution.map(d => d.count));
            const height = maxCount > 0 ? (item.count / maxCount * 80) : 0;
            
            chartHTML += `
                <div class="chart-bar" title="РЎР»РѕР¶РЅРѕСЃС‚СЊ ${item.difficulty}: ${item.count} Р·Р°РґР°С‡">
                    <div class="bar-fill" style="height: ${height}px"></div>
                    <div class="bar-label">${item.difficulty}</div>
                    <div class="bar-count">${item.count}</div>
                </div>
            `;
        });
        chartHTML += '</div>';
        
        taskStatsDiv.innerHTML = statsHTML + '</div>' + chartHTML;
    } else {
        taskStatsDiv.innerHTML = statsHTML + '</div><div class="info">РќРµС‚ РґР°РЅРЅС‹С… РґР»СЏ СЃС‚Р°С‚РёСЃС‚РёРєРё</div>';
    }
}

// РЈРґР°Р»РёС‚СЊ Р·Р°РґР°С‡Сѓ
async function deleteTask(taskId) {
    if (!confirm('РЈРґР°Р»РёС‚СЊ СЌС‚Сѓ Р·Р°РґР°С‡Сѓ?')) {
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
            // РЈРґР°Р»СЏРµРј РёР· Р»РѕРєР°Р»СЊРЅС‹С… РјР°СЃСЃРёРІРѕРІ
            if (window.allTasks) {
                window.allTasks = window.allTasks.filter(task => task.id !== taskId);
            }
            if (window.filteredTasks) {
                window.filteredTasks = window.filteredTasks.filter(task => task.id !== taskId);
            }
            
            // РћР±РЅРѕРІР»СЏРµРј РѕС‚РѕР±СЂР°Р¶РµРЅРёРµ
            displayTasks();
            loadTaskStats();
            showMessage('Р—Р°РґР°С‡Р° СѓРґР°Р»РµРЅР°', 'success');
        } else {
            const data = await response.json();
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ Р·Р°РґР°С‡Рё', 'error');
    }
}

// Р¤РёР»СЊС‚СЂР°С†РёСЏ Р·Р°РґР°С‡ РїРѕ СЃР»РѕР¶РЅРѕСЃС‚Рё
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
    
    // РћР±РЅРѕРІР»СЏРµРј Р°РєС‚РёРІРЅСѓСЋ РєРЅРѕРїРєСѓ С„РёР»СЊС‚СЂР°
    setActiveTaskFilter(filterType);
    displayTasks();
}

// РЈСЃС‚Р°РЅРѕРІРёС‚СЊ Р°РєС‚РёРІРЅС‹Р№ С„РёР»СЊС‚СЂ Р·Р°РґР°С‡
function setActiveTaskFilter(filterType) {
    const filterButtons = document.querySelectorAll('.task-filter .btn-filter, .filters .btn-filter');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(filterType)) {
            btn.classList.add('active');
        }
    });
}

// РџРѕРёСЃРє Р·Р°РґР°С‡
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

// РЎРѕСЂС‚РёСЂРѕРІРєР° Р·Р°РґР°С‡
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

// Р­РєСЃРїРѕСЂС‚ Р·Р°РґР°С‡ (Р·Р°РіР»СѓС€РєР°)
function exportTasks() {
    if (!window.filteredTasks || window.filteredTasks.length === 0) {
        showMessage('РќРµС‚ Р·Р°РґР°С‡ РґР»СЏ СЌРєСЃРїРѕСЂС‚Р°', 'info');
        return;
    }
    
    // РџСЂРѕСЃС‚РѕР№ СЌРєСЃРїРѕСЂС‚ РІ CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "РЎСЃС‹Р»РєР°,РЎР»РѕР¶РЅРѕСЃС‚СЊ,РљРѕРјРјРµРЅС‚Р°СЂРёР№,Р”Р°С‚Р° РґРѕР±Р°РІР»РµРЅРёСЏ\n";
    
    window.filteredTasks.forEach(task => {
        const row = [
            `"${task.task_url}"`,
            task.difficulty || 'РќРµ СѓРєР°Р·Р°РЅР°',
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
    
    showMessage('Р—Р°РґР°С‡Рё СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°РЅС‹ РІ CSV', 'success');
}

