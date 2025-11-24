import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  PieChart, 
  Calendar,
  DollarSign,
  Target,
  Sparkles,
  Crown,
  Zap,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  Award,
  Activity
} from 'lucide-react';

// Simple card components as fallback
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// Recharts components - make sure these are installed
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// API service - make sure this path is correct
import api from '../../services/api';

const COLORS = [
  'hsl(142 76% 36%)',    // Green
  'hsl(217 91% 60%)',    // Blue
  'hsl(280 90% 60%)',    // Purple
  'hsl(24 95% 53%)',     // Orange
  'hsl(338 90% 60%)',    // Pink
  'hsl(48 96% 53%)',     // Yellow
  'hsl(162 90% 60%)',    // Teal
  'hsl(340 90% 60%)',    // Red
];

// Constants for analytics data processing
const ESTIMATED_AMOUNT_PER_TRANSACTION = 10000; // Temporary estimate until backend provides actual amounts
const TARGET_PERCENTAGE = 0.8; // Target set to 80% of highest growth

const gradientColors = {
  contributions: { from: 'hsl(142 76% 36%)', to: 'hsl(162 90% 60%)' },
  growth: { from: 'hsl(217 91% 60%)', to: 'hsl(198 90% 60%)' },
  activity: { from: 'hsl(280 90% 60%)', to: 'hsl(300 90% 60%)' },
  categories: { from: 'hsl(24 95% 53%)', to: 'hsl(14 95% 53%)' },
};

type Group = { id: string; name: string };

// API Response types
interface ApiMemberActivity {
  member_name: string;
  transactions: number;
}

interface ApiCategoryBreakdown {
  name: string;
  value: number;
}

interface ApiGrowthTrend {
  month: string;
  growth: number;
}

interface ApiContribution {
  date: string;
  amount: number;
}

interface RawAnalyticsData {
  contributions_over_time: ApiContribution[];
  member_activity: ApiMemberActivity[];
  category_breakdown: ApiCategoryBreakdown[];
  growth_trends: ApiGrowthTrend[];
  generated_at?: string;
}

type AnalyticsData = {
  contributions_over_time: Array<{ date: string; amount: number }>;
  member_activity: Array<{ member_name: string; transactions: number; amount: number }>;
  category_breakdown: Array<{ name: string; value: number; color?: string }>;
  growth_trends: Array<{ month: string; growth: number; target: number }>;
  summary_stats: {
    total_contributions: number;
    active_members: number;
    average_growth: number;
    top_performer: string;
  };
};

// Helper function to process raw API data into the format expected by the UI
const processAnalyticsData = (data: RawAnalyticsData): AnalyticsData => {
  // Add amount field to member_activity (estimate based on transactions)
  const processedMemberActivity = (data.member_activity || []).map((member: ApiMemberActivity) => ({
    ...member,
    amount: member.transactions * ESTIMATED_AMOUNT_PER_TRANSACTION,
  }));
  
  // Add target field to growth_trends (set target to percentage of highest growth)
  const maxGrowth = Math.max(...(data.growth_trends || []).map((g: ApiGrowthTrend) => g.growth), 0);
  const targetAmount = maxGrowth * TARGET_PERCENTAGE;
  const processedGrowthTrends = (data.growth_trends || []).map((trend: ApiGrowthTrend) => ({
    ...trend,
    target: targetAmount,
  }));
  
  // Add colors to category_breakdown
  const processedCategoryBreakdown = (data.category_breakdown || []).map((cat: ApiCategoryBreakdown, idx: number) => ({
    ...cat,
    color: COLORS[idx % COLORS.length],
  }));
  
  // Calculate summary stats from the data
  const totalContributions = (data.contributions_over_time || []).reduce(
    (sum: number, item: ApiContribution) => sum + (item.amount || 0), 
    0
  );
  const activeMembers = (data.member_activity || []).length;
  
  // Get top performer (backend already sorts by transaction count, but we'll be explicit)
  const sortedMembers = [...(data.member_activity || [])].sort((a, b) => b.transactions - a.transactions);
  const topPerformer = sortedMembers[0]?.member_name || 'N/A';
  
  // Calculate average growth (month-over-month percentage)
  const growthValues = (data.growth_trends || []).map((g: ApiGrowthTrend) => g.growth);
  let averageGrowth = 0;
  if (growthValues.length > 1) {
    const growthRates = [];
    for (let i = 1; i < growthValues.length; i++) {
      if (growthValues[i - 1] > 0) {
        const rate = ((growthValues[i] - growthValues[i - 1]) / growthValues[i - 1]) * 100;
        growthRates.push(rate);
      }
    }
    if (growthRates.length > 0) {
      averageGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    }
  }
  
  return {
    contributions_over_time: data.contributions_over_time || [],
    member_activity: processedMemberActivity,
    category_breakdown: processedCategoryBreakdown,
    growth_trends: processedGrowthTrends,
    summary_stats: {
      total_contributions: totalContributions,
      active_members: activeMembers,
      average_growth: parseFloat(averageGrowth.toFixed(1)),
      top_performer: topPerformer,
    },
  };
};

// Enhanced Tooltip Component
const ChartTooltip = ({ active, payload, label, valueFormatter }: any) => {
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
              {valueFormatter ? valueFormatter(entry.value) : 
               typeof entry.value === 'number' ? `KES ${entry.value.toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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

// Stat Card Component
function StatCard({ title, value, change, icon: Icon, gradient, description }: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  gradient: string;
  description: string;
}) {
  const isPositive = change === undefined ? true : change >= 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-6 rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-1">{value}</h3>
      <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  );
}

export function AnalyticsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('12months');

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    contributions_over_time: [],
    member_activity: [],
    category_breakdown: [],
    growth_trends: [],
    summary_stats: {
      total_contributions: 0,
      active_members: 0,
      average_growth: 0,
      top_performer: '',
    },
  });

  // Load user's groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await api.get('/groups/chama-groups/my_groups/');
        setGroups(res.data);
        if (res.data.length > 0) {
          setSelectedGroupId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
        setError('Failed to load your chamas. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Load analytics when group changes
  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchAnalytics = async () => {
      setFetching(true);
      setError(null);

      try {
        const response = await api.get(`/analytics/dashboard/?group_id=${selectedGroupId}`);
        const processedData = processAnalyticsData(response.data);
        setAnalyticsData(processedData);
      } catch (err: unknown) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
        // Don't show mock data on error - keep empty state
      } finally {
        setFetching(false);
      }
    };

    fetchAnalytics();
  }, [selectedGroupId, timeRange]);

  const handleExportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
    alert('Export functionality would be implemented here');
  };

  const handleRefresh = async () => {
    if (selectedGroupId) {
      setFetching(true);
      setError(null);
      
      try {
        const response = await api.get(`/analytics/dashboard/?group_id=${selectedGroupId}`);
        const processedData = processAnalyticsData(response.data);
        setAnalyticsData(processedData);
      } catch (err: unknown) {
        console.error('Error refreshing analytics:', err);
        setError('Failed to refresh analytics data. Please try again.');
      } finally {
        setFetching(false);
      }
    }
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
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

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10"
        >
          <motion.button
            whileHover={{ x: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 mb-8"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
              Back to Dashboard
            </span>
          </motion.button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative"
              >
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <BarChart3 className="h-10 w-10 text-white" />
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
                  <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
                >
                  Analytics Dashboard
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-gray-600 flex items-center gap-2"
                >
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Real-time insights and performance metrics for your chama
                </motion.p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Time Range Filter */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80 backdrop-blur-sm text-gray-700 font-medium w-full sm:w-48"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Group Selector */}
              <div className="relative">
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  disabled={fetching || groups.length === 0}
                  className="appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80 backdrop-blur-sm text-gray-700 font-medium w-full sm:w-64 disabled:opacity-50"
                >
                  {groups.length === 0 ? (
                    <option>No chamas found</option>
                  ) : (
                    groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))
                  )}
                </select>
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={fetching}
                  className="p-3 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 ${fetching ? 'animate-spin' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportData}
                  className="p-3 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Download className="h-5 w-5 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 text-red-700 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Analytics Update</h3>
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {fetching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity }
                  }}
                  className="mx-auto mb-4"
                >
                  <Sparkles className="h-12 w-12 text-purple-600" />
                </motion.div>
                <p className="text-gray-600 font-medium">Updating analytics data...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Contributions"
            value={`KES ${analyticsData.summary_stats.total_contributions.toLocaleString()}`}
            change={analyticsData.summary_stats.average_growth}
            icon={DollarSign}
            gradient="from-green-500 to-emerald-500"
            description="Total amount contributed by members"
          />
          <StatCard
            title="Active Members"
            value={analyticsData.summary_stats.active_members}
            change={12.3}
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            description="Members with recent activity"
          />
          <StatCard
            title="Average Growth"
            value={`${analyticsData.summary_stats.average_growth}%`}
            change={3.2}
            icon={TrendingUp}
            gradient="from-purple-500 to-pink-500"
            description="Monthly growth rate"
          />
          <StatCard
            title="Top Performer"
            value={analyticsData.summary_stats.top_performer}
            icon={Award}
            gradient="from-orange-500 to-amber-500"
            description="Highest contributing member"
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 1. Contributions Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800">Contributions Over Time</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">Monthly contribution trends and patterns</CardDescription>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </motion.button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.contributions_over_time}>
                    <defs>
                      <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={gradientColors.contributions.from} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={gradientColors.contributions.from} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short' })}
                      className="text-sm font-medium"
                    />
                    <YAxis 
                      tickFormatter={(v) => `KES ${v / 1000}k`}
                      className="text-sm font-medium"
                    />
                    <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `KES ${v.toLocaleString()}`} />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={gradientColors.contributions.from}
                      fill="url(#colorContributions)" 
                      strokeWidth={3}
                      dot={{ fill: gradientColors.contributions.from, strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Member Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800">Top Contributors</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">Most active members by transaction volume</CardDescription>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={analyticsData.member_activity}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      tickFormatter={(v) => `KES ${v / 1000}k`}
                      className="text-sm font-medium"
                    />
                    <YAxis 
                      dataKey="member_name" 
                      type="category" 
                      width={100}
                      className="text-sm font-medium"
                    />
                    <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `${v} transactions`} />} />
                    <Bar 
                      dataKey="amount" 
                      fill={gradientColors.activity.from}
                      radius={[0, 8, 8, 0]}
                      name="Total Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800">Fund Distribution</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">How group funds are allocated</CardDescription>
                </div>
                <PieChart className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.category_breakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                        >
                          {analyticsData.category_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `KES ${(v * 24567).toLocaleString()}`} />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {analyticsData.category_breakdown.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-gray-700">{category.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{category.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. Growth Trends */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800">Growth vs Target</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">Monthly performance against targets</CardDescription>
                </div>
                <Target className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.growth_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" className="text-sm font-medium" />
                    <YAxis 
                      tickFormatter={(v) => `KES ${v / 1000}k`}
                      className="text-sm font-medium"
                    />
                    <Tooltip content={<ChartTooltip valueFormatter={(v: number) => `KES ${v.toLocaleString()}`} />} />
                    <Bar 
                      dataKey="target" 
                      fill={gradientColors.growth.from}
                      opacity={0.6}
                      radius={[4, 4, 0, 0]}
                      name="Target"
                    />
                    <Bar 
                      dataKey="growth" 
                      fill={gradientColors.growth.to}
                      radius={[4, 4, 0, 0]}
                      name="Actual Growth"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Skeleton Loader
function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-3xl bg-gray-200 animate-pulse" />
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}