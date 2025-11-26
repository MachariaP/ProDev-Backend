# ChamaHub Frontend - React TypeScript Application

## 📜 Table of Contents
* [1. Project Overview](#1-project-overview)
* [2. Team Roles and Responsibilities](#2-team-roles-and-responsibilities)
* [3. Technology Stack Overview](#3-technology-stack-overview)
* [4. Database Design Overview](#4-database-design-overview)
* [5. Feature Breakdown](#5-feature-breakdown)
* [6. API Security Overview](#6-api-security-overview)
* [7. CI/CD Pipeline Overview](#7-cicd-pipeline-overview)
* [8. Resources](#8-resources)
* [9. License](#9-license)
* [10. Created By](#10-created-by)

---

## 1. Project Overview

### Brief Description

The ChamaHub Frontend is a modern, production-ready web application built with React 19 and TypeScript 5.9. It provides an intuitive, responsive user interface for managing savings groups, tracking financial transactions, and facilitating group governance. The application is designed with a mobile-first approach, ensuring accessibility for users across Africa who primarily access the internet via mobile devices.

The frontend implements type-safe API integration with the Django backend, leveraging auto-generated TypeScript types from OpenAPI schemas. This eliminates runtime errors from API mismatches and provides excellent developer experience with full autocomplete support. The application features smooth animations, real-time data updates, and a beautiful dark mode option.

### Project Goals

* **Mobile-First Design**: Optimize for mobile users in Kenya and across Africa with responsive layouts
* **Type Safety**: Achieve zero runtime API errors through auto-generated TypeScript types from the backend
* **Performance**: Fast initial load with Vite, efficient data fetching with React Query, and lazy loading
* **Accessibility**: Meet WCAG 2.1 AA standards with proper ARIA labels and keyboard navigation
* **User Experience**: Provide smooth animations, intuitive forms, and real-time feedback
* **Offline Support**: Enable progressive web app (PWA) capabilities for unreliable network conditions
* **Developer Experience**: Maintain clean, documented code with consistent patterns and tooling

### Key Tech Stack

* **Framework**: React 19 with TypeScript 5.9
* **Build Tool**: Vite 7 for fast development and optimized production builds
* **Styling**: Tailwind CSS 3.4 with custom design system
* **State Management**: Zustand 5 (client state) + React Query 5 (server state)
* **Forms**: React Hook Form 7 with Zod 4 validation
* **Routing**: React Router 7 with nested routes and lazy loading
* **Charts**: Recharts 3 for financial data visualization
* **Animations**: Framer Motion for smooth UI transitions
* **HTTP Client**: Axios with request/response interceptors
* **Components**: Radix UI primitives with custom styling

---

## 2. Team Roles and Responsibilities

| Role | Key Responsibility |
|------|-------------------|
| **Frontend Lead** | Architect component structure, establish coding patterns, review PRs, and coordinate with backend team |
| **Frontend Developer** | Build React components, implement pages, integrate APIs, and handle form validation |
| **UI/UX Designer** | Create wireframes, design mockups, define color palette, and ensure consistent design language |
| **QA Engineer** | Write component tests, end-to-end tests, and ensure cross-browser compatibility |
| **DevOps Engineer** | Configure Vite build, optimize bundle size, set up CDN, and deploy to Vercel/Netlify/Render |
| **Performance Engineer** | Profile application, optimize re-renders, implement code splitting, and monitor Core Web Vitals |
| **Accessibility Specialist** | Audit WCAG compliance, test with screen readers, and implement ARIA patterns |

---

## 3. Technology Stack Overview

| Technology | Purpose in the Project |
|-----------|----------------------|
| **React 19** | UI library for building component-based interfaces with the latest concurrent features |
| **TypeScript 5.9** | Strongly-typed JavaScript for compile-time error checking and improved IDE support |
| **Vite 7** | Next-generation build tool with instant HMR, optimized builds, and ESM-native development |
| **Tailwind CSS 3.4** | Utility-first CSS framework enabling rapid UI development without leaving HTML |
| **React Router 7** | Declarative routing with nested routes, lazy loading, and data loaders |
| **React Query (TanStack) 5** | Server state management with caching, background refetching, and optimistic updates |
| **Zustand 5** | Lightweight client state management (8KB) for UI state like modals, themes, and filters |
| **React Hook Form 7** | Performant form library with minimal re-renders and built-in validation |
| **Zod 4** | TypeScript-first schema validation for forms and API response validation |
| **Axios 1.13** | HTTP client with interceptors for authentication tokens and error handling |
| **Framer Motion 12** | Production-ready animation library for smooth, physics-based transitions |
| **Recharts 3** | Composable charting library built on D3 for financial data visualization |
| **Lucide React** | Modern icon library with 1000+ icons, tree-shakeable for optimal bundle size |
| **Radix UI** | Unstyled, accessible component primitives (Select, Dialog, Tabs) |
| **class-variance-authority** | Utility for creating variant-based component styles |
| **clsx & tailwind-merge** | Utilities for conditional class name composition |
| **ESLint 9** | JavaScript/TypeScript linter with React-specific rules |
| **PostCSS 8** | CSS transformation tool for Tailwind's JIT compilation |
| **Autoprefixer 10** | PostCSS plugin for automatic vendor prefixing |

---

## 4. Database Design Overview

### Key Entities (Frontend Data Models)

The frontend interfaces with backend entities through TypeScript interfaces that mirror the API responses:

**User & Authentication**
* `User` - User profile with email, name, phone, KYC status, credit score
* `AuthTokens` - JWT access and refresh token pair
* `LoginCredentials` - Email and password for authentication
* `RegistrationData` - User registration form data

**Groups**
* `ChamaGroup` - Group details with type, settings, balance, KYB status
* `GroupMembership` - User's membership in a group with role and status
* `GroupOfficial` - Elected official with position and term dates
* `GroupGoal` - Financial goal with target and progress
* `GroupMessage` - Chat message with content and attachments

**Finance**
* `Contribution` - Contribution record with amount, method, status
* `Loan` - Loan with principal, interest, duration, status
* `LoanRepayment` - Individual repayment record
* `Expense` - Expense with category, amount, approval status
* `DisbursementApproval` - Multi-signature approval record

**Governance**
* `Vote` - Vote record with options and results
* `VoteBallot` - Individual ballot cast by a member
* `Fine` - Fine issued to a member
* `Document` - Uploaded group document

**Investments**
* `Investment` - Investment with type, principal, current value
* `StockHolding` - Stock shares with quantity and prices
* `Portfolio` - Portfolio summary with diversification

### Relationships (Component Data Flow)

* **User → Groups**: User can view and interact with multiple groups they belong to
* **Group → Financial Data**: Each group displays its contributions, loans, expenses, and investments
* **Group → Governance**: Each group has votes, constitution, fines, and documents
* **Dashboard → Aggregates**: Dashboard pulls data from multiple endpoints to show summary statistics

### State Management Strategy

| State Type | Tool | Example |
|-----------|------|---------|
| **Server State** | React Query | User profile, groups, contributions, loans |
| **Client State** | Zustand | Theme preference, sidebar open/close, active filters |
| **Form State** | React Hook Form | Login form, contribution form, loan application |
| **URL State** | React Router | Current page, group ID, search params |

---

## 5. Feature Breakdown

### Landing Page & Authentication
* **Beautiful Landing Page**: Eye-catching hero section with animated stats and feature highlights
* **Login Page**: Email/password form with validation, error messages, and loading states
* **Registration**: Multi-step registration with email verification
* **Password Reset**: Email-based password reset flow
* **Protected Routes**: Redirect unauthenticated users to login

### Dashboard
* **Stats Overview**: Animated stat cards showing total balance, contributions, loans, members
* **Contribution Chart**: Area chart showing contribution trends over time
* **Recent Activity**: Live feed of recent transactions and events
* **Quick Actions**: One-click access to common actions (new contribution, apply for loan)
* **Group Selector**: Switch between multiple groups the user belongs to

### Group Management
* **Group List**: Card-based list of user's groups with search and filter
* **Group Details**: Comprehensive group info with tabs for different sections
* **Member Directory**: List of group members with role badges and contact info
* **Member Profile**: Detailed member view with contribution history and loan status
* **Role Management**: Admin interface for assigning roles to members

### Financial Operations

**Contributions**
* **Contribution List**: Table view with sorting, filtering, and pagination
* **New Contribution**: Form with amount, payment method, reference number
* **Reconciliation**: Treasurer interface for verifying contributions
* **Contribution Receipt**: Printable receipt for completed contributions

**Loans**
* **Loan List**: Cards showing loan status, amount, outstanding balance
* **Loan Application**: Multi-step form with amount, duration, purpose
* **Loan Calculator**: Real-time calculation of monthly payments and total interest
* **Repayment Schedule**: Timeline showing upcoming payments
* **Make Repayment**: Form for recording loan repayments

**Expenses**
* **Expense List**: Table with category filters and status badges
* **New Expense**: Form with category, description, amount, receipt upload
* **Approval Interface**: Multi-signature approval UI for authorized officials

### Governance Features
* **Constitution Viewer**: Rich text display of group constitution with sections
* **Voting Interface**: 
  - Active vote cards with countdown timers
  - Vote casting with Yes/No/Abstain options
  - Real-time vote count updates
  - Results visualization after voting closes
* **Fine Management**: Issue and track fines with reason documentation
* **Document Library**: Upload, categorize, and download group documents

### Investment Dashboard
* **Portfolio Overview**: Pie chart showing asset allocation
* **Investment List**: Cards for each investment with ROI calculation
* **Stock Tracker**: Table of stock holdings with profit/loss indicators
* **Add Investment**: Form for recording new investments
* **Transaction History**: Timeline of investment transactions

### Settings & Profile
* **Profile Settings**: Update name, phone, profile picture
* **KYC Documents**: Upload ID, KRA PIN for verification
* **Notification Preferences**: Toggle email/push notifications
* **Theme Toggle**: Switch between light and dark mode
* **Security Settings**: Change password, view active sessions

### UI Components Library
* **Stats Cards**: Animated cards with icons, values, and trend indicators
* **Data Tables**: Sortable, filterable tables with pagination
* **Form Components**: Input, Select, Checkbox, DatePicker, CurrencyInput
* **Modals**: Confirmation dialogs, form modals, image lightbox
* **Toast Notifications**: Success, error, warning, info toasts with progress bars
* **Loading States**: Skeletons, spinners, and shimmer effects
* **Empty States**: Friendly illustrations when no data exists

### Mobile Responsiveness
* **Responsive Navigation**: Hamburger menu on mobile, sidebar on desktop
* **Touch-Friendly**: Large tap targets, swipe gestures
* **Bottom Navigation**: Quick access tabs on mobile
* **Responsive Tables**: Card view on mobile, table on desktop
* **Optimized Images**: Lazy loading and responsive srcsets

---

## 6. API Security Overview

| Security Measure | Implementation | Why It's Crucial |
|-----------------|----------------|------------------|
| **Token Storage** | `httpOnly` cookies or secure storage (not localStorage) | Prevents XSS attacks from stealing tokens |
| **Axios Interceptors** | Attach Authorization header automatically, refresh on 401 | Seamless authentication without manual token handling |
| **Token Refresh** | Automatic refresh before access token expires | Users don't get logged out unexpectedly |
| **CORS Handling** | API requests only to whitelisted backend domain | Prevents CSRF and cross-origin attacks |
| **Input Sanitization** | Zod validation on all form inputs | Prevents malformed data from being sent to API |
| **XSS Prevention** | React's automatic escaping, DOMPurify for rich text | User-generated content can't execute scripts |
| **Secure Routing** | Protected routes redirect unauthenticated users | Sensitive pages can't be accessed without login |
| **Environment Variables** | API URL in `VITE_API_URL` env variable | Different configurations for dev/staging/production |
| **Content Security Policy** | CSP headers via meta tag or server config | Blocks inline scripts and unauthorized resources |
| **Error Handling** | Catch and display errors without exposing internals | User-friendly messages without stack traces |

### Authentication Flow

```
1. User enters email/password on Login page
2. Frontend validates input with Zod schema
3. POST request to /api/token/ with credentials
4. Backend returns access + refresh tokens
5. Tokens stored in httpOnly cookie (preferred) or secure memory
6. Axios interceptor attaches token to all subsequent requests
7. On 401 response, interceptor tries refresh token automatically
8. If refresh fails, user is logged out and redirected to login
9. On logout, tokens are cleared and blacklisted on server
```

### Form Validation Strategy

```typescript
// Example: Contribution form validation with Zod
const contributionSchema = z.object({
  amount: z.number()
    .min(100, 'Minimum contribution is KES 100')
    .max(1000000, 'Maximum contribution is KES 1,000,000'),
  payment_method: z.enum(['MPESA', 'BANK', 'CASH']),
  reference_number: z.string()
    .min(10, 'Reference number must be at least 10 characters')
    .optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
});
```

---

## 7. CI/CD Pipeline Overview

Continuous Integration and Continuous Deployment (CI/CD) automates the testing, building, and deployment of the frontend application. This ensures code quality, optimizes bundle size, and enables rapid iteration with confidence.

### Pipeline Stages

1. **Code Push**: Developer pushes code to GitHub repository
2. **Linting**: 
   - Run ESLint to check code quality
   - Run TypeScript compiler for type errors
3. **Testing**: 
   - Run unit tests with Vitest
   - Run component tests with React Testing Library
4. **Build**: 
   - Build production bundle with `vite build`
   - Analyze bundle size and warn on regressions
5. **Deploy**: 
   - Deploy to Render/Vercel/Netlify on push to main
   - Preview deployments for pull requests
6. **Post-Deploy**: 
   - Run Lighthouse for performance audit
   - Notify team via Slack/Discord

### Build Configuration

The `vite.config.ts` file configures the build:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react', 'recharts'],
          forms: ['react-hook-form', 'zod'],
        }
      }
    }
  }
})
```

### Deployment Configuration (Render)

The frontend is deployed to Render with these settings:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` (serves from dist/) |
| **Publish Directory** | `dist` |
| **Environment Variables** | `VITE_API_URL`, `VITE_WS_URL` |

### Performance Optimization

| Optimization | Implementation |
|-------------|----------------|
| **Code Splitting** | `React.lazy()` for route-based splitting |
| **Tree Shaking** | ES modules with Vite's Rollup |
| **Image Optimization** | Lazy loading, WebP format, responsive sizes |
| **CSS Optimization** | Tailwind's JIT compiler, PurgeCSS in production |
| **Caching** | React Query's stale-while-revalidate strategy |
| **Bundle Analysis** | `rollup-plugin-visualizer` for identifying bloat |

### Testing Strategy

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| Unit Tests | Vitest | Utility functions, hooks |
| Component Tests | React Testing Library | UI components |
| Integration Tests | React Testing Library | Page-level flows |
| E2E Tests | Playwright (optional) | Critical user journeys |

---

## 8. Resources

### Official Documentation
* [React Documentation](https://react.dev/)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)
* [Vite Documentation](https://vitejs.dev/)
* [Tailwind CSS](https://tailwindcss.com/docs)
* [React Router](https://reactrouter.com/)
* [React Query](https://tanstack.com/query/latest)
* [React Hook Form](https://react-hook-form.com/)
* [Zod](https://zod.dev/)
* [Framer Motion](https://www.framer.com/motion/)

### Project Documentation
* [Quick Start Guide](../QUICK_START.md)
* [Dashboard Troubleshooting](../DASHBOARD_TROUBLESHOOTING.md)
* [CORS Troubleshooting](../CORS_TROUBLESHOOTING.md)
* [Render Deployment Guide](../docs/RENDER_DEPLOYMENT.md)

### Learning Guides
* [Guide 7: Full-Stack Integration](../docs/07-django-typescript-fullstack-mastery.md)
* [Guide 8: Eye-Catching UI Components](../docs/08-eye-catching-ui-components.md)
* [Guide 9: Complete Dashboard](../docs/09-complete-dashboard.md)
* [Guide 10: Advanced Forms](../docs/10-advanced-forms.md)
* [Guide 11: Real-Time WebSockets](../docs/11-realtime-websockets.md)

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, Card)
│   ├── forms/          # Form components (LoginForm, ContributionForm)
│   ├── charts/         # Chart components (ContributionChart, PieChart)
│   └── layout/         # Layout components (Sidebar, Header, Footer)
├── pages/              # Page components
│   ├── auth/           # Login, Register, ForgotPassword
│   ├── dashboard/      # Dashboard page
│   ├── groups/         # Group list and details
│   ├── financial/      # Contributions, Loans, Expenses
│   ├── admin/          # Admin pages
│   ├── settings/       # User settings
│   └── tools/          # Utility pages
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── types/              # TypeScript interfaces
├── lib/                # Utility functions
└── assets/             # Static assets (images, fonts)
```

---

## 9. License

This project is licensed under the **MIT License**.

Copyright (c) 2025 Phinehas Macharia

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

---

## 10. Created By

**Phinehas Macharia**

* GitHub: [@MachariaP](https://github.com/MachariaP)
* Twitter: [@_M_Phinehas](https://twitter.com/_M_Phinehas)

---

*Last Updated: November 2025*
