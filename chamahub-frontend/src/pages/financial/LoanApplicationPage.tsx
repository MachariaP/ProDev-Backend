import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Check,
  X,
  Calculator,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Download,
  Plus,
  Search,
  Crown,
  Wallet,
  User,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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

interface Group {
  id: number;
  name: string;
  available_funds: number;
  max_loan_amount: number;
  member_count: number;
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

// Loan Insights Component - Fixed layout
const LoanInsights = () => {
  const insights = [
    {
      title: 'Approval Rate',
      value: '85%',
      description: 'Applications approved',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Avg. Interest',
      value: '12%',
      description: 'Annual rate',
      color: 'text-blue-300',
      icon: Calculator,
    },
    {
      title: 'Processing Time',
      value: '2 Days',
      description: 'Average approval',
      color: 'text-purple-300',
      icon: Clock,
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
            <h3 className="font-bold text-xl">Loan Insights</h3>
            <p className="text-white/60 text-sm">Key metrics and analytics</p>
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
              <FileText className="h-4 w-4" />
              Policies
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Calculator
            </motion.button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export function LoanApplicationPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loanPreview, setLoanPreview] = useState<{
    monthly_payment: number;
    total_interest: number;
    total_repayment: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    group_id: '',
    amount: '',
    purpose: '',
    duration_months: '12',
    guarantors: [''],
    repayment_method: 'monthly',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const calculateLoan = useCallback(async () => {
    if (!formData.amount || !formData.duration_months || !formData.group_id) return;
    
    setCalculating(true);
    try {
      const response = await api.post('/finance/loans/calculate/', {
        group_id: formData.group_id,
        amount: parseFloat(formData.amount),
        duration_months: parseInt(formData.duration_months),
      });
      setLoanPreview(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to calculate loan:', err);
      setLoanPreview(null);
    } finally {
      setCalculating(false);
    }
  }, [formData.amount, formData.duration_months, formData.group_id]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  const fetchGroups = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get('/groups/chama-groups/');
      setGroups(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups. Please refresh the page.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/finance/loans/', {
        group: parseInt(formData.group_id),
        principal_amount: parseFloat(formData.amount),
        duration_months: parseInt(formData.duration_months),
        purpose: formData.purpose,
      });
      setSuccess('Loan application submitted successfully! Awaiting approval.');
      setTimeout(() => {
        navigate('/loans');
      }, 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  const addGuarantor = () => {
    setFormData({
      ...formData,
      guarantors: [...formData.guarantors, ''],
    });
  };

  const updateGuarantor = (index: number, value: string) => {
    const newGuarantors = [...formData.guarantors];
    newGuarantors[index] = value;
    setFormData({ ...formData, guarantors: newGuarantors });
  };

  const removeGuarantor = (index: number) => {
    setFormData({
      ...formData,
      guarantors: formData.guarantors.filter((_, i) => i !== index),
    });
  };

  const selectedGroup = groups.find((g) => g.id.toString() === formData.group_id);

  // Calculate stats for the dashboard
  const stats = {
    totalGroups: groups.length,
    availableFunds: groups.reduce((sum, group) => sum + group.available_funds, 0),
    maxLoanAmount: selectedGroup?.max_loan_amount || 0,
    memberCount: groups.reduce((sum, group) => sum + (group.member_count || 0), 0),
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (initialLoading) {
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
          <p className="text-gray-600 font-medium">Loading loan application...</p>
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
              onClick={() => navigate('/loans')} 
              className="group flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Loans</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Apply for Loan
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <DollarSign className="h-5 w-5" />
                Request a loan from your group with competitive interest rates
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
              onClick={fetchGroups}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/loans')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              <Download className="h-5 w-5" />
              View Policies
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
            title="Available Groups" 
            value={stats.totalGroups.toString()} 
            change="+2"
            color="green"
            delay={0}
            icon={Users}
            description="Groups you can apply to"
          />
          <AnimatedStatCard 
            title="Total Funds" 
            value={`KES ${stats.availableFunds.toLocaleString()}`} 
            change="+15%"
            color="blue"
            delay={0.1}
            icon={Wallet}
            description="Across all your groups"
          />
          <AnimatedStatCard 
            title="Max Loan Amount" 
            value={`KES ${stats.maxLoanAmount.toLocaleString()}`} 
            change={stats.maxLoanAmount > 0 ? "+25%" : "Select Group"}
            color={stats.maxLoanAmount > 0 ? "orange" : "purple"}
            delay={0.2}
            icon={DollarSign}
            description="Based on selected group"
          />
          <AnimatedStatCard 
            title="Group Members" 
            value={stats.memberCount.toString()} 
            change="+8%"
            color="purple"
            delay={0.3}
            icon={User}
            description="Across all your groups"
          />
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3"
            >
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Success</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <Check className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-4">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                        Loan Application Form
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm mt-1">
                        Fill in the details for your loan request
                      </CardDescription>
                    </div>
                    
                    {/* Enhanced Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
                      <div className="relative flex-1 sm:flex-none sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          placeholder="Search groups..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Select Group
                    </label>
                    <select
                      value={formData.group_id}
                      onChange={(e) =>
                        setFormData({ ...formData, group_id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white appearance-none"
                    >
                      <option value="">Choose a group...</option>
                      {filteredGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} (Available: KES {group.available_funds.toLocaleString()})
                        </option>
                      ))}
                    </select>
                    {selectedGroup && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-blue-700">
                              Maximum loan amount: KES {selectedGroup.max_loan_amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                              Available funds: KES {selectedGroup.available_funds.toLocaleString()}
                            </p>
                          </div>
                          <Crown className="h-6 w-6 text-yellow-500" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Amount and Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Loan Amount (KES)
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        required
                        min="1000"
                        step="100"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                        placeholder="e.g., 50000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Repayment Period
                      </label>
                      <select
                        value={formData.duration_months}
                        onChange={(e) =>
                          setFormData({ ...formData, duration_months: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white appearance-none"
                      >
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                      </select>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Purpose of Loan
                    </label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                      placeholder="Describe what you need the loan for..."
                    />
                  </div>

                  {/* Repayment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Repayment Method
                    </label>
                    <select
                      value={formData.repayment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, repayment_method: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white appearance-none"
                    >
                      <option value="monthly">Monthly Installments</option>
                      <option value="weekly">Weekly Installments</option>
                      <option value="lumpsum">Lump Sum at End</option>
                    </select>
                  </div>

                  {/* Guarantors */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Guarantors (At least 1 required)
                    </label>
                    <div className="space-y-3">
                      {formData.guarantors.map((guarantor, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3"
                        >
                          <input
                            type="email"
                            value={guarantor}
                            onChange={(e) => updateGuarantor(index, e.target.value)}
                            placeholder="guarantor@example.com"
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                          />
                          {formData.guarantors.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => removeGuarantor(index)}
                              className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors border border-red-200"
                            >
                              <X className="h-5 w-5" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addGuarantor}
                      className="mt-3 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add another guarantor
                    </motion.button>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Submit Application
                      </>
                    )}
                  </motion.button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Loan Preview & Insights Sidebar */}
          <div className="space-y-8">
            {/* Loan Preview */}
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Loan Preview
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm mt-1">
                      Estimated repayment details
                    </CardDescription>
                  </div>
                  <Calculator className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  {calculating ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mx-auto mb-4"
                      >
                        <Calculator className="h-8 w-8 text-purple-600" />
                      </motion.div>
                      <p className="text-sm text-gray-500">Calculating...</p>
                    </div>
                  ) : loanPreview ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                        <p className="text-3xl font-bold text-purple-600">
                          KES {loanPreview.monthly_payment.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50">
                          <span className="text-sm text-gray-600">Loan Amount</span>
                          <span className="font-semibold">
                            KES {parseFloat(formData.amount || '0').toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-orange-50 border border-orange-200">
                          <span className="text-sm text-orange-600">Total Interest</span>
                          <span className="font-semibold text-orange-600">
                            KES {loanPreview.total_interest.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-green-50 border border-green-200">
                          <span className="font-semibold text-green-700">Total Repayment</span>
                          <span className="font-bold text-lg text-green-700">
                            KES {loanPreview.total_repayment.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Enter loan details to see preview
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Loan Insights - Fixed */}
            <LoanInsights />
          </div>
        </motion.div>
      </div>
    </div>
  );
}