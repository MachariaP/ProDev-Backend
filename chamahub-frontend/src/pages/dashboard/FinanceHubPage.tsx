import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  CheckCircle,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  MoreHorizontal,
  Eye,
  Download,
  Target,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
  Crown,
  BarChart3,
  PiggyBank,
  Shield,
  Rocket,
} from 'lucide-react';

// Simple card components as fallback
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// --- Enhanced Progress Bar with better visuals ---
const FundProgress = ({ percentage }: { percentage: number }) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  const getColorClass = (percent: number) => {
    if (percent > 85) return 'from-red-500 to-pink-600';
    if (percent > 65) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-600';
  };

  const colorClass = getColorClass(normalizedPercentage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 pt-6 border-t border-white/20"
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm font-medium opacity-90">Funds Utilization</p>
          <p className="text-2xl font-bold mt-1">{normalizedPercentage}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Available Cash</p>
          <p className="text-lg font-semibold mt-1">KES 432,098</p>
        </div>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${normalizedPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className={`h-3 rounded-full bg-gradient-to-r ${colorClass} shadow-lg`}
        />
      </div>
      <div className="flex justify-between text-xs opacity-75">
        <span>Low Risk</span>
        <span>Optimal</span>
        <span>High Risk</span>
      </div>
    </motion.div>
  );
};

// Floating Background Elements
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -15, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

// Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  change, 
  color, 
  delay = 0, 
  icon: Icon,
  description 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  color: string; 
  delay?: number;
  icon: any;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="relative group"
  >
    <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 backdrop-blur-sm bg-white/70 border-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          {change && (
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
              change.startsWith('+') 
                ? 'bg-green-100 text-green-700' 
                : change === 'Urgent'
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {change}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export function FinanceHubPage() {
  const navigate = useNavigate();

  const financeModules = [
    {
      title: 'Contributions',
      description: 'Track and manage member contributions',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-50',
      borderColor: 'border-green-200',
      gradient: 'from-green-500 to-emerald-600',
      path: '/contributions',
      stats: 'KES 145K',
      trend: '+12%',
      badge: null,
    },
    {
      title: 'Loans',
      description: 'Manage loans, applications, and repayments',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-50',
      borderColor: 'border-blue-200',
      gradient: 'from-blue-500 to-cyan-600',
      path: '/loans',
      stats: '12 Active',
      trend: '-2%',
      badge: null,
    },
    {
      title: 'Expenses',
      description: 'Track and approve group expenses',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-violet-50',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-500 to-violet-600',
      path: '/expenses',
      stats: 'KES 35K',
      trend: '+8%',
      badge: null,
    },
    {
      title: 'Approvals',
      description: 'Review multi-signature approval requests',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-100 to-amber-50',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-500 to-amber-600',
      path: '/approvals',
      stats: '5 Pending',
      trend: 'Urgent',
      badge: '5',
    },
  ];

  // Mock data for recent activity
  const recentActivities = [
    { 
      id: 1, 
      type: 'Contribution', 
      amount: 50000, 
      user: 'Jane Doe', 
      icon: ArrowUpRight, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100', 
      date: '2 hours ago', 
      status: 'completed' 
    },
    { 
      id: 2, 
      type: 'Loan Repayment', 
      amount: 12000, 
      user: 'John Smith', 
      icon: ArrowDownLeft, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100', 
      date: 'Yesterday', 
      status: 'completed' 
    },
    { 
      id: 3, 
      type: 'Expense Approval', 
      amount: 35000, 
      user: 'Admin', 
      icon: CheckCircle, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100', 
      date: '2 days ago', 
      status: 'pending' 
    },
    { 
      id: 4, 
      type: 'Loan Disbursement', 
      amount: 150000, 
      user: 'Finance Team', 
      icon: TrendingUp, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100', 
      date: '3 days ago', 
      status: 'completed' 
    },
  ];

  // Mock data for financial insights
  const financialInsights = [
    {
      title: 'Savings Growth',
      value: '+18%',
      description: 'Compared to last month',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Loan Recovery',
      value: '92%',
      description: 'On-time repayment rate',
      color: 'text-blue-300',
      icon: Shield,
    },
    {
      title: 'Member Participation',
      value: '89%',
      description: 'Active contributors this month',
      color: 'text-purple-300',
      icon: Users,
    },
    {
      title: 'Fund Growth',
      value: 'KES 245K',
      description: 'Monthly increase',
      color: 'text-yellow-300',
      icon: Rocket,
    },
  ];

  // Mock data for progress visualization
  const fundUtilizationPercent = 65;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200 to-violet-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4"
        >
          <div className='flex items-center gap-4'>
            <motion.button
              whileHover={{ x: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200 p-3 rounded-2xl hover:bg-white hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              >
                Finance Hub
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <Calendar className="h-5 w-5" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </motion.p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300"
            >
              <Download className="h-4 w-4" />
              Export Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contributions')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              New Transaction
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Group Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white transform hover:scale-[1.005] transition-transform duration-500 overflow-hidden border-none relative">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24"></div>
            
            <CardContent className="p-8 relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3 mb-3">
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
                    >
                      <Crown className="h-6 w-6 text-yellow-300" />
                    </motion.div>
                    <p className="text-sm opacity-90 font-medium flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Total Group Balance
                    </p>
                  </div>
                  <p className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    KES 1,234,567
                  </p>
                  <p className="text-sm opacity-75 mt-4 flex items-center gap-3">
                    <Target className="h-4 w-4" />
                    <span>Monthly target: KES 200,000 • </span>
                    <span className="text-green-300 font-semibold">82% achieved</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              <FundProgress percentage={fundUtilizationPercent} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Quick Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatedStatCard 
            title="Monthly Contributions" 
            value="KES 145K" 
            change="+12%" 
            color="text-green-600"
            delay={0}
            icon={DollarSign}
            description="This month's total contributions"
          />
          <AnimatedStatCard 
            title="Active Loans" 
            value="12" 
            change="-2%" 
            color="text-blue-600"
            delay={0.1}
            icon={TrendingUp}
            description="Currently active loans"
          />
          <AnimatedStatCard 
            title="Pending Approvals" 
            value="5" 
            change="Urgent" 
            color="text-orange-600"
            delay={0.2}
            icon={AlertCircle}
            description="Requires immediate attention"
          />
          <AnimatedStatCard 
            title="Total Members" 
            value="24" 
            change="+2" 
            color="text-purple-600"
            delay={0.3}
            icon={Users}
            description="Active group members"
          />
        </motion.div>

        {/* Enhanced Finance Modules Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {financeModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <button
                onClick={() => navigate(module.path)}
                className="w-full text-left focus:outline-none block group"
              >
                <Card className={`h-full shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 ${module.borderColor} overflow-hidden relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-6 relative z-10">
                    {module.badge && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse"
                      >
                        {module.badge}
                      </motion.span>
                    )}
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-3 rounded-2xl ${module.bgColor} w-fit mb-4 transition-transform duration-300`}
                    >
                      <module.icon className={`h-7 w-7 ${module.color}`} />
                    </motion.div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{module.stats}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        module.trend === 'Urgent' 
                          ? 'text-red-500 bg-red-50'
                          : module.trend.startsWith('+')
                          ? 'text-green-500 bg-green-50'
                          : 'text-blue-500 bg-blue-50'
                      }`}>
                        {module.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Activity & Insights Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-gray-800">Recent Activity</h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>
              <div className="space-y-4">
                <AnimatePresence>
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100"
                    >
                      <div className="flex items-center">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`p-3 rounded-xl ${activity.bgColor} mr-4 transition-transform`}
                        >
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-gray-800">{activity.type}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {activity.user}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          activity.type.includes('Contribution') || activity.type.includes('Repayment')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          KES {activity.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-gray-400">{activity.date}</span>
                          {activity.status === 'pending' && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Pending
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Financial Insights */}
          <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                </motion.div>
                <h3 className="font-bold text-xl">Financial Insights</h3>
              </div>
              <div className="space-y-4">
                {financialInsights.map((insight, index) => (
                  <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-200">{insight.title}</p>
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <p className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {insight.value}
                    </p>
                    <p className="text-sm opacity-75">{insight.description}</p>
                  </motion.div>
                ))}
              </div>
              
              {/* Quick Action Buttons */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="mt-6 pt-6 border-t border-white/20"
              >
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Reports
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium"
                  >
                    <PiggyBank className="h-4 w-4 inline mr-2" />
                    Savings
                  </motion.button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}