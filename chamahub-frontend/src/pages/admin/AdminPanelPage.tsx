import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Settings, BarChart3, FileText,
  DollarSign, UserCheck, AlertCircle, Activity, CheckCircle,
  Clock, UserPlus, Building2, Wallet, ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { AdminLayout } from '../../components/AdminLayout';
import { adminApi, type AdminStats } from '../../services/adminApi';

export function AdminPanelPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Failed to load admin statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage and monitor your ChamaHub platform
                </p>
              </div>
            </div>
            <button
              onClick={loadAdminStats}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && !stats && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Main Content */}
        {stats && (
          <>
            {/* Key Metrics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Total Users */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_users}</p>
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <ArrowUpRight className="h-4 w-4" />
                        {stats.active_users} active
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Groups */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_groups}</p>
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {stats.active_groups} active
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Contributions */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contributions</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {formatCurrency(stats.total_contributions)}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {stats.total_transactions} transactions
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Loans */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Loans</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {formatCurrency(stats.total_loans)}
                      </p>
                      <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {stats.pending_loans} pending
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Secondary Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Transactions Today</p>
                      <p className="text-4xl font-bold mt-2">{stats.transactions_today}</p>
                    </div>
                    <Activity className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Pending KYC</p>
                      <p className="text-4xl font-bold mt-2">{stats.pending_kyc}</p>
                    </div>
                    <UserCheck className="h-10 w-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Pending Loan Applications</p>
                      <p className="text-4xl font-bold mt-2">{stats.pending_loans}</p>
                    </div>
                    <FileText className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activities
                  </CardTitle>
                  <CardDescription>Latest system activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recent_activities.length > 0 ? (
                      stats.recent_activities.map((activity) => (
                        <div
                          key={`${activity.type}-${activity.id}`}
                          className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'user_registration' ? 'bg-blue-100 dark:bg-blue-900' :
                            activity.type === 'group_creation' ? 'bg-green-100 dark:bg-green-900' :
                            activity.type === 'contribution' ? 'bg-purple-100 dark:bg-purple-900' :
                            activity.type === 'loan_application' ? 'bg-orange-100 dark:bg-orange-900' :
                            'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            {activity.type === 'user_registration' && <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            {activity.type === 'group_creation' && <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
                            {activity.type === 'contribution' && <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                            {activity.type === 'loan_application' && <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No recent activities to display
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate('/admin/users')}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user accounts, roles, and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-2">
                    Manage Users
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate('/admin/groups')}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Group Management</CardTitle>
                  <CardDescription>Monitor groups, verify KYB, and manage group settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-600 hover:underline font-medium flex items-center gap-2">
                    Manage Groups
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate('/admin/analytics')}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Analytics & Reports</CardTitle>
                  <CardDescription>View detailed analytics and generate reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-purple-600 hover:underline font-medium flex items-center gap-2">
                    View Analytics
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate('/admin/audit-logs')}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Review system activity and security audit trails</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-orange-600 hover:underline font-medium flex items-center gap-2">
                    View Audit Logs
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate('/admin/settings')}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure platform settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-red-600 hover:underline font-medium flex items-center gap-2">
                    Configure Settings
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate('/admin/kyc')}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>KYC/KYB Verification</CardTitle>
                  <CardDescription>Review and approve KYC/KYB submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-indigo-600 hover:underline font-medium flex items-center gap-2">
                    Review Submissions
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
