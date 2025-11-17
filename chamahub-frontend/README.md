# ChamaHub Frontend

A modern, eye-catching React + TypeScript frontend for the ChamaHub savings group management platform.

## 🎨 Features

- **Beautiful, Modern UI** - Clean design with smooth animations and transitions
- **Type-Safe** - Full TypeScript support with type definitions for all API models
- **Responsive** - Mobile-first design that works on all devices
- **Animated Components** - Framer Motion animations for delightful user experience
- **Interactive Charts** - Beautiful data visualizations with Recharts
- **Dark Mode Ready** - CSS variables configured for easy theme switching

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript 5** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Composable charting library
- **Axios** - HTTP client with JWT interceptors
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### API Configuration

The API service is configured in `src/services/api.ts` with:
- Automatic JWT token management
- Token refresh on 401 errors
- Request/response interceptors

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Card, Button, etc.)
│   └── StatsCard.tsx   # Animated statistics card
├── pages/              # Page components
│   ├── LoginPage.tsx   # Authentication page
│   └── DashboardPage.tsx # Main dashboard
├── services/           # API and external services
│   └── api.ts         # Axios instance with JWT
├── types/             # TypeScript type definitions
│   └── index.ts       # API model types
├── lib/               # Utility functions
│   └── utils.ts       # Helper functions
├── App.tsx            # Main app component with routing
└── main.tsx           # App entry point
```

## 🎯 Key Components

### StatsCard
Animated card component showing key metrics with trend indicators

### Dashboard
Main dashboard with:
- 4 animated stat cards
- Contribution trend chart (Area chart)
- Weekly activity chart (Bar chart)
- Recent transactions feed

### Login Page
Clean, centered login form with:
- Gradient background
- Animated icon
- Form validation
- JWT authentication

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:
- Access token for API requests
- Refresh token for renewing expired access tokens
- Automatic redirect to login on authentication failure

## 🎨 Styling

### Tailwind CSS
Custom configuration with design tokens:
- Custom color palette (primary green, secondary, muted, etc.)
- CSS variables for easy theming
- Custom animations (slide-in, fade-in, bounce-in)

## 📊 Charts

Recharts is used for data visualization with custom tooltips and styling.

## 🚀 Deployment

### Build
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)

---

Built with ❤️ for the ChamaHub community
