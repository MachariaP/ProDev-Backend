import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Receipt, DollarSign, CheckCircle, Clock, XCircle, 
  AlertCircle, Download, Filter, Search, Users, Sparkles,
  BarChart3, PiggyBank, Eye, MoreHorizontal, Calendar,
  TrendingUp, Shield, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { financeService } from '../../services/apiService';
import type { Expense } from '../../types/api';

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

// Enhanced Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  change, 
  color = 'purple',
  delay = 0, 
  icon: Icon,
  description 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  color?: 'purple' | 'orange' | 'blue' | 'green';
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
    DISBURSED: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-200',
      bgColor: 'bg-green-50',
      label: 'Disbursed'
    },
    APPROVED: {
      icon: CheckCircle,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      bgColor: 'bg-blue-50',
      label: 'Approved'
    },
    PENDING: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      bgColor: 'bg-yellow-50',
      label: 'Pending'
    },
    REJECTED: {
      icon: XCircle,
      color: 'bg-red-100 text-red-700 border-red-200',
      bgColor: 'bg-red-50',
      label: 'Rejected'
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

// Expense Insights Component
const ExpenseInsights = () => {
  const insights = [
    {
      title: 'Avg. Expense',
      value: 'KES 8.2K',
      description: 'Per request average',
      color: 'text-purple-300',
      icon: DollarSign,
    },
    {
      title: 'Approval Rate',
      value: '85%',
      description: 'Requests approved',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Top Category',
      value: 'Operational',
      description: 'Most common type',
      color: 'text-blue-300',
      icon: Receipt,
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
            <h3 className="font-bold text-xl">Expense Insights</h3>
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

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { 
    fetchExpenses(); 
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await financeService.getExpenses();
      setExpenses(res.results || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Export logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate export
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'PENDING').length,
    approved: expenses.filter(e => e.status === 'APPROVED').length,
    disbursed: expenses.filter(e => e.status === 'DISBURSED').length,
    totalAmount: expenses.reduce((s, e) => s + Number(e.amount), 0)
  };

  const categoryIcon = (cat: string) => {
    const map: Record<string, string> = { 
      OPERATIONAL: '🔧', 
      ADMINISTRATIVE: '📋', 
      WELFARE: '❤️', 
      INVESTMENT: '💰',
      UTILITIES: '⚡',
      MAINTENANCE: '🛠️'
    };
    return map[cat] || '📝';
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-gray-600 font-medium">Loading expenses...</p>
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
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Expenses
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
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export Report'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="h-5 w-5" />
              Request Expense
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
            title="Total Expenses" 
            value={stats.total.toString()} 
            change="+8%"
            color="purple"
            delay={0}
            icon={Receipt}
            description="All expense requests"
          />
          <AnimatedStatCard 
            title="Pending Approval" 
            value={stats.pending.toString()} 
            change="Urgent"
            color="orange"
            delay={0.1}
            icon={AlertCircle}
            description="Requires attention"
          />
          <AnimatedStatCard 
            title="Approved" 
            value={stats.approved.toString()} 
            change="+12%"
            color="blue"
            delay={0.2}
            icon={CheckCircle}
            description="Approved expenses"
          />
          <AnimatedStatCard 
            title="Total Amount" 
            value={`KES ${stats.totalAmount.toLocaleString()}`} 
            change="+15%"
            color="green"
            delay={0.3}
            icon={DollarSign}
            description="Total expenses value"
          />
        </motion.div>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Expenses List */}
          <div className="lg:col-span-2">
            {filteredExpenses.length === 0 ? (
              <Card className="shadow-2xl text-center py-20 border-0 bg-white">
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 w-fit mx-auto mb-6"
                  >
                    <Receipt className="h-16 w-16 text-purple-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Expenses Found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm 
                      ? 'No expenses match your search criteria. Try adjusting your search.'
                      : 'Start recording expenses to track your group spending.'
                    }
                  </p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
                  >
                    Request First Expense
                  </motion.button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-2xl overflow-hidden border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex flex-col space-y-4">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                          Expense Requests
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm mt-1">
                          All expense requests and their current status
                        </CardDescription>
                      </div>
                      
                      {/* Enhanced Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
                        <div className="relative flex-1 sm:flex-none sm:w-48">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input 
                            placeholder="Search expenses..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white w-full text-sm"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={fetchExpenses}
                          className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white text-sm whitespace-nowrap"
                        >
                          <Filter className="h-4 w-4" />
                          Filter
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                      {filteredExpenses.map((expense, index) => (
                        <motion.div
                          key={expense.id}
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
                                className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg flex-shrink-0"
                              >
                                <span className="text-2xl">{categoryIcon(expense.category)}</span>
                              </motion.div>
                              <div className="flex flex-col gap-2 min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <Receipt className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <p className="font-semibold text-lg text-gray-800 truncate">
                                    {expense.description}
                                  </p>
                                  <StatusBadge status={expense.status} />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    <span className="capitalize">{expense.category.toLowerCase()}</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span className="truncate">Member #{expense.requested_by}</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(expense.requested_at).toLocaleDateString()}</span>
                                  </div>
                                  {expense.approved_by && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        <span>Approved by #{expense.approved_by}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-600">
                                  KES {Number(expense.amount).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Requested {new Date(expense.requested_at).toLocaleDateString()}
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
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Expense Insights Sidebar */}
          <ExpenseInsights />
        </motion.div>
      </div>

      {/* Enhanced Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full border-0"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 w-fit mx-auto mb-4"
              >
                <Receipt className="h-8 w-8 text-purple-600" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Request Expense
              </h2>
              <p className="text-gray-600">Submit a new expense request for approval</p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input 
                    type="number" 
                    placeholder="KES 0.00"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
                    <option>OPERATIONAL</option>
                    <option>ADMINISTRATIVE</option>
                    <option>WELFARE</option>
                    <option>INVESTMENT</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  placeholder="Describe the expense purpose..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
              >
                Submit Request
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}