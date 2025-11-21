import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Layout
import { DashboardLayout } from './components/DashboardLayout';
// Landing page
import { LandingPage } from './pages/LandingPage';
// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
// Dashboard pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { FinanceHubPage } from './pages/dashboard/FinanceHubPage';
// Group pages
import { GroupsListPage } from './pages/groups/GroupsListPage';
import { CreateGroupPage } from './pages/groups/CreateGroupPage';
import { GroupDetailPage } from './pages/groups/GroupDetailPage';
import { MemberManagementPage } from './pages/groups/MemberManagementPage';
// Financial pages
import { ContributionsPage } from './pages/financial/ContributionsPage';
import { ExpensesPage } from './pages/financial/ExpensesPage';
import { LoansPage } from './pages/financial/LoansPage';
import { LoanApplicationPage } from './pages/financial/LoanApplicationPage';
import { InvestmentsPage } from './pages/financial/InvestmentsPage';
import { InvestmentPortfolioPage } from './pages/financial/InvestmentPortfolioPage';
import { TransactionHistoryPage } from './pages/financial/TransactionHistoryPage';
// Tools pages
import { VotingPage } from './pages/tools/VotingPage';
import { ApprovalsPage } from './pages/tools/ApprovalsPage';
import { ActionsPage } from './pages/tools/ActionsPage';
import { StatementGenerationPage } from './pages/tools/StatementGenerationPage';
import { WealthEnginePage } from './pages/tools/WealthEnginePage';
import { MPesaIntegrationPage } from './pages/tools/MPesaIntegrationPage';
import { ReportsPage } from './pages/tools/ReportsPage';
// Settings pages
import { ProfilePage } from './pages/settings/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TwoFactorAuthPage } from './pages/settings/TwoFactorAuthPage';
import { AuditLogPage } from './pages/settings/AuditLogPage';
// Collaboration pages
import { ChatPage } from './pages/collaboration/ChatPage';
import { MeetingSchedulePage } from './pages/collaboration/MeetingSchedulePage';
import { DocumentSharingPage } from './pages/collaboration/DocumentSharingPage';
// Admin pages
import { AdminPanelPage } from './pages/admin/AdminPanelPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminGroupsPage } from './pages/admin/AdminGroupsPage';
import { AdminContributionsPage } from './pages/admin/AdminContributionsPage';
import { AdminLoansPage } from './pages/admin/AdminLoansPage';
import { AdminExpensesPage } from './pages/admin/AdminExpensesPage';
import { AdminKYCPage } from './pages/admin/AdminKYCPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Helper component to wrap authenticated routes with layout
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

// Helper component for admin routes without DashboardLayout wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  return <>{children}</>;
}

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Core application routes */}
        <Route
          path="/dashboard"
          element={<AuthenticatedRoute><DashboardPage /></AuthenticatedRoute>}
        />
        <Route
          path="/profile"
          element={<AuthenticatedRoute><ProfilePage /></AuthenticatedRoute>}
        />
        <Route
          path="/settings"
          element={<AuthenticatedRoute><SettingsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/two-factor-auth"
          element={<AuthenticatedRoute><TwoFactorAuthPage /></AuthenticatedRoute>}
        />
        
        {/* Group management routes */}
        <Route
          path="/groups"
          element={<AuthenticatedRoute><GroupsListPage /></AuthenticatedRoute>}
        />
        <Route
          path="/groups/create"
          element={<AuthenticatedRoute><CreateGroupPage /></AuthenticatedRoute>}
        />
        <Route
          path="/groups/:id"
          element={<AuthenticatedRoute><GroupDetailPage /></AuthenticatedRoute>}
        />
        <Route
          path="/groups/:id/members"
          element={<AuthenticatedRoute><MemberManagementPage /></AuthenticatedRoute>}
        />
        
        {/* Finance routes */}
        <Route
          path="/finance"
          element={<AuthenticatedRoute><FinanceHubPage /></AuthenticatedRoute>}
        />
        <Route
          path="/contributions"
          element={<AuthenticatedRoute><ContributionsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/transactions"
          element={<AuthenticatedRoute><TransactionHistoryPage /></AuthenticatedRoute>}
        />
        <Route
          path="/statements"
          element={<AuthenticatedRoute><StatementGenerationPage /></AuthenticatedRoute>}
        />
        
        {/* Loans routes */}
        <Route
          path="/loans"
          element={<AuthenticatedRoute><LoansPage /></AuthenticatedRoute>}
        />
        <Route
          path="/loans/apply"
          element={<AuthenticatedRoute><LoanApplicationPage /></AuthenticatedRoute>}
        />
        
        {/* Investments routes */}
        <Route
          path="/investments"
          element={<AuthenticatedRoute><InvestmentsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/investments/portfolio"
          element={<AuthenticatedRoute><InvestmentPortfolioPage /></AuthenticatedRoute>}
        />
        <Route
          path="/wealth-engine"
          element={<AuthenticatedRoute><WealthEnginePage /></AuthenticatedRoute>}
        />
        <Route
          path="/mpesa-integration"
          element={<AuthenticatedRoute><MPesaIntegrationPage /></AuthenticatedRoute>}
        />
        
        {/* Analytics & Reports routes */}
        <Route
          path="/analytics"
          element={<AuthenticatedRoute><AnalyticsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/reports"
          element={<AuthenticatedRoute><ReportsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/audit-log"
          element={<AuthenticatedRoute><AuditLogPage /></AuthenticatedRoute>}
        />
        
        {/* Other routes */}
        <Route
          path="/expenses"
          element={<AuthenticatedRoute><ExpensesPage /></AuthenticatedRoute>}
        />
        <Route
          path="/approvals"
          element={<AuthenticatedRoute><ApprovalsPage /></AuthenticatedRoute>}
        />
        <Route
          path="/voting"
          element={<AuthenticatedRoute><VotingPage /></AuthenticatedRoute>}
        />
        <Route
          path="/actions"
          element={<AuthenticatedRoute><ActionsPage /></AuthenticatedRoute>}
        />
        
        {/* Collaboration routes */}
        <Route
          path="/chat"
          element={<AuthenticatedRoute><ChatPage /></AuthenticatedRoute>}
        />
        <Route
          path="/meetings"
          element={<AuthenticatedRoute><MeetingSchedulePage /></AuthenticatedRoute>}
        />
        <Route
          path="/documents"
          element={<AuthenticatedRoute><DocumentSharingPage /></AuthenticatedRoute>}
        />
        
        {/* Admin routes */}
        <Route
          path="/admin"
          element={<AdminRoute><AdminPanelPage /></AdminRoute>}
        />
        <Route
          path="/admin/users"
          element={<AdminRoute><AdminUsersPage /></AdminRoute>}
        />
        <Route
          path="/admin/groups"
          element={<AdminRoute><AdminGroupsPage /></AdminRoute>}
        />
        <Route
          path="/admin/contributions"
          element={<AdminRoute><AdminContributionsPage /></AdminRoute>}
        />
        <Route
          path="/admin/loans"
          element={<AdminRoute><AdminLoansPage /></AdminRoute>}
        />
        <Route
          path="/admin/expenses"
          element={<AdminRoute><AdminExpensesPage /></AdminRoute>}
        />
        <Route
          path="/admin/kyc"
          element={<AdminRoute><AdminKYCPage /></AdminRoute>}
        />
        <Route
          path="/admin/audit-logs"
          element={<AdminRoute><AdminAuditLogsPage /></AdminRoute>}
        />
        <Route
          path="/admin/analytics"
          element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>}
        />
        <Route
          path="/admin/settings"
          element={<AdminRoute><AdminSettingsPage /></AdminRoute>}
        />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

