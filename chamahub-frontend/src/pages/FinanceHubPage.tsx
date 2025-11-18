import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  CheckCircle,
  Wallet,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </motion.button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Finance Hub
            </h1>
            <p className="text-muted-foreground mt-2">Manage all financial operations</p>
          </div>
        </div>

        {/* Group Balance Card */}
        <Card className="shadow-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2">Total Group Balance</p>
                <p className="text-4xl font-bold">KES 1,234,567</p>
                <p className="text-sm opacity-75 mt-2">As of {new Date().toLocaleDateString()}</p>
              </div>
              <Wallet className="h-16 w-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Finance Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {financeModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(module.path)}
                className="w-full"
              >
                <Card className="shadow-lg hover:shadow-2xl transition-all">
                  <CardContent className="p-6">
                    <div className={`p-4 rounded-full ${module.bgColor} w-fit mb-4`}>
                      <module.icon className={`h-8 w-8 ${module.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </CardContent>
                </Card>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">This Month's Contributions</p>
              <p className="text-2xl font-bold text-green-600">KES 145,000</p>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Loans</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-muted-foreground mt-1">Total: KES 890,000</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
