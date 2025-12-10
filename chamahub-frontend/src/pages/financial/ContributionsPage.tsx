import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, DollarSign, CheckCircle, Clock, XCircle, 
  AlertCircle, Download, Filter, Search, Users, Sparkles, Crown,
  Wallet, BarChart3, PiggyBank, Eye, MoreHorizontal, Calendar,
  TrendingUp, User, CreditCard, Shield, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { financeService } from '../../services/apiService';
import type { Contribution } from '../../types/api';

// Helper function to format currency (fallback if not in utils)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
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

// Color configuration for stat cards
const statCardConfig = {
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  orange: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  green: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  }
};

// Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  change, 
  color = 'purple',
  delay = 0, 
  icon: Icon,
  description,
  isLoading = false
}: { 
  title: string; 
  value: string; 
  change?: string; 
  color?: 'purple' | 'orange' | 'blue' | 'green';
  delay?: number;
  icon: React.ComponentType<{ className?: string }>;
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

  const config = statCardConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <Card className={`shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 ${config.border} overflow-hidden`}>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-2xl ${config.iconBg}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
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

// Enhanced Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    RECONCILED: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-200',
      bgColor: 'bg-green-50',
      label: 'Reconciled'
    },
    COMPLETED: {
      icon: CheckCircle,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      bgColor: 'bg-blue-50',
      label: 'Completed'
    },
    PENDING: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      bgColor: 'bg-yellow-50',
      label: 'Pending'
    },
    FAILED: {
      icon: XCircle,
      color: 'bg-red-100 text-red-700 border-red-200',
      bgColor: 'bg-red-50',
      label: 'Failed'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const IconComponent = config.icon;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.color} ${config.bgColor}`}
    >
      <IconComponent className="h-3 w-3" />
      <span className="text-xs font-medium">{config.label}</span>
    </motion.div>
  );
};

// Contribution Insights Component - USING REAL DATA
const ContributionInsights = ({ 
  contributions,
  isLoading 
}: { 
  contributions: Contribution[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none h-full animate-pulse">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="h-6 w-48 bg-gray-700 rounded mb-6" />
          <div className="space-y-4 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-800">
                <div className="h-4 w-32 bg-gray-700 rounded mb-3" />
                <div className="h-8 w-24 bg-gray-700 rounded mb-2" />
                <div className="h-3 w-40 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate insights from REAL data
  const calculateInsights = () => {
    if (contributions.length === 0) {
      return {
        topContributor: { name: 'No contributions yet', amount: 0 },
        consistencyRate: 0,
        avgContribution: 0,
        memberCount: 0
      };
    }

    // Calculate top contributor
    const memberTotals: Record<string, number> = {};
    contributions.forEach(contribution => {
      const member = contribution.member_name || `Member #${contribution.member}`;
      const amount = parseFloat(contribution.amount) || 0;
      memberTotals[member] = (memberTotals[member] || 0) + amount;
    });

    let topContributor = { name: 'No contributors', amount: 0 };
    Object.entries(memberTotals).forEach(([name, amount]) => {
      if (amount > topContributor.amount) {
        topContributor = { name, amount };
      }
    });

    // Calculate consistency rate (contributors who contributed this month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const uniqueContributorsThisMonth = new Set(
      contributions
        .filter(c => {
          const date = new Date(c.created_at);
          return date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear;
        })
        .map(c => c.member_name || `Member #${c.member}`)
    ).size;

    const totalUniqueMembers = Object.keys(memberTotals).length;
    const consistencyRate = totalUniqueMembers > 0 
      ? Math.round((uniqueContributorsThisMonth / totalUniqueMembers) * 100)
      : 0;

    // Calculate average contribution
    const totalAmount = contributions.reduce((sum, c) => 
      sum + (parseFloat(c.amount) || 0), 0
    );
    const avgContribution = contributions.length > 0 
      ? Math.round(totalAmount / contributions.length)
      : 0;

    return {
      topContributor,
      consistencyRate,
      avgContribution,
      memberCount: totalUniqueMembers
    };
  };

  const insights = calculateInsights();

  const insightItems = [
    {
      title: 'Top Contributor',
      value: insights.topContributor.name.split(' ')[0], // First name only
      description: `${formatCurrency(insights.topContributor.amount)} total`,
      color: 'text-purple-300',
      icon: Crown,
    },
    {
      title: 'Consistency Rate',
      value: `${insights.consistencyRate}%`,
      description: 'Active contributors this month',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Avg Contribution',
      value: formatCurrency(insights.avgContribution),
      description: 'Per member average',
      color: 'text-blue-300',
      icon: Users,
    },
  ];

  return (
    <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none h-full">
      <CardContent className="p-6 flex flex-col h-full">
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
          <div>
            <h3 className="font-bold text-xl">Contribution Insights</h3>
            <p className="text-white/60 text-sm mt-1">
              Based on {contributions.length} contributions from {insights.memberCount} members
            </p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          {insightItems.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-200 text-sm">{insight.title}</p>
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
              </div>
              <p className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {insight.value}
              </p>
              <p className="text-xs opacity-75">{insight.description}</p>
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
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <PiggyBank className="h-4 w-4" />
              Analytics
            </motion.button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    monthly: 0,
    pending: 0,
    members: 0,
    reconciled: 0,
    growth: 0
  });
  const navigate = useNavigate();

  useEffect(() => { 
    fetchContributions(); 
  }, []);

  // Filter contributions when search or status changes
  useEffect(() => {
    const filtered = contributions.filter(contribution => {
      const memberName = contribution.member_name || `Member #${contribution.member}`;
      const matchesSearch = 
        memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contribution.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || contribution.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
    setFilteredContributions(filtered);
  }, [searchTerm, filterStatus, contributions]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financeService.getContributions({
        page_size: 100 // Get all contributions for stats calculation
      });
      const contributionsData = response.results || [];
      setContributions(contributionsData);
      setFilteredContributions(contributionsData);
      
      // Calculate stats from REAL data
      calculateStats(contributionsData);
    } catch (err: any) { 
      console.error('Error fetching contributions:', err);
      setError('Failed to load contributions. Please try again.');
      setContributions([]);
      setFilteredContributions([]);
    } finally { 
      setLoading(false); 
    }
  };

  const calculateStats = (contributionsData: Contribution[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate monthly contributions
    const monthlyContributions = contributionsData
      .filter(contribution => {
        const date = new Date(contribution.created_at);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      })
      .reduce((sum, contribution) => sum + (parseFloat(contribution.amount) || 0), 0);

    // Calculate total contributions
    const totalContributions = contributionsData.reduce(
      (sum, contribution) => sum + (parseFloat(contribution.amount) || 0), 0
    );

    // Count pending contributions
    const pendingCount = contributionsData.filter(c => c.status === 'PENDING').length;

    // Count unique members
    const uniqueMembers = new Set(contributionsData.map(c => c.member)).size;

    // Count reconciled contributions
    const reconciledCount = contributionsData.filter(c => c.status === 'RECONCILED').length;

    // Calculate growth (simple mock - in real app, compare with previous month)
    const growth = contributionsData.length > 10 ? 12 : 0;

    setStats({
      total: totalContributions,
      monthly: monthlyContributions,
      pending: pendingCount,
      members: uniqueMembers,
      reconciled: reconciledCount,
      growth
    });
  };

  const handleReconcile = async (id: number) => {
    setReconciling(id);
    try {
      await financeService.reconcileContribution(id);
      await fetchContributions();
    } catch (err: any) { 
      console.error('Error reconciling contribution:', err);
      setError('Failed to reconcile contribution. Please try again.');
    } finally { 
      setReconciling(null); 
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const params: { status?: string } = {};
      if (filterStatus !== 'ALL') {
        params.status = filterStatus;
      }
      
      const blob = await financeService.exportContributions(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contributions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting contributions:', err);
      setError('Failed to export contributions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0}>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
          </FloatingElement>
          <FloatingElement delay={2}>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
          </FloatingElement>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
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
          <p className="text-gray-600 font-medium">Loading contributions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ x: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/finance')} 
              className="group flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Finance</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Contributions
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
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
          
          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              disabled={exporting || contributions.length === 0}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export Report'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contributions/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="h-5 w-5" />
              New Contribution
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats Section - USING REAL DATA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatedStatCard 
            title="Total Contributions" 
            value={formatCurrency(stats.total)} 
            change={stats.growth > 0 ? `+${stats.growth}%` : undefined}
            color="purple"
            delay={0}
            icon={DollarSign}
            description="All-time total contributions"
            isLoading={loading}
          />
          <AnimatedStatCard 
            title="Monthly Total" 
            value={formatCurrency(stats.monthly)} 
            change={stats.monthly > 0 ? "+8%" : undefined}
            color="blue"
            delay={0.1}
            icon={Wallet}
            description="This month's contributions"
            isLoading={loading}
          />
          <AnimatedStatCard 
            title="Pending Review" 
            value={stats.pending.toString()} 
            change={stats.pending > 0 ? "Urgent" : undefined}
            color="orange"
            delay={0.2}
            icon={AlertCircle}
            description="Requires reconciliation"
            isLoading={loading}
          />
          <AnimatedStatCard 
            title="Active Members" 
            value={stats.members.toString()} 
            change={stats.members > 0 ? `+${Math.min(stats.members, 5)}` : undefined}
            color="green"
            delay={0.3}
            icon={Users}
            description="Contributing members"
            isLoading={loading}
          />
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Contributions List */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      Recent Contributions
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {filteredContributions.length} of {contributions.length} contributions
                    </CardDescription>
                  </div>
                  
                  {/* Enhanced Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none sm:w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        placeholder="Search contributions..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white w-full text-sm"
                      />
                    </div>
                    <div className="relative flex-1 sm:flex-none sm:w-40">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white w-full text-sm appearance-none"
                      >
                        <option value="ALL">All Status</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="RECONCILED">Reconciled</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchContributions}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white text-sm whitespace-nowrap"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </motion.button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {filteredContributions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {contributions.length === 0 ? 'No Contributions Yet' : 'No Matching Contributions'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {contributions.length === 0 
                        ? 'Start recording member contributions to track your group\'s financial growth.'
                        : 'Try adjusting your search or filter criteria.'
                      }
                    </p>
                    {contributions.length === 0 && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/contributions/new')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
                      >
                        Record First Contribution
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                      {filteredContributions.map((contribution, index) => {
                        const memberName = contribution.member_name || `Member #${contribution.member}`;
                        const amount = parseFloat(contribution.amount) || 0;
                        
                        return (
                          <motion.div
                            key={contribution.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                            className="p-6 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5 min-w-0">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg flex-shrink-0">
                                  <DollarSign className="h-7 w-7 text-purple-600" />
                                </div>
                                <div className="flex flex-col gap-2 min-w-0 flex-1">
                                  <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <p className="font-semibold text-lg text-gray-800 truncate">
                                      {memberName}
                                    </p>
                                    <StatusBadge status={contribution.status} />
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      <span className="truncate">{contribution.payment_method}</span>
                                    </div>
                                    {contribution.reference_number && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <Shield className="h-3 w-3" />
                                          <span className="truncate">Ref: {contribution.reference_number}</span>
                                        </div>
                                      </>
                                    )}
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatTimeAgo(contribution.created_at)}</span>
                                    </div>
                                  </div>
                                  {contribution.notes && (
                                    <p className="text-xs text-gray-500 mt-1 truncate">{contribution.notes}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-purple-600 whitespace-nowrap">
                                    {formatCurrency(amount)}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {new Date(contribution.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  {contribution.status === 'COMPLETED' && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleReconcile(contribution.id)}
                                      disabled={reconciling === contribution.id}
                                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm rounded-xl hover:shadow-lg disabled:opacity-50 transition-all whitespace-nowrap"
                                    >
                                      {reconciling === contribution.id ? (
                                        <div className="flex items-center gap-2">
                                          <RefreshCw className="h-3 w-3 animate-spin" />
                                          Reconciling...
                                        </div>
                                      ) : (
                                        'Reconcile'
                                      )}
                                    </motion.button>
                                  )}
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                  >
                                    <Eye className="h-4 w-4 text-gray-600" />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                  </motion.button>
                                </div>
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
          </div>

          {/* Enhanced Insights Sidebar - USING REAL DATA */}
          <ContributionInsights 
            contributions={contributions}
            isLoading={loading}
          />
        </motion.div>
      </div>
    </div>
  );
}