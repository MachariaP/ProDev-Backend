#!/usr/bin/env bash
# build.sh - Render build script for ProDev-Backend

set -o errexit

echo "🚀 Starting Render Build Process for ProDev-Backend"

echo "📦 Step 1: Upgrading pip..."
pip install --upgrade pip

echo "📥 Step 2: Installing Python dependencies..."
pip install -r requirements.txt

python manage.py create_superuser

echo "🗂️ Step 3: Collecting static files..."
python manage.py collectstatic --no-input --clear

echo "🗄️ Step 4: Running database migrations..."
# Use a more robust migration approach
python manage.py migrate --noinput || {
    echo "⚠️  First migration attempt failed, retrying..."
    sleep 5
    python manage.py migrate --noinput
}

echo "✅ Build completed successfully!"
