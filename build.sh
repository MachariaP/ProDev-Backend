#!/usr/bin/env bash
# build.sh - Render build script for ProDev-Backend

set -o errexit

echo "🚀 Starting Render Build Process for ProDev-Backend"

echo "📦 Step 1: Upgrading pip..."
pip install --upgrade pip

echo "📥 Step 2: Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Step 3: Running database migrations..."
python manage.py migrate --noinput || {
    echo "⚠️  First migration attempt failed, retrying..."
    sleep 5
    python manage.py migrate --noinput
}

echo "🗂️ Step 4: Collecting static files..."
python manage.py collectstatic --no-input --clear

echo "👑 Step 5: Checking superuser..."
# Only create superuser if environment variables are set
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
    echo "Creating superuser with provided credentials..."
    python manage.py create_superuser
else
    echo "⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping superuser creation."
    echo "Please set these environment variables in Render dashboard."
fi

echo "✅ Build completed successfully!"
