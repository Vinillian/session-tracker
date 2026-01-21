FROM python:3.9-slim

WORKDIR /app

# Устанавливаем зависимости системы
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копируем зависимости
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY backend/ ./backend/

# Создаем пользователя для безопасности
RUN useradd -m -u 1000 user
USER user

# Запускаем приложение
WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:$PORT"]