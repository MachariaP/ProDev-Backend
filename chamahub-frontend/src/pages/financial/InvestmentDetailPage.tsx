import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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

const investmentTypeColors: Record<string, string> = {
  TREASURY_BILL: 'from-blue-500 to-blue-600',
  TREASURY_BILLS: 'from-blue-500 to-blue-600',
  MONEY_MARKET: 'from-green-500 to-green-600',
  STOCKS: 'from-purple-500 to-purple-600',
  BONDS: 'from-indigo-500 to-indigo-600',
  REAL_ESTATE: 'from-orange-500 to-orange-600',
  FIXED_DEPOSIT: 'from-teal-500 to-teal-600',
  OTHER: 'from-gray-500 to-gray-600',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  MATURED: 'bg-blue-100 text-blue-700',
  SOLD: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ElementType> = {
  ACTIVE: CheckCircle,
  MATURED: CheckCircle,
  SOLD: CheckCircle,
  CANCELLED: XCircle,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <button
            onClick={() => navigate('/investments')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Investments
          </button>
          <Card className="shadow-2xl">
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Investment</h3>
              <p className="text-muted-foreground">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/investments')}
                className="mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Return to Investments
              </motion.button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const Icon = investmentTypeIcons[investment.investment_type] || FileText;
  const StatusIcon = statusIcons[investment.status] || CheckCircle;
  const gradient = investmentTypeColors[investment.investment_type] || 'from-gray-500 to-gray-600';
  const roi = calculateROI();
  const profitLoss = calculateProfitLoss();
  const daysToMaturity = calculateDaysToMaturity();

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
              onClick={() => navigate('/investments')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Investment Details
              </h1>
              <p className="text-muted-foreground mt-2">Complete overview of your investment</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Overview */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{investment.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {investment.investment_type.replace(/_/g, ' ')}
                      </CardDescription>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statusColors[investment.status]}`}>
                    <StatusIcon className="h-4 w-4" />
                    {investment.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                  <p className="text-foreground">{investment.description || 'No description provided'}</p>
                </div>
                {investment.group_name && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Group</h4>
                    <p className="text-foreground">{investment.group_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Principal Amount</p>
                    <p className="text-2xl font-bold text-foreground">
                      KES {parseFloat(investment.principal_amount || investment.amount_invested).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      KES {parseFloat(investment.current_value || '0').toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-muted-foreground mb-1">Expected Return</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">{investment.expected_return_rate || investment.expected_return}%</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border ${profitLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-sm text-muted-foreground mb-1">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitLoss >= 0 ? '+' : ''}KES {Math.abs(profitLoss).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-muted-foreground mb-1">Return on Investment (ROI)</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-6 w-6 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <p className={`text-3xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline & Additional Info */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Investment Date</p>
                  <p className="font-semibold text-foreground">
                    {new Date(investment.purchase_date || investment.investment_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {investment.maturity_date && (
                  <>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-muted-foreground mb-1">Maturity Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(investment.maturity_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {daysToMaturity !== null && daysToMaturity > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Days to Maturity</p>
                        <p className="text-2xl font-bold text-green-600">{daysToMaturity} days</p>
                      </div>
                    )}
                    {daysToMaturity !== null && daysToMaturity <= 0 && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="font-semibold text-orange-600">Matured</p>
                      </div>
                    )}
                  </>
                )}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="font-semibold text-foreground">
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
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {investment.created_by_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created By</p>
                    <p className="font-semibold text-foreground">{investment.created_by_name}</p>
                  </div>
                )}
                {investment.returns !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Returns</p>
                    <p className="font-semibold text-green-600">
                      KES {investment.returns.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm text-foreground">
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}
