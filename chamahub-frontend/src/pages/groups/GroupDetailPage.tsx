import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  Wallet,
  TrendingUp,
  Settings,
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  Activity,
  Target,
  PieChart,
  Calendar,
  CheckCircle2,
  Sparkles,
  Crown,
  Zap,
  BarChart3,
  Shield,
  PiggyBank,
  ArrowUpRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Simple card components as fallback
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Mock API service
const api = {
  get: async (url: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on endpoint
    if (url.includes('/groups/chama-groups/')) {
      return {
        data: {
          id: 1,
          name: 'Savings Collective',
          description: 'A community-driven savings group focused on financial growth and mutual support',
          objectives: 'To achieve collective financial stability and growth through regular contributions',
          total_balance: 2450000,
          created_at: '2023-06-15',
          contribution_frequency: 'MONTHLY',
          minimum_contribution: 5000,
          is_active: true
        }
      };
    }
    
    if (url.includes('/groups/memberships/')) {
      return {
        data: {
          results: [
            {
              id: 1,
              user: { id: 1, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
              role: 'ADMIN',
              joined_at: '2023-06-15',
              total_contributions: 450000,
              is_active: true
            },
            {
              id: 2,
              user: { id: 2, first_name: 'John', last_name: 'Smith', email: 'john@example.com' },
              role: 'MEMBER',
              joined_at: '2023-06-20',
              total_contributions: 380000,
              is_active: true
            },
            {
              id: 3,
              user: { id: 3, first_name: 'Mary', last_name: 'Johnson', email: 'mary@example.com' },
              role: 'MEMBER',
              joined_at: '2023-07-01',
              total_contributions: 320000,
              is_active: true
            },
            {
              id: 4,
              user: { id: 4, first_name: 'Peter', last_name: 'Brown', email: 'peter@example.com' },
              role: 'MEMBER',
              joined_at: '2023-07-15',
              total_contributions: 280000,
              is_active: true
            },
            {
              id: 5,
              user: { id: 5, first_name: 'Sarah', last_name: 'Wilson', email: 'sarah@example.com' },
              role: 'MEMBER',
              joined_at: '2023-08-01',
              total_contributions: 250000,
              is_active: true
            }
          ]
        }
      };
    }
    
    if (url.includes('/finance/transactions/')) {
      return {
        data: {
          results: [
            {
              id: 1,
              type: 'CONTRIBUTION',
              amount: 15000,
              description: 'Monthly contribution',
              created_at: '2024-01-15T10:30:00Z',
              user_name: 'Jane Doe',
              status: 'COMPLETED'
            },
            {
              id: 2,
              type: 'LOAN_DISBURSEMENT',
              amount: 50000,
              description: 'Business loan',
              created_at: '2024-01-14T14:20:00Z',
              user_name: 'John Smith',
              status: 'COMPLETED'
            },
            {
              id: 3,
              type: 'EXPENSE',
              amount: 25000,
              description: 'Office supplies',
              created_at: '2024-01-13T09:15:00Z',
              user_name: 'Admin',
              status: 'PENDING'
            },
            {
              id: 4,
              type: 'CONTRIBUTION',
              amount: 12000,
              description: 'Monthly contribution',
              created_at: '2024-01-12T16:45:00Z',
              user_name: 'Mary Johnson',
              status: 'COMPLETED'
            }
          ]
        }
      };
    }
    
    if (url.includes('/finance/loans/')) {
      return {
        data: {
          results: [
            { id: 1, amount: 150000, status: 'ACTIVE' },
            { id: 2, amount: 75000, status: 'ACTIVE' },
            { id: 3, amount: 200000, status: 'ACTIVE' }
          ]
        }
      };
    }
    
    if (url.includes('/groups/goals/')) {
      return {
        data: {
          results: [
            {
              id: 1,
              title: 'Emergency Fund',
              description: 'Build a safety net for group emergencies',
              target_amount: 1000000,
              current_amount: 750000,
              deadline: '2024-06-30',
              status: 'IN_PROGRESS'
            },
            {
              id: 2,
              title: 'Investment Pool',
              description: 'Create investment capital for group projects',
              target_amount: 2000000,
              current_amount: 1200000,
              deadline: '2024-12-31',
              status: 'IN_PROGRESS'
            },
            {
              id: 3,
              title: 'Community Project',
              description: 'Fund local community development initiative',
              target_amount: 500000,
              current_amount: 500000,
              deadline: '2023-12-31',
              status: 'ACHIEVED'
            }
          ]
        }
      };
    }
    
    return { data: {} };
  }
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
const StatsCard = ({ 
  title, 
  value, 
  change, 
  color, 
  delay = 0, 
  icon: Icon,
  description 
}: { 
  title: string; 
  value: string | number; 
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
    <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 backdrop-blur-sm bg-white/70 overflow-hidden">
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

// Progress Bar Component
const ProgressBar = ({ percentage, color = 'from-blue-500 to-cyan-600', delay = 0 }: { percentage: number; color?: string; delay?: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      className={`h-3 rounded-full bg-gradient-to-r ${color} shadow-lg`}
    />
  </div>
);

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch group details
      const groupRes = await api.get(`/groups/chama-groups/${id}/`);
      const groupData = groupRes.data;
      
      // Calculate stats from group data
      const dashboardData = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description || groupData.objectives,
        member_count: 0,
        total_contributions: 0,
        total_loans: 0,
        balance: Number(groupData.total_balance || 0),
        created_at: groupData.created_at,
        contribution_frequency: groupData.contribution_frequency,
        contribution_amount: Number(groupData.minimum_contribution || 0),
        is_active: groupData.is_active,
      };
      
      // Fetch members
      let membersList: any[] = [];
      try {
        const membersRes = await api.get(`/groups/memberships/?group=${id}`);
        const membersData = membersRes.data.results || membersRes.data;
        membersList = Array.isArray(membersData) ? membersData : [];
        dashboardData.member_count = membersList.length;
        
        // Calculate total contributions from members
        dashboardData.total_contributions = membersList.reduce(
          (sum: number, m: any) => sum + Number(m.total_contributions || 0), 
          0
        );
      } catch (err) {
        console.error('Failed to fetch members:', err);
      }
      
      // Fetch transactions
      let transactionsList: any[] = [];
      try {
        const transactionsRes = await api.get(`/finance/transactions/?group=${id}&limit=10`);
        const transData = transactionsRes.data.results || transactionsRes.data;
        transactionsList = Array.isArray(transData) ? transData : [];
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      }
      
      // Try to get loan data
      try {
        const loansRes = await api.get(`/finance/loans/?group=${id}&status=ACTIVE`);
        const loansData = loansRes.data.results || loansRes.data;
        if (Array.isArray(loansData)) {
          dashboardData.total_loans = loansData.reduce(
            (sum: number, loan: any) => sum + Number(loan.amount || 0),
            0
          );
        }
      } catch (err) {
        console.error('Failed to fetch loans:', err);
      }
      
      // Fetch group goals
      try {
        const goalsRes = await api.get(`/groups/goals/?group=${id}`);
        const goalsData = goalsRes.data.results || goalsRes.data;
        if (Array.isArray(goalsData)) {
          // Calculate progress percentage for each goal
          const goalsWithProgress = goalsData.map((goal: any) => ({
            ...goal,
            progress_percentage: goal.target_amount > 0 
              ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
              : 0
          }));
          setGoals(goalsWithProgress);
        }
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      }
      
      setGroup(dashboardData);
      setMembers(membersList);
      setTransactions(transactionsList);
    } catch (err) {
      setError('Failed to load group details');
      console.error('Group details error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
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
            <Sparkles className="h-12 w-12 text-blue-600" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading group details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <div className="text-red-600">
            <AlertCircle className="h-16 w-16 mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">{error || 'Group not found'}</p>
            <p className="text-gray-600 mb-6">We couldn't load the group details. Please try again.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/groups')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg"
            >
              ← Back to Groups
            </motion.button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/groups')}
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200 p-3 rounded-2xl hover:bg-white hover:shadow-lg mb-6 bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Groups</span>
          </motion.button>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative"
              >
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <Users className="h-10 w-10 text-white" />
                </div>
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
                  className="absolute -top-2 -right-2"
                >
                  <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3"
                >
                  {group.name}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-gray-600 max-w-2xl"
                >
                  {group.description}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 mt-4 text-sm text-gray-500"
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </div>
                  <div className={`flex items-center gap-1 ${group.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`h-2 w-2 rounded-full ${group.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    {group.is_active ? 'Active' : 'Inactive'}
                  </div>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/groups/${id}/members`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
              >
                <UserPlus className="h-5 w-5" />
                Manage Members
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/groups/${id}/settings`)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
              >
                <Settings className="h-5 w-5" />
                Settings
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard
            title="Total Members"
            value={group.member_count}
            change="+2"
            color="text-blue-600"
            delay={0}
            icon={Users}
            description="Active group members"
          />
          <StatsCard
            title="Total Contributions"
            value={`KES ${group.total_contributions.toLocaleString()}`}
            change="+18%"
            color="text-green-600"
            delay={0.1}
            icon={Wallet}
            description="All-time contributions"
          />
          <StatsCard
            title="Active Loans"
            value={`KES ${group.total_loans.toLocaleString()}`}
            change="-5%"
            color="text-orange-600"
            delay={0.2}
            icon={DollarSign}
            description="Currently active loans"
          />
          <StatsCard
            title="Current Balance"
            value={`KES ${group.balance.toLocaleString()}`}
            change="+12%"
            color="text-purple-600"
            delay={0.3}
            icon={TrendingUp}
            description="Available group funds"
          />
        </motion.div>

        {/* Enhanced Group Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Activity className="h-6 w-6 text-blue-600" />
                </motion.div>
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-4 rounded-2xl bg-white/50 backdrop-blur-sm">
                  <PiggyBank className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Contribution Frequency</p>
                  <p className="text-lg font-bold text-gray-800 capitalize">
                    {group.contribution_frequency.toLowerCase()}
                  </p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-white/50 backdrop-blur-sm">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Minimum Contribution</p>
                  <p className="text-lg font-bold text-gray-800">
                    KES {group.contribution_amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-white/50 backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">Group Status</p>
                  <p className={`text-lg font-bold ${group.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {group.is_active ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Members List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Users className="h-6 w-6 text-blue-600" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">Group Members</CardTitle>
                      <CardDescription className="text-gray-600">
                        {members.length} active members in this group
                      </CardDescription>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/groups/${id}/members`)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    View All
                  </motion.button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {members.slice(0, 5).map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-blue-50/50 transition-all group border border-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-lg"
                          >
                            <span className="font-bold text-blue-600 text-sm">
                              {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                            </span>
                          </motion.div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {member.user.first_name} {member.user.last_name}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                member.role === 'ADMIN' 
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {member.role}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            KES {member.total_contributions.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Total contributed</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {members.length > 5 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/groups/${id}/members`)}
                    className="mt-6 w-full text-center text-blue-600 hover:text-blue-700 font-semibold py-3 rounded-xl border border-dashed border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    View all {members.length} members → 
                  </motion.button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Recent Activity */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Activity className="h-6 w-6 text-purple-600" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-gray-800">Recent Activity</CardTitle>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/transactions')}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </motion.button>
                </div>
                <CardDescription className="text-gray-600">Latest group transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {transactions.slice(0, 4).map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/50 hover:bg-purple-50/50 transition-all group"
                      >
                        <div className={`p-2 rounded-xl ${
                          transaction.type === 'CONTRIBUTION' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'LOAN_DISBURSEMENT' ? 'bg-blue-100 text-blue-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {transaction.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {transaction.user_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            transaction.type === 'CONTRIBUTION' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'CONTRIBUTION' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    <Zap className="h-6 w-6 text-yellow-300" />
                  </motion.div>
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Wallet, label: 'Make Contribution', path: '/contributions', color: 'from-green-500 to-emerald-600' },
                  { icon: DollarSign, label: 'Request Loan', path: '/loans', color: 'from-blue-500 to-cyan-600' },
                  { icon: BarChart3, label: 'View Reports', path: '/reports', color: 'from-purple-500 to-pink-600' },
                  { icon: PieChart, label: 'Analytics', path: '/analytics', color: 'from-orange-500 to-amber-600' }
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(action.path)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Group Goals Section */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Target className="h-6 w-6 text-red-600" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">Group Goals</CardTitle>
                      <CardDescription className="text-gray-600">
                        Track progress towards financial objectives
                      </CardDescription>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </motion.button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {goals.map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                              {goal.title}
                              {goal.status === 'ACHIEVED' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </motion.div>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-bold text-gray-700">
                              {(goal.progress_percentage ?? 0).toFixed(1)}%
                            </span>
                          </div>
                          
                          <ProgressBar 
                            percentage={goal.progress_percentage ?? 0} 
                            color={
                              goal.status === 'ACHIEVED' ? 'from-green-500 to-emerald-600' :
                              (goal.progress_percentage ?? 0) >= 75 ? 'from-blue-500 to-cyan-600' :
                              (goal.progress_percentage ?? 0) >= 50 ? 'from-yellow-500 to-orange-500' :
                              'from-orange-500 to-red-600'
                            }
                            delay={index * 0.2}
                          />
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Current</p>
                              <p className="text-lg font-bold text-green-600">
                                KES {Number(goal.current_amount).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Target</p>
                              <p className="text-lg font-bold text-gray-800">
                                KES {Number(goal.target_amount).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar className="h-3 w-3" />
                              Due {new Date(goal.deadline).toLocaleDateString()}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.status === 'ACHIEVED' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {goal.status === 'ACHIEVED' ? 'Achieved' : 'In Progress'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}