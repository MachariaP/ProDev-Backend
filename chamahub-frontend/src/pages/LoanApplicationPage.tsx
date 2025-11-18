import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

interface Group {
  id: number;
  name: string;
  available_funds: number;
  max_loan_amount: number;
}

export function LoanApplicationPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (formData.amount && formData.duration_months && formData.group_id) {
      calculateLoan();
    }
  }, [formData.amount, formData.duration_months, formData.group_id]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/groups/');
      setGroups(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const calculateLoan = async () => {
    setCalculating(true);
    try {
      const response = await api.post('/finance/loans/calculate/', {
        group_id: formData.group_id,
        amount: parseFloat(formData.amount),
        duration_months: parseInt(formData.duration_months),
      });
      setLoanPreview(response.data);
    } catch (err) {
      console.error('Failed to calculate loan:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/finance/loans/', {
        ...formData,
        amount: parseFloat(formData.amount),
        duration_months: parseInt(formData.duration_months),
        guarantors: formData.guarantors.filter((g) => g.trim() !== ''),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/loans')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Loans
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Apply for Loan</h1>
              <p className="text-muted-foreground">
                Request a loan from your group with competitive interest rates
              </p>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Loan Application Form
                </CardTitle>
                <CardDescription>
                  Fill in the details for your loan request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Select Group
                    </label>
                    <select
                      value={formData.group_id}
                      onChange={(e) =>
                        setFormData({ ...formData, group_id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="">Choose a group...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} (Available: KES {group.available_funds.toLocaleString()})
                        </option>
                      ))}
                    </select>
                    {selectedGroup && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Maximum loan amount: KES {selectedGroup.max_loan_amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
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
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="e.g., 50000"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Repayment Period (Months)
                    </label>
                    <select
                      value={formData.duration_months}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_months: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="36">36 months</option>
                    </select>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Purpose of Loan
                    </label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      required
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Describe what you need the loan for..."
                    />
                  </div>

                  {/* Repayment Method */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Repayment Method
                    </label>
                    <select
                      value={formData.repayment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, repayment_method: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="monthly">Monthly Installments</option>
                      <option value="weekly">Weekly Installments</option>
                      <option value="lumpsum">Lump Sum at End</option>
                    </select>
                  </div>

                  {/* Guarantors */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Guarantors (At least 1 required)
                    </label>
                    <div className="space-y-2">
                      {formData.guarantors.map((guarantor, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="email"
                            value={guarantor}
                            onChange={(e) => updateGuarantor(index, e.target.value)}
                            placeholder="guarantor@example.com"
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                          {formData.guarantors.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => removeGuarantor(index)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </motion.button>
                          )}
                        </div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addGuarantor}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      + Add another guarantor
                    </motion.button>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
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
          </motion.div>

          {/* Loan Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Loan Preview
                </CardTitle>
                <CardDescription>Estimated repayment details</CardDescription>
              </CardHeader>
              <CardContent>
                {calculating ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Calculating...</p>
                  </div>
                ) : loanPreview ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Monthly Payment
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        KES {loanPreview.monthly_payment.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Loan Amount
                        </span>
                        <span className="font-medium">
                          KES {parseFloat(formData.amount || '0').toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Interest
                        </span>
                        <span className="font-medium text-orange-600">
                          KES {loanPreview.total_interest.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Total Repayment</span>
                        <span className="font-bold text-lg">
                          KES {loanPreview.total_repayment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Enter loan details to see preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Loans are subject to group approval and available funds
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Interest rates are set by your group's policies
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Guarantors will be notified and must approve
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Late payments may incur additional charges
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
