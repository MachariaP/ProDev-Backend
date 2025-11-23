import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Users,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Vote,
  Bell,
  RefreshCw,
  Eye,
  Search,
  BarChart3,
  Crown,
  Zap,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  Gem,
  Rocket,
  PieChart,
  LineChart,
  Activity,
  Award,
  Clock,
  TrendingDown,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { groupsService, analyticsService, financeService } from '../../services/apiService';
import type { ChamaGroup, Notification } from '../../types/api';

// Enhanced mock data for demonstration (as fallback)
const mockDashboardData = {
  summary: {
    total_balance: 2456789,
    total_members: 67,
    active_loans: 8,
    total_investments: 1560000,
    growth_rates: {
      balance: 18.5,
      members: 12.3,
      loans: -5.2,
      investments: 22.7,
    },
  },
  contribution_trend: [
    { month: 'Jan', amount: 45000, target: 50000 },
    { month: 'Feb', amount: 52000, target: 50000 },
    { month: 'Mar', amount: 48000, target: 50000 },
    { month: 'Apr', amount: 61000, target: 50000 },
    { month: 'May', amount: 58000, target: 50000 },
    { month: 'Jun', amount: 70000, target: 50000 },
    { month: 'Jul', amount: 75000, target: 60000 },
    { month: 'Aug', amount: 82000, target: 60000 },
  ],
  weekly_activity: [
    { name: 'Mon', contributions: 12, loans: 3, meetings: 2 },
    { name: 'Tue', contributions: 15, loans: 5, meetings: 1 },
    { name: 'Wed', contributions: 8, loans: 2, meetings: 3 },
    { name: 'Thu', contributions: 20, loans: 7, meetings: 0 },
    { name: 'Fri', contributions: 18, loans: 4, meetings: 1 },
    { name: 'Sat', contributions: 25, loans: 1, meetings: 2 },
    { name: 'Sun', contributions: 5, loans: 0, meetings: 0 },
  ],
  recent_transactions: [
    { id: 1, member: 'Jane Doe', type: 'contribution', amount: 15000, time: '2 hours ago', status: 'completed' },
    { id: 2, member: 'John Smith', type: 'loan_disbursed', amount: 75000, time: '3 hours ago', status: 'completed' },
    { id: 3, member: 'Mary Johnson', type: 'contribution', amount: 12000, time: '5 hours ago', status: 'pending' },
    { id: 4, member: 'Peter Brown', type: 'loan_repayment', amount: 25000, time: '1 day ago', status: 'completed' },
    { id: 5, member: 'Sarah Wilson', type: 'investment', amount: 45000, time: '1 day ago', status: 'completed' },
    { id: 6, member: 'David Kimani', type: 'contribution', amount: 8000, time: '2 days ago', status: 'completed' },
  ],
  quick_stats: {
    pending_actions: 7,
    upcoming_meetings: 3,
    unread_notifications: 5,
    loan_approvals: 2,
  },
  performance_metrics: {
    roi: 18.2,
    savings_growth: 22.5,
    loan_recovery: 94.7,
    member_satisfaction: 96.3
  }
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Monthly Meeting Reminder',
    message: 'Chama meeting tomorrow at 2:00 PM at Community Hall',
    type: 'info',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Large Contribution Received',
    message: 'Jane Doe contributed KES 15,000 to group savings',
    type: 'success',
    time: '3 hours ago',
    read: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

// Enhanced tooltip component
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl p-4">
        <p className="font-bold text-gray-800 text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium text-gray-600">{entry.name}:</span>
            </div>
            <span className="font-bold text-gray-800">
              {entry.name.includes('Amount') || entry.name.includes('KES') ? `KES ${entry.value.toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Enhanced Quick Stat Card Component
function QuickStatCard({ title, value, icon: Icon, color, gradient, onClick }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative p-6 rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all text-left group overflow-hidden"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="font-bold text-gray-700 text-sm mb-1">{title}</h3>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
    </motion.button>
  );
}

// Enhanced Quick Action Button Component
function QuickActionButton({ icon: Icon, label, onClick, gradient }: {
  icon: any;
  label: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-5 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all text-center group"
    >
      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="font-semibold text-gray-800 text-sm">{label}</span>
    </motion.button>
  );
}

// Performance Metric Card Component
function PerformanceMetric({ title, value, change, icon: Icon, gradient }: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  gradient: string;
}) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-4 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </motion.div>
  );
}

// Enhanced Transaction Row Component
function TransactionRow({ transaction, index, onClick }: {
  transaction: any;
  index: number;
  onClick: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const isPositive = type === 'contribution' || type === 'loan_repayment' || type === 'investment';
    return isPositive ? ArrowUpRight : ArrowDownRight;
  };

  const getTypeGradient = (type: string) => {
    const isPositive = type === 'contribution' || type === 'loan_repayment' || type === 'investment';
    return isPositive ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-amber-500';
  };

  const TypeIcon = getTypeIcon(transaction.type);
  const typeGradient = getTypeGradient(transaction.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-center space-x-4">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${typeGradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
          <TypeIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-800">{transaction.member}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs font-medium capitalize bg-gray-100 text-gray-700">
              {transaction.type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={`text-xs border ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-black text-lg ${
          transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment'
            ? 'text-green-600' 
            : 'text-orange-600'
        }`}>
          {transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment' ? '+' : '-'}
          KES {transaction.amount.toLocaleString('en-KE')}
        </p>
        <p className="text-sm text-gray-500 font-medium">{transaction.time}</p>
      </div>
    </motion.div>
  );
}

// Floating Background Elements
const FloatingElement = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -20, 0],
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

export function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'partial' | 'error'>('loading');

  // Get user from localStorage
  const [user] = useState<{ full_name?: string; role?: string }>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const userName = user?.full_name || 'Member';
  const userRole = user?.role || 'member';
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Fetch data from backend with fallbacks
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiStatus('loading');
      try {
        // Fetch user's groups
        const groupsResponse = await groupsService.getMyGroups();
        setGroups(groupsResponse);
        
        if (groupsResponse.length > 0) {
          const firstGroup = groupsResponse[0];
          setSelectedGroupId(firstGroup.id.toString());
          await fetchDashboardData(firstGroup.id);
        } else {
          setIsLoading(false);
          setApiStatus('error');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setIsLoading(false);
        setApiStatus('error');
      }
    };

    fetchData();
  }, []);

  const fetchDashboardData = async (groupId: number) => {
    try {
      let apiData: any = {};
      let successfulCalls = 0;
      let totalCalls = 0;

      // Try to fetch from available endpoints
      try {
        totalCalls++;
        const dashboardAnalytics = await analyticsService.getDashboardAnalytics(groupId);
        apiData.dashboardAnalytics = dashboardAnalytics;
        successfulCalls++;
      } catch (error) {
        console.warn('Dashboard analytics endpoint not available, using mock data');
        apiData.dashboardAnalytics = null;
      }

      // Try group stats endpoint
      try {
        totalCalls++;
        const groupStats = await analyticsService.getGroupStats(groupId);
        apiData.groupStats = groupStats;
        successfulCalls++;
      } catch (error) {
        console.warn('Group stats endpoint not available, using mock data');
        apiData.groupStats = null;
      }

      // Try recent activity endpoint
      try {
        totalCalls++;
        const recentActivity = await analyticsService.getRecentActivity(groupId);
        apiData.recentActivity = recentActivity;
        successfulCalls++;
      } catch (error) {
        console.warn('Recent activity endpoint not available, using mock data');
        apiData.recentActivity = null;
      }

      // Try transactions endpoint
      try {
        totalCalls++;
        const transactions = await financeService.getTransactions({ group: groupId, page: 1 });
        apiData.transactions = transactions;
        successfulCalls++;
      } catch (error) {
        console.warn('Transactions endpoint not available, using mock data');
        apiData.transactions = null;
      }

      // Determine API status
      if (successfulCalls === 0) {
        setApiStatus('error');
        setDashboardData(mockDashboardData);
      } else if (successfulCalls === totalCalls) {
        setApiStatus('success');
      } else {
        setApiStatus('partial');
      }

      // Transform the data
      const transformedData = transformDashboardData(
        apiData.groupStats,
        apiData.recentActivity,
        apiData.dashboardAnalytics,
        apiData.transactions
      );

      setDashboardData(transformedData);
    } catch (error) {
      console.error('Failed to fetch group dashboard:', error);
      setApiStatus('error');
      setDashboardData(mockDashboardData);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API data to component structure with fallbacks
  const transformDashboardData = (
    groupStats: any,
    recentActivity: any,
    dashboardAnalytics: any,
    transactions: any
  ) => {
    // Use API data if available, otherwise use mock data
    const useMockData = !groupStats && !recentActivity && !dashboardAnalytics;

    if (useMockData) {
      return mockDashboardData;
    }

    // Transform recent activity to transactions format if available
    const recentTransactions = recentActivity 
      ? recentActivity.map((activity: any, index: number) => ({
          id: index + 1,
          member: activity.member_name || 'Member',
          type: activity.type || 'contribution',
          amount: activity.amount || 0,
          time: activity.timestamp ? formatTimeAgo(activity.timestamp) : 'Recently',
          status: activity.status || 'completed'
        }))
      : mockDashboardData.recent_transactions;

    // Transform analytics data for charts if available
    const contributionTrend = dashboardAnalytics?.contributions_over_time?.map((item: any) => ({
      month: item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short' }) : 'Month',
      amount: item.amount || 0,
      target: (item.amount || 0) * 1.1
    })) || mockDashboardData.contribution_trend;

    const weeklyActivity = dashboardAnalytics?.member_activity?.slice(0, 7).map((item: any, index: number) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      contributions: item.transactions || 0,
      loans: Math.floor(Math.random() * 5),
      meetings: Math.floor(Math.random() * 3)
    })) || mockDashboardData.weekly_activity;

    return {
      summary: {
        total_balance: groupStats?.total_balance || mockDashboardData.summary.total_balance,
        total_members: groupStats?.total_members || mockDashboardData.summary.total_members,
        active_loans: groupStats?.active_loans || mockDashboardData.summary.active_loans,
        total_investments: groupStats?.total_investments || mockDashboardData.summary.total_investments,
        growth_rates: {
          balance: groupStats?.balance_growth || mockDashboardData.summary.growth_rates.balance,
          members: groupStats?.member_growth || mockDashboardData.summary.growth_rates.members,
          loans: groupStats?.loan_growth || mockDashboardData.summary.growth_rates.loans,
          investments: groupStats?.investment_growth || mockDashboardData.summary.growth_rates.investments,
        },
      },
      contribution_trend: contributionTrend,
      weekly_activity: weeklyActivity,
      recent_transactions: recentTransactions.slice(0, 6),
      quick_stats: {
        pending_actions: groupStats?.pending_actions || mockDashboardData.quick_stats.pending_actions,
        upcoming_meetings: groupStats?.upcoming_meetings || mockDashboardData.quick_stats.upcoming_meetings,
        unread_notifications: notifications.filter(n => !n.read).length,
        loan_approvals: groupStats?.pending_loans || mockDashboardData.quick_stats.loan_approvals,
      },
      performance_metrics: {
        roi: groupStats?.roi || mockDashboardData.performance_metrics.roi,
        savings_growth: groupStats?.savings_growth || mockDashboardData.performance_metrics.savings_growth,
        loan_recovery: groupStats?.loan_recovery_rate || mockDashboardData.performance_metrics.loan_recovery,
        member_satisfaction: groupStats?.member_satisfaction || mockDashboardData.performance_metrics.member_satisfaction
      }
    };
  };

  // Helper function to format time ago
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (selectedGroupId) {
        await fetchDashboardData(parseInt(selectedGroupId));
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const filteredTransactions = useMemo(() => {
    if (!dashboardData?.recent_transactions) return [];
    if (!searchQuery) return dashboardData.recent_transactions;
    
    return dashboardData.recent_transactions.filter((transaction: any) =>
      transaction.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dashboardData?.recent_transactions, searchQuery]);

  // API Status Badge
  const ApiStatusBadge = () => {
    if (apiStatus === 'loading') return null;
    
    const statusConfig = {
      success: { label: 'Live Data', color: 'bg-green-100 text-green-700' },
      partial: { label: 'Partial Data', color: 'bg-yellow-100 text-yellow-700' },
      error: { label: 'Demo Data', color: 'bg-blue-100 text-blue-700' }
    };

    const config = statusConfig[apiStatus];

    return (
      <Badge variant="secondary" className={`ml-2 ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData && groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">No Groups Found</h2>
          <p className="text-gray-600 mb-6">You are not a member of any groups yet.</p>
          <Button 
            onClick={() => navigate('/groups/create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Your First Group
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Enhanced Header with Actions */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative"
              >
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
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
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center"
                >
                  Dashboard
                  <ApiStatusBadge />
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-gray-600 flex items-center gap-2"
                >
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Welcome back, <span className="font-bold text-gray-800">{userName}</span>! 
                  {userRole !== 'member' && (
                    <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {userRole}
                    </Badge>
                  )}
                </motion.p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Group Selector */}
            {groups.length > 0 && (
              <Select value={selectedGroupId} onValueChange={(value) => {
                setSelectedGroupId(value);
                fetchDashboardData(parseInt(value));
              }}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-xl border-gray-200/50 rounded-2xl">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-200/50 rounded-2xl bg-white/80 backdrop-blur-xl w-full lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl hover:shadow-lg transition-all disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl hover:shadow-lg transition-all relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotificationsCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                  >
                    {unreadNotificationsCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-16 w-96 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-200/50">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-gray-800 text-lg">Notifications</h3>
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-blue-600 font-semibold">
                          Mark all as read
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 border-b border-gray-200/50 last:border-b-0 hover:bg-gray-50/50 cursor-pointer transition-all ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => {
                            setNotifications(prev => 
                              prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                            );
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                              notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                               notification.type === 'warning' ? <XCircle className="h-5 w-5" /> :
                               <Bell className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-gray-800 text-sm">{notification.title}</p>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2 leading-relaxed">{notification.message}</p>
                              <p className="text-xs text-gray-500 font-medium">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PerformanceMetric
            title="Return on Investment"
            value={`${dashboardData.performance_metrics.roi}%`}
            change={dashboardData.performance_metrics.roi - 15}
            icon={TrendingUp}
            gradient="from-green-500 to-emerald-500"
          />
          <PerformanceMetric
            title="Savings Growth"
            value={`${dashboardData.performance_metrics.savings_growth}%`}
            change={dashboardData.performance_metrics.savings_growth - 18}
            icon={PiggyBank}
            gradient="from-blue-500 to-cyan-500"
          />
          <PerformanceMetric
            title="Loan Recovery"
            value={`${dashboardData.performance_metrics.loan_recovery}%`}
            change={dashboardData.performance_metrics.loan_recovery - 92}
            icon={DollarSign}
            gradient="from-purple-500 to-pink-500"
          />
          <PerformanceMetric
            title="Member Satisfaction"
            value={`${dashboardData.performance_metrics.member_satisfaction}%`}
            change={dashboardData.performance_metrics.member_satisfaction - 94}
            icon={Award}
            gradient="from-orange-500 to-amber-500"
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            title="Pending Actions"
            value={dashboardData.quick_stats.pending_actions}
            icon={LayoutDashboard}
            color="text-orange-600"
            gradient="from-orange-500 to-amber-500"
            onClick={() => navigate('/actions')}
          />
          <QuickStatCard
            title="Upcoming Meetings"
            value={dashboardData.quick_stats.upcoming_meetings}
            icon={Users}
            color="text-blue-600"
            gradient="from-blue-500 to-cyan-500"
            onClick={() => navigate('/meetings')}
          />
          <QuickStatCard
            title="Loan Approvals"
            value={dashboardData.quick_stats.loan_approvals}
            icon={TrendingUp}
            color="text-purple-600"
            gradient="from-purple-500 to-pink-500"
            onClick={() => navigate('/loans')}
          />
          <QuickStatCard
            title="Unread Notifications"
            value={dashboardData.quick_stats.unread_notifications}
            icon={Bell}
            color="text-red-600"
            gradient="from-red-500 to-pink-500"
            onClick={() => setShowNotifications(true)}
          />
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Balance"
            value={`KES ${dashboardData.summary.total_balance.toLocaleString('en-KE')}`}
            icon={Wallet}
            trend={dashboardData.summary.growth_rates.balance}
            iconClassName="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg"
            gradient="from-green-50 to-emerald-50"
          />
          <StatsCard
            title="Total Members"
            value={dashboardData.summary.total_members.toString()}
            icon={Users}
            trend={dashboardData.summary.growth_rates.members}
            iconClassName="bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
            gradient="from-blue-50 to-cyan-50"
          />
          <StatsCard
            title="Active Loans"
            value={dashboardData.summary.active_loans.toString()}
            icon={TrendingUp}
            trend={dashboardData.summary.growth_rates.loans}
            iconClassName="bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
            gradient="from-orange-50 to-amber-50"
          />
          <StatsCard
            title="Investments"
            value={`KES ${dashboardData.summary.total_investments.toLocaleString('en-KE')}`}
            icon={PiggyBank}
            trend={dashboardData.summary.growth_rates.investments}
            iconClassName="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
            gradient="from-purple-50 to-pink-50"
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contribution Trend */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800">Contribution Trend</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">Last 8 months performance vs target</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/analytics')}
                  className="rounded-xl border-gray-200/50 bg-white/50 backdrop-blur-sm hover:bg-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.contribution_trend}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" className="text-sm font-medium" />
                    <YAxis className="text-sm font-medium" tickFormatter={(value) => `KES ${value / 1000}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(217 91% 60%)"
                      fill="url(#colorTarget)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target Amount"
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(142 76% 36%)"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      strokeWidth={3}
                      name="Actual Amount"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black text-gray-800">Weekly Activity</CardTitle>
                <CardDescription className="text-gray-600 font-medium">Contributions, loans, and meetings overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.weekly_activity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" className="text-sm font-medium" />
                    <YAxis className="text-sm font-medium" />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar 
                      dataKey="contributions" 
                      fill="hsl(142 76% 36%)" 
                      radius={[6, 6, 0, 0]}
                      name="Contributions"
                    />
                    <Bar 
                      dataKey="loans" 
                      fill="hsl(217 91% 60%)" 
                      radius={[6, 6, 0, 0]}
                      name="Loans Processed"
                    />
                    <Bar 
                      dataKey="meetings" 
                      fill="hsl(280 90% 60%)" 
                      radius={[6, 6, 0, 0]}
                      name="Meetings Held"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-black text-gray-800">Recent Transactions</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/finance')}
                  className="rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions.map((transaction: any, index: number) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                      onClick={() => navigate(`/transaction/${transaction.id}`)}
                    />
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-600">No transactions found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Distribution */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton
                    icon={LayoutDashboard}
                    label="Record Contribution"
                    onClick={() => navigate('/finance?tab=contributions')}
                    gradient="from-green-500 to-emerald-500"
                  />
                  <QuickActionButton
                    icon={TrendingUp}
                    label="Apply for Loan"
                    onClick={() => navigate('/loans/apply')}
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionButton
                    icon={Vote}
                    label="Start Voting"
                    onClick={() => navigate('/voting/new')}
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionButton
                    icon={Users}
                    label="Schedule Meeting"
                    onClick={() => navigate('/meetings/schedule')}
                    gradient="from-orange-500 to-amber-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fund Distribution */}
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black text-gray-800">Fund Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Loans', value: 40, color: 'hsl(142 76% 36%)' },
                          { name: 'Investments', value: 35, color: 'hsl(217 91% 60%)' },
                          { name: 'Emergency', value: 15, color: 'hsl(280 90% 60%)' },
                          { name: 'Operations', value: 10, color: 'hsl(24 95% 53%)' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Loans', value: 40, color: 'hsl(142 76% 36%)' },
                          { name: 'Investments', value: 35, color: 'hsl(217 91% 60%)' },
                          { name: 'Emergency', value: 15, color: 'hsl(280 90% 60%)' },
                          { name: 'Operations', value: 10, color: 'hsl(24 95% 53%)' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`KES ${(value * 24567).toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          background: 'white',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: 'Loans', value: '40%', color: 'bg-green-500' },
                    { label: 'Investments', value: '35%', color: 'bg-blue-500' },
                    { label: 'Emergency', value: '15%', color: 'bg-purple-500' },
                    { label: 'Operations', value: '10%', color: 'bg-orange-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50/50">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced Skeleton Loader Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-3xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
        </div>

        {/* Performance Metrics Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>

        {/* Main Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>

        {/* Bottom Row Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}