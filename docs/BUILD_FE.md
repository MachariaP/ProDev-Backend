# 🎨 BUILD_FE.md - Frontend Development Guide

## Chama Nexus - Complete Frontend Development Path

This comprehensive guide will walk you through building the **Chama Nexus** frontend from scratch. Follow each step sequentially to create a production-ready React + TypeScript application that integrates with your Django backend.

**📍 Prerequisites:** Complete [BUILD_BE.md](./BUILD_BE.md) first to have your backend API running.

---

## 📁 Project Structure Overview

```
Chama_Nexus/
├── BE/                              # Backend folder (see BUILD_BE.md)
│
└── FE/                              # Frontend folder
    ├── .env                         # Environment variables
    ├── .env.example                 # Environment template
    ├── .gitignore                   # Git ignore rules
    ├── package.json                 # NPM dependencies
    ├── package-lock.json            # Lock file
    ├── tsconfig.json                # TypeScript configuration
    ├── vite.config.ts               # Vite configuration
    ├── tailwind.config.js           # Tailwind CSS config
    ├── postcss.config.js            # PostCSS config
    ├── index.html                   # Entry HTML
    ├── Dockerfile                   # Docker configuration
    │
    └── src/
        ├── main.tsx                 # Application entry point
        ├── App.tsx                  # Root component
        ├── vite-env.d.ts            # Vite type declarations
        │
        ├── api/                     # API service layer
        │   ├── index.ts             # API exports
        │   ├── client.ts            # Axios instance
        │   ├── auth.ts              # Auth API calls
        │   ├── groups.ts            # Groups API calls
        │   ├── finance.ts           # Finance API calls
        │   └── types.ts             # API response types
        │
        ├── components/              # Reusable components
        │   ├── ui/                  # UI primitives
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Card.tsx
        │   │   ├── Modal.tsx
        │   │   ├── Table.tsx
        │   │   ├── Badge.tsx
        │   │   └── Spinner.tsx
        │   │
        │   ├── layout/              # Layout components
        │   │   ├── Header.tsx
        │   │   ├── Sidebar.tsx
        │   │   ├── Footer.tsx
        │   │   └── DashboardLayout.tsx
        │   │
        │   ├── forms/               # Form components
        │   │   ├── LoginForm.tsx
        │   │   ├── RegisterForm.tsx
        │   │   ├── GroupForm.tsx
        │   │   └── ContributionForm.tsx
        │   │
        │   └── features/            # Feature-specific components
        │       ├── groups/
        │       ├── finance/
        │       └── dashboard/
        │
        ├── pages/                   # Page components
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   ├── RegisterPage.tsx
        │   │   └── ForgotPasswordPage.tsx
        │   │
        │   ├── dashboard/
        │   │   └── DashboardPage.tsx
        │   │
        │   ├── groups/
        │   │   ├── GroupsListPage.tsx
        │   │   ├── GroupDetailPage.tsx
        │   │   └── CreateGroupPage.tsx
        │   │
        │   └── finance/
        │       ├── ContributionsPage.tsx
        │       ├── ExpensesPage.tsx
        │       └── LoansPage.tsx
        │
        ├── hooks/                   # Custom hooks
        │   ├── useAuth.ts
        │   ├── useApi.ts
        │   ├── useGroups.ts
        │   └── useLocalStorage.ts
        │
        ├── store/                   # State management
        │   ├── index.ts             # Store exports
        │   ├── authStore.ts         # Auth state (Zustand)
        │   └── groupStore.ts        # Groups state
        │
        ├── context/                 # React Context
        │   └── AuthContext.tsx
        │
        ├── routes/                  # Routing
        │   ├── index.tsx            # Route definitions
        │   └── ProtectedRoute.tsx   # Auth guard
        │
        ├── lib/                     # Utilities
        │   ├── utils.ts             # Helper functions
        │   ├── constants.ts         # App constants
        │   └── validators.ts        # Form validation
        │
        ├── types/                   # TypeScript types
        │   ├── index.ts
        │   ├── auth.ts
        │   ├── group.ts
        │   └── finance.ts
        │
        └── styles/                  # Styles
            ├── globals.css          # Global styles
            └── components/          # Component styles
```

---

## 🚀 Phase 1: Foundation & Authentication

### Step 1.1: Initialize React + TypeScript Project

```bash
# Navigate to the Chama_Nexus directory (where BE folder exists)
cd Chama_Nexus

# Create React project with Vite
npm create vite@latest FE -- --template react-ts

# Navigate to frontend folder
cd FE

# Install dependencies
npm install

# Install additional packages
npm install axios react-router-dom zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react clsx tailwind-merge

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### Step 1.2: Configure Tailwind CSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
```

**src/styles/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 199 89% 48%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 199 89% 48%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 199 89% 48%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 1.3: Configure Environment Variables

**Create .env file:**
```bash
# .env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Chama Nexus
```

**.env.example:**
```bash
# Backend API URL
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Chama Nexus
```

### Step 1.4: Set Up API Client with Axios

**src/api/client.ts:**
```typescript
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Step 1.5: Create TypeScript Types

**src/types/auth.ts:**
```typescript
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture?: string;
  bio?: string;
  is_verified: boolean;
  date_joined: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**src/types/group.ts:**
```typescript
export type GroupType = 'SAVINGS' | 'INVESTMENT' | 'WELFARE' | 'MERRY_GO_ROUND' | 'MIXED';
export type MemberRole = 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'LEFT';
export type ContributionFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface Group {
  id: string;
  name: string;
  description: string;
  group_type: GroupType;
  contribution_amount: string;
  contribution_frequency: ContributionFrequency;
  max_members: number;
  members_count: number;
  is_active: boolean;
  is_public: boolean;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface GroupDetail extends Group {
  members: Membership[];
}

export interface Membership {
  id: string;
  user: string;
  user_email: string;
  user_name: string;
  role: MemberRole;
  status: MembershipStatus;
  joined_at: string;
  updated_at: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  group_type: GroupType;
  contribution_amount: number;
  contribution_frequency: ContributionFrequency;
  max_members?: number;
  is_public?: boolean;
}
```

**src/types/finance.ts:**
```typescript
export type PaymentMethod = 'MPESA' | 'BANK' | 'CASH';
export type ContributionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
export type ExpenseCategory = 'ADMINISTRATIVE' | 'OPERATIONAL' | 'INVESTMENT' | 'WELFARE' | 'OTHER';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'REPAYING' | 'COMPLETED' | 'DEFAULTED';

export interface Contribution {
  id: string;
  member: string;
  member_name: string;
  group: string;
  group_name: string;
  amount: string;
  payment_method: PaymentMethod;
  status: ContributionStatus;
  transaction_ref: string;
  notes: string;
  contributed_at: string;
  confirmed_at: string | null;
}

export interface Expense {
  id: string;
  group: string;
  title: string;
  description: string;
  amount: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  receipt: string | null;
  created_by: string;
  created_by_name: string;
  approved_by: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface Loan {
  id: string;
  borrower: string;
  borrower_name: string;
  group: string;
  principal_amount: string;
  interest_rate: string;
  purpose: string;
  repayment_period_months: number;
  monthly_repayment: string;
  total_repaid: string;
  status: LoanStatus;
  applied_at: string;
  approved_at: string | null;
  disbursed_at: string | null;
  due_date: string | null;
}
```

**src/types/index.ts:**
```typescript
export * from './auth';
export * from './group';
export * from './finance';

// Pagination response type
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error response
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
```

### Step 1.6: Create Auth API Service

**src/api/auth.ts:**
```typescript
import apiClient from './client';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
} from '../types';

export const authApi = {
  /**
   * Login user and get tokens
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register/', data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile/');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>('/auth/profile/', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put('/auth/change-password/', data);
    return response.data;
  },

  /**
   * Logout (blacklist refresh token)
   */
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await apiClient.post('/auth/refresh/', { refresh: refreshToken });
    return response.data;
  },
};
```

### Step 1.7: Create Auth Store (Zustand)

**src/store/authStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          
          // Store tokens
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);

          set({
            user: response.user,
            accessToken: response.access,
            refreshToken: response.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = 
            (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Login failed. Please check your credentials.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          
          // Store tokens
          localStorage.setItem('access_token', response.tokens.access);
          localStorage.setItem('refresh_token', response.tokens.refresh);

          set({
            user: response.user,
            accessToken: response.tokens.access,
            refreshToken: response.tokens.refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = 
            (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch {
          // Ignore logout errors
        } finally {
          // Clear tokens and state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.getProfile();
          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Step 1.8: Create Protected Route Component

**src/routes/ProtectedRoute.tsx:**
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### Step 1.9: Create Auth Pages

**src/pages/auth/LoginPage.tsx:**
```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Chama Nexus
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**src/pages/auth/RegisterPage.tsx:**
```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/dashboard');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                value={formData.password_confirm}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Step 1.10: Set Up Routing

**src/routes/index.tsx:**
```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <LoginPage />,
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
```

**src/App.tsx:**
```typescript
import { AppRoutes } from './routes';
import './styles/globals.css';

function App() {
  return <AppRoutes />;
}

export default App;
```

**src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 🚀 Phase 2: Core App Features

### Step 2.1: Create Groups API Service

**src/api/groups.ts:**
```typescript
import apiClient from './client';
import type { Group, GroupDetail, CreateGroupData, Membership, PaginatedResponse } from '../types';

export const groupsApi = {
  /**
   * List all groups
   */
  list: async (params?: {
    page?: number;
    group_type?: string;
    is_active?: boolean;
    is_public?: boolean;
  }): Promise<PaginatedResponse<Group>> => {
    const response = await apiClient.get<PaginatedResponse<Group>>('/groups/groups/', { params });
    return response.data;
  },

  /**
   * Get single group with members
   */
  get: async (id: string): Promise<GroupDetail> => {
    const response = await apiClient.get<GroupDetail>(`/groups/groups/${id}/`);
    return response.data;
  },

  /**
   * Create a new group
   */
  create: async (data: CreateGroupData): Promise<Group> => {
    const response = await apiClient.post<Group>('/groups/groups/', data);
    return response.data;
  },

  /**
   * Update a group
   */
  update: async (id: string, data: Partial<CreateGroupData>): Promise<Group> => {
    const response = await apiClient.patch<Group>(`/groups/groups/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a group
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/groups/groups/${id}/`);
  },

  /**
   * Join a group
   */
  join: async (id: string): Promise<Membership> => {
    const response = await apiClient.post<Membership>(`/groups/groups/${id}/join/`);
    return response.data;
  },

  /**
   * Leave a group
   */
  leave: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/groups/groups/${id}/leave/`);
    return response.data;
  },
};
```

### Step 2.2: Create Dashboard Page

**src/pages/dashboard/DashboardPage.tsx:**
```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { groupsApi } from '../../api/groups';
import type { Group } from '../../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupsApi.list();
        setGroups(response.results);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {user?.first_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500">My Groups</h3>
            <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500">Total Contributions</h3>
            <p className="text-3xl font-bold text-green-600">KES 0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-500">Active Loans</h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>

        {/* Groups list */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">My Groups</h2>
            <button
              onClick={() => navigate('/groups/create')}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Create Group
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>You haven't joined any groups yet.</p>
              <button
                onClick={() => navigate('/groups')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse available groups
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {group.members_count} members
                      </p>
                      <p className="text-sm text-gray-500">
                        KES {group.contribution_amount} / {group.contribution_frequency.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
```

### Step 2.3: Pattern for Each New Feature

Follow this pattern for each new feature module:

1. **Create TypeScript types** in `src/types/`
2. **Create API service** in `src/api/`
3. **Create store slice** in `src/store/` (if needed)
4. **Create page components** in `src/pages/`
5. **Create reusable components** in `src/components/`
6. **Add routes** in `src/routes/`
7. **Test integration** with backend API

---

## 🔐 Security Best Practices

### Token Storage
```typescript
// Store tokens securely
// For higher security, consider httpOnly cookies set by backend

// Good: localStorage for refresh token rotation
localStorage.setItem('access_token', token);

// Better: In-memory for access token + httpOnly cookie for refresh
// This requires backend changes to set cookies
```

### Input Validation
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Use with react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### XSS Prevention
```typescript
// React automatically escapes output
// But be careful with dangerouslySetInnerHTML

// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe
<div>{userInput}</div>

// If HTML is needed, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## ⚡ Performance Optimization

### Code Splitting
```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));

// In router
{
  path: '/dashboard',
  element: (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    </Suspense>
  ),
}
```

### React Query for Data Fetching
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch with caching
function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations with cache invalidation
function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
```

### Memoization
```typescript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
const sortedGroups = useMemo(() => {
  return [...groups].sort((a, b) => a.name.localeCompare(b.name));
}, [groups]);

// Memoize callbacks
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Memoize components
const GroupCard = memo(function GroupCard({ group }: { group: Group }) {
  return <div>{group.name}</div>;
});
```

---

## 🐳 Docker Configuration

**Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🧪 Testing

**Install testing dependencies:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**src/test/setup.ts:**
```typescript
import '@testing-library/jest-dom';
```

**Example test:**
```typescript
// src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 🚢 Deployment Checklist

- [ ] Set production API URL in `.env.production`
- [ ] Build the production bundle: `npm run build`
- [ ] Test the production build locally: `npm run preview`
- [ ] Configure CORS on backend for production domain
- [ ] Set up SSL/HTTPS
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics
- [ ] Test authentication flow end-to-end
- [ ] Test all API integrations
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit

---

## 🔗 Backend Reference

Need to update or check your backend API?

**👉 [Go back to BUILD_BE.md →](./BUILD_BE.md)**

The backend guide covers:
- Django project setup
- Authentication endpoints
- API structure
- Database models
- Security configurations

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Zustand](https://docs.pmnd.rs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

---

## 🎯 Next Steps After Both Guides

Once you've completed both BUILD_BE.md and BUILD_FE.md:

1. **Test Full Integration**: Ensure frontend communicates properly with backend
2. **Add More Features**: Extend with additional modules (governance, investments)
3. **Deploy**: Follow deployment checklists for both services
4. **Monitor**: Set up logging and error tracking
5. **Iterate**: Add features based on user feedback

---

**Happy Coding! 🎉**

*Built with ❤️ for the Chama Nexus project*
