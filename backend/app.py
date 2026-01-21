import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes import api
from database import init_db
from config import Config

app = Flask(__name__)

# CORS настройки - разрешаем все для теста
CORS(app, resources={r"/*": {"origins": "*"}})

app.config.from_object(Config)

# Регистрируем Blueprint
app.register_blueprint(api, url_prefix='/api')

@app.route('/')
def index():
    return jsonify({
        'message': 'Session Tracker API',
        'endpoints': [
            'GET  /api/health',
            'POST /api/register',
            'POST /api/login',
            'GET  /api/sessions',
            'POST /api/sessions',
            'GET  /api/tasks',
            'POST /api/tasks',
            'DELETE /api/tasks/<id>',
            'GET  /api/tasks/stats'
        ]
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'message': 'API работает'})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8080))  # Railway использует 8080
    print("=" * 50)
    print(f"🚀 Session Tracker API запущен")
    print(f"🌐 Порт: {port}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=port, debug=False)
