from flask import Flask, jsonify
from flask_cors import CORS
from routes import api
from database import init_db
from config import Config

app = Flask(__name__)
CORS(app)
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
            'POST /api/sessions'
        ]
    })

if __name__ == '__main__':
    init_db()
    print("=" * 50)
    print("🚀 Session Tracker API запущен")
    print("🌐 http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)