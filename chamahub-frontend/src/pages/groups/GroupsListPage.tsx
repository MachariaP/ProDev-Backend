// chamahub-frontend/src/pages/groups/GroupsListPage.tsx
import { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Sparkles,
  Crown,
  Target,
  BarChart3,
  PiggyBank,
  Shield,
  Zap,
  AlertCircle,
  Download,
  Filter,
  Search,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { groupsService } from '../../services/apiService';
import type { ChamaGroup } from '../../types/api';

// Create Groups Context
export const GroupsContext = createContext<{ groups: ChamaGroup[] }>({ groups: [] });

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

// Color configuration for stat cards
const statCardConfig = {
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  orange: {
    border: 'border-l-orange-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  green: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  }
};

// Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  change, 
  color = 'purple',
  delay = 0, 
  icon: Icon,
  description 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  color?: 'purple' | 'orange' | 'blue' | 'green';
  delay?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) => {
  const config = statCardConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <Card className={`shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 ${config.border} overflow-hidden`}>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-2xl ${config.iconBg}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
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
};

// Interface for QuickStat
interface QuickStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Group Insights Component with Real Data
const GroupInsights = ({ groups }: { groups: ChamaGroup[] }) => {
  const navigate = useNavigate();

  // Calculate insights from groups data
  const calculateInsights = () => {
    if (!groups || groups.length === 0) {
      return {
        mostActiveGroup: { name: 'No groups', balance: 0, id: null, type: null },
        growthRate: 0,
        memberEngagement: 0,
        totalGroups: 0,
        totalBalance: 0,
        activeGroups: 0,
        totalMembers: 0,
        averageContribution: 0,
      };
    }

    // Calculate most active group (by total balance)
    const mostActiveGroup = groups.reduce((max, group) => {
      const maxValue = Number(max.total_balance || 0);
      const currentValue = Number(group.total_balance || 0);
      return currentValue > maxValue ? group : max;
    }, groups[0]);

    // Calculate total statistics
    const totalBalance = groups.reduce((sum, group) => sum + Number(group.total_balance || 0), 0);
    const totalGroups = groups.length;
    const activeGroups = groups.filter(g => g.is_active).length;
    const totalMembers = groups.reduce((sum, group) => sum + (group.member_count || 0), 0);
    
    // Calculate growth rate (based on active vs total groups)
    const growthRate = Math.round((activeGroups / totalGroups) * 100);
    
    // Calculate member engagement (simplified: average members per group)
    const avgMembersPerGroup = totalMembers / totalGroups;
    const memberEngagement = Math.min(100, Math.round((avgMembersPerGroup / 20) * 100));

    // Calculate average contribution per group
    const averageContribution = totalGroups > 0 ? totalBalance / totalGroups : 0;

    return {
      mostActiveGroup: {
        name: mostActiveGroup.name,
        balance: mostActiveGroup.total_balance || 0,
        type: mostActiveGroup.group_type,
        id: mostActiveGroup.id,
      },
      growthRate,
      memberEngagement,
      totalGroups,
      totalBalance,
      activeGroups,
      totalMembers,
      averageContribution,
    };
  };

  const calculatedInsights = calculateInsights();

  const insightsData = [
    {
      title: 'Most Active Group',
      value: calculatedInsights.mostActiveGroup.name,
      description: `KES ${Number(calculatedInsights.mostActiveGroup.balance).toLocaleString()} total balance`,
      color: 'text-purple-300',
      icon: Crown,
      type: calculatedInsights.mostActiveGroup.type,
    },
    {
      title: 'Growth Rate',
      value: `+${calculatedInsights.growthRate}%`,
      description: 'Active groups rate',
      color: calculatedInsights.growthRate >= 50 ? 'text-green-300' : 'text-yellow-300',
      icon: TrendingUp,
      isPositive: calculatedInsights.growthRate >= 50,
    },
    {
      title: 'Member Engagement',
      value: `${calculatedInsights.memberEngagement}%`,
      description: 'Active participation',
      color: calculatedInsights.memberEngagement >= 80 ? 'text-blue-300' : 'text-orange-300',
      icon: Users,
    },
  ];

  const quickStats: QuickStat[] = [
    {
      title: 'Total Groups',
      value: calculatedInsights.totalGroups,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Active Groups',
      value: calculatedInsights.activeGroups,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Total Members',
      value: calculatedInsights.totalMembers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Avg. Contribution',
      value: `KES ${Math.round(calculatedInsights.averageContribution).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-500',
    },
  ];

  const handleAnalyticsClick = () => {
    if (calculatedInsights.totalGroups > 0) {
      navigate('/analytics/dashboard');
    }
  };

  const handleMembersClick = () => {
    if (calculatedInsights.mostActiveGroup.id) {
      navigate(`/groups/${calculatedInsights.mostActiveGroup.id}/members`);
    } else {
      navigate('/groups/create');
    }
  };

  const handleQuickStatClick = (stat: QuickStat) => {
    switch (stat.title) {
      case 'Total Groups':
        document.getElementById('groups-list')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'Active Groups':
        // This would filter groups in parent component
        // We'll pass a callback for this
        break;
      case 'Total Members':
        navigate('/members');
        break;
      case 'Avg. Contribution':
        navigate('/analytics/contributions');
        break;
      default:
        break;
    }
  };

  const exportInsights = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      insights: calculatedInsights,
      groups: groups.map(g => ({
        name: g.name,
        type: g.group_type,
        balance: g.total_balance,
        members: g.member_count,
        status: g.is_active ? 'Active' : 'Inactive',
      })),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group-insights-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none h-full">
      <CardContent className="p-6 flex flex-col h-full">
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
          <div>
            <h3 className="font-bold text-xl">Group Insights</h3>
            <p className="text-white/60 text-sm mt-1">
              {calculatedInsights.totalGroups > 0 
                ? `Analyzing ${calculatedInsights.totalGroups} groups` 
                : 'No groups to analyze'}
            </p>
          </div>
        </div>
        
        {calculatedInsights.totalGroups === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <Users className="h-16 w-16 text-gray-500 mb-4" />
            <p className="text-gray-400 text-center mb-6">
              Create your first group to see insights and analytics
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/groups/create')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Group
            </motion.button>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickStatClick(stat)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">{stat.title}</p>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="h-1 w-full bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      className={`h-full bg-gradient-to-r ${
                        stat.title === 'Total Groups' ? 'from-purple-500 to-purple-500/50' :
                        stat.title === 'Active Groups' ? 'from-green-500 to-green-500/50' :
                        stat.title === 'Total Members' ? 'from-blue-500 to-blue-500/50' :
                        'from-orange-500 to-orange-500/50'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Insights */}
            <div className="space-y-4 flex-1">
              {insightsData.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-200 text-sm">{insight.title}</p>
                    <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <p className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {insight.value}
                  </p>
                  <p className="text-xs opacity-75">{insight.description}</p>
                  {insight.type && (
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.type === 'SAVINGS' ? 'bg-green-500/20 text-green-300' :
                        insight.type === 'INVESTMENT' ? 'bg-blue-500/20 text-blue-300' :
                        insight.type === 'WELFARE' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {insight.type}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Functional Action Buttons */}
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
                  onClick={handleAnalyticsClick}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMembersClick}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Members
                </motion.button>
              </div>
              
              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportInsights}
                className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2 border border-purple-500/30"
              >
                <Download className="h-4 w-4" />
                Export Insights
              </motion.button>
            </motion.div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Main Groups List Page Component
export function GroupsListPage() {
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsService.getMyGroups();
      setGroups(response);
    } catch (err) {
      setError('Failed to load groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'INVESTMENT':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'WELFARE':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MIXED':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getGroupTypeName = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'Savings Group';
      case 'INVESTMENT':
        return 'Investment Group';
      case 'WELFARE':
        return 'Welfare Group';
      case 'MIXED':
        return 'Mixed Purpose';
      default:
        return type;
    }
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return PiggyBank;
      case 'INVESTMENT':
        return TrendingUp;
      case 'WELFARE':
        return Shield;
      case 'MIXED':
        return Zap;
      default:
        return Users;
    }
  };

  const getGroupGradient = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'from-green-100 to-emerald-50';
      case 'INVESTMENT':
        return 'from-blue-100 to-cyan-50';
      case 'WELFARE':
        return 'from-purple-100 to-violet-50';
      case 'MIXED':
        return 'from-orange-100 to-amber-50';
      default:
        return 'from-gray-100 to-gray-50';
    }
  };

  const getGroupBorder = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'border-green-200';
      case 'INVESTMENT':
        return 'border-blue-200';
      case 'WELFARE':
        return 'border-purple-200';
      case 'MIXED':
        return 'border-orange-200';
      default:
        return 'border-gray-200';
    }
  };

  // Filter groups based on search and type
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || group.group_type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const stats = {
    total: groups.length,
    active: groups.filter(g => g.is_active).length,
    totalBalance: groups.reduce((sum, g) => sum + Number(g.total_balance || 0), 0),
    totalMembers: groups.reduce((sum, g) => sum + (g.member_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0}>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
          </FloatingElement>
          <FloatingElement delay={2}>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
          </FloatingElement>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
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
            <Sparkles className="h-12 w-12 text-purple-600" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading groups...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <GroupsContext.Provider value={{ groups }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <FloatingElement delay={0}>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
          </FloatingElement>
          <FloatingElement delay={2}>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
          </FloatingElement>
          <FloatingElement delay={1}>
            <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full blur-3xl opacity-20" />
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
                onClick={() => navigate('/dashboard')} 
                className="group flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
              </motion.button>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  My Groups
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
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
              transition={{ delay: 0.2 }}
              className="flex gap-3"
            >
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Export groups data
                  const exportData = groups.map(g => ({
                    Name: g.name,
                    Type: g.group_type,
                    'Total Balance': g.total_balance,
                    Members: g.member_count || 0,
                    Status: g.is_active ? 'Active' : 'Inactive',
                    'Created Date': g.created_at,
                  }));
                  
                  const csv = [
                    ['Name', 'Type', 'Total Balance', 'Members', 'Status', 'Created Date'],
                    ...exportData.map(g => [g.Name, g.Type, g['Total Balance'], g.Members, g.Status, g['Created Date']])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `my-groups-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
              >
                <Download className="h-4 w-4" />
                Export Report
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/groups/create')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              >
                <Plus className="h-5 w-5" />
                Create Group
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {/* Enhanced Total Groups Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 text-white transform hover:scale-[1.005] transition-transform duration-500 overflow-hidden border-none relative">
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
                        <Users className="h-5 w-5" />
                        Total Groups Overview
                      </p>
                    </div>
                    <p className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {stats.total} Groups
                    </p>
                    <p className="text-sm opacity-75 mt-4 flex items-center gap-3">
                      <Target className="h-4 w-4" />
                      <span>Total Balance: KES {stats.totalBalance.toLocaleString()} • </span>
                      <span className="text-green-300 font-semibold">{stats.active} Active</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={fetchGroups}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      title="Refresh"
                    >
                      <Clock className="h-5 w-5" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      title="More options"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <AnimatedStatCard 
              title="Total Groups" 
              value={stats.total.toString()} 
              change="+2"
              color="purple"
              delay={0}
              icon={Users}
              description="All your groups"
            />
            <AnimatedStatCard 
              title="Active Groups" 
              value={stats.active.toString()} 
              change="+1"
              color="green"
              delay={0.1}
              icon={CheckCircle}
              description="Currently active"
            />
            <AnimatedStatCard 
              title="Total Members" 
              value={stats.totalMembers.toString()} 
              change="+8"
              color="blue"
              delay={0.2}
              icon={Users}
              description="Across all groups"
            />
            <AnimatedStatCard 
              title="Total Balance" 
              value={`KES ${stats.totalBalance.toLocaleString()}`} 
              change="+15%"
              color="orange"
              delay={0.3}
              icon={DollarSign}
              description="Combined group funds"
            />
          </motion.div>

          {/* Enhanced Main Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Groups List */}
            <div className="lg:col-span-2" id="groups-list">
              {filteredGroups.length === 0 ? (
                <Card className="shadow-2xl text-center py-20 border-0 bg-white">
                  <CardContent>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-6 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 w-fit mx-auto mb-6"
                    >
                      <Users className="h-16 w-16 text-purple-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Groups Found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm || filterType !== 'ALL' 
                        ? 'No groups match your current filters. Try adjusting your search criteria.'
                        : 'Create your first group to start saving and investing together.'
                      }
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/groups/create')}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30"
                    >
                      Create Your First Group
                    </motion.button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-2xl overflow-hidden border-0 bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                            My Groups
                          </CardTitle>
                          <CardDescription className="text-gray-600 text-sm mt-1">
                            All your savings and investment groups
                          </CardDescription>
                        </div>
                        
                        {/* Enhanced Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto min-w-0">
                          <div className="relative flex-1 sm:flex-none sm:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input 
                              placeholder="Search groups..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white w-full text-sm"
                            />
                          </div>
                          <div className="relative flex-1 sm:flex-none sm:w-40">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select 
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white w-full text-sm appearance-none"
                            >
                              <option value="ALL">All Types</option>
                              <option value="SAVINGS">Savings</option>
                              <option value="INVESTMENT">Investment</option>
                              <option value="WELFARE">Welfare</option>
                              <option value="MIXED">Mixed</option>
                            </select>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchGroups}
                            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white text-sm whitespace-nowrap"
                          >
                            <Clock className="h-4 w-4" />
                            Refresh
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="grid gap-6 p-6 md:grid-cols-1 lg:grid-cols-2">
                      <AnimatePresence>
                        {filteredGroups.map((group, index) => {
                          const GroupIcon = getGroupIcon(group.group_type);
                          return (
                            <motion.div
                              key={group.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Card 
                                className={`shadow-lg hover:shadow-2xl transition-all cursor-pointer border-l-4 ${getGroupBorder(group.group_type)} overflow-hidden group h-full`}
                                onClick={() => navigate(`/groups/${group.id}`)}
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <motion.div 
                                          whileHover={{ scale: 1.1, rotate: 5 }}
                                          className={`p-3 rounded-2xl ${getGroupGradient(group.group_type)} shadow-lg flex-shrink-0`}
                                        >
                                          <GroupIcon className="h-6 w-6 text-gray-700" />
                                        </motion.div>
                                        <div className="min-w-0 flex-1">
                                          <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                                            {group.name}
                                          </h3>
                                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {group.description || group.objectives || 'No description provided'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 mt-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getGroupTypeColor(group.group_type)}`}>
                                          {getGroupTypeName(group.group_type)}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          group.is_active
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}>
                                          {group.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        {group.kyb_verified ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3 mt-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <DollarSign className="h-4 w-4" />
                                        <span>Total Balance</span>
                                      </div>
                                      <span className="font-semibold text-green-600">
                                        KES {Number(group.total_balance || 0).toLocaleString()}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span>Members</span>
                                      </div>
                                      <span className="font-semibold">{group.member_count || 0}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>Contribution</span>
                                      </div>
                                      <span className="font-semibold capitalize text-sm">
                                        {group.contribution_frequency?.toLowerCase() || 'Monthly'}
                                      </span>
                                    </div>
                                  </div>

                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/groups/${group.id}`);
                                    }}
                                    className="w-full mt-4 py-3 rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </motion.button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Group Insights Sidebar with Real Data */}
            <GroupInsights groups={groups} />
          </motion.div>
        </div>
      </div>
    </GroupsContext.Provider>
  );
}