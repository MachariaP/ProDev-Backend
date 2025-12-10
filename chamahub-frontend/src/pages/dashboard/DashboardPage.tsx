import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  DollarSign,
  Award,
  TrendingDown,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { groupsService, analyticsService, financeService, notificationsService } from '../../services/apiService';
import type { ChamaGroup, Notification } from '../../types/api';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
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
function QuickStatCard({ title, value, icon: Icon, gradient, onClick }: {
  title: string;
  value: number;
  icon: any;
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

// Enhanced Transaction Row Component - FIXED ROUTING
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
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'partial' | 'error'>('loading');

  // Get user from localStorage
  const [user] = useState<{ full_name?: string }>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const userName = user?.full_name || 'Member';
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiStatus('loading');
      
      try {
        console.log('🔄 Starting dashboard data fetch...');
        
        // Fetch user's groups
        const groupsResponse = await groupsService.getMyGroups();
        setGroups(groupsResponse);
        
        // Fetch notifications
        try {
          const notificationsResponse = await notificationsService.getNotifications({
            page_size: 10
          });
          setNotifications(notificationsResponse.results || []);
        } catch (notifError) {
          console.warn('⚠️ Notifications endpoint not available:', notifError);
          setNotifications([]);
        }
        
        if (groupsResponse.length > 0) {
          const firstGroup = groupsResponse[0];
          setSelectedGroupId(firstGroup.id.toString());
          await fetchDashboardData(firstGroup.id);
        } else {
          console.log('👤 No groups found for user');
          setIsLoading(false);
          setApiStatus('error');
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch dashboard data:', error);
        setIsLoading(false);
        setApiStatus('error');
      }
    };

    fetchData();
  }, []);

  // Fetch dashboard data for a specific group
  const fetchDashboardData = async (groupId: number) => {
    try {
      console.log(`🚀 Fetching dashboard data for group ${groupId}...`);
      
      // Use Promise.allSettled to handle partial failures gracefully
      const [groupStats, recentActivity, transactions] = await Promise.allSettled([
        analyticsService.getGroupStats(groupId).catch(err => {
          console.warn('⚠️ Group stats endpoint failed:', err.message);
          return null;
        }),
        analyticsService.getRecentActivity(groupId).catch(err => {
          console.warn('⚠️ Recent activity endpoint failed:', err.message);
          return null;
        }),
        financeService.getTransactions({ 
          group: groupId, 
          page: 1, 
          page_size: 10,
          ordering: '-created_at'
        }).catch(err => {
          console.warn('⚠️ Transactions endpoint failed:', err.message);
          return { results: [] };
        })
      ]);

      let successfulCalls = 0;
      const results: any = {};

      // Process each promise result
      if (groupStats.status === 'fulfilled' && groupStats.value) {
        results.groupStats = groupStats.value;
        successfulCalls++;
      }

      if (recentActivity.status === 'fulfilled' && recentActivity.value) {
        results.recentActivity = recentActivity.value;
        successfulCalls++;
      }

      if (transactions.status === 'fulfilled' && transactions.value) {
        results.transactions = transactions.value;
        successfulCalls++;
      }

      // Determine API status
      if (successfulCalls === 0) {
        setApiStatus('error');
      } else if (successfulCalls === 3) {
        setApiStatus('success');
      } else {
        setApiStatus('partial');
      }

      // Transform the data
      const transformedData = transformDashboardData(
        results.groupStats,
        results.recentActivity,
        results.transactions?.results || []
      );

      setDashboardData(transformedData);
      
    } catch (error) {
      console.error('❌ Critical error in fetchDashboardData:', error);
      setApiStatus('error');
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API data to dashboard format - FIXED: Now uses transactionsData parameter
  const transformDashboardData = (
    groupStats: any,
    recentActivity: any,
    transactionsData: any[]
  ) => {
    // Use transactionsData if available, otherwise use recentActivity
    const recentTransactions = transactionsData && transactionsData.length > 0 
      ? transactionsData.slice(0, 6).map((transaction: any, index: number) => ({
          id: transaction.id || index + 1,
          member: transaction.member?.full_name || transaction.user?.full_name || 'Member',
          type: transaction.transaction_type || 'contribution',
          amount: transaction.amount || 0,
          time: transaction.created_at ? formatTimeAgo(transaction.created_at) : 'Recently',
          status: transaction.status?.toLowerCase() || 'completed'
        }))
      : recentActivity 
        ? recentActivity.slice(0, 6).map((activity: any, index: number) => ({
            id: activity.id || index + 1,
            member: activity.member_name || activity.user?.full_name || 'Member',
            type: activity.type || 'contribution',
            amount: activity.amount || 0,
            time: activity.timestamp ? formatTimeAgo(activity.timestamp) : 'Recently',
            status: activity.status?.toLowerCase() || 'completed'
          }))
        : [];

    // Create contribution trend from group stats or use empty array
    const contributionTrend = groupStats?.monthly_contributions?.map((item: any, index: number) => ({
      month: item.month || `Month ${index + 1}`,
      amount: item.amount || 0,
      target: (item.amount || 0) * 1.1
    })) || [];

    // Create weekly activity from group stats or use empty array
    const weeklyActivity = groupStats?.weekly_activity?.map((item: any, index: number) => ({
      name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
      contributions: item.contributions || 0,
      loans: item.loans || 0,
      meetings: item.meetings || 0
    })) || [];

    return {
      summary: {
        total_balance: groupStats?.total_balance || 0,
        total_members: groupStats?.total_members || 0,
        active_loans: groupStats?.active_loans || 0,
        total_investments: groupStats?.total_investments || 0,
        growth_rates: {
          balance: groupStats?.balance_growth || 0,
          members: groupStats?.member_growth || 0,
          loans: groupStats?.loan_growth || 0,
          investments: groupStats?.investment_growth || 0,
        },
      },
      contribution_trend: contributionTrend,
      weekly_activity: weeklyActivity,
      recent_transactions: recentTransactions,
      quick_stats: {
        pending_actions: groupStats?.pending_actions || 0,
        upcoming_meetings: groupStats?.upcoming_meetings || 0,
        unread_notifications: notifications.filter(n => !n.read).length,
        loan_approvals: groupStats?.pending_loans || 0,
      },
      performance_metrics: {
        roi: groupStats?.roi || 0,
        savings_growth: groupStats?.savings_growth || 0,
        loan_recovery: groupStats?.loan_recovery_rate || 0,
        member_satisfaction: groupStats?.member_satisfaction || 0
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

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await notificationsService.markAsRead(parseInt(notification.id));
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      
      // Navigate if there's an action_url
      if (notification.action_url) {
        navigate(notification.action_url);
      }
      
      setShowNotifications(false);
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
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
      success: { label: 'Live Data', color: 'bg-green-100 text-green-700', icon: '✅' },
      partial: { label: 'Partial Data', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
      error: { label: 'No Data', color: 'bg-red-100 text-red-700', icon: '🔴' }
    };

    const config = statusConfig[apiStatus];

    return (
      <Badge variant="secondary" className={`ml-2 ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
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
          <p className="text-gray-600 mb-4">Please check your internet connection and try again.</p>
          <Button onClick={handleRefresh} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
        {/* Header */}
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
                  className="text-xl text-gray-600"
                >
                  Welcome back, <span className="font-bold text-gray-800">{userName}</span>!
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
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                              notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                               notification.type === 'warning' || notification.type === 'error' ? <XCircle className="h-5 w-5" /> :
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
                      {notifications.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="font-medium">No notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics - Show only if we have performance data */}
        {dashboardData.performance_metrics && dashboardData.performance_metrics.roi > 0 && (
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
        )}

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            title="Pending Actions"
            value={dashboardData.quick_stats.pending_actions}
            icon={LayoutDashboard}
            gradient="from-orange-500 to-amber-500"
            onClick={() => navigate('/actions')}
          />
          <QuickStatCard
            title="Upcoming Meetings"
            value={dashboardData.quick_stats.upcoming_meetings}
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            onClick={() => navigate('/meetings')}
          />
          <QuickStatCard
            title="Loan Approvals"
            value={dashboardData.quick_stats.loan_approvals}
            icon={TrendingUp}
            gradient="from-purple-500 to-pink-500"
            onClick={() => navigate('/loans')}
          />
          <QuickStatCard
            title="Unread Notifications"
            value={unreadNotificationsCount}
            icon={Bell}
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
          />
          <StatsCard
            title="Total Members"
            value={dashboardData.summary.total_members.toString()}
            icon={Users}
            trend={dashboardData.summary.growth_rates.members}
            iconClassName="bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
          />
          <StatsCard
            title="Active Loans"
            value={dashboardData.summary.active_loans.toString()}
            icon={TrendingUp}
            trend={dashboardData.summary.growth_rates.loans}
            iconClassName="bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
          />
          <StatsCard
            title="Investments"
            value={`KES ${dashboardData.summary.total_investments.toLocaleString('en-KE')}`}
            icon={PiggyBank}
            trend={dashboardData.summary.growth_rates.investments}
            iconClassName="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
          />
        </motion.div>

        {/* Charts Row - Only show if we have data */}
        {(dashboardData.contribution_trend.length > 0 || dashboardData.weekly_activity.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contribution Trend */}
            {dashboardData.contribution_trend.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="text-xl font-black text-gray-800">Contribution Trend</CardTitle>
                      <CardDescription className="text-gray-600 font-medium">Monthly performance vs target</CardDescription>
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
            )}

            {/* Weekly Activity */}
            {dashboardData.weekly_activity.length > 0 && (
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
            )}
          </div>
        )}

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions - FIXED: Now navigates to transaction details */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-black text-gray-800">Recent Transactions</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/transactions')}
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
                      onClick={() => navigate(`/transactions/${transaction.id}`)} // FIXED ROUTE
                    />
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-600">No transactions found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchQuery ? 'Try adjusting your search criteria' : 'No recent transactions available'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Distribution - FIXED: All routes corrected */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* FIXED ROUTES BELOW */}
                  <QuickActionButton
                    icon={LayoutDashboard}
                    label="Record Contribution"
                    onClick={() => navigate('/contributions/new')}
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
                    onClick={() => navigate('/voting')}
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionButton
                    icon={Users}
                    label="Schedule Meeting"
                    onClick={() => navigate('/meetings')}
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
                          { name: 'Savings', value: 40, color: 'hsl(142 76% 36%)' },
                          { name: 'Loans', value: 25, color: 'hsl(217 91% 60%)' },
                          { name: 'Investments', value: 20, color: 'hsl(280 90% 60%)' },
                          { name: 'Operations', value: 15, color: 'hsl(24 95% 53%)' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[
                          { name: 'Savings', value: 40, color: 'hsl(142 76% 36%)' },
                          { name: 'Loans', value: 25, color: 'hsl(217 91% 60%)' },
                          { name: 'Investments', value: 20, color: 'hsl(280 90% 60%)' },
                          { name: 'Operations', value: 15, color: 'hsl(24 95% 53%)' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [
                          `KES ${Math.round((value / 100) * dashboardData.summary.total_balance).toLocaleString()}`,
                          'Amount'
                        ]}
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
                    { label: 'Savings', value: '40%', color: 'bg-green-500' },
                    { label: 'Loans', value: '25%', color: 'bg-blue-500' },
                    { label: 'Investments', value: '20%', color: 'bg-purple-500' },
                    { label: 'Operations', value: '15%', color: 'bg-orange-500' },
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
