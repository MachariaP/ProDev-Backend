import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Wallet,
  BarChart3,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api';

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

interface Investment {
  id: number;
  investment_type: string;
  name: string;
  principal_amount: number;
  current_value: number;
  roi: number;
  profit_loss: number;
  maturity_date: string;
  status: string;
}

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Investment Insights Component
const InvestmentInsights = () => {
  const insights = [
    {
      title: 'Best Performer',
      value: '+24.5%',
      description: 'Treasury Bills',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Diversification',
      value: '68%',
      description: 'Portfolio spread',
      color: 'text-blue-300',
      icon: PieChart,
    },
    {
      title: 'Risk Level',
      value: 'Low',
      description: 'Conservative portfolio',
      color: 'text-purple-300',
      icon: Shield,
    },
  ];

  return (
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
          <div>
            <h3 className="font-bold text-xl">Investment Insights</h3>
            <p className="text-white/60 text-sm">Portfolio analytics & metrics</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
          transition={{ delay: 0.4 }}
          className="mt-6 pt-6 border-t border-white/20"
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <PiggyBank className="h-4 w-4" />
              Strategy
            </motion.button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export function InvestmentPortfolioPage() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    total_invested: 0,
    current_value: 0,
    total_returns: 0,
    average_roi: 0,
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await api.get('/investments/investments/');
      const rawData = response.data.results || response.data || [];
      
      // Parse string values to numbers from API response
      interface RawInvestment {
        id: number;
        investment_type: string;
        name: string;
        principal_amount: string;
        current_value: string;
        roi: string;
        profit_loss: string;
        maturity_date: string;
        status: string;
      }
      
      const data: Investment[] = rawData.map((inv: RawInvestment) => ({
        ...inv,
        principal_amount: parseFloat(inv.principal_amount) || 0,
        current_value: parseFloat(inv.current_value) || 0,
        roi: parseFloat(inv.roi) || 0,
        profit_loss: parseFloat(inv.profit_loss) || 0,
      }));
      
      setInvestments(data);

      // Calculate stats
      const totalInvested = data.reduce((sum: number, inv: Investment) => sum + inv.principal_amount, 0);
      const currentValue = data.reduce((sum: number, inv: Investment) => sum + inv.current_value, 0);
      const totalReturns = data.reduce((sum: number, inv: Investment) => sum + inv.profit_loss, 0);
      const avgROI = data.length > 0
        ? data.reduce((sum: number, inv: Investment) => sum + inv.roi, 0) / data.length
        : 0;

      setStats({
        total_invested: totalInvested,
        current_value: currentValue,
        total_returns: totalReturns,
        average_roi: avgROI,
      });
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const portfolioDistribution = investments.reduce((acc: Record<string, number>, inv) => {
    acc[inv.investment_type] = (acc[inv.investment_type] || 0) + inv.current_value;
    return acc;
  }, {});

  const pieData = Object.entries(portfolioDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const performanceData = investments.slice(0, 6).map((inv) => ({
    name: inv.name.substring(0, 10),
    value: inv.current_value,
    returns: inv.profit_loss,
  }));

  const investmentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'treasury_bills', label: 'Treasury Bills' },
    { value: 'stocks', label: 'Stocks' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'mutual_funds', label: 'Mutual Funds' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'matured', label: 'Matured' },
    { value: 'closed', label: 'Closed' },
  ];

  const filteredInvestments = investments.filter((investment) =>
    investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investment.investment_type.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((investment) =>
    selectedType === 'all' || investment.investment_type === selectedType
  ).filter((investment) =>
    selectedStatus === 'all' || investment.status === selectedStatus
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0}>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full blur-3xl opacity-20" />
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
            <Sparkles className="h-12 w-12 text-emerald-600" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading investment portfolio...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-teal-200 to-sky-200 rounded-full blur-3xl opacity-20" />
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
              onClick={() => navigate('/investments')} 
              className="group flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Investments</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
              >
                Investment Portfolio
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <TrendingUp className="h-5 w-5" />
                Track your treasury bills and investment returns
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
              onClick={fetchInvestments}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/investments/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            >
              <Plus className="h-5 w-5" />
              New Investment
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatedStatCard 
            title="Total Invested" 
            value={`KES ${stats.total_invested.toLocaleString()}`} 
            change="+8.2%"
            color="blue"
            delay={0}
            icon={DollarSign}
            description="Total amount invested across portfolio"
          />
          <AnimatedStatCard 
            title="Current Value" 
            value={`KES ${stats.current_value.toLocaleString()}`} 
            change="+12.5%"
            color="green"
            delay={0.1}
            icon={TrendingUp}
            description="Current market value of investments"
          />
          <AnimatedStatCard 
            title="Total Returns" 
            value={`KES ${stats.total_returns.toLocaleString()}`} 
            change={stats.total_returns >= 0 ? "+15.3%" : "-5.2%"}
            color={stats.total_returns >= 0 ? "purple" : "orange"}
            delay={0.2}
            icon={Wallet}
            description="Net profit/loss from investments"
          />
          <AnimatedStatCard 
            title="Average ROI" 
            value={`${stats.average_roi.toFixed(2)}%`} 
            change="+2.1%"
            color="orange"
            delay={0.3}
            icon={PieChart}
            description="Average return on investment"
          />
        </motion.div>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Portfolio Distribution & Performance */}
          <div className="space-y-8">
            {/* Portfolio Distribution */}
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Portfolio Distribution
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Investment allocation by type
                    </CardDescription>
                  </div>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `KES ${value.toLocaleString()}`}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            KES {item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-16 w-16 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500">No investments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Insights */}
            <InvestmentInsights />
          </div>

          {/* Investments List */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-4">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                        Your Investments
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm mt-1">
                        {filteredInvestments.length} active investment(s)
                      </CardDescription>
                    </div>
                    
                    {/* Enhanced Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
                      <div className="relative flex-1 sm:flex-none sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          placeholder="Search investments..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white w-full text-sm"
                        />
                      </div>
                      <div className="relative flex-1 sm:flex-none sm:w-40">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select 
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white w-full text-sm appearance-none"
                        >
                          {investmentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="relative flex-1 sm:flex-none sm:w-40">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select 
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white w-full text-sm appearance-none"
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {filteredInvestments.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">No investments found</h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start investing to grow your wealth'}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/investments/new')}
                          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                        >
                          Create Investment
                        </motion.button>
                      </motion.div>
                    ) : (
                      filteredInvestments.map((investment, index) => {
                        const isPositive = investment.profit_loss >= 0;
                        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
                        const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
                        const bgClass = isPositive 
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                          : 'bg-gradient-to-br from-red-100 to-orange-100';
                        
                        return (
                          <motion.div
                            key={investment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                            className="p-6 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5 min-w-0">
                                <motion.div 
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className={`p-4 rounded-2xl ${bgClass} shadow-lg flex-shrink-0`}
                                >
                                  <Icon className={`h-7 w-7 ${colorClass}`} />
                                </motion.div>
                                <div className="flex flex-col gap-2 min-w-0 flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      investment.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : investment.status === 'matured'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {investment.status}
                                    </span>
                                    <p className="font-semibold text-lg text-gray-800 truncate">
                                      {investment.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <PieChart className="h-3 w-3" />
                                      <span className="capitalize">{investment.investment_type.replace('_', ' ')}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      <span>Invested: KES {investment.principal_amount.toLocaleString()}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Matures: {new Date(investment.maturity_date).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-gray-900">
                                    KES {investment.current_value.toLocaleString()}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className={`text-sm font-medium ${colorClass}`}>
                                      {isPositive ? '+' : ''}KES {investment.profit_loss.toLocaleString()}
                                    </p>
                                    <span className="text-sm text-gray-500">•</span>
                                    <p className={`text-sm font-medium ${colorClass}`}>
                                      {isPositive ? '+' : ''}{investment.roi.toFixed(2)}%
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <motion.div 
                                  initial={{ opacity: 0, x: 10 }}
                                  whileHover={{ opacity: 1, x: 0 }}
                                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => navigate(`/investments/${investment.id}`)}
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
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            {investments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Card className="shadow-2xl border-0 bg-white">
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Investment growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => `KES ${value.toLocaleString()}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="returns"
                          stackId="2"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}