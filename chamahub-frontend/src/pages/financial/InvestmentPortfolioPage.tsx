import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Plus,
  Eye,


} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/StatsCard';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api';

interface Investment {
  id: number;
  type: string;
  name: string;
  amount: number;
  current_value: number;
  returns: number;
  roi_percentage: number;
  maturity_date: string;
  status: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function InvestmentPortfolioPage() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_invested: 0,
    current_value: 0,
    total_returns: 0,
    average_roi: 0,
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await api.get('/investments/portfolio/');
      const data = response.data.results || response.data.investments || [];
      setInvestments(data);

      // Calculate stats
      const totalInvested = data.reduce((sum: number, inv: Investment) => sum + inv.amount, 0);
      const currentValue = data.reduce((sum: number, inv: Investment) => sum + inv.current_value, 0);
      const totalReturns = data.reduce((sum: number, inv: Investment) => sum + inv.returns, 0);
      const avgROI = data.length > 0
        ? data.reduce((sum: number, inv: Investment) => sum + inv.roi_percentage, 0) / data.length
        : 0;

      setStats({
        total_invested: totalInvested,
        current_value: currentValue,
        total_returns: totalReturns,
        average_roi: avgROI,
      });
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const portfolioDistribution = investments.reduce((acc: Record<string, number>, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.current_value;
    return acc;
  }, {});

  const pieData = Object.entries(portfolioDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const performanceData = investments.slice(0, 6).map((inv) => ({
    name: inv.name.substring(0, 10),
    value: inv.current_value,
    returns: inv.returns,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/investments')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Investments
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Investment Portfolio</h1>
              <p className="text-muted-foreground">
                Track your treasury bills and investment returns
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/investments/new')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Investment
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Invested"
            value={`KES ${stats.total_invested.toLocaleString()}`}
            icon={DollarSign}
            iconClassName="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Current Value"
            value={`KES ${stats.current_value.toLocaleString()}`}
            icon={TrendingUp}
            iconClassName="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Total Returns"
            value={`KES ${stats.total_returns.toLocaleString()}`}
            icon={TrendingUp}
            trend={{
              value: stats.average_roi,
              isPositive: stats.average_roi > 0,
            }}
            iconClassName="bg-purple-100 text-purple-600"
          />
          <StatsCard
            title="Average ROI"
            value={`${stats.average_roi.toFixed(2)}%`}
            icon={PieChart}
            iconClassName="bg-orange-100 text-orange-600"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Portfolio Distribution
                </CardTitle>
                <CardDescription>Investment allocation by type</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `KES ${value.toLocaleString()}`}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            KES {item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No investments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Investments List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Investments</CardTitle>
                <CardDescription>
                  {investments.length} active investment(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investments.map((investment, index) => (
                    <motion.div
                      key={investment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{investment.name}</h4>
                          <p className="text-sm text-muted-foreground">{investment.type}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            investment.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : investment.status === 'matured'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {investment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="font-medium">
                            KES {investment.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Current Value</p>
                          <p className="font-medium">
                            KES {investment.current_value.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Returns</p>
                          <p className="font-medium text-green-600">
                            +KES {investment.returns.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="font-medium text-green-600">
                            +{investment.roi_percentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Matures: {new Date(investment.maturity_date).toLocaleDateString()}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/investments/${investment.id}`)}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {investments.length === 0 && (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start investing in treasury bills to grow your wealth
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/investments/new')}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Create Investment
                    </motion.button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Chart */}
        {investments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Investment growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="returns"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
