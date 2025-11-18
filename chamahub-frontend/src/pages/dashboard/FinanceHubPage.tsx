import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

// --- Enhanced Progress Bar with better visuals ---
const FundProgress = ({ percentage }: { percentage: number }) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  const getColorClass = (percent: number) => {
    if (percent > 85) return 'bg-red-500 from-red-500 to-red-600';
    if (percent > 65) return 'bg-yellow-500 from-yellow-500 to-orange-500';
    return 'bg-green-500 from-green-500 to-emerald-600';
  };

  const colorClass = getColorClass(normalizedPercentage);

  return (
    <div className="mt-6 pt-6 border-t border-white/20">
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
      <div className="w-full bg-white/20 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${normalizedPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs opacity-75">
        <span>Low Risk</span>
        <span>Optimal</span>
        <span>High Risk</span>
      </div>
    </div>
  );
};

// Animated Stat Card Component
const AnimatedStatCard = ({ title, value, change, color, delay = 0 }: { title: string; value: string; change?: string; color: string; delay?: number }) => (
  <div
    className="animate-fadeIn"
    style={{ animationDelay: `${delay}ms` }}
  >
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 backdrop-blur-sm bg-white/50 border-white">
      <CardContent className="p-5">
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              change.startsWith('+') 
                ? 'bg-green-100 text-green-700' 
                : change.startsWith('-')
                ? 'bg-red-100 text-red-700'
                : 'bg-orange-100 text-orange-700' // For "Urgent"
            }`}>
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
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
      path: '/contributions',
      stats: 'KES 145K',
      trend: '+12%',
    },
    {
      title: 'Loans',
      description: 'Manage loans, applications, and repayments',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-50',
      borderColor: 'border-blue-200',
      path: '/loans',
      stats: '12 Active',
      trend: '-2%',
    },
    {
      title: 'Expenses',
      description: 'Track and approve group expenses',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-100 to-violet-50',
      borderColor: 'border-purple-200',
      path: '/expenses',
      stats: 'KES 35K',
      trend: '+8%',
    },
    {
      title: 'Approvals',
      description: 'Review multi-signature approval requests',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-100 to-amber-50',
      borderColor: 'border-orange-200',
      path: '/approvals',
      stats: '5 Pending',
      trend: 'Urgent',
      badge: '5',
    },
  ];

  // Mock data for recent activity
  const recentActivities = [
    { id: 1, type: 'Contribution', amount: 50000, user: 'Jane Doe', icon: ArrowUpRight, color: 'text-green-600', bgColor: 'bg-green-100', date: '2 hours ago', status: 'completed' },
    { id: 2, type: 'Loan Repayment', amount: 12000, user: 'John Smith', icon: ArrowDownLeft, color: 'text-blue-600', bgColor: 'bg-blue-100', date: 'Yesterday', status: 'completed' },
    { id: 3, type: 'Expense Approval', amount: 35000, user: 'Admin', icon: CheckCircle, color: 'text-orange-600', bgColor: 'bg-orange-100', date: '2 days ago', status: 'pending' },
    { id: 4, type: 'Loan Disbursement', amount: 150000, user: 'Finance Team', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100', date: '3 days ago', status: 'completed' },
  ];

  // Mock data for progress visualization (65% utilized funds)
  const fundUtilizationPercent = 65;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200 p-3 rounded-2xl hover:bg-white hover:shadow-lg group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Finance Hub
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => navigate('/contributions')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Make Contribution
            </button>
          </div>
        </div>

        {/* Enhanced Group Balance Card */}
        <Card className="shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white transform hover:scale-[1.005] transition-transform duration-500 overflow-hidden border-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 translate-y-12"></div>
          <CardContent className="p-8 relative">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm opacity-90 mb-2 font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Total Group Balance
                </p>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  KES 1,234,567
                </p>
                <p className="text-sm opacity-75 mt-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Monthly target: KES 200,000 • </span>
                  <span className="text-green-300">82% achieved</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
            <FundProgress percentage={fundUtilizationPercent} />
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedStatCard 
            title="Monthly Contributions" 
            value="KES 145K" 
            change="+12%" 
            color="text-green-600"
            delay={0}
          />
          <AnimatedStatCard 
            title="Active Loans" 
            value="12" 
            change="-2%" 
            color="text-blue-600"
            delay={100}
          />
          <AnimatedStatCard 
            title="Pending Approvals" 
            value="5" 
            change="Urgent" 
            color="text-orange-600"
            delay={200}
          />
          <AnimatedStatCard 
            title="Total Members" 
            value="24" 
            change="+2" 
            color="text-purple-600"
            delay={300}
          />
        </div>

        {/* Enhanced Finance Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {financeModules.map((module, index) => (
            <div
              key={module.title}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-fadeIn"
            >
              <button
                onClick={() => navigate(module.path)}
                className="w-full text-left focus:outline-none block group"
              >
                <Card className={`h-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 ${module.borderColor} group-hover:scale-[1.02] overflow-hidden`}>
                  <CardContent className="p-6 relative">
                    {module.badge && (
                      <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        {module.badge}
                      </span>
                    )}
                    <div className={`p-3 rounded-2xl ${module.bgColor} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <module.icon className={`h-7 w-7 ${module.color}`} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{module.stats}</span>
                      <span className={`text-xs font-medium ${
                        module.trend === 'Urgent' 
                          ? 'text-red-500 bg-red-50 px-2 py-1 rounded-full'
                          : module.trend.startsWith('+')
                          ? 'text-green-500'
                          : 'text-blue-500'
                      }`}>
                        {module.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </div>
          ))}
        </div>

        {/* Enhanced Activity & Insights Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="font-bold text-xl text-gray-800">Recent Activity</h3>
                </div>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-xl ${activity.bgColor} mr-4 group-hover:scale-110 transition-transform`}>
                        <activity.icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
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
                        {activity.amount.toLocaleString('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 })}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-gray-400">{activity.date}</span>
                        {activity.status === 'pending' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Insights */}
          <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                  <p className="font-semibold text-green-300">Savings Growth</p>
                  <p className="text-2xl font-bold mt-1">+18%</p>
                  <p className="text-sm opacity-75 mt-1">Compared to last month</p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                  <p className="font-semibold text-blue-300">Loan Recovery</p>
                  <p className="text-2xl font-bold mt-1">92%</p>
                  <p className="text-sm opacity-75 mt-1">On-time repayment rate</p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                  <p className="font-semibold text-purple-300">Member Participation</p>
                  <p className="text-2xl font-bold mt-1">89%</p>
                  <p className="text-sm opacity-75 mt-1">Active contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Custom CSS for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0; 
        }
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}