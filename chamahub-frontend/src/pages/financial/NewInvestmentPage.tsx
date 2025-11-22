import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Check,
  X,
  Info,
  Sparkles,
  Building,
  CreditCard,
  Landmark,
  Home,
  BarChart3,
  Target,
  Zap,
  Shield,
  Star,
  Rocket,
  Gem,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { investmentService, groupsService } from '../../services/apiService';
import type { ChamaGroup } from '../../types/api';

interface InvestmentType {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  gradient: string;
  risk: 'Low' | 'Medium' | 'High';
  popularity: number;
}

const investmentTypes: InvestmentType[] = [
  {
    value: 'TREASURY_BILL',
    label: 'Treasury Bill',
    icon: Landmark,
    color: 'text-blue-600',
    description: 'Government-backed short-term securities with guaranteed returns',
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
    risk: 'Low',
    popularity: 95
  },
  {
    value: 'MONEY_MARKET',
    label: 'Money Market',
    icon: CreditCard,
    color: 'text-green-600',
    description: 'Low-risk, highly liquid investment funds with stable returns',
    gradient: 'from-green-500 via-emerald-600 to-teal-500',
    risk: 'Low',
    popularity: 88
  },
  {
    value: 'STOCKS',
    label: 'Stocks & Shares',
    icon: TrendingUp,
    color: 'text-purple-600',
    description: 'High-growth potential through company equity and shares',
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
    risk: 'High',
    popularity: 76
  },
  {
    value: 'BONDS',
    label: 'Corporate Bonds',
    icon: BarChart3,
    color: 'text-indigo-600',
    description: 'Fixed-income debt securities with regular interest payments',
    gradient: 'from-indigo-500 via-indigo-600 to-blue-500',
    risk: 'Medium',
    popularity: 82
  },
  {
    value: 'REAL_ESTATE',
    label: 'Real Estate',
    icon: Home,
    color: 'text-orange-600',
    description: 'Property investments with long-term appreciation potential',
    gradient: 'from-orange-500 via-amber-600 to-yellow-500',
    risk: 'Medium',
    popularity: 79
  },
  {
    value: 'FIXED_DEPOSIT',
    label: 'Fixed Deposit',
    icon: Building,
    color: 'text-teal-600',
    description: 'Secure time-bound bank deposits with guaranteed returns',
    gradient: 'from-teal-500 via-cyan-600 to-blue-500',
    risk: 'Low',
    popularity: 90
  },
];

const riskColors = {
  Low: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  High: 'bg-red-100 text-red-700 border-red-200'
};

export function NewInvestmentPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    group: '',
    investment_type: '',
    name: '',
    description: '',
    principal_amount: '',
    current_value: '',
    expected_return_rate: '',
    purchase_date: new Date().toISOString().split('T')[0],
    maturity_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setInitialLoading(true);
      const response = await groupsService.getMyGroups();
      setGroups(response);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups. Please refresh the page.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setFormData({ ...formData, investment_type: type });
    setCurrentStep(2);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'principal_amount') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        current_value: (!prev.current_value || prev.current_value === prev.principal_amount) ? value : prev.current_value
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateProjectedReturns = useCallback(() => {
    const principal = parseFloat(formData.principal_amount || '0');
    const rate = parseFloat(formData.expected_return_rate || '0');
    const purchaseDate = new Date(formData.purchase_date);
    const maturityDate = formData.maturity_date ? new Date(formData.maturity_date) : null;
    
    if (principal > 0 && rate > 0 && maturityDate) {
      const days = (maturityDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
      const months = days / 30.44;
      const years = months / 12;
      const projectedValue = principal * (1 + (rate / 100) * years);
      const projectedReturns = projectedValue - principal;
      const roi = (projectedReturns / principal) * 100;
      
      return {
        projectedValue: projectedValue.toFixed(2),
        projectedReturns: projectedReturns.toFixed(2),
        duration: months.toFixed(1),
        roi: roi.toFixed(1)
      };
    }
    return null;
  }, [formData.principal_amount, formData.expected_return_rate, formData.purchase_date, formData.maturity_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const investmentData = {
        group: parseInt(formData.group),
        investment_type: formData.investment_type,
        name: formData.name,
        description: formData.description,
        principal_amount: formData.principal_amount,
        current_value: formData.current_value || formData.principal_amount,
        expected_return_rate: formData.expected_return_rate,
        purchase_date: formData.purchase_date,
        maturity_date: formData.maturity_date || undefined,
        notes: formData.notes,
        status: 'ACTIVE',
      };

      await investmentService.createInvestment(investmentData as any);

      setSuccess('🎉 Investment created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/investments');
      }, 2000);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMsg || 'Failed to create investment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const projection = calculateProjectedReturns();
  const selectedTypeInfo = investmentTypes.find(t => t.value === selectedType);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
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
            Preparing Your Investment Hub
          </motion.h3>
          <p className="text-gray-600">Loading investment opportunities...</p>
        </motion.div>
      </div>
    );
  }

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
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.button
            whileHover={{ x: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/investments')}
            className="group flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 transition-all duration-300 mb-6"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
              Back to Investments
            </span>
          </motion.button>
          
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="relative"
            >
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Rocket className="h-10 w-10 text-white" />
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
            
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3"
              >
                Launch New Investment
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 flex items-center gap-2"
              >
                <Zap className="h-5 w-5 text-yellow-500" />
                Grow your wealth with strategic investments
              </motion.p>
            </div>
          </div>

          {/* Progress Steps */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 mt-8"
          >
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/50' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                <span className={`font-medium ${
                  currentStep >= step ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {step === 1 ? 'Choose Type' : 'Details'}
                </span>
                {step < 2 && (
                  <div className={`w-12 h-1 rounded-full ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 text-red-700 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Attention Needed</h3>
                <p>{error}</p>
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 rounded-2xl flex items-center gap-4 shadow-lg backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Success!</h3>
                <p>{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-3 space-y-8"
          >
            {/* Step 1: Investment Type Selection */}
            <AnimatePresence>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white pb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                          <Target className="h-8 w-8" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black">Choose Your Investment Vehicle</CardTitle>
                          <CardDescription className="text-purple-100 text-lg">
                            Select the perfect investment type for your financial goals
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {investmentTypes.map((type, index) => {
                          const Icon = type.icon;
                          const isSelected = selectedType === type.value;
                          return (
                            <motion.button
                              key={type.value}
                              initial={{ opacity: 0, y: 20, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ 
                                scale: 1.05,
                                y: -5
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTypeSelect(type.value)}
                              className={`relative p-6 rounded-2xl border-3 transition-all duration-300 group overflow-hidden ${
                                isSelected
                                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-2xl shadow-purple-500/25'
                                  : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-xl'
                              }`}
                            >
                              {/* Background Gradient on Hover */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                              
                              {/* Popularity Badge */}
                              <div className="absolute top-4 right-4 flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-600">{type.popularity}%</span>
                              </div>

                              {/* Risk Badge */}
                              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${riskColors[type.risk]}`}>
                                {type.risk} Risk
                              </div>

                              <div className="text-center pt-8">
                                <div
                                  className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300`}
                                >
                                  <Icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-800'}`}>
                                  {type.label}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {type.description}
                                </p>
                              </div>

                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-3 right-3 h-7 w-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <Check className="h-4 w-4 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Investment Details Form */}
            <AnimatePresence>
              {currentStep === 2 && selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                >
                  <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white pb-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-black">Investment Details</CardTitle>
                            <CardDescription className="text-blue-100 text-lg">
                              Complete your {selectedTypeInfo?.label.toLowerCase()} investment information
                            </CardDescription>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05, x: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentStep(1)}
                          className="px-6 py-3 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </motion.button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Group Selection */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <Building className="h-5 w-5 text-blue-600" />
                              Select Investment Group *
                            </label>
                            <select
                              name="group"
                              value={formData.group}
                              onChange={handleInputChange}
                              required
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            >
                              <option value="">Choose your group...</option>
                              {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <Target className="h-5 w-5 text-purple-600" />
                              Investment Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                              placeholder="e.g., 91-Day Treasury Bill - Q1 2024"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-600" />
                            Investment Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg resize-none"
                            placeholder="Describe your investment strategy, goals, and any important details..."
                          />
                        </div>

                        {/* Amount and Return Rate */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              Principal Amount (KES) *
                            </label>
                            <input
                              type="number"
                              name="principal_amount"
                              value={formData.principal_amount}
                              onChange={handleInputChange}
                              required
                              min="1"
                              step="0.01"
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                              placeholder="100,000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-orange-600" />
                              Expected Annual Return (%) *
                            </label>
                            <input
                              type="number"
                              name="expected_return_rate"
                              value={formData.expected_return_rate}
                              onChange={handleInputChange}
                              required
                              min="0"
                              step="0.01"
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                              placeholder="12.5"
                            />
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              Purchase Date *
                            </label>
                            <input
                              type="date"
                              name="purchase_date"
                              value={formData.purchase_date}
                              onChange={handleInputChange}
                              required
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-purple-600" />
                              Maturity Date
                            </label>
                            <input
                              type="date"
                              name="maturity_date"
                              value={formData.maturity_date}
                              onChange={handleInputChange}
                              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            />
                          </div>
                        </div>

                        {/* Current Value */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-teal-600" />
                            Current Value (KES)
                            <span className="text-xs font-normal text-gray-500 ml-2">
                              (Defaults to principal amount if not set)
                            </span>
                          </label>
                          <input
                            type="number"
                            name="current_value"
                            value={formData.current_value}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg"
                            placeholder={formData.principal_amount || "100,000"}
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Additional Notes
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg resize-none"
                            placeholder="Any additional information, risk factors, or special considerations..."
                          />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Sparkles className="h-6 w-6" />
                              </motion.div>
                              Launching Investment...
                            </>
                          ) : (
                            <>
                              <Rocket className="h-6 w-6 group-hover:scale-110 transition-transform" />
                              Launch Investment
                            </>
                          )}
                        </motion.button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Investment Preview */}
            {projection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <TrendingUp className="h-6 w-6" />
                      Projected Returns
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      Smart investment analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <p className="text-sm text-emerald-100 mb-2">Expected Maturity Value</p>
                      <p className="text-2xl font-black">
                        KES {parseFloat(projection.projectedValue).toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <p className="text-xs text-emerald-100 mb-1">Total Returns</p>
                        <p className="font-bold text-lg">
                          +{projection.roi}%
                        </p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <p className="text-xs text-emerald-100 mb-1">Duration</p>
                        <p className="font-bold text-lg">{projection.duration}m</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <p className="text-xs text-emerald-100 mb-1">Profit</p>
                      <p className="font-bold text-lg text-yellow-300">
                        +KES {parseFloat(projection.projectedReturns).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Selected Investment Info */}
            {selectedTypeInfo && (
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Investment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${selectedTypeInfo.gradient}`}>
                      <selectedTypeInfo.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{selectedTypeInfo.label}</p>
                      <p className="text-sm text-gray-600">{selectedTypeInfo.description}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-2 rounded-full text-sm font-bold text-center border ${riskColors[selectedTypeInfo.risk]}`}>
                    {selectedTypeInfo.risk} Risk Profile
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Information Card */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Smart Investing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Diversify across multiple investment types to spread risk",
                  "Always verify investment opportunities and read terms carefully",
                  "Consider your group's risk tolerance and investment timeline",
                  "Keep track of maturity dates and set reminders for renewals",
                  "Monitor market trends and adjust your strategy accordingly"
                ].map((tip, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex gap-3 group"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Check className="h-3 w-3 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {formData.principal_amount && formData.expected_return_rate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <BarChart3 className="h-5 w-5" />
                      Investment Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-amber-600">Principal Amount</span>
                      <span className="font-bold text-amber-700">
                        KES {parseFloat(formData.principal_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-amber-600">Annual Return</span>
                      <span className="font-bold text-green-600">
                        {formData.expected_return_rate}%
                      </span>
                    </div>
                    {formData.maturity_date && (
                      <div className="flex justify-between items-center p-2">
                        <span className="text-sm text-amber-600">Maturity Date</span>
                        <span className="font-bold text-amber-700">
                          {new Date(formData.maturity_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}