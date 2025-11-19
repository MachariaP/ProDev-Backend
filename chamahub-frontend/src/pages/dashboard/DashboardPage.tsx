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
  Calendar,
  Download,
  MoreHorizontal,
  Eye,
  Filter,
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  PieChart as PieChartIcon, // Renamed to avoid conflict
} from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { analyticsService, groupsService } from '../../services/apiService';
import type { DashboardStats, RecentActivity, ChamaGroup, Notification } from '../../types/api';

// Mock data for demonstration
const mockDashboardData = {
  summary: {
    total_balance: 1234567,
    total_members: 45,
    active_loans: 12,
    total_investments: 890000,
    growth_rates: {
      balance: 12.5,
      members: 8.2,
      loans: -3.1,
      investments: 15.8,
    },
  },
  contribution_trend: [
    { month: 'Jan', amount: 45000, target: 50000 },
    { month: 'Feb', amount: 52000, target: 50000 },
    { month: 'Mar', amount: 48000, target: 50000 },
    { month: 'Apr', amount: 61000, target: 50000 },
    { month: 'May', amount: 58000, target: 50000 },
    { month: 'Jun', amount: 70000, target: 50000 },
  ],
  weekly_activity: [
    { name: 'Mon', contributions: 12, loans: 3, meetings: 2 },
    { name: 'Tue', contributions: 15, loans: 5, meetings: 1 },
    { name: 'Wed', contributions: 8, loans: 2, meetings: 3 },
    { name: 'Thu', contributions: 20, loans: 7, meetings: 0 },
    { name: 'Fri', contributions: 18, loans: 4, meetings: 1 },
    { name: 'Sat', contributions: 10, loans: 1, meetings: 2 },
    { name: 'Sun', contributions: 5, loans: 0, meetings: 0 },
  ],
  recent_transactions: [
    { id: 1, member: 'Jane Doe', type: 'contribution', amount: 5000, time: '2 hours ago', status: 'completed' },
    { id: 2, member: 'John Smith', type: 'loan_disbursed', amount: 50000, time: '3 hours ago', status: 'completed' },
    { id: 3, member: 'Mary Johnson', type: 'contribution', amount: 3000, time: '5 hours ago', status: 'pending' },
    { id: 4, member: 'Peter Brown', type: 'loan_repayment', amount: 10000, time: '1 day ago', status: 'completed' },
    { id: 5, member: 'Sarah Wilson', type: 'investment', amount: 15000, time: '1 day ago', status: 'completed' },
  ],
  quick_stats: {
    pending_actions: 5,
    upcoming_meetings: 2,
    unread_notifications: 3,
    loan_approvals: 4,
  },
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Meeting Reminder',
    message: 'Monthly chama meeting tomorrow at 2:00 PM',
    type: 'info',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Contribution Received',
    message: 'Jane Doe contributed KES 5,000',
    type: 'success',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '3',
    title: 'Loan Approval Required',
    message: '3 loan applications pending your review',
    type: 'warning',
    time: '1 day ago',
    read: true,
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

// Custom tooltip component
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name.includes('Amount') ? `KES ${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Quick Stat Card Component
function QuickStatCard({ title, value, icon: Icon, color, onClick }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left shadow-sm hover:shadow-md w-full"
    >
      <Icon className={`h-8 w-8 mb-2 ${color}`} />
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </motion.button>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon: Icon, label, onClick, color }: {
  icon: any;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-all text-center w-full"
    >
      <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center mx-auto mb-2`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

// Transaction Row Component
function TransactionRow({ transaction, index, onClick }: {
  transaction: any;
  index: number;
  onClick: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    const isPositive = type === 'contribution' || type === 'loan_repayment' || type === 'investment';
    return isPositive ? ArrowUpRight : ArrowDownRight;
  };

  const TypeIcon = getTypeIcon(transaction.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${
          transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment'
            ? 'bg-green-100 text-green-600' 
            : 'bg-orange-100 text-orange-600'
        }`}>
          <TypeIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.member}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {transaction.type.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-lg ${
          transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment'
            ? 'text-green-600' 
            : 'text-orange-600'
        }`}>
          {transaction.type === 'contribution' || transaction.type === 'loan_repayment' || transaction.type === 'investment' ? '+' : '-'}
          KES {transaction.amount.toLocaleString('en-KE')}
        </p>
        <p className="text-sm text-muted-foreground">{transaction.time}</p>
      </div>
    </motion.div>
  );
}

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

  // Simulate API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's groups
        const groupsResponse = await groupsService.getMyGroups();
        setGroups(groupsResponse);
        
        if (groupsResponse.length > 0) {
          setSelectedGroupId(groupsResponse[0].id.toString());
          // Fetch dashboard data for the first group
          await fetchDashboardData(groupsResponse[0].id);
        } else {
          // Use mock data if no groups
          setDashboardData(mockDashboardData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data
        setDashboardData(mockDashboardData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDashboardData = async (groupId: number) => {
    try {
      // In a real app, you would fetch actual dashboard data
      // const stats = await analyticsService.getGroupStats(groupId);
      // const activity = await analyticsService.getRecentActivity(groupId);
      
      // For now, use mock data tailored to the group
      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error('Failed to fetch group dashboard:', error);
      setDashboardData(mockDashboardData);
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

  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 lg:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header with Actions */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, <span className="font-medium text-foreground">{userName}</span>! 
              {userRole !== 'member' && <Badge variant="secondary" className="ml-2">{userRole}</Badge>}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Group Selector */}
            {groups.length > 0 && (
              <Select value={selectedGroupId} onValueChange={(value) => {
                setSelectedGroupId(value);
                fetchDashboardData(parseInt(value));
              }}>
                <SelectTrigger className="w-48">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg z-50"
                  >
                    <div className="p-4 border-b border-border">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Notifications</h3>
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                          Mark all as read
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                          }`}
                          onClick={() => {
                            setNotifications(prev => 
                              prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                            );
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatCard
            title="Pending Actions"
            value={dashboardData.quick_stats.pending_actions}
            icon={LayoutDashboard}
            color="text-orange-600"
            onClick={() => navigate('/actions')}
          />
          <QuickStatCard
            title="Upcoming Meetings"
            value={dashboardData.quick_stats.upcoming_meetings}
            icon={Users}
            color="text-blue-600"
            onClick={() => navigate('/meetings')}
          />
          <QuickStatCard
            title="Loan Approvals"
            value={dashboardData.quick_stats.loan_approvals}
            icon={TrendingUp}
            color="text-purple-600"
            onClick={() => navigate('/loans')}
          />
          <QuickStatCard
            title="Unread Notifications"
            value={dashboardData.quick_stats.unread_notifications}
            icon={Bell}
            color="text-red-600"
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
            iconClassName="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            loading={isRefreshing}
          />
          <StatsCard
            title="Total Members"
            value={dashboardData.summary.total_members.toString()}
            icon={Users}
            trend={dashboardData.summary.growth_rates.members}
            iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            loading={isRefreshing}
          />
          <StatsCard
            title="Active Loans"
            value={dashboardData.summary.active_loans.toString()}
            icon={TrendingUp}
            trend={dashboardData.summary.growth_rates.loans}
            iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
            loading={isRefreshing}
          />
          <StatsCard
            title="Investments"
            value={`KES ${dashboardData.summary.total_investments.toLocaleString('en-KE')}`}
            icon={PiggyBank}
            trend={dashboardData.summary.growth_rates.investments}
            iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
            loading={isRefreshing}
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contribution Trend */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contribution Trend</CardTitle>
                  <CardDescription>Last 6 months performance vs target</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.contribution_trend}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-sm" />
                    <YAxis className="text-sm" tickFormatter={(value) => `KES ${value / 1000}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(217 91% 60%)"
                      fill="url(#colorTarget)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
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
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Contributions, loans, and meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.weekly_activity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-sm" />
                    <YAxis className="text-sm" />
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
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/finance')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction: any, index: number) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                      onClick={() => navigate(`/transaction/${transaction.id}`)}
                    />
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Distribution */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton
                    icon={LayoutDashboard}
                    label="Record Contribution"
                    onClick={() => navigate('/finance?tab=contributions')}
                    color="bg-green-500"
                  />
                  <QuickActionButton
                    icon={TrendingUp}
                    label="Apply for Loan"
                    onClick={() => navigate('/loans/apply')}
                    color="bg-blue-500"
                  />
                  <QuickActionButton
                    icon={Vote}
                    label="Start Voting"
                    onClick={() => navigate('/voting/new')}
                    color="bg-purple-500"
                  />
                  <QuickActionButton
                    icon={Users}
                    label="Schedule Meeting"
                    onClick={() => navigate('/meetings/schedule')}
                    color="bg-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fund Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Fund Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Loans', value: 40 },
                          { name: 'Investments', value: 35 },
                          { name: 'Emergency', value: 15 },
                          { name: 'Operations', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="hsl(142 76% 36%)" />
                        <Cell fill="hsl(217 91% 60%)" />
                        <Cell fill="hsl(280 90% 60%)" />
                        <Cell fill="hsl(24 95% 53%)" />
                      </Pie>
                      <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Skeleton Loader Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Main Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>

        {/* Bottom Row Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
