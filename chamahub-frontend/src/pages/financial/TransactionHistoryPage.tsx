import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Filter,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  RefreshCw,
  Sparkles,
  Users,
  Eye,
  MoreHorizontal,
  Clock,
  User,
  CreditCard,
  Shield,
  BarChart3,
  PiggyBank
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  group_name: string;
  user_name: string;
  status: string;
}

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
    completed: {
      icon: FileText,
      color: 'bg-green-100 text-green-700 border-green-200',
      bgColor: 'bg-green-50',
      label: 'Completed'
    },
    pending: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      bgColor: 'bg-yellow-50',
      label: 'Pending'
    },
    failed: {
      icon: TrendingDown,
      color: 'bg-red-100 text-red-700 border-red-200',
      bgColor: 'bg-red-50',
      label: 'Failed'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
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

// Transaction Insights Component
const TransactionInsights = () => {
  const insights = [
    {
      title: 'Most Active Day',
      value: 'Monday',
      description: 'Highest transaction volume',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Avg. Transaction',
      value: 'KES 12.5K',
      description: 'Per transaction average',
      color: 'text-blue-300',
      icon: DollarSign,
    },
    {
      title: 'Success Rate',
      value: '98.2%',
      description: 'Completed transactions',
      color: 'text-purple-300',
      icon: Shield,
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
            <h3 className="font-bold text-xl">Transaction Insights</h3>
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

const transactionTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'contribution', label: 'Contribution' },
  { value: 'loan', label: 'Loan' },
  { value: 'expense', label: 'Expense' },
  { value: 'investment', label: 'Investment' },
  { value: 'withdrawal', label: 'Withdrawal' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    totalTransactions: 0,
    netBalance: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [selectedType, selectedStatus, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await api.get(`/finance/transactions/?${params.toString()}`);
      const data = response.data.results || response.data;
      setTransactions(data);

      // Calculate stats
      const inflow = data
        .filter((t: Transaction) => ['contribution', 'investment'].includes(t.type))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const outflow = data
        .filter((t: Transaction) => ['loan', 'expense', 'withdrawal'].includes(t.type))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      setStats({
        totalInflow: inflow,
        totalOutflow: outflow,
        totalTransactions: data.length,
        netBalance: inflow - outflow,
      });
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/finance/transactions/export/', {
        responseType: 'blob',
        params: {
          type: selectedType !== 'all' ? selectedType : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export transactions:', err);
    } finally {
      setExporting(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionIcon = (type: string) => {
    return ['contribution', 'investment'].includes(type) ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type: string) => {
    return ['contribution', 'investment'].includes(type) ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBg = (type: string) => {
    return ['contribution', 'investment'].includes(type) 
      ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
      : 'bg-gradient-to-br from-red-100 to-orange-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
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
          <p className="text-gray-600 font-medium">Loading transactions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
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
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                Transaction History
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
              onClick={fetchTransactions}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-indigo-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50"
            >
              <Download className={`h-5 w-5 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export CSV'}
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
            title="Total Inflow" 
            value={`KES ${stats.totalInflow.toLocaleString()}`} 
            change="+12%"
            color="green"
            delay={0}
            icon={TrendingUp}
            description="Income from contributions & investments"
          />
          <AnimatedStatCard 
            title="Total Outflow" 
            value={`KES ${stats.totalOutflow.toLocaleString()}`} 
            change="-8%"
            color="orange"
            delay={0.1}
            icon={TrendingDown}
            description="Expenses, loans & withdrawals"
          />
          <AnimatedStatCard 
            title="Net Balance" 
            value={`KES ${stats.netBalance.toLocaleString()}`} 
            change={stats.netBalance >= 0 ? "+5%" : "-3%"}
            color={stats.netBalance >= 0 ? "blue" : "purple"}
            delay={0.2}
            icon={DollarSign}
            description="Current financial position"
          />
          <AnimatedStatCard 
            title="Total Transactions" 
            value={stats.totalTransactions.toString()} 
            change="+15%"
            color="purple"
            delay={0.3}
            icon={FileText}
            description="All-time transaction count"
          />
        </motion.div>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Transactions List */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-4">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                        Transaction History
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm mt-1">
                        Complete ledger of all your financial transactions
                      </CardDescription>
                    </div>
                    
                    {/* Enhanced Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
                      <div className="relative flex-1 sm:flex-none sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          placeholder="Search transactions..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white w-full text-sm"
                        />
                      </div>
                      <div className="relative flex-1 sm:flex-none sm:w-40">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select 
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white w-full text-sm appearance-none"
                        >
                          {transactionTypes.map((type) => (
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
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white w-full text-sm appearance-none"
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

                  {/* Date Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                        placeholder="From Date"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                        placeholder="To Date"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {filteredTransactions.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">No transactions found</h3>
                        <p className="text-gray-600">
                          {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start making transactions to see history here'}
                        </p>
                      </motion.div>
                    ) : (
                      filteredTransactions.map((transaction, index) => {
                        const Icon = getTransactionIcon(transaction.type);
                        const colorClass = getTransactionColor(transaction.type);
                        const bgClass = getTransactionBg(transaction.type);
                        
                        return (
                          <motion.div
                            key={transaction.id}
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
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <p className="font-semibold text-lg text-gray-800 truncate">
                                      {transaction.description}
                                    </p>
                                    <StatusBadge status={transaction.status} />
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      <span className="capitalize">{transaction.type}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span className="truncate">{transaction.group_name}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span className="truncate">{transaction.user_name}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{new Date(transaction.created_at).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <div className="text-right">
                                  <p className={`text-2xl font-bold ${colorClass}`}>
                                    {['contribution', 'investment'].includes(transaction.type) ? '+' : '-'}
                                    KES {transaction.amount.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Balance: KES {transaction.balance_after.toLocaleString()}
                                  </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <motion.div 
                                  initial={{ opacity: 0, x: 10 }}
                                  whileHover={{ opacity: 1, x: 0 }}
                                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                                >
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
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Insights Sidebar */}
          <TransactionInsights />
        </motion.div>
      </div>
    </div>
  );
}