import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Core application routes */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/two-factor-auth"
          element={isAuthenticated ? <TwoFactorAuthPage /> : <Navigate to="/login" />}
        />
        
        {/* Group management routes */}
        <Route
          path="/groups"
          element={isAuthenticated ? <GroupsListPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups/create"
          element={isAuthenticated ? <CreateGroupPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups/:id"
          element={isAuthenticated ? <GroupDetailPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups/:id/members"
          element={isAuthenticated ? <MemberManagementPage /> : <Navigate to="/login" />}
        />
        
        {/* Finance routes */}
        <Route
          path="/finance"
          element={isAuthenticated ? <FinanceHubPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/contributions"
          element={isAuthenticated ? <ContributionsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={isAuthenticated ? <TransactionHistoryPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/statements"
          element={isAuthenticated ? <StatementGenerationPage /> : <Navigate to="/login" />}
        />
        
        {/* Loans routes */}
        <Route
          path="/loans"
          element={isAuthenticated ? <LoansPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/loans/apply"
          element={isAuthenticated ? <LoanApplicationPage /> : <Navigate to="/login" />}
        />
        
        {/* Investments routes */}
        <Route
          path="/investments"
          element={isAuthenticated ? <InvestmentsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/investments/portfolio"
          element={isAuthenticated ? <InvestmentPortfolioPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/wealth-engine"
          element={isAuthenticated ? <WealthEnginePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/mpesa-integration"
          element={isAuthenticated ? <MPesaIntegrationPage /> : <Navigate to="/login" />}
        />
        
        {/* Analytics & Reports routes */}
        <Route
          path="/analytics"
          element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/reports"
          element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/audit-log"
          element={isAuthenticated ? <AuditLogPage /> : <Navigate to="/login" />}
        />
        
        {/* Other routes */}
        <Route
          path="/expenses"
          element={isAuthenticated ? <ExpensesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/approvals"
          element={isAuthenticated ? <ApprovalsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/voting"
          element={isAuthenticated ? <VotingPage /> : <Navigate to="/login" />}
        />
        
        {/* Collaboration routes */}
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/meetings"
          element={isAuthenticated ? <MeetingSchedulePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/documents"
          element={isAuthenticated ? <DocumentSharingPage /> : <Navigate to="/login" />}
        />
        
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

