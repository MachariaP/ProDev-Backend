# ChamaHub Frontend

A modern, feature-rich React + TypeScript frontend for the ChamaHub savings group management platform. ChamaHub enables communities to manage their savings groups (Chamas) with tools for contributions, loans, investments, and collaborative decision-making.

## 🎨 Features

### Core Features
- **Beautiful, Modern UI** - Clean design with smooth animations and transitions
- **Type-Safe** - Full TypeScript support with type definitions for all API models
- **Responsive** - Mobile-first design that works on all devices
- **Animated Components** - Framer Motion animations for delightful user experience
- **Interactive Charts** - Beautiful data visualizations with Recharts
- **Dark Mode Ready** - CSS variables configured for easy theme switching

### Application Features
- **Authentication** - Complete auth flow with login, registration, password reset, email verification, and 2FA
- **Group Management** - Create, manage, and view savings groups with member management
- **Financial Management** - Track contributions, loans, expenses, and investments
- **Analytics Dashboard** - Comprehensive analytics and reporting
- **Collaboration Tools** - Chat, meetings scheduling, and document sharing
- **Admin Panel** - Full administrative control with user, group, and financial management
- **M-Pesa Integration** - Mobile money integration for easy payments
- **Wealth Engine** - Investment portfolio management and wealth tracking

## 🚀 Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript 5** - Type-safe development
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Composable charting library
- **Axios** - HTTP client with JWT interceptors
- **React Router 7** - Client-side routing
- **React Query (TanStack)** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling and validation
- **Radix UI** - Accessible UI primitives
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

# Run linting
npm run lint

# Start production server (uses PORT env variable)
npm start
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
├── components/              # Reusable UI components
│   ├── ui/                 # Base UI components (Button, Card, Dialog, etc.)
│   ├── AdminLayout.tsx     # Admin panel layout wrapper
│   ├── DashboardLayout.tsx # Main dashboard layout
│   └── StatsCard.tsx       # Animated statistics card
├── pages/                  # Page components
│   ├── auth/               # Authentication pages
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   └── OnboardingPage.tsx
│   ├── dashboard/          # Dashboard pages
│   │   ├── DashboardPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── FinanceHubPage.tsx
│   ├── groups/             # Group management pages
│   │   ├── GroupsListPage.tsx
│   │   ├── CreateGroupPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   └── MemberManagementPage.tsx
│   ├── financial/          # Financial management pages
│   │   ├── ContributionsPage.tsx
│   │   ├── NewContributionPage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── LoansPage.tsx
│   │   ├── LoanApplicationPage.tsx
│   │   ├── InvestmentsPage.tsx
│   │   ├── InvestmentPortfolioPage.tsx
│   │   ├── NewInvestmentPage.tsx
│   │   ├── InvestmentDetailPage.tsx
│   │   └── TransactionHistoryPage.tsx
│   ├── tools/              # Utility and integration pages
│   │   ├── VotingPage.tsx
│   │   ├── ApprovalsPage.tsx
│   │   ├── ActionsPage.tsx
│   │   ├── StatementGenerationPage.tsx
│   │   ├── WealthEnginePage.tsx
│   │   ├── MPesaIntegrationPage.tsx
│   │   └── ReportsPage.tsx
│   ├── settings/           # User settings pages
│   │   ├── ProfilePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── TwoFactorAuthPage.tsx
│   │   └── AuditLogPage.tsx
│   ├── collaboration/      # Collaboration tools pages
│   │   ├── ChatPage.tsx
│   │   ├── MeetingSchedulePage.tsx
│   │   └── DocumentSharingPage.tsx
│   ├── admin/              # Admin panel pages
│   │   ├── AdminPanelPage.tsx
│   │   ├── AdminUsersPage.tsx
│   │   ├── AdminGroupsPage.tsx
│   │   ├── AdminContributionsPage.tsx
│   │   ├── AdminLoansPage.tsx
│   │   ├── AdminExpensesPage.tsx
│   │   ├── AdminKYCPage.tsx
│   │   ├── AdminAuditLogsPage.tsx
│   │   ├── AdminAnalyticsPage.tsx
│   │   └── AdminSettingsPage.tsx
│   └── LandingPage.tsx     # Public landing page
├── services/               # API and external services
│   ├── api.ts             # Axios instance with JWT
│   ├── apiService.ts      # API service utilities
│   └── adminApi.ts        # Admin-specific API calls
├── hooks/                 # Custom React hooks
│   ├── useApi.ts          # API request hooks
│   ├── useAuth.ts         # Authentication hooks
│   └── useLocalStorage.ts # Local storage hooks
├── types/                 # TypeScript type definitions
│   ├── index.ts           # Common types
│   └── api.ts             # API model types
├── lib/                   # Utility functions
│   └── utils.ts           # Helper functions
├── App.tsx                # Main app component with routing
└── main.tsx               # App entry point
```

## 🎯 Key Components

### StatsCard
Animated card component showing key metrics with trend indicators

### Dashboard
Main dashboard with:
- Animated stat cards for key metrics
- Contribution trend chart (Area chart)
- Weekly activity chart (Bar chart)
- Recent transactions feed
- Quick action shortcuts

### Authentication
Complete authentication flow including:
- Login with JWT authentication
- User registration with email verification
- Password reset functionality
- Two-factor authentication (2FA)
- Onboarding for new users

### Group Management
- View all groups you're a member of
- Create new savings groups
- Manage group members and roles
- Track group activity

### Financial Management
- **Contributions**: Track and make contributions
- **Loans**: Apply for and manage loans
- **Investments**: Portfolio management with detailed views
- **Expenses**: Track group expenses
- **Transactions**: Full transaction history with filtering

### Admin Panel
Full administrative control:
- User management and KYC verification
- Group oversight
- Financial monitoring (contributions, loans, expenses)
- Audit logs and analytics
- System settings

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

### Deploy to Render (Recommended)

For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

Quick start:
1. Connect your repository to Render
2. Render will auto-detect `render.yaml`
3. Set `VITE_API_URL` environment variable
4. Deploy!

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
- [React Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

Built with ❤️ for the ChamaHub community
