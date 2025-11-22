import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/StatsCard';
import api from '../../services/api';

interface GroupDetail {
  id: number;
  name: string;
  description: string;
  member_count: number;
  total_contributions: number;
  total_loans: number;
  balance: number;
  created_at: string;
  contribution_frequency: string;
  contribution_amount: number;
  is_active: boolean;
}

interface Member {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  role: string;
  joined_at: string;
  total_contributions: number;
  is_active: boolean;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  user_name: string;
}

interface GroupGoal {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: string;
  progress_percentage?: number;
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<GroupGoal[]>([]);
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
      let membersList: Member[] = [];
      try {
        const membersRes = await api.get(`/groups/memberships/?group=${id}`);
        const membersData = membersRes.data.results || membersRes.data;
        membersList = Array.isArray(membersData) ? membersData : [];
        dashboardData.member_count = membersList.length;
        
        // Calculate total contributions from members
        dashboardData.total_contributions = membersList.reduce(
          (sum: number, m: Member) => sum + Number(m.total_contributions || 0), 
          0
        );
      } catch (err) {
        console.error('Failed to fetch members:', err);
      }
      
      // Fetch transactions
      let transactionsList: Transaction[] = [];
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
          const goalsWithProgress = goalsData.map((goal: GroupGoal) => ({
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="p-8 max-w-md">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold">{error || 'Group not found'}</p>
            <button
              onClick={() => navigate('/groups')}
              className="mt-4 text-primary hover:underline"
            >
              ← Back to Groups
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/groups/${id}/members`)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Manage Members
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/groups/${id}/settings`)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Members"
            value={group.member_count}
            icon={Users}
            iconClassName="bg-blue-100 text-blue-600"
          />
          <StatsCard
            title="Total Contributions"
            value={`KES ${group.total_contributions.toLocaleString()}`}
            icon={Wallet}
            iconClassName="bg-green-100 text-green-600"
          />
          <StatsCard
            title="Active Loans"
            value={`KES ${group.total_loans.toLocaleString()}`}
            icon={DollarSign}
            iconClassName="bg-orange-100 text-orange-600"
          />
          <StatsCard
            title="Current Balance"
            value={`KES ${group.balance.toLocaleString()}`}
            icon={TrendingUp}
            iconClassName="bg-purple-100 text-purple-600"
          />
        </motion.div>

        {/* Group Info Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Activity className="h-6 w-6 text-primary" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Contribution Frequency</p>
                  <p className="text-lg font-semibold capitalize">
                    {group.contribution_frequency.toLowerCase()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Minimum Contribution</p>
                  <p className="text-lg font-semibold">
                    KES {group.contribution_amount.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Group Status</p>
                  <p className={`text-lg font-semibold ${group.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {group.is_active ? '🟢 Active' : '🔴 Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Members
                </CardTitle>
                <CardDescription>
                  {members.length} active members in this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.slice(0, 8).map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.user.first_name} {member.user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          KES {member.total_contributions.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total contributed</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {members.length > 8 && (
                  <button
                    onClick={() => navigate(`/groups/${id}/members`)}
                    className="mt-4 w-full text-center text-primary hover:underline"
                  >
                    View all {members.length} members →
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest group transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {transaction.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.user_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          KES {transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/transactions')}
                  className="mt-4 w-full text-center text-primary hover:underline text-sm"
                >
                  View all transactions →
                </button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/contributions')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-left"
                >
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="font-medium">Make Contribution</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/loans')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-left"
                >
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-medium">Request Loan</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/reports')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-left"
                >
                  <PieChart className="h-5 w-5 text-primary" />
                  <span className="font-medium">View Reports</span>
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Group Goals Section */}
        {goals.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="h-6 w-6 text-primary" />
                  Group Goals
                </CardTitle>
                <CardDescription>Track progress towards financial objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-border"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            {goal.title}
                            {goal.status === 'ACHIEVED' && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Target Date</p>
                          <p className="text-sm font-semibold flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            {(goal.progress_percentage ?? 0).toFixed(1)}%
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress_percentage ?? 0}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              goal.status === 'ACHIEVED'
                                ? 'bg-green-600'
                                : (goal.progress_percentage ?? 0) >= 75
                                ? 'bg-blue-600'
                                : (goal.progress_percentage ?? 0) >= 50
                                ? 'bg-yellow-600'
                                : 'bg-orange-600'
                            }`}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Amount</p>
                            <p className="text-lg font-bold text-primary">
                              KES {Number(goal.current_amount).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Target Amount</p>
                            <p className="text-lg font-bold">
                              KES {Number(goal.target_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
