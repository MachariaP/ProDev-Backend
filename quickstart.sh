#!/bin/bash

# ChamaHub Quick Start Script
# This script sets up the development environment

echo "🏦 ChamaHub - Quick Start Setup"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.12+ first."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created (please update with your settings)"
else
    echo "✅ .env file already exists"
fi
echo ""

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate
echo "✅ Migrations completed"
echo ""

# Create superuser prompt
echo "👤 Create superuser account"
echo "Do you want to create a superuser now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    python manage.py createsuperuser
fi
echo ""

# Collect static files (for production)
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput
echo "✅ Static files collected"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  python manage.py runserver"
echo ""
echo "Then visit:"
echo "  - API: http://localhost:8000/"
echo "  - Admin: http://localhost:8000/admin/"
echo "  - API Docs: http://localhost:8000/api/docs/"
echo ""
echo "Happy coding! 🚀"
