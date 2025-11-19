web: gunicorn chamahub.wsgi:application --bind 0.0.0.0:$PORT
worker: celery -A chamahub worker --loglevel=info
beat: celery -A chamahub beat --loglevel=info
