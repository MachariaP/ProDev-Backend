#!/bin/bash

# Quick Start Script for ChamaHub
# Starts both backend and frontend servers

set -e

echo "🚀 Starting ChamaHub..."
echo ""

# Check if setup has been run
if [ ! -d "venv" ] || [ ! -f "chamahub-frontend/.env" ]; then
    echo "⚠️  Initial setup required. Running setup first..."
    ./setup_dashboard.sh
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup EXIT INT TERM

# Start backend
echo "🔧 Starting Django backend on port 8000..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    . venv/Scripts/activate
else
    echo "❌ Virtual environment not found. Run ./setup_dashboard.sh first"
    exit 1
fi

# Create log directory
LOG_DIR="${TMPDIR:-/tmp}"
python manage.py runserver > "${LOG_DIR}/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check ${LOG_DIR}/backend.log for details."
    cat "${LOG_DIR}/backend.log"
    exit 1
fi

# Start frontend
echo "🎨 Starting React frontend on port 5173..."
cd chamahub-frontend
npm run dev > "${LOG_DIR}/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start. Check ${LOG_DIR}/frontend.log for details."
    cat "${LOG_DIR}/frontend.log"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ ChamaHub is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Frontend:  http://localhost:5173"
echo "  🔧 Backend:   http://localhost:8000"
echo "  📊 Dashboard: http://localhost:5173/dashboard"
echo ""
echo "  🔐 Test Login:"
echo "     Email:    test@example.com"
echo "     Password: password123"
echo ""
echo "  📝 Logs:"
echo "     Backend:  ${LOG_DIR}/backend.log"
echo "     Frontend: ${LOG_DIR}/frontend.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait
