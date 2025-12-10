// chamahub-frontend/src/pages/financial/TransactionDetailsPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  Eye,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

interface TransactionDetails {
  id: number;
  type: 'contribution' | 'loan' | 'expense' | 'investment' | 'withdrawal';
  category: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
  group_name: string;
  user_name: string;
  status: 'completed' | 'pending' | 'failed';
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}

export function TransactionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get transaction from multiple endpoints
      try {
        // First try the specific transaction endpoint
        const response = await api.get(`/finance/transactions/${id}/`);
        setTransaction(response.data);
      } catch (apiError) {
        console.log('Specific transaction endpoint failed, trying fallback...');
        
        // Fallback: fetch from list and filter
        const response = await api.get('/finance/transactions/', {
          params: { page_size: 50 }
        });
        const transactions = response.data.results || response.data;
        const foundTransaction = transactions.find((t: TransactionDetails) => t.id.toString() === id);
        
        if (foundTransaction) {
          setTransaction(foundTransaction);
        } else {
          throw new Error('Transaction not found in list');
        }
      }
    } catch (err: any) {
      console.error('Failed to load transaction details:', err);
      setError(err?.response?.data?.detail || 'Failed to load transaction details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getTransactionIcon = (type: string) => {
    return ['contribution', 'investment'].includes(type) ? TrendingUp : TrendingDown;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Transaction Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested transaction could not be found.'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/transactions')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold"
          >
            Back to Transactions
          </motion.button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(transaction.status).icon;
  const statusConfig = getStatusIcon(transaction.status);
  const TransactionIcon = getTransactionIcon(transaction.type);
  const transactionColor = getTransactionColor(transaction.type);
  const transactionBg = getTransactionBg(transaction.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium hidden md:inline">Back to Transactions</span>
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Transaction Details</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(transaction.created_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Transaction Summary */}
          <Card className="md:col-span-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Transaction Summary</CardTitle>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusConfig.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                  <span className={`font-semibold capitalize ${statusConfig.color}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Icon & Amount */}
              <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${transactionBg}`}>
                    <TransactionIcon className={`h-8 w-8 ${transactionColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaction Type</p>
                    <p className="text-xl font-bold text-gray-800 capitalize">{transaction.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Amount</p>
                  <p className={`text-3xl font-black ${transactionColor}`}>
                    {['contribution', 'investment'].includes(transaction.type) ? '+' : '-'}
                    KES {transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Member Details
                  </h3>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-600">Member Name</p>
                    <p className="font-semibold text-gray-800">{transaction.user_name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Group Details
                  </h3>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-600">Group Name</p>
                    <p className="font-semibold text-gray-800">{transaction.group_name}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </h3>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-gray-800">{transaction.description}</p>
                </div>
              </div>

              {/* Additional Details */}
              {transaction.payment_method && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </h3>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-semibold text-gray-800">{transaction.payment_method}</p>
                      </div>
                      {transaction.reference_number && (
                        <div>
                          <p className="text-sm text-gray-600">Reference Number</p>
                          <p className="font-semibold text-gray-800">{transaction.reference_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Balance Info */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Balance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Balance After Transaction</p>
                  <p className="text-2xl font-black text-blue-700">
                    KES {transaction.balance_after.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  <Share2 className="h-4 w-4" />
                  Share Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-300 text-gray-700 font-semibold"
                >
                  <Eye className="h-4 w-4" />
                  View Full Report
                </motion.button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-gray-800">{transaction.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="text-gray-800">
                      {new Date(transaction.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
