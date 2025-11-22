import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Building,
  CreditCard,
  Landmark,
  Home,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Sparkles,
  Crown,
  Gem,
  Zap,
  Shield,
  Rocket,
  PieChart,
  Award,
  TrendingDown,
  Clock3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { investmentService } from '../../services/apiService';
import type { Investment } from '../../types/api';

const investmentTypeIcons: Record<string, React.ElementType> = {
  TREASURY_BILL: Landmark,
  MONEY_MARKET: CreditCard,
  STOCKS: TrendingUp,
  BONDS: BarChart3,
  REAL_ESTATE: Home,
  FIXED_DEPOSIT: Building,
  OTHER: FileText,
};

const investmentTypeColors: Record<string, { gradient: string; bg: string; text: string }> = {
  TREASURY_BILL: {
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700'
  },
  MONEY_MARKET: {
    gradient: 'from-green-500 via-emerald-600 to-teal-500',
    bg: 'bg-green-50',
    text: 'text-green-700'
  },
  STOCKS: {
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700'
  },
  BONDS: {
    gradient: 'from-indigo-500 via-indigo-600 to-blue-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700'
  },
  REAL_ESTATE: {
    gradient: 'from-orange-500 via-amber-600 to-yellow-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700'
  },
  FIXED_DEPOSIT: {
    gradient: 'from-teal-500 via-cyan-600 to-blue-500',
    bg: 'bg-teal-50',
    text: 'text-teal-700'
  },
  OTHER: {
    gradient: 'from-gray-500 via-gray-600 to-slate-500',
    bg: 'bg-gray-50',
    text: 'text-gray-700'
  },
};

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  ACTIVE: {
    color: 'text-green-700',
    bg: 'bg-green-100 border-green-200',
    icon: CheckCircle,
    label: 'Active & Growing'
  },
  MATURED: {
    color: 'text-blue-700',
    bg: 'bg-blue-100 border-blue-200',
    icon: Award,
    label: 'Matured Successfully'
  },
  SOLD: {
    color: 'text-purple-700',
    bg: 'bg-purple-100 border-purple-200',
    icon: TrendingUp,
    label: 'Sold'
  },
  CANCELLED: {
    color: 'text-red-700',
    bg: 'bg-red-100 border-red-200',
    icon: XCircle,
    label: 'Cancelled'
  },
};

export function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvestmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await investmentService.getInvestment(Number(id));
      setInvestment(data);
    } catch (err) {
      console.error('Failed to load investment details:', err);
      setError('Failed to load investment details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInvestmentDetails();
    }
  }, [id, fetchInvestmentDetails]);

  const calculateROI = () => {
    if (!investment) return 0;
    const principal = parseFloat(investment.principal_amount || investment.amount_invested || '0');
    const current = parseFloat(investment.current_value || '0');
    if (principal > 0) {
      return ((current - principal) / principal) * 100;
    }
    return 0;
  };

  const calculateProfitLoss = () => {
    if (!investment) return 0;
    const principal = parseFloat(investment.principal_amount || investment.amount_invested || '0');
    const current = parseFloat(investment.current_value || '0');
    return current - principal;
  };

  const calculateDaysToMaturity = () => {
    if (!investment?.maturity_date) return null;
    const today = new Date();
    const maturity = new Date(investment.maturity_date);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getInvestmentDuration = () => {
    if (!investment) return null;
    const purchaseDate = new Date(investment.purchase_date || investment.investment_date);
    const endDate = investment.maturity_date ? new Date(investment.maturity_date) : new Date();
    const diffTime = endDate.getTime() - purchaseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
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
            className="mx-auto mb-6"
          >
            <Gem className="h-16 w-16 text-purple-600" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
          >
            Loading Investment Details
          </motion.h3>
          <p className="text-gray-600">Fetching your investment performance data...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur-3xl opacity-20"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <motion.button
            whileHover={{ x: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/investments')}
            className="group flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 transition-all duration-300 mb-8"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
              Back to Investments
            </span>
          </motion.button>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardContent className="py-20 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
              >
                <AlertCircle className="h-12 w-12 text-red-600" />
              </motion.div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Investment Not Found
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/investments')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <Rocket className="h-5 w-5" />
                Return to Investments
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const Icon = investmentTypeIcons[investment.investment_type] || FileText;
  const typeConfig = investmentTypeColors[investment.investment_type] || investmentTypeColors.OTHER;
  const statusInfo = statusConfig[investment.status] || statusConfig.ACTIVE;
  const StatusIcon = statusInfo.icon;
  const roi = calculateROI();
  const profitLoss = calculateProfitLoss();
  const daysToMaturity = calculateDaysToMaturity();
  const investmentDuration = getInvestmentDuration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ x: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/investments')}
                className="group flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  Back to Portfolio
                </span>
              </motion.button>
              
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="relative"
                >
                  <div className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center shadow-2xl shadow-${typeConfig.text.split('-')[1]}-500/30`}>
                    <Icon className="h-10 w-10 text-white" />
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
                    className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3"
                  >
                    {investment.name}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-gray-600 flex items-center gap-2"
                  >
                    <Zap className="h-5 w-5 text-yellow-500" />
                    {investment.investment_type.replace(/_/g, ' ')} • {investment.group_name || 'Personal Investment'}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 backdrop-blur-sm ${statusInfo.bg} ${statusInfo.color} shadow-lg`}
            >
              <StatusIcon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-bold text-sm">{statusInfo.label}</div>
                <div className="text-xs opacity-80">{investment.status}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            <Card className="lg:col-span-2 shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-600">
                  <PieChart className="h-6 w-6" />
                  Investment Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/80 rounded-2xl border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
                    <p className="text-2xl font-black text-gray-800">
                      KES {parseFloat(investment.principal_amount || investment.amount_invested).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/80 rounded-2xl border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                    <p className="text-2xl font-black text-green-600">
                      KES {parseFloat(investment.current_value || '0').toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl rounded-3xl">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <p className={`text-3xl font-black ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl rounded-3xl">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Profit/Loss</p>
                <p className={`text-2xl font-black ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitLoss >= 0 ? '+' : ''}KES {Math.abs(profitLoss).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Investment Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="xl:col-span-2 space-y-8"
            >
              {/* Investment Overview */}
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white pb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">Investment Overview</CardTitle>
                      <CardDescription className="text-blue-100 text-lg">
                        Complete details of your investment
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Investment Description
                    </h4>
                    <p className="text-gray-800 bg-blue-50/50 p-4 rounded-2xl border border-blue-200 backdrop-blur-sm">
                      {investment.description || 'No description provided for this investment.'}
                    </p>
                  </div>
                  
                  {investment.group_name && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Building className="h-5 w-5 text-green-600" />
                        Investment Group
                      </h4>
                      <p className="text-gray-800 bg-green-50/50 p-4 rounded-2xl border border-green-200 backdrop-blur-sm">
                        {investment.group_name}
                      </p>
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        <p className="text-sm font-bold text-gray-700">Expected Return</p>
                      </div>
                      <p className="text-2xl font-black text-orange-600">
                        {investment.expected_return_rate || investment.expected_return}%
                      </p>
                    </div>

                    {investmentDuration && (
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock3 className="h-5 w-5 text-purple-600" />
                          <p className="text-sm font-bold text-gray-700">Investment Duration</p>
                        </div>
                        <p className="text-2xl font-black text-purple-600">
                          {investmentDuration} days
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Breakdown */}
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <DollarSign className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">Financial Breakdown</CardTitle>
                      <CardDescription className="text-green-100 text-lg">
                        Detailed financial analysis and projections
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Annual Return Rate</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                          <p className="text-2xl font-black text-blue-600">
                            {investment.expected_return_rate || investment.expected_return}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white/50 rounded-2xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Current Investment Status</p>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-6 w-6 text-green-600" />
                          <p className="text-lg font-bold text-green-600">{statusInfo.label}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                      <p className="text-sm text-gray-600 mb-2">Performance Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Initial Investment</span>
                          <span className="font-bold">
                            KES {parseFloat(investment.principal_amount || investment.amount_invested).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Value</span>
                          <span className="font-bold text-green-600">
                            KES {parseFloat(investment.current_value || '0').toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">Net Gain/Loss</span>
                          <span className={`font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profitLoss >= 0 ? '+' : ''}KES {Math.abs(profitLoss).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Timeline & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-8"
            >
              {/* Timeline Card */}
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">Investment Timeline</CardTitle>
                      <CardDescription className="text-purple-100 text-lg">
                        Key dates and milestones
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 backdrop-blur-sm">
                    <p className="text-xs text-gray-600 mb-1">Investment Date</p>
                    <p className="font-bold text-gray-800 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {new Date(investment.purchase_date || investment.investment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  
                  {investment.maturity_date && (
                    <>
                      <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 backdrop-blur-sm">
                        <p className="text-xs text-gray-600 mb-1">Maturity Date</p>
                        <p className="font-bold text-gray-800 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          {new Date(investment.maturity_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      
                      {daysToMaturity !== null && daysToMaturity > 0 && (
                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-200 backdrop-blur-sm">
                          <p className="text-xs text-gray-600 mb-1">Days to Maturity</p>
                          <p className="text-2xl font-black text-green-600 flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            {daysToMaturity} days
                          </p>
                        </div>
                      )}
                      
                      {daysToMaturity !== null && daysToMaturity <= 0 && (
                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 backdrop-blur-sm">
                          <p className="text-xs text-gray-600 mb-1">Status</p>
                          <p className="font-bold text-orange-600 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Investment Matured
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-200 backdrop-blur-sm">
                    <p className="text-xs text-gray-600 mb-1">Created On</p>
                    <p className="font-bold text-gray-800">
                      {new Date(investment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-50 to-amber-50 backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Shield className="h-5 w-5" />
                    Investment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investment.created_by_name && (
                    <div className="p-3 bg-white/50 rounded-xl border border-amber-200">
                      <p className="text-xs text-amber-600 mb-1">Created By</p>
                      <p className="font-bold text-amber-700">{investment.created_by_name}</p>
                    </div>
                  )}
                  
                  {investment.returns !== undefined && (
                    <div className="p-3 bg-white/50 rounded-xl border border-green-200">
                      <p className="text-xs text-green-600 mb-1">Total Returns Generated</p>
                      <p className="font-bold text-green-600 text-lg">
                        KES {investment.returns.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-white/50 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Last Updated</p>
                    <p className="text-sm text-blue-700">
                      {new Date(investment.updated_at || investment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-50 to-gray-100 backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                  >
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-700">View Documents</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                  >
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Performance Report</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                  >
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Update Value</span>
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}