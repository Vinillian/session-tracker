from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import sqlite3
from auth import token_required, hash_password, check_password, generate_token
from database import get_db

api = Blueprint('api', __name__)

# === СЕССИИ (старые функции остаются) ===
@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'API работает'})

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'message': 'Все поля обязательны'}), 400
    
    try:
        conn = get_db()
        c = conn.cursor()
        password_hash = hash_password(password)
        
        c.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        
        user_id = c.lastrowid
        conn.commit()
        conn.close()
        
        token = generate_token(user_id, username)
        
        return jsonify({
            'message': 'Регистрация успешна',
            'user': {'id': user_id, 'username': username, 'email': email},
            'token': token
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Пользователь уже существует'}), 400

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db()
    c = conn.cursor()
    
    c.execute('SELECT id, username, email, password_hash FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'message': 'Неверные данные'}), 401
    
    user_id, username, email, password_hash = user
    
    if check_password(password, password_hash):
        token = generate_token(user_id, username)
        return jsonify({
            'message': 'Вход выполнен',
            'user': {'id': user_id, 'username': username, 'email': email},
            'token': token
        }), 200
    
    return jsonify({'message': 'Неверные данные'}), 401

@api.route('/sessions', methods=['POST'])
@token_required
def create_session():
    data = request.get_json()
    user_id = request.user_id
    
    session_date = data.get('session_date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    tasks_completed = data.get('tasks_completed', 0)
    comments = data.get('comments', '')
    
    # Расчет длительности
    start_dt = datetime.strptime(f"{session_date} {start_time}", "%Y-%m-%d %H:%M")
    end_dt = datetime.strptime(f"{session_date} {end_time}", "%Y-%m-%d %H:%M")
    if end_dt < start_dt:
        end_dt += timedelta(days=1)
    
    duration = end_dt - start_dt
    hours = duration.seconds // 3600
    minutes = (duration.seconds % 3600) // 60
    duration_str = f"{hours:02d}:{minutes:02d}"
    
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO sessions (user_id, session_date, start_time, end_time, duration, tasks_completed, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, session_date, start_time, end_time, duration_str, tasks_completed, comments))
    
    session_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Сессия создана',
        'session_id': session_id
    }), 201

@api.route('/sessions', methods=['GET'])
@token_required
def get_sessions():
    user_id = request.user_id
    
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''
        SELECT id, session_date, start_time, end_time, duration, tasks_completed, comments, created_at
        FROM sessions WHERE user_id = ? ORDER BY session_date DESC, start_time DESC
    ''', (user_id,))
    
    sessions = []
    for row in c.fetchall():
        sessions.append({
            'id': row[0],
            'session_date': row[1],
            'start_time': row[2],
            'end_time': row[3],
            'duration': row[4],
            'tasks_completed': row[5],
            'comments': row[6],
            'created_at': row[7]
        })
    
    conn.close()
    return jsonify(sessions), 200

# === НОВЫЕ ФУНКЦИИ ДЛЯ ЗАДАЧ ===
@api.route('/tasks', methods=['POST'])
@token_required
def create_task():
    data = request.get_json()
    user_id = request.user_id
    
    task_url = data.get('task_url')
    difficulty = data.get('difficulty')
    comment = data.get('comment', '')
    
    if not task_url:
        return jsonify({'message': 'Ссылка на задачу обязательна'}), 400
    
    # Проверка сложности
    if difficulty:
        try:
            difficulty = int(difficulty)
            if difficulty < 1 or difficulty > 10:
                return jsonify({'message': 'Сложность должна быть от 1 до 10'}), 400
        except ValueError:
            return jsonify({'message': 'Сложность должна быть числом'}), 400
    
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO tasks (user_id, task_url, difficulty, comment)
        VALUES (?, ?, ?, ?)
    ''', (user_id, task_url, difficulty, comment))
    
    task_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'message': 'Задача добавлена',
        'task_id': task_id
    }), 201

@api.route('/tasks', methods=['GET'])
@token_required
def get_tasks():
    user_id = request.user_id
    
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''
        SELECT id, task_url, difficulty, comment, created_at
        FROM tasks WHERE user_id = ? ORDER BY created_at DESC
    ''', (user_id,))
    
    tasks = []
    for row in c.fetchall():
        tasks.append({
            'id': row[0],
            'task_url': row[1],
            'difficulty': row[2],
            'comment': row[3],
            'created_at': row[4]
        })
    
    conn.close()
    return jsonify(tasks), 200

@api.route('/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(task_id):
    user_id = request.user_id
    
    conn = get_db()
    c = conn.cursor()
    
    # Проверяем, что задача принадлежит пользователю
    c.execute('SELECT id FROM tasks WHERE id = ? AND user_id = ?', (task_id, user_id))
    task = c.fetchone()
    
    if not task:
        conn.close()
        return jsonify({'message': 'Задача не найдена'}), 404
    
    c.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', (task_id, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Задача удалена'}), 200

@api.route('/tasks/stats', methods=['GET'])
@token_required
def get_task_stats():
    user_id = request.user_id
    
    conn = get_db()
    c = conn.cursor()
    
    # Общая статистика
    c.execute('SELECT COUNT(*) as total, AVG(difficulty) as avg_difficulty FROM tasks WHERE user_id = ?', (user_id,))
    stats = c.fetchone()
    
    # Распределение по сложности
    c.execute('''
        SELECT difficulty, COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? AND difficulty IS NOT NULL 
        GROUP BY difficulty 
        ORDER BY difficulty
    ''', (user_id,))
    
    difficulty_distribution = []
    for row in c.fetchall():
        difficulty_distribution.append({
            'difficulty': row[0],
            'count': row[1]
        })
    
    conn.close()
    
    total_tasks = stats[0] or 0
    avg_difficulty = round(float(stats[1] or 0), 2)
    
    return jsonify({
        'total_tasks': total_tasks,
        'avg_difficulty': avg_difficulty,
        'difficulty_distribution': difficulty_distribution
    }), 200