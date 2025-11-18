import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { GroupsListPage } from './pages/GroupsListPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { FinanceHubPage } from './pages/FinanceHubPage';
import { ContributionsPage } from './pages/ContributionsPage';
import { LoansPage } from './pages/LoansPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { VotingPage } from './pages/VotingPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
// New pages
import { GroupDetailPage } from './pages/GroupDetailPage';
import { MemberManagementPage } from './pages/MemberManagementPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { StatementGenerationPage } from './pages/StatementGenerationPage';
import { SettingsPage } from './pages/SettingsPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { TwoFactorAuthPage } from './pages/TwoFactorAuthPage';
import { LoanApplicationPage } from './pages/LoanApplicationPage';
import { InvestmentPortfolioPage } from './pages/InvestmentPortfolioPage';
import { WealthEnginePage } from './pages/WealthEnginePage';
import { MPesaIntegrationPage } from './pages/MPesaIntegrationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ChatPage } from './pages/ChatPage';
import { MeetingSchedulePage } from './pages/MeetingSchedulePage';
import { DocumentSharingPage } from './pages/DocumentSharingPage';

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

