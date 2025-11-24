# 🚀 ChamaHub Full-Stack Quick Start Guide

This guide will help you run both the Django backend and React frontend together.

## Prerequisites

- Python 3.12+
- Node.js 20+
- Git

## 🏃 Quick Start (Development)

### 1. Backend Setup (Django)

```bash
# Navigate to project root
cd /path/to/ProDev-Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

The backend API will be available at: `http://localhost:8000`

### 2. Frontend Setup (React)

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd /path/to/ProDev-Backend/chamahub-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🌐 Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:8000/api/v1
3. **API Documentation**: http://localhost:8000/api/docs/
4. **Admin Panel**: http://localhost:8000/admin/

## 🔐 Test Login

Create a test user in Django:

```bash
# In the backend terminal
python manage.py shell

# Then run:
from accounts.models import User
user = User.objects.create_user(
    email='demo@chamahub.com',
    password='Demo@123456',
    first_name='Demo',
    last_name='User',
    phone_number='254712345678'
)
user.save()
exit()
```

Now you can login at http://localhost:5173 with:
- **Email**: demo@chamahub.com
- **Password**: Demo@123456

## 📦 Production Build

### Backend (Django)

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn
gunicorn chamahub.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (React)

```bash
cd chamahub-frontend

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

The production build will be in `chamahub-frontend/dist/`

## 🐳 Docker Setup (Optional)

Coming soon...

## 🔧 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database (PostgreSQL for production)
DB_NAME=chamahub_db
DB_USER=chamahub_user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

### Frontend (chamahub-frontend/.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

**Database errors:**
```bash
# Delete and recreate database
rm db.sqlite3
python manage.py migrate
```

### Frontend Issues

**Port 5173 already in use:**
Change the port in `vite.config.ts`:
```ts
server: {
  port: 3000,
}
```

**API connection errors:**
- Verify Django backend is running on port 8000
- Check CORS settings in Django `settings.py`
- Verify `VITE_API_URL` in `.env`

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Development Workflow

1. **Start Backend** (Terminal 1):
   ```bash
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd chamahub-frontend
   npm run dev
   ```

3. **Access Application**:
   - Open http://localhost:5173 in your browser
   - Login with your test credentials
   - Start developing!

## 🧪 Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
cd chamahub-frontend
npm run test
```

## 📝 API Endpoints

Key endpoints available at `http://localhost:8000/api/v1`:

- `POST /api/v1/token/` - Login (get JWT tokens)
- `POST /api/v1/token/refresh/` - Refresh access token
- `GET /accounts/users/me/` - Get current user
- `GET /groups/chama-groups/` - List groups
- `GET /finance/contributions/` - List contributions
- `GET /finance/loans/` - List loans

Full API documentation: http://localhost:8000/api/docs/

## 🎨 Features Implemented

### Backend ✅
- User authentication (JWT)
- Group management
- Financial tracking (contributions, loans, expenses)
- Investment portfolio
- Governance system
- Complete REST API

### Frontend ✅
- Login page with authentication
- Beautiful animated dashboard
- Interactive charts (contributions, weekly activity)
- Real-time transaction feed
- Type-safe API integration
- Responsive design

## 🚀 Next Steps

1. Explore the API documentation
2. Check out the frontend code in `chamahub-frontend/src/`
3. Review the backend models in each app
4. Customize the UI to your needs
5. Add more features!

## 📖 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [DRF Documentation](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Coding! 🎉**

Built with ❤️ for the ChamaHub community
