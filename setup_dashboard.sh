#!/bin/bash

# Dashboard Setup Script
# This script ensures the dashboard can be accessed at http://localhost:5173/dashboard

set -e

echo "🚀 ChamaHub Dashboard Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Python
echo "📋 Step 1: Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} $PYTHON_VERSION found"
else
    echo -e "${RED}✗${NC} Python 3 not found. Please install Python 3.12+"
    exit 1
fi

# Step 2: Check Node.js
echo ""
echo "📋 Step 2: Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION found"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Step 3: Install Python dependencies
echo ""
echo "📦 Step 3: Installing Python dependencies..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
pip install -q -r requirements.txt
echo -e "${GREEN}✓${NC} Python dependencies installed"

# Step 4: Setup database
echo ""
echo "🗄️  Step 4: Setting up database..."
python manage.py migrate --no-input
echo -e "${GREEN}✓${NC} Database migrations complete"

# Step 5: Create test user
echo ""
echo "👤 Step 5: Creating test user..."
python manage.py shell << 'EOF'
from accounts.models import User
from groups.models import ChamaGroup, GroupMembership

# Create test user if doesn't exist
user, created = User.objects.get_or_create(
    email='test@example.com',
    defaults={
        'phone_number': '+254700000000',
        'first_name': 'Test',
        'last_name': 'User',
        'is_active': True
    }
)
if created:
    user.set_password('password123')
    user.save()

# Create test group if doesn't exist
group, created = ChamaGroup.objects.get_or_create(
    name='Test Chama',
    defaults={
        'group_type': 'SAVINGS',
        'description': 'Test savings group',
        'created_by': user
    }
)
if created:
    GroupMembership.objects.create(
        group=group,
        user=user,
        role='ADMIN',
        status='ACTIVE'
    )
EOF
echo -e "${GREEN}✓${NC} Test user created"

# Step 6: Setup frontend
echo ""
echo "🎨 Step 6: Setting up frontend..."
cd chamahub-frontend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
    echo -e "${GREEN}✓${NC} Frontend .env file created"
fi

# Install Node dependencies
if [ ! -d "node_modules" ]; then
    npm install --silent
    echo -e "${GREEN}✓${NC} Node dependencies installed"
else
    echo -e "${GREEN}✓${NC} Node dependencies already installed"
fi

cd ..

# Step 7: Display success message
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎯 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Open TWO terminal windows:"
echo ""
echo "  📌 Terminal 1 - Start Backend:"
echo "     cd $(pwd)"
echo "     source venv/bin/activate  # or . venv/Scripts/activate on Windows"
echo "     python manage.py runserver"
echo ""
echo "  📌 Terminal 2 - Start Frontend:"
echo "     cd $(pwd)/chamahub-frontend"
echo "     npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Then visit: ${GREEN}http://localhost:5173${NC}"
echo ""
echo "  🔐 Login with:"
echo "     Email: test@example.com"
echo "     Password: password123"
echo ""
echo "  📊 Dashboard: ${GREEN}http://localhost:5173/dashboard${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
