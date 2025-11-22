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
  AlertCircle,
  Info,
  Sparkles,
  Building,
  CreditCard,
  Landmark,
  Home,
  BarChart3,
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
}

const investmentTypes: InvestmentType[] = [
  {
    value: 'TREASURY_BILL',
    label: 'Treasury Bill',
    icon: Landmark,
    color: 'text-blue-600',
    description: 'Government-backed short-term securities',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    value: 'MONEY_MARKET',
    label: 'Money Market',
    icon: CreditCard,
    color: 'text-green-600',
    description: 'Low-risk, liquid investment funds',
    gradient: 'from-green-500 to-green-600',
  },
  {
    value: 'STOCKS',
    label: 'Stocks/Shares',
    icon: TrendingUp,
    color: 'text-purple-600',
    description: 'Company equity and shares',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    value: 'BONDS',
    label: 'Bonds',
    icon: BarChart3,
    color: 'text-indigo-600',
    description: 'Fixed-income debt securities',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  {
    value: 'REAL_ESTATE',
    label: 'Real Estate',
    icon: Home,
    color: 'text-orange-600',
    description: 'Property and land investments',
    gradient: 'from-orange-500 to-orange-600',
  },
  {
    value: 'FIXED_DEPOSIT',
    label: 'Fixed Deposit',
    icon: Building,
    color: 'text-teal-600',
    description: 'Time-bound bank deposits',
    gradient: 'from-teal-500 to-teal-600',
  },
];

export function NewInvestmentPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

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
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-set current value same as principal if not set
    if (name === 'principal_amount' && !formData.current_value) {
      setFormData(prev => ({ ...prev, [name]: value, current_value: value }));
    }
  };

  const calculateProjectedReturns = useCallback(() => {
    const principal = parseFloat(formData.principal_amount || '0');
    const rate = parseFloat(formData.expected_return_rate || '0');
    const purchaseDate = new Date(formData.purchase_date);
    const maturityDate = formData.maturity_date ? new Date(formData.maturity_date) : null;
    
    if (principal > 0 && rate > 0 && maturityDate) {
      const months = (maturityDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const years = months / 12;
      const projectedValue = principal * (1 + (rate / 100) * years);
      const projectedReturns = projectedValue - principal;
      
      return {
        projectedValue: projectedValue.toFixed(2),
        projectedReturns: projectedReturns.toFixed(2),
        duration: months.toFixed(1),
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
      // Backend expects: principal_amount, expected_return_rate, purchase_date
      // not amount_invested, expected_return, investment_date
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

      setSuccess('Investment created successfully!');
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
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <Sparkles className="h-12 w-12 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/investments')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Investments
          </button>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Investment
              </h1>
              <p className="text-muted-foreground mt-1">
                Grow your group's wealth with smart investments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm"
            >
              <X className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm"
            >
              <Check className="h-5 w-5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Investment Type Selection */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Select Investment Type
                </CardTitle>
                <CardDescription>Choose the type of investment you want to make</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {investmentTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.value;
                    return (
                      <motion.button
                        key={type.value}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTypeSelect(type.value)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-gray-200 hover:border-primary/50 bg-white'
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-2 mx-auto`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {type.label}
                        </p>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {selectedTypeInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <p className="text-sm text-muted-foreground">{selectedTypeInfo.description}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Investment Details Form */}
            <AnimatePresence>
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Investment Details
                      </CardTitle>
                      <CardDescription>Fill in the information about your investment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Group Selection */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Select Group *</label>
                          <select
                            name="group"
                            value={formData.group}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                          >
                            <option value="">Choose a group...</option>
                            {groups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Investment Name */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Investment Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            placeholder="e.g., 91-Day Treasury Bill - Q1 2024"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            placeholder="Brief description of the investment..."
                          />
                        </div>

                        {/* Amount and Return Rate */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                              placeholder="100000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                              placeholder="12.5"
                            />
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Purchase Date *
                            </label>
                            <input
                              type="date"
                              name="purchase_date"
                              value={formData.purchase_date}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Maturity Date
                            </label>
                            <input
                              type="date"
                              name="maturity_date"
                              value={formData.maturity_date}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                          </div>
                        </div>

                        {/* Current Value (optional) */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Current Value (KES)
                            <span className="text-xs text-muted-foreground ml-2">
                              (defaults to principal amount)
                            </span>
                          </label>
                          <input
                            type="number"
                            name="current_value"
                            value={formData.current_value}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            placeholder={formData.principal_amount || "100000"}
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Notes</label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            placeholder="Additional notes or comments..."
                          />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Sparkles className="h-5 w-5" />
                              </motion.div>
                              Creating Investment...
                            </>
                          ) : (
                            <>
                              <Check className="h-5 w-5" />
                              Create Investment
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

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Investment Preview */}
            {projection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-xl border-0 bg-gradient-to-br from-primary/10 to-purple-100/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <TrendingUp className="h-5 w-5" />
                      Projected Returns
                    </CardTitle>
                    <CardDescription>Based on your inputs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Expected Value at Maturity</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        KES {parseFloat(projection.projectedValue).toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/80 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Returns</p>
                        <p className="font-bold text-green-600">
                          +KES {parseFloat(projection.projectedReturns).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-white/80 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                        <p className="font-bold text-primary">{projection.duration} months</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Information Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Investment Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Diversify your portfolio across different investment types
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Always verify investment opportunities before committing funds
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Keep track of maturity dates and expected returns
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Consider your group's risk tolerance and investment goals
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {formData.principal_amount && formData.expected_return_rate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <BarChart3 className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal</span>
                      <span className="font-semibold">
                        KES {parseFloat(formData.principal_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Rate</span>
                      <span className="font-semibold text-green-600">
                        {formData.expected_return_rate}%
                      </span>
                    </div>
                    {formData.maturity_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Matures</span>
                        <span className="font-semibold">
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
