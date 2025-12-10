#!/bin/bash
set -e

echo "Aplicando migraciones..."
python manage.py migrate --noinput

echo "Recolectando staticfiles..."
python manage.py collectstatic --noinput

echo "Iniciando Gunicorn..."
gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 3
