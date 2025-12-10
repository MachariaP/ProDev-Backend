// chamahub-frontend/src/pages/dashboard/DashboardPage.tsx
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
  XCircle,
  Calendar,
  AlertCircle,
  Target,
  Sparkles
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Brush } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { groupsService, analyticsService, financeService, notificationsService } from '../../services/apiService';
import type { ChamaGroup, Notification } from '../../types/api';
import { formatCurrency, formatTimeAgo, abbreviateNumber } from '../../utils/formatting';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

// Enhanced tooltip component with consistent styling
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-xl shadow-2xl p-3">
        <p className="font-bold text-gray-800 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-medium text-gray-600">{entry.name}:</span>
            </div>
            <span className="font-bold text-gray-800 text-sm">
              {entry.name.includes('Amount') || entry.name.includes('KES') ? formatCurrency(entry.value) : entry.value}
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
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative p-5 rounded-2xl border border-gray-200/40 bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all text-left group"
    >
      {/* Subtle gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`} />
      
      <div className="pt-1">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-700 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-black text-gray-900">{value}</p>
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
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-4 rounded-xl border border-gray-200/40 bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all text-center group"
    >
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="font-semibold text-gray-800 text-sm block">{label}</span>
      <span className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to start
      </span>
    </motion.button>
  );
}

// Performance Metric Card Component with enhanced display
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
      whileHover={{ scale: 1.02, y: -1 }}
      className="p-4 rounded-xl border border-gray-200/40 bg-white/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          isPositive 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-xl font-black text-gray-900">{value}</p>
      {/* Mini sparkline */}
      <div className="mt-2 h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className={`h-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
        />
      </div>
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
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const isPositive = type === 'contribution' || type === 'loan_repayment' || type === 'investment';
    return isPositive ? ArrowUpRight : ArrowDownRight;
  };

  const getTypeGradient = (type: string) => {
    const isPositive = type === 'contribution' || type === 'loan_repayment' || type === 'investment';
    return isPositive ? 'from-green-400 to-emerald-500' : 'from-orange-400 to-amber-500';
  };

  const TypeIcon = getTypeIcon(transaction.type);
  const typeGradient = getTypeGradient(transaction.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl border border-gray-200/40 bg-white/95 backdrop-blur-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center space-x-3">
        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${typeGradient} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
          <TypeIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{transaction.member}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs font-medium capitalize bg-gray-100 text-gray-700 px-2 py-0.5">
              {transaction.type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={`text-xs border ${getStatusColor(transaction.status)} px-2 py-0.5`}>
              {transaction.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-base ${
          transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment'
            ? 'text-green-600' 
            : 'text-orange-600'
        }`}>
          {transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-500 font-medium">{transaction.time}</p>
      </div>
    </motion.div>
  );
}

// Empty State Component for Charts
function ChartEmptyState({ title, description, icon: Icon = BarChart3, actionText, onAction }: {
  title: string;
  description: string;
  icon?: any;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] p-8 text-center">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-800 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-md mb-4">{description}</p>
      {actionText && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

// Floating Background Elements (more subtle)
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -10, 0],
    }}
    transition={{
      duration: 8,
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
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    // Try to get last selected group from localStorage
    return localStorage.getItem('lastSelectedGroup') || '';
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'partial' | 'error'>('loading');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [compactMode, setCompactMode] = useState(false);

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

  // Save selected group to localStorage
  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem('lastSelectedGroup', selectedGroupId);
    }
  }, [selectedGroupId]);

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
          const groupToSelect = selectedGroupId || groupsResponse[0].id.toString();
          setSelectedGroupId(groupToSelect);
          await fetchDashboardData(parseInt(groupToSelect));
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

      // Transform the data with time range filter
      const transformedData = transformDashboardData(
        results.groupStats,
        results.transactions?.results || [],
        timeRange
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

  // Transform API data with time range filtering
  const transformDashboardData = (
    groupStats: any,
    transactionsData: any[],
    range: string
  ) => {
    // Filter transactions based on time range
    const filteredTransactions = transactionsData.filter((transaction: any) => {
      if (!transaction.created_at) return true;
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (range) {
        case '7d': return diffInDays <= 7;
        case '30d': return diffInDays <= 30;
        case '90d': return diffInDays <= 90;
        case '1y': return diffInDays <= 365;
        default: return true;
      }
    });

    const recentTransactions = filteredTransactions.slice(0, 6).map((transaction: any, index: number) => ({
      id: transaction.id || index + 1,
      member: transaction.member?.full_name || transaction.user?.full_name || 'Member',
      type: transaction.transaction_type || 'contribution',
      amount: transaction.amount || 0,
      time: transaction.created_at ? formatTimeAgo(transaction.created_at) : 'Recently',
      status: transaction.status?.toLowerCase() || 'completed'
    }));

    // Create contribution trend with time range
    const contributionTrend = groupStats?.monthly_contributions?.slice(0, getRangeLimit(range)).map((item: any, index: number) => ({
      month: item.month || `Month ${index + 1}`,
      amount: item.amount || 0,
      target: (item.amount || 0) * 1.1
    })) || [];

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

  const getRangeLimit = (range: string): number => {
    switch (range) {
      case '7d': return 1;
      case '30d': return 1;
      case '90d': return 3;
      case '1y': return 12;
      default: return 6;
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

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
    if (selectedGroupId && dashboardData) {
      // Re-transform data with new time range
      const transformedData = transformDashboardData(
        dashboardData.rawStats,
        dashboardData.rawTransactions || [],
        range
      );
      setDashboardData(transformedData);
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
      await notificationsService.markAsRead(parseInt(notification.id));
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      
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

  // API Status Badge with improved styling
  const ApiStatusBadge = () => {
    if (apiStatus === 'loading') return null;
    
    const statusConfig = {
      success: { 
        label: 'Live', 
        color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200',
        icon: '🟢'
      },
      partial: { 
        label: 'Partial', 
        color: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200',
        icon: '🟡'
      },
      error: { 
        label: 'Offline', 
        color: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200',
        icon: '🔴'
      }
    };

    const config = statusConfig[apiStatus];

    return (
      <Badge variant="secondary" className={`ml-2 ${config.color} flex items-center gap-1.5 px-2 py-1`}>
        <span className="text-xs">{config.icon}</span>
        <span className="text-xs font-medium">{config.label}</span>
      </Badge>
    );
  };

  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData && groups.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome to ChamaHub!</h2>
          <p className="text-gray-600 mb-6">You're not a member of any groups yet. Let's create your first group to get started.</p>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/groups')}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              Browse Groups
            </Button>
            <Button 
              onClick={() => navigate('/groups/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              Create Group
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connection Issue</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading your dashboard data.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRefresh} variant="outline" className="border-gray-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30 p-4 lg:p-6 relative overflow-hidden">
      {/* Subtle Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
        </FloatingElement>
        <FloatingElement delay={3}>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        </FloatingElement>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`max-w-7xl mx-auto space-y-6 relative z-10 ${compactMode ? 'compact-mode' : ''}`}
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="relative"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Crown className="h-7 w-7 text-white" />
              </div>
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Dashboard
                </motion.h1>
                <ApiStatusBadge />
              </div>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600"
              >
                Welcome back, <span className="font-bold text-gray-800">{userName}</span>!
              </motion.p>
            </div>
          </div>
          
          {/* Header Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0">
            {/* Compact Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompactMode(!compactMode)}
              className="text-gray-600 hover:text-gray-800"
              title={compactMode ? "Switch to normal view" : "Switch to compact view"}
            >
              <Sparkles className={`h-4 w-4 ${compactMode ? 'text-purple-500' : ''}`} />
            </Button>

            {/* Group Selector */}
            {groups.length > 0 && (
              <Select value={selectedGroupId} onValueChange={(value) => {
                setSelectedGroupId(value);
                fetchDashboardData(parseInt(value));
              }}>
                <SelectTrigger className="w-40 bg-white/95 backdrop-blur-sm border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="truncate">{group.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Time Range Selector */}
            <div className="relative">
              <Tabs value={timeRange} onValueChange={(v) => handleTimeRangeChange(v as any)}>
                <TabsList className="bg-white/95 backdrop-blur-sm border border-gray-300">
                  <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
                  <TabsTrigger value="90d" className="text-xs">90D</TabsTrigger>
                  <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search */}
            <div className="relative flex-1 lg:flex-none min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white/95 backdrop-blur-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg border border-gray-300 bg-white/95 backdrop-blur-sm hover:shadow transition-all disabled:opacity-50"
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg border border-gray-300 bg-white/95 backdrop-blur-sm hover:shadow transition-all relative"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                {unreadNotificationsCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow"
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
                    className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-blue-600 text-sm">
                          Mark all read
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-2">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              notification.type === 'error' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notification.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                               notification.type === 'warning' || notification.type === 'error' ? <XCircle className="h-4 w-4" /> :
                               <Bell className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-gray-800 text-sm">{notification.title}</p>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-gray-600 text-xs mb-1 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        {dashboardData.performance_metrics && dashboardData.performance_metrics.roi > 0 && (
          <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <PerformanceMetric
              title="Return on Investment"
              value={`${dashboardData.performance_metrics.roi}%`}
              change={dashboardData.performance_metrics.roi - 15}
              icon={TrendingUp}
              gradient="from-green-400 to-emerald-500"
            />
            <PerformanceMetric
              title="Savings Growth"
              value={`${dashboardData.performance_metrics.savings_growth}%`}
              change={dashboardData.performance_metrics.savings_growth - 18}
              icon={PiggyBank}
              gradient="from-blue-400 to-cyan-500"
            />
            <PerformanceMetric
              title="Loan Recovery"
              value={`${dashboardData.performance_metrics.loan_recovery}%`}
              change={dashboardData.performance_metrics.loan_recovery - 92}
              icon={DollarSign}
              gradient="from-purple-400 to-pink-500"
            />
            <PerformanceMetric
              title="Member Satisfaction"
              value={`${dashboardData.performance_metrics.member_satisfaction}%`}
              change={dashboardData.performance_metrics.member_satisfaction - 94}
              icon={Award}
              gradient="from-orange-400 to-amber-500"
            />
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            title="Pending Actions"
            value={dashboardData.quick_stats.pending_actions}
            icon={LayoutDashboard}
            gradient="from-orange-400 to-amber-500"
            onClick={() => navigate('/actions')}
          />
          <QuickStatCard
            title="Upcoming Meetings"
            value={dashboardData.quick_stats.upcoming_meetings}
            icon={Users}
            gradient="from-blue-400 to-cyan-500"
            onClick={() => navigate('/meetings')}
          />
          <QuickStatCard
            title="Loan Approvals"
            value={dashboardData.quick_stats.loan_approvals}
            icon={TrendingUp}
            gradient="from-purple-400 to-pink-500"
            onClick={() => navigate('/loans')}
          />
          <QuickStatCard
            title="Unread Notifications"
            value={unreadNotificationsCount}
            icon={Bell}
            gradient="from-red-400 to-rose-500"
            onClick={() => setShowNotifications(true)}
          />
        </motion.div>

        {/* Main Stats Grid with animated values */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Balance"
            value={dashboardData.summary.total_balance}
            trend={dashboardData.summary.growth_rates.balance}
            icon={Wallet}
            iconClassName="bg-gradient-to-br from-green-400 to-emerald-500"
            formatAsCurrency={true}
            animateValue={true}
          />
          <StatsCard
            title="Total Members"
            value={dashboardData.summary.total_members}
            trend={dashboardData.summary.growth_rates.members}
            icon={Users}
            iconClassName="bg-gradient-to-br from-blue-400 to-cyan-500"
            formatAsCurrency={false}
            animateValue={true}
          />
          <StatsCard
            title="Active Loans"
            value={dashboardData.summary.active_loans}
            trend={dashboardData.summary.growth_rates.loans}
            icon={TrendingUp}
            iconClassName="bg-gradient-to-br from-orange-400 to-amber-500"
            formatAsCurrency={false}
            animateValue={true}
          />
          <StatsCard
            title="Investments"
            value={dashboardData.summary.total_investments}
            trend={dashboardData.summary.growth_rates.investments}
            icon={PiggyBank}
            iconClassName="bg-gradient-to-br from-purple-400 to-pink-500"
            formatAsCurrency={true}
            animateValue={true}
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Contribution Trend */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-300 bg-white/95 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800">Contribution Trend</CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      {timeRange === '7d' ? 'Weekly' : timeRange === '30d' ? 'Monthly' : timeRange === '90d' ? 'Quarterly' : 'Yearly'} performance
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/analytics')}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardData.contribution_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => `KES ${abbreviateNumber(value)}`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stroke="hsl(217 91% 60%)"
                        fill="url(#colorTarget)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        name="Target"
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(142 76% 36%)"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        strokeWidth={2}
                        name="Actual"
                      />
                      {/* Brush for zooming */}
                      <Brush 
                        dataKey="month" 
                        height={20} 
                        stroke="#8884d8" 
                        fill="rgba(136, 132, 216, 0.1)"
                        tickFormatter={() => ''}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmptyState
                    title="No Contribution Data"
                    description="Start recording contributions to see trends and performance analytics."
                    icon={Target}
                    actionText="Record Contribution"
                    onAction={() => navigate('/contributions/new')}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-300 bg-white/95 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800">Weekly Activity</CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Contributions, loans, and meetings overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.weekly_activity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dashboardData.weekly_activity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar 
                        dataKey="contributions" 
                        fill="hsl(142 76% 36%)" 
                        radius={[4, 4, 0, 0]}
                        name="Contributions"
                      />
                      <Bar 
                        dataKey="loans" 
                        fill="hsl(217 91% 60%)" 
                        radius={[4, 4, 0, 0]}
                        name="Loans"
                      />
                      <Bar 
                        dataKey="meetings" 
                        fill="hsl(280 90% 60%)" 
                        radius={[4, 4, 0, 0]}
                        name="Meetings"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ChartEmptyState
                    title="No Activity This Week"
                    description="When members make contributions or process loans, they'll appear here."
                    icon={Calendar}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <Card className="border border-gray-300 bg-white/95 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">Recent Transactions</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/transactions')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredTransactions.map((transaction: any, index: number) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                    />
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <Search className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium text-gray-600">No transactions found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchQuery ? 'Try a different search term' : 'No recent transactions'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Distribution */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Card className="border border-gray-300 bg-white/95 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <QuickActionButton
                    icon={LayoutDashboard}
                    label="Record Contribution"
                    onClick={() => navigate('/contributions/new')}
                    gradient="from-green-400 to-emerald-500"
                  />
                  <QuickActionButton
                    icon={TrendingUp}
                    label="Apply for Loan"
                    onClick={() => navigate('/loans/apply')}
                    gradient="from-blue-400 to-cyan-500"
                  />
                  <QuickActionButton
                    icon={Vote}
                    label="Start Voting"
                    onClick={() => navigate('/voting')}
                    gradient="from-purple-400 to-pink-500"
                  />
                  <QuickActionButton
                    icon={Users}
                    label="Schedule Meeting"
                    onClick={() => navigate('/meetings')}
                    gradient="from-orange-400 to-amber-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fund Distribution */}
            <Card className="border border-gray-300 bg-white/95 backdrop-blur-sm shadow-md rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800">Fund Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
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
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={1}
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
                          formatCurrency(Math.round((value / 100) * dashboardData.summary.total_balance)),
                          'Amount'
                        ]}
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'Savings', value: '40%', color: 'bg-green-500' },
                    { label: 'Loans', value: '25%', color: 'bg-blue-500' },
                    { label: 'Investments', value: '20%', color: 'bg-purple-500' },
                    { label: 'Operations', value: '15%', color: 'bg-orange-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                      <span className="text-xs font-bold text-gray-900 ml-auto">{item.value}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>

        {/* Performance Metrics Skeleton */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        {/* Main Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>

        {/* Bottom Row Skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}