import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { financeService } from '../services/apiService';
import type { Loan } from '../types/api';

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    defaulted: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await financeService.getLoans();
      setLoans(response.results);
      
      // Calculate stats
      const total = response.results.length;
      const active = response.results.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED').length;
      const completed = response.results.filter(l => l.status === 'COMPLETED').length;
      const defaulted = response.results.filter(l => l.status === 'DEFAULTED').length;
      
      setStats({ total, active, completed, defaulted });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ACTIVE':
      case 'DISBURSED':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'DEFAULTED':
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'ACTIVE':
      case 'DISBURSED':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING':
      case 'APPROVED':
        return 'bg-yellow-100 text-yellow-700';
      case 'DEFAULTED':
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateProgress = (loan: Loan) => {
    const totalPaid = loan.total_repaid || 0;
    const totalAmount = loan.amount || 0;
    return totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading loans...</p>
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
                Loans Management
              </h1>
              <p className="text-muted-foreground mt-2">Track loans, applications, and repayments</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLoanForm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Apply for Loan
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Defaulted</p>
                  <p className="text-2xl font-bold text-red-600">{stats.defaulted}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loans List */}
        {loans.length === 0 ? (
          <Card className="shadow-2xl">
            <CardContent className="py-16 text-center">
              <DollarSign className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Loans Yet</h3>
              <p className="text-muted-foreground mb-4">Apply for your first loan to get started</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLoanForm(true)}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Apply Now
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>All Loans</CardTitle>
              <CardDescription>View and manage loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loans.map((loan) => (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            KES {Number(loan.amount).toLocaleString()}
                          </h3>
                          <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(loan.status)}
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-semibold">{loan.interest_rate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold">{loan.duration_months} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Repaid</p>
                        <p className="font-semibold text-green-600">
                          KES {Number(loan.total_repaid || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(loan.status === 'ACTIVE' || loan.status === 'DISBURSED') && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Repayment Progress</span>
                          <span className="text-xs font-semibold">{calculateProgress(loan).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${calculateProgress(loan)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Loan Application Modal - Placeholder */}
      {showLoanForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background p-8 rounded-lg shadow-2xl max-w-2xl w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4">Apply for Loan</h2>
            <p className="text-muted-foreground mb-4">Loan application form coming soon...</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoanForm(false)}
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
