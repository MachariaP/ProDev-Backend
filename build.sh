#!/usr/bin/env bash
# build.sh - Render build script for ProDev-Backend
# This script runs during Render deployment to prepare the Django app

set -o errexit  # Exit immediately if a command exits with a non-zero status

echo "════════════════════════════════════════════════════════════"
echo "🚀 Starting Render Build Process for ProDev-Backend"
echo "════════════════════════════════════════════════════════════"

echo ""
echo "📦 Step 1: Upgrading pip..."
pip install --upgrade pip

echo ""
echo "📥 Step 2: Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🗂️ Step 3: Collecting static files..."
python manage.py collectstatic --no-input --clear

echo ""
echo "🗄️ Step 4: Running database migrations..."
python manage.py migrate --no-input

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Build completed successfully!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next: Your app will start with Gunicorn..."
