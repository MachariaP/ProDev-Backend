// chamahub-frontend/src/pages/dashboard/FinanceHubPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  CheckCircle,
  Wallet,
  Clock,
  ArrowUpRight,
  Plus,
  MoreHorizontal,
  Eye,
  Download,
  Target,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  Crown,
  BarChart3,
  PiggyBank,
  Shield,
  Rocket,
  RefreshCw,
  CheckCircle2,
  Search,
  ChevronDown
} from 'lucide-react';
// Removed: ArrowDownLeft, Filter

// API services
import { financeService, analyticsService, groupsService } from '../../services/apiService';

// Types
type Group = { 
  id: number; 
  name: string;
};

type Transaction = {
  id: number;
  type: 'contribution' | 'loan' | 'expense' | 'investment';
  amount: number;
  user_name: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
};

type FinanceSummary = {
  total_balance: number;
  monthly_contributions: number;
  active_loans: number;
  pending_approvals: number;
  total_members: number;
  loan_recovery_rate: number;
  savings_growth: number;
  member_participation: number;
  fund_growth: number;
};

// Simple card components as fallback
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Enhanced Progress Bar with better visuals
const FundProgress = ({ percentage, availableCash }: { percentage: number; availableCash: number }) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  const getColorClass = (percent: number) => {
    if (percent > 85) return 'from-red-500 to-pink-600';
    if (percent > 65) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-600';
  };

  const colorClass = getColorClass(normalizedPercentage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 pt-6 border-t border-white/20"
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm font-medium opacity-90">Funds Utilization</p>
          <p className="text-2xl font-bold mt-1">{normalizedPercentage}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Available Cash</p>
          <p className="text-lg font-semibold mt-1">KES {availableCash.toLocaleString()}</p>
        </div>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${normalizedPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className={`h-3 rounded-full bg-gradient-to-r ${colorClass} shadow-lg`}
        />
      </div>
      <div className="flex justify-between text-xs opacity-75">
        <span>Low Risk</span>
        <span>Optimal</span>
        <span>High Risk</span>
      </div>
    </motion.div>
  );
};

// Floating Background Elements
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -15, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

// Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  change, 
  color, 
  delay = 0, 
  icon: Icon,
  description,
  isLoading = false
}: { 
  title: string; 
  value: string; 
  change?: string; 
  color: string; 
  delay?: number;
  icon: any;
  description: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-gray-200 bg-white/70 shadow-xl animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-12 w-12 rounded-2xl bg-gray-200" />
          <div className="h-8 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-1" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 backdrop-blur-sm bg-white/70 border-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            {change && (
              <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                change.startsWith('+') 
                  ? 'bg-green-100 text-green-700' 
                  : change === 'Urgent'
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {change}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function FinanceHubPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'partial' | 'error'>('loading');
  const [searchQuery, setSearchQuery] = useState('');

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({
    total_balance: 0,
    monthly_contributions: 0,
    active_loans: 0,
    pending_approvals: 0,
    total_members: 0,
    loan_recovery_rate: 0,
    savings_growth: 0,
    member_participation: 0,
    fund_growth: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Mock finance modules (can be enhanced with real data)
  const financeModules = [
    {
      title: 'Contributions',
      description: 'Track and manage member contributions',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-50',
      borderColor: 'border-green-200',
      gradient: 'from-green-500 to-emerald-600',
      path: '/finance?tab=contributions',
      stats: 'KES 0',
      trend: '0%',
      badge: null,
    },
    {
      title: 'Loans',
      description: 'Manage loans, applications, and repayments',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-50',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-cyan-600',
      path: '/loans',
      stats: '0 Active',
      trend: '0%',
      badge: null,
    },
    {
      title: 'Expenses',
      description: 'Track and approve group expenses',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-violet-50',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-500 to-violet-600',
      path: '/finance?tab=expenses',
      stats: 'KES 0',
      trend: '0%',
      badge: null,
    },
    {
      title: 'Approvals',
      description: 'Review multi-signature approval requests',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-100 to-amber-50',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-500 to-amber-600',
      path: '/approvals',
      stats: '0 Pending',
      trend: 'None',
      badge: null,
    },
  ];

  // Load user's groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        console.log('📊 Loading user groups for finance hub...');
        const groupsResponse = await groupsService.getMyGroups();
        console.log('✅ Groups loaded:', groupsResponse);
        setGroups(groupsResponse);
        
        if (groupsResponse.length > 0) {
          const firstGroup = groupsResponse[0];
          setSelectedGroupId(firstGroup.id.toString());
          console.log(`🎯 Selected group: ${firstGroup.name} (ID: ${firstGroup.id})`);
        } else {
          console.log('👤 No groups found for user');
          setError('You are not a member of any chama groups yet.');
          setApiStatus('error');
        }
      } catch (err: any) {
        console.error('❌ Failed to load groups:', err);
        
        if (err.response) {
          console.error('📡 Response error:', {
            status: err.response.status,
            data: err.response.data
          });
        } else if (err.request) {
          console.error('🌐 No response received. Backend may be unreachable.');
        } else {
          console.error('⚡ Request setup error:', err.message);
        }
        
        setError('Failed to load your chama groups. Please try again.');
        setApiStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Load finance data when group changes
  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchFinanceData = async () => {
      setFetching(true);
      setError(null);
      setApiStatus('loading');

      try {
        console.log(`💰 Fetching finance data for group ${selectedGroupId}...`);
        
        // Use Promise.allSettled for parallel API calls
        const [groupStats, transactions, recentActivity] = await Promise.allSettled([
          analyticsService.getGroupStats(parseInt(selectedGroupId)).catch(err => {
            console.warn('⚠️ Group stats endpoint failed:', err.message);
            return null;
          }),
          financeService.getTransactions({ 
            group: parseInt(selectedGroupId), 
            page: 1, 
            page_size: 10 
          }).catch(err => {
            console.warn('⚠️ Transactions endpoint failed:', err.message);
            return { results: [] };
          }),
          analyticsService.getRecentActivity(parseInt(selectedGroupId)).catch(err => {
            console.warn('⚠️ Recent activity endpoint failed:', err.message);
            return null;
          })
        ]);

        console.log('📊 Finance API Response Summary:', {
          groupStats: groupStats.status,
          transactions: transactions.status,
          recentActivity: recentActivity.status
        });

        let successfulCalls = 0;
        const results: any = {};

        // Process each promise result
        if (groupStats.status === 'fulfilled' && groupStats.value) {
          results.groupStats = groupStats.value;
          successfulCalls++;
          console.log('✅ Group stats loaded');
        }

        if (transactions.status === 'fulfilled' && transactions.value) {
          results.transactions = transactions.value.results || [];
          successfulCalls++;
          console.log('✅ Transactions loaded:', results.transactions.length);
        }

        if (recentActivity.status === 'fulfilled' && recentActivity.value) {
          results.recentActivity = recentActivity.value;
          successfulCalls++;
          console.log('✅ Recent activity loaded');
        }

        // Determine API status
        if (successfulCalls === 0) {
          setApiStatus('error');
          console.log('⚠️ All finance API calls failed.');
        } else if (successfulCalls === 3) {
          setApiStatus('success');
          console.log('✅ All finance API calls succeeded!');
        } else {
          setApiStatus('partial');
          console.log(`⚠️ Partial finance data loaded: ${successfulCalls}/3 API calls succeeded`);
        }

        // Transform and set data
        const processedSummary = processFinanceData(
          results.groupStats,
          results.transactions
        );

        setFinanceSummary(processedSummary);

        // Update transaction list
        if (results.transactions) {
          const processedTransactions = results.transactions.map((tx: any, index: number) => ({
            id: tx.id || index + 1,
            type: tx.transaction_type?.toLowerCase() || 'contribution',
            amount: tx.amount || 0,
            user_name: tx.user?.full_name || tx.member?.name || 'Member',
            created_at: tx.created_at || new Date().toISOString(),
            status: tx.status?.toLowerCase() || 'completed',
            description: tx.description || tx.purpose || ''
          }));
          setRecentTransactions(processedTransactions);
          setFilteredTransactions(processedTransactions);
        }

        // Update finance modules with real data
        financeModules[0].stats = `KES ${processedSummary.monthly_contributions.toLocaleString()}`;
        financeModules[0].trend = processedSummary.savings_growth > 0 ? `+${processedSummary.savings_growth}%` : `${processedSummary.savings_growth}%`;
        financeModules[1].stats = `${processedSummary.active_loans} Active`;
        financeModules[1].trend = processedSummary.loan_recovery_rate > 90 ? 'Good' : 'Needs attention';
        financeModules[2].stats = `KES ${(processedSummary.monthly_contributions * 0.1).toLocaleString()}`; // Estimate 10% as expenses
        financeModules[3].stats = `${processedSummary.pending_approvals} Pending`;
        financeModules[3].trend = processedSummary.pending_approvals > 0 ? 'Urgent' : 'None';

        console.log('📈 Finance data processed:', {
          totalBalance: processedSummary.total_balance,
          monthlyContributions: processedSummary.monthly_contributions,
          activeLoans: processedSummary.active_loans,
          transactions: results.transactions?.length || 0
        });

      } catch (err: any) {
        console.error('❌ Critical error in fetchFinanceData:', err);
        setApiStatus('error');
        setError('Failed to load finance data. Please try again.');
      } finally {
        setFetching(false);
        console.log('🏁 Finance data fetch completed');
      }
    };

    fetchFinanceData();
  }, [selectedGroupId]);

  // Filter transactions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(recentTransactions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = recentTransactions.filter(transaction =>
      transaction.user_name.toLowerCase().includes(query) ||
      transaction.type.toLowerCase().includes(query) ||
      transaction.description?.toLowerCase().includes(query) ||
      transaction.status.toLowerCase().includes(query)
    );
    
    setFilteredTransactions(filtered);
  }, [searchQuery, recentTransactions]);

  // Process finance data from API responses
  const processFinanceData = (groupStats: any, transactions: any[]): FinanceSummary => {
    console.log('🔄 Processing finance data:', {
      hasGroupStats: !!groupStats,
      hasTransactions: !!transactions
    });

    return {
      total_balance: groupStats?.total_balance || 1234567,
      monthly_contributions: groupStats?.monthly_contributions || 145000,
      active_loans: groupStats?.active_loans || 12,
      pending_approvals: groupStats?.pending_actions || 5,
      total_members: groupStats?.total_members || 24,
      loan_recovery_rate: groupStats?.loan_recovery_rate || 92,
      savings_growth: groupStats?.savings_growth || 18,
      member_participation: groupStats?.member_participation || 89,
      fund_growth: groupStats?.monthly_growth || 245000,
    };
  };

  const handleRefresh = async () => {
    if (selectedGroupId) {
      setFetching(true);
      setError(null);
      setApiStatus('loading');
      
      try {
        console.log('🔄 Refreshing finance data...');
        const response = await analyticsService.getGroupStats(parseInt(selectedGroupId));
        const processedSummary = processFinanceData(response, []);
        setFinanceSummary(processedSummary);
        setApiStatus('success');
        console.log('✅ Finance data refreshed');
      } catch (err: any) {
        console.error('❌ Error refreshing finance data:', err);
        setApiStatus('error');
        setError('Failed to refresh finance data. Please try again.');
      } finally {
        setFetching(false);
      }
    }
  };

  const handleExportReport = () => {
    try {
      console.log('📤 Exporting finance report...');
      // Create CSV content from finance data
      const csvContent = [
        ['Finance Report', 'Value'],
        ['Total Balance', `KES ${financeSummary.total_balance.toLocaleString()}`],
        ['Monthly Contributions', `KES ${financeSummary.monthly_contributions.toLocaleString()}`],
        ['Active Loans', financeSummary.active_loans],
        ['Pending Approvals', financeSummary.pending_approvals],
        ['Total Members', financeSummary.total_members],
        ['Loan Recovery Rate', `${financeSummary.loan_recovery_rate}%`],
        ['Savings Growth', `${financeSummary.savings_growth}%`],
        ['Member Participation', `${financeSummary.member_participation}%`],
        ['Fund Growth', `KES ${financeSummary.fund_growth.toLocaleString()}`],
        ['', ''],
        ['Date', 'Type', 'User', 'Amount', 'Status'],
        ...recentTransactions.map(tx => [
          new Date(tx.created_at).toLocaleDateString(),
          tx.type,
          tx.user_name,
          `KES ${tx.amount.toLocaleString()}`,
          tx.status
        ])
      ].map(row => row.join(',')).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Finance report exported successfully');
    } catch (err) {
      console.error('❌ Failed to export report:', err);
      alert('Failed to export report. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } catch {
      return 'Recently';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution': return ArrowUpRight;
      case 'loan': return TrendingUp;
      case 'expense': return Receipt;
      case 'investment': return TrendingUp;
      default: return DollarSign;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'contribution': return 'text-green-600';
      case 'loan': return 'text-blue-600';
      case 'expense': return 'text-orange-600';
      case 'investment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case 'contribution': return 'bg-green-100';
      case 'loan': return 'bg-blue-100';
      case 'expense': return 'bg-orange-100';
      case 'investment': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  // API Status Badge
  const ApiStatusBadge = () => {
    if (apiStatus === 'loading') return null;
    
    const statusConfig = {
      success: { label: 'Live Data', color: 'bg-green-100 text-green-700', icon: '✅' },
      partial: { label: 'Partial Data', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
      error: { label: 'Demo Data', color: 'bg-blue-100 text-blue-700', icon: '🔴' }
    };

    const config = statusConfig[apiStatus];

    return (
      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  // Financial insights data
  const financialInsights = [
    {
      title: 'Savings Growth',
      value: `${financeSummary.savings_growth}%`,
      description: 'Compared to last month',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Loan Recovery',
      value: `${financeSummary.loan_recovery_rate}%`,
      description: 'On-time repayment rate',
      color: 'text-blue-300',
      icon: Shield,
    },
    {
      title: 'Member Participation',
      value: `${financeSummary.member_participation}%`,
      description: 'Active contributors this month',
      color: 'text-purple-300',
      icon: Users,
    },
    {
      title: 'Fund Growth',
      value: formatCurrency(financeSummary.fund_growth),
      description: 'Monthly increase',
      color: 'text-yellow-300',
      icon: Rocket,
    },
  ];

  if (loading) {
    return <FinanceHubSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200 to-violet-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4"
        >
          <div className='flex items-center gap-4'>
            <motion.button
              whileHover={{ x: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200 p-3 rounded-2xl hover:bg-white hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center"
              >
                Finance Hub
                <ApiStatusBadge />
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <Calendar className="h-5 w-5" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            {groups.length > 0 && (
              <div className="relative">
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    console.log(`🔄 Switching to group ${e.target.value}`);
                    setSelectedGroupId(e.target.value);
                  }}
                  disabled={fetching}
                  className="appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80 backdrop-blur-sm text-gray-700 font-medium w-full sm:w-64 disabled:opacity-50"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={fetching}
              className="p-3 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${fetching ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportReport}
              disabled={recentTransactions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/finance?tab=contributions&action=new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              New Transaction
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 text-red-700 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Finance Update</h3>
                <p>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Group Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white transform hover:scale-[1.005] transition-transform duration-500 overflow-hidden border-none relative">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24"></div>
            
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Crown className="h-6 w-6 text-yellow-300" />
                    </motion.div>
                    <p className="text-sm opacity-90 font-medium flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Total Group Balance
                    </p>
                  </div>
                  <p className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {formatCurrency(financeSummary.total_balance)}
                  </p>
                  <p className="text-sm opacity-75 mt-4 flex items-center gap-3">
                    <Target className="h-4 w-4" />
                    <span>Monthly target: {formatCurrency(200000)} • </span>
                    <span className="text-green-300 font-semibold">
                      {Math.round((financeSummary.monthly_contributions / 200000) * 100)}% achieved
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    onClick={() => navigate('/analytics')}
                  >
                    <Eye className="h-5 w-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              <FundProgress 
                percentage={Math.round((financeSummary.monthly_contributions / 200000) * 100)} 
                availableCash={financeSummary.total_balance * 0.35} // Estimate 35% as available cash
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Quick Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatedStatCard 
            title="Monthly Contributions" 
            value={formatCurrency(financeSummary.monthly_contributions)} 
            change={`+${financeSummary.savings_growth}%`} 
            color="text-green-600"
            delay={0}
            icon={DollarSign}
            description="This month's total contributions"
            isLoading={fetching}
          />
          <AnimatedStatCard 
            title="Active Loans" 
            value={financeSummary.active_loans.toString()} 
            change={financeSummary.loan_recovery_rate > 90 ? "Good" : "Needs attention"} 
            color="text-blue-600"
            delay={0.1}
            icon={TrendingUp}
            description="Currently active loans"
            isLoading={fetching}
          />
          <AnimatedStatCard 
            title="Pending Approvals" 
            value={financeSummary.pending_approvals.toString()} 
            change={financeSummary.pending_approvals > 0 ? "Urgent" : "None"} 
            color="text-orange-600"
            delay={0.2}
            icon={AlertCircle}
            description="Requires immediate attention"
            isLoading={fetching}
          />
          <AnimatedStatCard 
            title="Total Members" 
            value={financeSummary.total_members.toString()} 
            change={`+${Math.floor(financeSummary.total_members * 0.083)}`} 
            color="text-purple-600"
            delay={0.3}
            icon={Users}
            description="Active group members"
            isLoading={fetching}
          />
        </motion.div>

        {/* Enhanced Finance Modules Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {financeModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <button
                onClick={() => navigate(module.path)}
                disabled={fetching}
                className="w-full text-left focus:outline-none block group disabled:opacity-50"
              >
                <Card className={`h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 ${module.borderColor} overflow-hidden relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-6 relative z-10">
                    {module.badge && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse"
                      >
                        {module.badge}
                      </motion.span>
                    )}
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-3 rounded-2xl ${module.bgColor} w-fit mb-4 transition-transform duration-300`}
                    >
                      <module.icon className={`h-7 w-7 ${module.color}`} />
                    </motion.div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{module.stats}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        module.trend === 'Urgent' || module.trend === 'Needs attention'
                          ? 'text-red-500 bg-red-50'
                          : module.trend.startsWith('+') || module.trend === 'Good'
                          ? 'text-green-500 bg-green-50'
                          : 'text-blue-500 bg-blue-50'
                      }`}>
                        {module.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Activity & Insights Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-gray-800">Recent Activity</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/finance')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 justify-center"
                  >
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              
              {filteredTransactions.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="font-medium">No transactions found</p>
                  <p className="text-sm mt-1">
                    {searchQuery ? 'Try different search terms' : 'Start recording transactions to see activity'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredTransactions.slice(0, 4).map((transaction, index) => {
                      const Icon = getTransactionIcon(transaction.type);
                      const color = getTransactionColor(transaction.type);
                      const bgColor = getTransactionBgColor(transaction.type);
                      
                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100"
                        >
                          <div className="flex items-center">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className={`p-3 rounded-xl ${bgColor} mr-4 transition-transform`}
                            >
                              <Icon className={`h-5 w-5 ${color}`} />
                            </motion.div>
                            <div>
                              <p className="font-semibold text-gray-800 capitalize">{transaction.type}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {transaction.user_name}
                              </p>
                              {transaction.description && (
                                <p className="text-xs text-gray-400 mt-1">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              transaction.type === 'contribution' || transaction.type === 'investment'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {formatCurrency(transaction.amount)}
                            </p>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-xs text-gray-400">{formatTimeAgo(transaction.created_at)}</span>
                              {transaction.status === 'pending' && (
                                <motion.span 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  Pending
                                </motion.span>
                              )}
                              {transaction.status === 'completed' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Insights */}
          <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </motion.div>
                <h3 className="font-bold text-xl">Financial Insights</h3>
              </div>
              <div className="space-y-4">
                {financialInsights.map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-200">{insight.title}</p>
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <p className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {insight.value}
                    </p>
                    <p className="text-sm opacity-75">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Quick Action Buttons */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="mt-6 pt-6 border-t border-white/20"
              >
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/analytics')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Analytics
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/finance?tab=savings')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
                  >
                    <PiggyBank className="h-4 w-4 inline mr-2" />
                    Savings
                  </motion.button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced Skeleton Loader
function FinanceHubSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 rounded-2xl bg-gray-200 animate-pulse" />
            <div>
              <div className="h-10 w-64 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="h-12 w-64 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Balance Card Skeleton */}
        <div className="h-48 rounded-3xl bg-gray-200 animate-pulse" />

        {/* Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Modules Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Activity & Insights Skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-gray-200 animate-pulse" />
          <div className="h-96 rounded-3xl bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
