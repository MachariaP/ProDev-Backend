import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  CheckCircle,
  Wallet,
  Clock, // New icon for activity
  ArrowUpRight, // New icon for contributions
  ArrowDownLeft, // New icon for loan repayments
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

// --- NEW: Fund Allocation Progress Bar Component ---
const FundProgress = ({ percentage }: { percentage: number }) => {
    // Ensure percentage is between 0 and 100
    const normalizedPercentage = Math.max(0, Math.min(100, percentage));
    
    let colorClass;
    if (normalizedPercentage > 75) {
        // High utilization, maybe a warning
        colorClass = 'bg-red-500';
    } else if (normalizedPercentage > 50) {
        // Medium utilization
        colorClass = 'bg-yellow-500';
    } else {
        // Low utilization/good cash position
        colorClass = 'bg-green-500';
    }

    return (
        <div className="mt-4 pt-4 border-t border-indigo-500/50">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium opacity-90">Funds Utilized ({normalizedPercentage}%)</p>
                <p className="text-xs opacity-75">Cash Available</p>
            </div>
            <div className="w-full bg-indigo-500/30 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-700 ${colorClass}`} 
                    style={{ width: `${normalizedPercentage}%` }}
                />
            </div>
        </div>
    );
};

export function FinanceHubPage() {
  const navigate = useNavigate();

  const financeModules = [
    {
      title: 'Contributions',
      description: 'Track and manage member contributions',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      path: '/contributions',
    },
    {
      title: 'Loans',
      description: 'Manage loans, applications, and repayments',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/loans',
    },
    {
      title: 'Expenses',
      description: 'Track and approve group expenses',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      path: '/expenses',
    },
    {
      title: 'Approvals',
      description: 'Review multi-signature approval requests',
      icon: CheckCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      path: '/approvals',
    },
  ];

  // Mock data for recent activity
  const recentActivities = [
    { id: 1, type: 'Contribution', amount: 50000, user: 'Jane Doe', icon: ArrowUpRight, color: 'text-green-500', date: '2 hours ago' },
    { id: 2, type: 'Loan Repayment', amount: 12000, user: 'John Smith', icon: ArrowDownLeft, color: 'text-blue-500', date: 'Yesterday' },
    { id: 3, type: 'Expense Approval', amount: 35000, user: 'Admin', icon: CheckCircle, color: 'text-orange-500', date: '2 days ago' },
    { id: 4, type: 'Loan Disbursement', amount: 150000, user: 'Finance Team', icon: TrendingUp, color: 'text-red-500', date: '3 days ago' },
  ];

  // Mock data for progress visualization (65% utilized funds)
  const fundUtilizationPercent = 65;

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Finance Hub
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage all financial operations</p>
            </div>
          </div>
          
          {/* NEW: Primary CTA */}
          <button
            onClick={() => navigate('/contributions')}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/50 hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.05]"
          >
            Make Contribution
          </button>
        </div>

        {/* Group Balance Card (Updated with Progress Bar) */}
        <Card className="shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white transform hover:scale-[1.005] transition-transform duration-300">
          <CardContent className="p-6 sm:p-8 !pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2 font-medium">Total Group Balance</p>
                <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">KES 1,234,567</p>
                <p className="text-xs sm:text-sm opacity-75 mt-2">As of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <Wallet className="h-12 w-12 sm:h-16 w-16 opacity-30 flex-shrink-0 mt-2" />
            </div>
            <FundProgress percentage={fundUtilizationPercent} />
          </CardContent>
        </Card>

        {/* Finance Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {financeModules.map((module, index) => (
            <div
              key={module.title}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-fadeIn"
            >
              <button
                onClick={() => navigate(module.path)}
                className="w-full text-left focus:outline-none block"
              >
                <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-indigo-400">
                  <CardContent className="p-6">
                    <div className={`p-4 rounded-full ${module.bgColor} w-fit mb-4`}>
                      <module.icon className={`h-8 w-8 ${module.color}`} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </CardContent>
                </Card>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Stats & Recent Activity (Side-by-Side on Desktop) */}
        <div className="grid gap-8 lg:grid-cols-3 pt-4">
            
            {/* Quick Stats (2/3 width on desktop) */}
            <div className="lg:col-span-2 grid gap-6 md:grid-cols-3">
                <Card className="shadow-lg border-l-4 border-green-500 transition-all hover:ring-2 ring-green-500/50">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500 mb-1">This Month's Contributions</p>
                    <p className="text-2xl font-bold text-green-600">KES 145,000</p>
                    <p className="text-xs text-gray-400 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-blue-500 transition-all hover:ring-2 ring-blue-500/50">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Active Loans</p>
                    <p className="text-2xl font-bold text-blue-600">12</p>
                    <p className="text-xs text-gray-400 mt-1">Total: KES 890,000</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-l-4 border-orange-500 transition-all hover:ring-2 ring-orange-500/50">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Pending Approvals</p>
                    <p className="text-2xl font-bold text-orange-600">5</p>
                    <p className="text-xs text-gray-400 mt-1">Requires your attention</p>
                  </CardContent>
                </Card>
            </div>

            {/* NEW: Recent Activity Feed (1/3 width on desktop) */}
            <Card className="lg:col-span-1 shadow-2xl">
                <CardContent className="p-6">
                    <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="font-bold text-lg text-gray-800">Recent Activity</h3>
                    </div>
                    <ul className="space-y-4">
                        {recentActivities.map(activity => (
                            <li key={activity.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full ${activity.color}/10 mr-3`}>
                                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-700">{activity.type}</p>
                                        <p className="text-xs text-gray-400">{activity.user}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold text-sm ${activity.color === 'text-red-500' ? 'text-red-500' : 'text-green-600'}`}>
                                        {activity.amount.toLocaleString('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-xs text-gray-400">{activity.date}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
      {/* Custom CSS for animation fade-in effect */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0; 
        }
      `}</style>
    </div>
  );
}