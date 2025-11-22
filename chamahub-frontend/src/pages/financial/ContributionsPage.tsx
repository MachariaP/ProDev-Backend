import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, DollarSign, CheckCircle, AlertCircle, XCircle, 
  Download, Filter, Search, TrendingUp, Users, Calendar, Eye, MoreHorizontal,
  Sparkles, Crown, Zap, BarChart3, RefreshCw, Clock, User, CreditCard,
  Shield, Target, PiggyBank, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

// Simple card components as fallback
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Mock service since we don't have the actual service
const financeService = {
  getContributions: async () => ({
    results: [
      {
        id: 1,
        member: 'Jane Doe',
        amount: 15000,
        status: 'COMPLETED',
        payment_method: 'M-Pesa',
        reference_number: 'MP123456789',
        date: '2024-01-15',
        timestamp: '2 hours ago'
      },
      {
        id: 2,
        member: 'John Smith',
        amount: 20000,
        status: 'PENDING',
        payment_method: 'Bank Transfer',
        reference_number: 'BT987654321',
        date: '2024-01-15',
        timestamp: '5 hours ago'
      },
      {
        id: 3,
        member: 'Mary Johnson',
        amount: 12000,
        status: 'RECONCILED',
        payment_method: 'M-Pesa',
        reference_number: 'MP456789123',
        date: '2024-01-14',
        timestamp: '1 day ago'
      },
      {
        id: 4,
        member: 'Peter Brown',
        amount: 18000,
        status: 'FAILED',
        payment_method: 'Cash',
        reference_number: null,
        date: '2024-01-14',
        timestamp: '1 day ago'
      },
      {
        id: 5,
        member: 'Sarah Wilson',
        amount: 22000,
        status: 'COMPLETED',
        payment_method: 'M-Pesa',
        reference_number: 'MP789123456',
        date: '2024-01-13',
        timestamp: '2 days ago'
      }
    ]
  })
};

// Mock API
const api = {
  post: async (url: string) => {
    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// Floating Background Elements
const FloatingElement = ({ children, delay = 0 }) => (
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

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    RECONCILED: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-200',
      bgColor: 'bg-green-50',
      label: 'Reconciled'
    },
    COMPLETED: {
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      bgColor: 'bg-emerald-50',
      label: 'Completed'
    },
    PENDING: {
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      bgColor: 'bg-yellow-50',
      label: 'Pending'
    },
    FAILED: {
      icon: XCircle,
      color: 'bg-red-100 text-red-700 border-red-200',
      bgColor: 'bg-red-50',
      label: 'Failed'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${config.color} ${config.bgColor}`}>
      <IconComponent className="h-3 w-3" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

export function ContributionsPage() {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => { 
    fetchContributions(); 
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await financeService.getContributions();
      setContributions(response.results || []);
    } catch (err) { 
      console.error(err);
      // Fallback to mock data
      setContributions(financeService.getContributions().then(res => res.results));
    } finally { 
      setLoading(false); 
    }
  };

  const handleReconcile = async (id: number) => {
    setReconciling(id);
    try {
      await api.post(`/finance/contributions/${id}/reconcile/`);
      await fetchContributions();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setReconciling(null); 
    }
  };

  // Filter contributions based on search and status
  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = contribution.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || contribution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Realistic mock stats
  const stats = { 
    total: 2_850_000, 
    monthly: 485_000, 
    pending: 3, 
    members: 28,
    growth: '+18%'
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
            <Sparkles className="h-12 w-12 text-green-600" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading contributions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ x: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/finance')} 
              className="group flex items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Finance</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                Contributions
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <Calendar className="h-5 w-5" />
                Track and manage member contributions
              </motion.p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-green-300"
            >
              <Download className="h-4 w-4" />
              Export Report
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contributions/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
            >
              <Plus className="h-5 w-5" />
              New Contribution
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatedStatCard 
            title="Total Contributions" 
            value={`KES ${stats.total.toLocaleString()}`} 
            change={stats.growth}
            color="text-green-600"
            delay={0}
            icon={DollarSign}
            description="All-time total contributions"
          />
          <AnimatedStatCard 
            title="This Month" 
            value={`KES ${stats.monthly.toLocaleString()}`} 
            change="+12%"
            color="text-blue-600"
            delay={0.1}
            icon={TrendingUp}
            description="Current month's contributions"
          />
          <AnimatedStatCard 
            title="Pending" 
            value={stats.pending.toString()} 
            change="Urgent"
            color="text-orange-600"
            delay={0.2}
            icon={AlertCircle}
            description="Requires attention"
          />
          <AnimatedStatCard 
            title="Active Members" 
            value={stats.members.toString()} 
            change="+2"
            color="text-purple-600"
            delay={0.3}
            icon={Users}
            description="Contributing members"
          />
        </motion.div>

        {/* Enhanced Contributions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {filteredContributions.length === 0 ? (
            <Card className="shadow-2xl text-center py-20 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-6 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 w-fit mx-auto mb-6"
                >
                  <DollarSign className="h-16 w-16 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Contributions Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'ALL' 
                    ? 'No contributions match your current filters. Try adjusting your search criteria.'
                    : 'Start recording member contributions to track your group\'s financial growth.'
                  }
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/contributions/new')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30"
                >
                  Record First Contribution
                </motion.button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-2xl overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Recent Contributions</CardTitle>
                    <CardDescription className="text-gray-600">
                      All member payments and their current status
                    </CardDescription>
                  </div>
                  
                  {/* Enhanced Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        placeholder="Search contributions..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white/50 w-full"
                      />
                    </div>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white/50"
                    >
                      <option value="ALL">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="RECONCILED">Reconciled</option>
                      <option value="FAILED">Failed</option>
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchContributions}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white/50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </motion.button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {filteredContributions.map((contribution, index) => (
                      <motion.div
                        key={contribution.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                        className="p-6 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg"
                            >
                              <DollarSign className="h-7 w-7 text-green-600" />
                            </motion.div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <p className="font-semibold text-lg text-gray-800">{contribution.member}</p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  <span>{contribution.payment_method}</span>
                                </div>
                                {contribution.reference_number && (
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    <span>Ref: {contribution.reference_number}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{contribution.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-bold text-2xl text-green-600">
                                KES {Number(contribution.amount).toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 mt-2 justify-end">
                                <StatusBadge status={contribution.status} />
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <motion.div 
                              initial={{ opacity: 0, x: 10 }}
                              whileHover={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              {contribution.status === 'COMPLETED' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleReconcile(contribution.id)}
                                  disabled={reconciling === contribution.id}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                                >
                                  {reconciling === contribution.id ? (
                                    <div className="flex items-center gap-2">
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                      Reconciling...
                                    </div>
                                  ) : (
                                    'Reconcile'
                                  )}
                                </motion.button>
                              )}
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                              >
                                <Eye className="h-4 w-4 text-gray-600" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                              </motion.button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}