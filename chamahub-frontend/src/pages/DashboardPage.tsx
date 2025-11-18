import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Users,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  UserCircle,
  LogOut,
  LayoutDashboard,
  Vote,
} from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from 'react';

// Sample data for charts
const contributionData = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 },
  { month: 'May', amount: 58000 },
  { month: 'Jun', amount: 70000 },
];

const activityData = [
  { name: 'Mon', contributions: 12, loans: 3 },
  { name: 'Tue', contributions: 15, loans: 5 },
  { name: 'Wed', contributions: 8, loans: 2 },
  { name: 'Thu', contributions: 20, loans: 7 },
  { name: 'Fri', contributions: 18, loans: 4 },
  { name: 'Sat', contributions: 10, loans: 1 },
  { name: 'Sun', contributions: 5, loans: 0 },
];

const recentTransactions = [
  { id: 1, member: 'Jane Doe', type: 'Contribution', amount: 5000, time: '2 hours ago', isPositive: true },
  { id: 2, member: 'John Smith', type: 'Loan Disbursed', amount: 50000, time: '3 hours ago', isPositive: false },
  { id: 3, member: 'Mary Johnson', type: 'Contribution', amount: 3000, time: '5 hours ago', isPositive: true },
  { id: 4, member: 'Peter Brown', type: 'Loan Repayment', amount: 10000, time: '1 day ago', isPositive: true },
  { id: 5, member: 'Sarah Wilson', type: 'Contribution', amount: 5000, time: '1 day ago', isPositive: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100
    }
  }
};

export function DashboardPage() {
  const navigate = useNavigate();

  // Get user from localStorage (common pattern after login)
  const [user] = useState<{ full_name?: string }>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return {};
      }
    }
    return {};
  });

  const userName = user?.full_name || 'Member';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user'); // Optional: clear user data
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header with Navigation */}
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, <span className="font-medium text-foreground">{userName}</span>! Here's what's happening with your Chama.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/groups')}
            className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left shadow-sm hover:shadow-md"
          >
            <Users className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold text-lg">My Groups</h3>
            <p className="text-sm text-muted-foreground">View and manage your groups</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/finance')}
            className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left shadow-sm hover:shadow-md"
          >
            <LayoutDashboard className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg">Finance</h3>
            <p className="text-sm text-muted-foreground">Contributions & Loans</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/voting')}
            className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left shadow-sm hover:shadow-md"
          >
            <Vote className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="font-semibold text-lg">Governance</h3>
            <p className="text-sm text-muted-foreground">Votes & Documents</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/investments')}
            className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left shadow-sm hover:shadow-md"
          >
            <TrendingUp className="h-10 w-10 text-orange-600 mb-3" />
            <h3 className="font-semibold text-lg">Investments</h3>
            <p className="text-sm text-muted-foreground">Portfolio & Returns</p>
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard
            title="Total Balance"
            value="KES 1,234,567"
            icon={Wallet}
            trend={{ value: 12.5, isPositive: true }}
            iconClassName="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Total Members"
            value="45"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
            iconClassName="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Active Loans"
            value="12"
            icon={TrendingUp}
            trend={{ value: 3.1, isPositive: false }}
            iconClassName="bg-orange-100 text-orange-600"
          />
          <StatsCard
            title="Investments"
            value="KES 890,000"
            icon={PiggyBank}
            trend={{ value: 15.8, isPositive: true }}
            iconClassName="bg-purple-100 text-purple-600"
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contribution Trend */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Contribution Trend (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={contributionData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-sm" />
                    <YAxis className="text-sm" tickFormatter={(value) => `KES ${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(142 76% 36%)"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="contributions" fill="hsl(142 76% 36%)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="loans" fill="hsl(217.2 91.2% 59.8%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${
                          transaction.isPositive ? 'bg-green-100' : 'bg-orange-100'
                        }`}
                      >
                        {transaction.isPositive ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.member}</p>
                        <p className="text-sm text-muted-foreground">{transaction.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${transaction.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                        {transaction.isPositive ? '+' : '-'}KES {transaction.amount.toLocaleString('en-KE')}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}