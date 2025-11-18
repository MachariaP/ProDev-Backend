import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Receipt,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { financeService } from '../services/apiService';
import type { Expense } from '../types/api';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    totalAmount: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await financeService.getExpenses();
      setExpenses(response.results);
      
      // Calculate stats
      const total = response.results.length;
      const pending = response.results.filter(e => e.status === 'PENDING').length;
      const approved = response.results.filter(e => e.status === 'APPROVED').length;
      const paid = response.results.filter(e => e.status === 'PAID').length;
      const totalAmount = response.results.reduce((sum, e) => sum + Number(e.amount), 0);
      
      setStats({ total, pending, approved, paid, totalAmount });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'APPROVED':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'OPERATIONAL':
        return '🔧';
      case 'MEETING':
        return '👥';
      case 'WELFARE':
        return '❤️';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Expenses
              </h1>
              <p className="text-muted-foreground mt-2">Track and manage group expenses</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Request Expense
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold text-purple-600">
                    KES {stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <Card className="shadow-2xl">
            <CardContent className="py-16 text-center">
              <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Expenses Yet</h3>
              <p className="text-muted-foreground mb-4">Request your first expense</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExpenseForm(true)}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Request Expense
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>View and manage expense requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-100 text-2xl">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {expense.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {expense.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-purple-600">
                          KES {Number(expense.amount).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(expense.status)}
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <span>Requested by: Member #{expense.requested_by}</span>
                        <span>•</span>
                        <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                      </div>
                      {expense.approved_by && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Approved by: Member #{expense.approved_by}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Expense Request Modal - Placeholder */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background p-8 rounded-lg shadow-2xl max-w-2xl w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4">Request Expense</h2>
            <p className="text-muted-foreground mb-4">Expense request form coming soon...</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExpenseForm(false)}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              Close
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
