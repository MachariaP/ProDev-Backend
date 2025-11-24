import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, DollarSign, CheckCircle, AlertCircle, XCircle, 
  Download, Search, TrendingUp, Users, Calendar, Eye, MoreHorizontal,
  Sparkles, RefreshCw, Clock, User, CreditCard, Shield, Crown,
  Target, Wallet, BarChart3, PiggyBank, Filter
} from 'lucide-react';

// Import the real finance service from apiService
import { financeService } from '../../services/apiService';
import type { Contribution } from '../../types/api';

// UI representation of contribution with display-friendly fields
interface ContributionDisplay {
  id: number;
  member: string; // member name for display
  amount: number; // parsed amount
  status: string;
  payment_method: string;
  reference_number: string | null;
  date: string;
  timestamp: string; // formatted time ago
}

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

// Transform API contribution to UI display format
const transformContribution = (contribution: Contribution): ContributionDisplay => {
  // Parse amount with fallback to 0 if invalid
  const parsedAmount = parseFloat(contribution.amount);
  const amount = isNaN(parsedAmount) ? 0 : parsedAmount;
  
  return {
    id: contribution.id,
    member: contribution.member_name || 'Unknown Member',
    amount,
    status: contribution.status,
    payment_method: contribution.payment_method,
    reference_number: contribution.reference_number || null,
    date: contribution.created_at,
    timestamp: formatTimeAgo(contribution.created_at),
  };
};

// Simple card components as fallback
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
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
  <div className={`p-6 ${className}`}>{children}</div>
);

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

// Enhanced Progress Bar Component
const ContributionsProgress = ({ percentage }: { percentage: number }) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  const getColorClass = (percent: number) => {
    if (percent > 85) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (percent > 65) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-600';
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
          <p className="text-sm font-medium opacity-90">Monthly Target Progress</p>
          <p className="text-2xl font-bold mt-1">{normalizedPercentage}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Remaining</p>
          <p className="text-lg font-semibold mt-1">KES 45,000</p>
        </div>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${normalizedPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className={`h-3 rounded-full ${colorClass} shadow-lg`}
        />
      </div>
      <div className="flex justify-between text-xs opacity-75">
        <span>Behind</span>
        <span>On Track</span>
        <span>Ahead</span>
      </div>
    </motion.div>
  );
};

// Color configuration for stat cards
const statCardConfig = {
  green: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  orange: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  }
};

// Enhanced Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  change, 
  color = 'green',
  delay = 0, 
  icon: Icon,
  description 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  color?: 'green' | 'blue' | 'orange' | 'purple';
  delay?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) => {
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
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      bgColor: 'bg-emerald-50',
      label: 'Completed'
    },
    PENDING: {
      icon: AlertCircle,
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

// Financial Insights Component
const FinancialInsights = () => {
  const insights = [
    {
      title: 'Top Contributor',
      value: 'Jane Doe',
      description: 'KES 85,000 this month',
      color: 'text-green-300',
      icon: Crown,
    },
    {
      title: 'Consistency Rate',
      value: '94%',
      description: 'On-time payments',
      color: 'text-blue-300',
      icon: TrendingUp,
    },
    {
      title: 'Avg Contribution',
      value: 'KES 17K',
      description: 'Per member monthly',
      color: 'text-purple-300',
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
            <p className="text-white/60 text-sm mt-1">Key metrics and analytics</p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          {insights.map((insight, index) => (
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
  const [contributions, setContributions] = useState<ContributionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { 
    fetchContributions(); 
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await financeService.getContributions();
      // Transform API contributions to display format
      const displayContributions = (response.results || []).map(transformContribution);
      setContributions(displayContributions);
    } catch (err) { 
      console.error('Error fetching contributions:', err);
      setError('Failed to load contributions. Please try again.');
      setContributions([]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleReconcile = async (id: number) => {
    setReconciling(id);
    try {
      await financeService.reconcileContribution(id);
      await fetchContributions();
    } catch (err) { 
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
      // Build query parameters based on current filters
      const params: { status?: string } = {};
      if (filterStatus !== 'ALL') {
        params.status = filterStatus;
      }
      
      // Use the financeService to export contributions
      const blob = await financeService.exportContributions(params);
      
      // Create download link
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

  // Filter contributions based on search and status
  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = contribution.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || contribution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Realistic mock stats
  const stats = { 
    total: 2_850_000, 
    monthly: 485_000, 
    pending: 3, 
    members: 28,
    growth: '+18%'
  };

  const targetProgress = 82; // Mock progress percentage

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0}>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
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
            <Sparkles className="h-12 w-12 text-green-600" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading contributions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Header */}
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
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
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
          
          {/* Enhanced Action Buttons */}
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
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`h-4 w-4 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export Report'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contributions/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
            >
              <Plus className="h-5 w-5" />
              New Contribution
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </motion.div>
        )}

        {/* Enhanced Total Contributions Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white transform hover:scale-[1.005] transition-transform duration-500 overflow-hidden border-none relative">
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
                      Total Contributions
                    </p>
                  </div>
                  <p className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    KES {stats.total.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-75 mt-4 flex items-center gap-3">
                    <Target className="h-4 w-4" />
                    <span>Monthly target: KES 530,000 • </span>
                    <span className="text-green-300 font-semibold">{targetProgress}% achieved</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
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
              <ContributionsProgress percentage={targetProgress} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatedStatCard 
            title="Monthly Contributions" 
            value={`KES ${stats.monthly.toLocaleString()}`} 
            change={stats.growth}
            color="green"
            delay={0}
            icon={DollarSign}
            description="Current month's contributions"
          />
          <AnimatedStatCard 
            title="Pending Review" 
            value={stats.pending.toString()} 
            change="Urgent"
            color="orange"
            delay={0.1}
            icon={AlertCircle}
            description="Requires attention"
          />
          <AnimatedStatCard 
            title="Active Members" 
            value={stats.members.toString()} 
            change="+2"
            color="purple"
            delay={0.2}
            icon={Users}
            description="Contributing members"
          />
          <AnimatedStatCard 
            title="Success Rate" 
            value="96%" 
            change="+2%"
            color="blue"
            delay={0.3}
            icon={TrendingUp}
            description="On-time payments"
          />
        </motion.div>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Contributions List - Fixed Header Area */}
          <div className="lg:col-span-2">
            {filteredContributions.length === 0 ? (
              <Card className="shadow-2xl text-center py-20 border-0 bg-white">
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 w-fit mx-auto mb-6"
                  >
                    <DollarSign className="h-16 w-16 text-green-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Contributions Found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm || filterStatus !== 'ALL' 
                      ? 'No contributions match your current filters. Try adjusting your search criteria.'
                      : 'Start recording member contributions to track your group\'s financial growth.'
                    }
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contributions/new')}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30"
                  >
                    Record First Contribution
                  </motion.button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-2xl overflow-hidden border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex flex-col space-y-4">
                    {/* Header Section - Fixed Height */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                          Recent Contributions
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm mt-1">
                          All member payments and their current status
                        </CardDescription>
                      </div>
                      
                      {/* Enhanced Filters - Better Layout */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
                        <div className="relative flex-1 sm:flex-none sm:w-48">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input 
                            placeholder="Search contributions..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white w-full text-sm"
                          />
                        </div>
                        <div className="relative flex-1 sm:flex-none sm:w-40">
                          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white w-full text-sm appearance-none"
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
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                      {filteredContributions.map((contribution, index) => (
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
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg flex-shrink-0"
                              >
                                <DollarSign className="h-7 w-7 text-green-600" />
                              </motion.div>
                              <div className="flex flex-col gap-2 min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <p className="font-semibold text-lg text-gray-800 truncate">{contribution.member}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    <span className="truncate">{contribution.payment_method}</span>
                                  </div>
                                  {contribution.reference_number && (
                                    <div className="flex items-center gap-1">
                                      <Shield className="h-3 w-3" />
                                      <span className="truncate">Ref: {contribution.reference_number}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{contribution.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 flex-shrink-0">
                              <div className="text-right">
                                <p className="font-bold text-2xl text-green-600 whitespace-nowrap">
                                  KES {Number(contribution.amount).toLocaleString()}
                                </p>
                                <div className="flex items-center gap-2 mt-2 justify-end">
                                  <StatusBadge status={contribution.status} />
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                whileHover={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                              >
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
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Financial Insights Sidebar - Fixed Height */}
          <FinancialInsights />
        </motion.div>
      </div>
    </div>
  );
}