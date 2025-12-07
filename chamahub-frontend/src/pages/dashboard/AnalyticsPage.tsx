// chamahub-frontend/src/pages/dashboard/AnalyticsPage.tsx
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
  DollarSign,
  Target,
  Sparkles,
  Crown,
  Zap,
  Download,
  RefreshCw,
  Eye,
  Award
} from 'lucide-react';

// API service
import { analyticsService, groupsService } from '../../services/apiService';

// Recharts components
import {
  BarChart,
  Bar,
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

// Types
type Group = { 
  id: number; 
  name: string;
};

type ApiResponse = {
  contributions_over_time: Array<{ date: string; amount: number }>;
  member_activity: Array<{ member_name: string; transactions: number }>;
  category_breakdown: Array<{ name: string; value: number }>;
  growth_trends: Array<{ month: string; growth: number }>;
  generated_at?: string;
};

type ProcessedAnalyticsData = {
  contributions_over_time: Array<{ date: string; amount: number }>;
  member_activity: Array<{ member_name: string; transactions: number; amount: number }>;
  category_breakdown: Array<{ name: string; value: number; color: string }>;
  growth_trends: Array<{ month: string; growth: number; target: number }>;
  summary_stats: {
    total_contributions: number;
    active_members: number;
    average_growth: number;
    top_performer: string;
  };
};

// Constants
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

const ESTIMATED_AMOUNT_PER_TRANSACTION = 10000; // Temporary estimate
const TARGET_PERCENTAGE = 0.8; // Target set to 80% of highest growth

const gradientColors = {
  contributions: { from: 'hsl(142 76% 36%)', to: 'hsl(162 90% 60%)' },
  growth: { from: 'hsl(217 91% 60%)', to: 'hsl(198 90% 60%)' },
  activity: { from: 'hsl(280 90% 60%)', to: 'hsl(300 90% 60%)' },
  categories: { from: 'hsl(24 95% 53%)', to: 'hsl(14 95% 53%)' },
};

// Simple card components as fallback
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// Helper function to process raw API data
const processAnalyticsData = (data: ApiResponse): ProcessedAnalyticsData => {
  console.log('🔄 Processing analytics data from API:', {
    contributions: data.contributions_over_time?.length || 0,
    members: data.member_activity?.length || 0,
    categories: data.category_breakdown?.length || 0,
    trends: data.growth_trends?.length || 0
  });

  // Add amount field to member_activity (estimate based on transactions)
  const processedMemberActivity = (data.member_activity || []).map((member) => ({
    ...member,
    amount: member.transactions * ESTIMATED_AMOUNT_PER_TRANSACTION,
  }));
  
  // Add target field to growth_trends
  const maxGrowth = Math.max(...(data.growth_trends || []).map((g) => g.growth), 0);
  const targetAmount = maxGrowth * TARGET_PERCENTAGE;
  const processedGrowthTrends = (data.growth_trends || []).map((trend) => ({
    ...trend,
    target: targetAmount,
  }));
  
  // Add colors to category_breakdown
  const processedCategoryBreakdown = (data.category_breakdown || []).map((cat, idx) => ({
    ...cat,
    color: COLORS[idx % COLORS.length],
  }));
  
  // Calculate summary stats
  const totalContributions = (data.contributions_over_time || []).reduce(
    (sum, item) => sum + (item.amount || 0), 
    0
  );
  const activeMembers = (data.member_activity || []).length;
  
  // Get top performer
  const sortedMembers = [...(data.member_activity || [])].sort((a, b) => b.transactions - a.transactions);
  const topPerformer = sortedMembers[0]?.member_name || 'No data';
  
  // Calculate average growth
  const growthValues = (data.growth_trends || []).map((g) => g.growth);
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

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient, 
  description,
  isLoading = false 
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: any;
  gradient: string;
  description: string;
  isLoading?: boolean;
}) {
  const isPositive = change === undefined ? true : change >= 0;
  
  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-12 w-12 rounded-2xl bg-gray-200`} />
          <div className="h-8 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    );
  }
  
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
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('12months');

  const [analyticsData, setAnalyticsData] = useState<ProcessedAnalyticsData>({
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

  // Load user's groups with better error handling
  useEffect(() => {
    const loadGroups = async () => {
      try {
        console.log('📊 Loading user groups...');
        const groupsResponse = await groupsService.getMyGroups();
        console.log('✅ Groups loaded:', groupsResponse);
        setGroups(groupsResponse);
        
        if (groupsResponse.length > 0) {
          const firstGroup = groupsResponse[0];
          setSelectedGroupId(firstGroup.id.toString());
          console.log(`🎯 Selected first group: ${firstGroup.name} (ID: ${firstGroup.id})`);
        } else {
          console.log('👤 No groups found for user');
          setError('You are not a member of any chama groups yet.');
        }
      } catch (err: any) {
        console.error('❌ Failed to load groups:', err);
        
        // Detailed error logging
        if (err.response) {
          console.error('📡 Response error:', {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          });
        } else if (err.request) {
          console.error('🌐 No response received. Backend may be unreachable.');
        } else {
          console.error('⚡ Request setup error:', err.message);
        }
        
        setError('Failed to load your chama groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Load analytics when group changes with improved error handling
  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchAnalytics = async () => {
      setFetching(true);
      setError(null);
      setApiStatus('loading');

      try {
        console.log(`📈 Fetching analytics for group ${selectedGroupId}...`);
        const response = await analyticsService.getDashboardAnalytics(parseInt(selectedGroupId));
        console.log('✅ Analytics data received:', {
          contributions: response.contributions_over_time?.length || 0,
          members: response.member_activity?.length || 0,
          categories: response.category_breakdown?.length || 0,
          trends: response.growth_trends?.length || 0
        });

        const processedData = processAnalyticsData(response);
        setAnalyticsData(processedData);
        setApiStatus('success');
        
        console.log('📊 Processed analytics data:', {
          totalContributions: processedData.summary_stats.total_contributions,
          activeMembers: processedData.summary_stats.active_members,
          topPerformer: processedData.summary_stats.top_performer
        });
      } catch (err: any) {
        console.error('❌ Error fetching analytics:', err);
        setApiStatus('error');
        
        // Detailed error logging
        if (err.response) {
          console.error('📡 Response error:', {
            status: err.response.status,
            data: err.response.data,
            url: err.config?.url
          });
          
          if (err.response.status === 401) {
            setError('Authentication required. Please login again.');
          } else if (err.response.status === 403) {
            setError('You do not have permission to view analytics for this group.');
          } else if (err.response.status === 404) {
            setError('Analytics data not found for this group.');
          } else if (err.response.status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(`Failed to load analytics: ${err.response.data?.detail || 'Unknown error'}`);
          }
        } else if (err.request) {
          console.error('🌐 No response received. Backend may be unreachable.');
          setError('Cannot connect to the server. Please check your internet connection.');
        } else {
          console.error('⚡ Request setup error:', err.message);
          setError('Failed to load analytics data. Please try again.');
        }
      } finally {
        setFetching(false);
      }
    };

    fetchAnalytics();
  }, [selectedGroupId, timeRange]);

  const handleExportData = () => {
    try {
      console.log('📤 Exporting analytics data...');
      // Create CSV content from analytics data
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Contributions', `KES ${analyticsData.summary_stats.total_contributions.toLocaleString()}`],
        ['Active Members', analyticsData.summary_stats.active_members],
        ['Average Growth', `${analyticsData.summary_stats.average_growth}%`],
        ['Top Performer', analyticsData.summary_stats.top_performer],
        ['', ''],
        ['Date', 'Amount'],
        ...analyticsData.contributions_over_time.map(item => [
          new Date(item.date).toLocaleDateString(),
          `KES ${item.amount.toLocaleString()}`
        ])
      ].map(row => row.join(',')).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Analytics data exported successfully');
    } catch (err) {
      console.error('❌ Failed to export analytics:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleRefresh = async () => {
    if (selectedGroupId) {
      setFetching(true);
      setError(null);
      setApiStatus('loading');
      
      try {
        console.log('🔄 Refreshing analytics data...');
        const response = await analyticsService.getDashboardAnalytics(parseInt(selectedGroupId));
        const processedData = processAnalyticsData(response);
        setAnalyticsData(processedData);
        setApiStatus('success');
        console.log('✅ Analytics data refreshed');
      } catch (err: any) {
        console.error('❌ Error refreshing analytics:', err);
        setApiStatus('error');
        setError('Failed to refresh analytics data. Please try again.');
      } finally {
        setFetching(false);
      }
    }
  };

  // API Status Badge Component
  const ApiStatusBadge = () => {
    if (apiStatus === 'loading') return null;
    
    const statusConfig = {
      success: { label: 'Live Data', color: 'bg-green-100 text-green-700', icon: '✅' },
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
                  className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 flex items-center"
                >
                  Analytics Dashboard
                  <ApiStatusBadge />
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
                {/* Filter icon removed */}
              </div>

              {/* Group Selector */}
              <div className="relative">
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    console.log(`🔄 Switching to group ${e.target.value}`);
                    setSelectedGroupId(e.target.value);
                  }}
                  disabled={fetching || groups.length === 0}
                  className="appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white/80 backdrop-blur-sm text-gray-700 font-medium w-full sm:w-64 disabled:opacity-50"
                >
                  {groups.length === 0 ? (
                    <option value="">No chamas found</option>
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
                  disabled={fetching || !selectedGroupId}
                  className="p-3 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all disabled:opacity-50"
                  aria-label="Refresh analytics"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 ${fetching ? 'animate-spin' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportData}
                  disabled={analyticsData.contributions_over_time.length === 0}
                  className="p-3 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  aria-label="Export data"
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
              <button
                onClick={() => setError(null)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                aria-label="Dismiss error"
              >
                {/* XCircle removed */}
                ×
              </button>
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
            isLoading={fetching}
          />
          <StatCard
            title="Active Members"
            value={analyticsData.summary_stats.active_members}
            change={12.3}
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            description="Members with recent activity"
            isLoading={fetching}
          />
          <StatCard
            title="Average Growth"
            value={`${analyticsData.summary_stats.average_growth}%`}
            change={3.2}
            icon={TrendingUp}
            gradient="from-purple-500 to-pink-500"
            description="Monthly growth rate"
            isLoading={fetching}
          />
          <StatCard
            title="Top Performer"
            value={analyticsData.summary_stats.top_performer}
            icon={Award}
            gradient="from-orange-500 to-amber-500"
            description="Highest contributing member"
            isLoading={fetching}
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
                  <CardDescription className="text-gray-600 font-medium">
                    {fetching ? 'Loading...' : `Showing ${analyticsData.contributions_over_time.length} data points`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus === 'success' && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      Live Data
                    </span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    aria-label="View details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </motion.button>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsData.contributions_over_time.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No contribution data available</p>
                    <p className="text-sm mt-1">Start recording contributions to see trends</p>
                  </div>
                ) : (
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
                )}
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
                  <CardDescription className="text-gray-600 font-medium">
                    {fetching ? 'Loading...' : `${analyticsData.member_activity.length} active members`}
                  </CardDescription>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                {analyticsData.member_activity.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <Users className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No member activity data</p>
                    <p className="text-sm mt-1">Members will appear here when they contribute</p>
                  </div>
                ) : (
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
                )}
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
                  <CardDescription className="text-gray-600 font-medium">
                    {fetching ? 'Loading...' : 'How group funds are allocated'}
                  </CardDescription>
                </div>
                <PieChart className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                {analyticsData.category_breakdown.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <PieChart className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No category data available</p>
                    <p className="text-sm mt-1">Categories will appear when expenses are recorded</p>
                  </div>
                ) : (
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
                )}
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
                  <CardDescription className="text-gray-600 font-medium">
                    {fetching ? 'Loading...' : 'Monthly performance against targets'}
                  </CardDescription>
                </div>
                <Target className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                {analyticsData.growth_trends.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                    <Target className="h-12 w-12 mb-4 opacity-50" />
                    <p className="font-medium">No growth data available</p>
                    <p className="text-sm mt-1">Growth trends will appear over time</p>
                  </div>
                ) : (
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
                )}
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-gray-200 animate-pulse" />
            <div>
              <div className="h-10 w-64 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="h-12 w-48 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-64 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="flex gap-2">
              <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-12 w-12 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-gray-200 animate-pulse" />
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
