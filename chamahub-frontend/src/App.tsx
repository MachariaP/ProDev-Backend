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

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups"
          element={isAuthenticated ? <GroupsListPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/groups/create"
          element={isAuthenticated ? <CreateGroupPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/finance"
          element={isAuthenticated ? <FinanceHubPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/contributions"
          element={isAuthenticated ? <ContributionsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/loans"
          element={isAuthenticated ? <LoansPage /> : <Navigate to="/login" />}
        />
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
        <Route
          path="/investments"
          element={isAuthenticated ? <InvestmentsPage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

