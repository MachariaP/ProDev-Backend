import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  FileText,
  Check,
  X,
  Sparkles,
  Building,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { financeService, groupsService } from '../../services/apiService';
import type { ChamaGroup } from '../../types/api';

interface PaymentMethod {
  value: 'MPESA' | 'BANK' | 'CASH' | 'OTHER';
  label: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    value: 'MPESA',
    label: 'M-Pesa',
    icon: CreditCard,
    color: 'text-green-600',
    gradient: 'from-green-500 via-green-600 to-emerald-500',
  },
  {
    value: 'BANK',
    label: 'Bank Transfer',
    icon: Building,
    color: 'text-blue-600',
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
  },
  {
    value: 'CASH',
    label: 'Cash',
    icon: DollarSign,
    color: 'text-purple-600',
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
  },
  {
    value: 'OTHER',
    label: 'Other',
    icon: FileText,
    color: 'text-gray-600',
    gradient: 'from-gray-500 via-gray-600 to-slate-500',
  },
];

export function NewContributionPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    group: string;
    amount: string;
    payment_method: 'MPESA' | 'BANK' | 'CASH' | 'OTHER';
    reference_number: string;
    notes: string;
  }>({
    group: '',
    amount: '',
    payment_method: 'MPESA',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsService.getMyGroups();
      setGroups(response);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.group) {
      setError('Please select a group');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.payment_method) {
      setError('Please select a payment method');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await financeService.createContribution({
        group: parseInt(formData.group),
        amount: formData.amount,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        notes: formData.notes,
      });

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/contributions');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating contribution:', err);
      setError(err?.response?.data?.message || 'Failed to record contribution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
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
            className="mx-auto mb-4"
          >
            <Loader className="h-12 w-12 text-green-600" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto mb-6 p-6 rounded-full bg-green-100 w-fit"
          >
            <CheckCircle className="h-16 w-16 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Success!</h2>
          <p className="text-gray-600 mb-6">
            Your contribution has been recorded successfully. Redirecting to contributions page...
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto"
          >
            <Loader className="h-6 w-6 text-green-600" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pt-4"
        >
          <motion.button 
            whileHover={{ x: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/contributions')} 
            className="group flex items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Back to Contributions</span>
          </motion.button>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            >
              New Contribution
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
            >
              <DollarSign className="h-5 w-5" />
              Record a new member contribution
            </motion.p>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                Contribution Details
              </CardTitle>
              <CardDescription className="text-gray-600">
                Fill in the details below to record a new contribution
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Group Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Building className="h-4 w-4" />
                    Select Group
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => handleInputChange('group', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white/50 text-gray-900"
                    required
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <DollarSign className="h-4 w-4" />
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white/50"
                    required
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      const isSelected = formData.payment_method === method.value;
                      
                      return (
                        <motion.button
                          key={method.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('payment_method', method.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-white/50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg bg-gradient-to-br ${method.gradient} ${
                                isSelected ? 'opacity-100' : 'opacity-60'
                              }`}
                            >
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <span className={`font-semibold ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>
                              {method.label}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto"
                              >
                                <Check className="h-5 w-5 text-green-600" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Reference Number */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Hash className="h-4 w-4" />
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => handleInputChange('reference_number', e.target.value)}
                    placeholder="e.g., MP123456789 or Bank Ref..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white/50"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4" />
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional information..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white/50 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/contributions')}
                    className="flex-1 px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
                    disabled={submitting}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <X className="h-5 w-5" />
                      Cancel
                    </div>
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          Record Contribution
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
