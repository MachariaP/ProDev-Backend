import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  PiggyBank, 
  BarChart3, 
  Vote, 
  ArrowRight,
  CheckCircle2,
  Star,
  Calendar,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Smart Group Management',
      description: 'Easily manage members, roles, and permissions with intuitive tools designed for chama committees.'
    },
    {
      icon: PiggyBank,
      title: 'Automated Contributions',
      description: 'Set up recurring contributions, send automatic reminders, and track savings goals effortlessly.'
    },
    {
      icon: TrendingUp,
      title: 'Investment Monitoring',
      description: 'Track your chama investments in real-time with performance analytics and growth insights.'
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Make data-driven decisions with comprehensive financial reports and visual dashboards.'
    },
    {
      icon: Vote,
      title: 'Transparent Voting',
      description: 'Conduct fair elections and make collective decisions with our secure voting system.'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your data is protected with enterprise-level security and regular automated backups.'
    }
  ];

  const benefits = [
    'Instant transaction tracking',
    'Automated financial statements',
    'Seamless M-Pesa integration',
    'Smart loan management',
    'Mobile-first design',
    'Customizable reports',
    'Meeting scheduling',
    'Multi-language support'
  ];

  const stats = [
    { value: '500+', label: 'Active Chamas' },
    { value: 'KSh 50M+', label: 'Managed Assets' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      {/* Navigation */}
      <nav className="relative z-50 sticky top-0 bg-white/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChamaHub
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <button
                onClick={() => navigate('/auth/login')}
                className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-4 py-2 md:px-6 md:py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
              >
                Get Started Free
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-sm font-medium mb-8">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                Trusted by 500+ Chamas across Kenya
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
            >
              Modern Chama
              <br />
              <span className="text-gray-900">Management</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Streamline your savings group with all-in-one financial management, 
              transparent voting, and smart investment tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all transform active:scale-95"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto p-4 bg-white/50 backdrop-blur-sm rounded-xl shadow-inner border border-gray-200"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Everything You Need to Grow Together
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed specifically for African savings groups and investment clubs
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
              className="bg-white rounded-3xl p-8 shadow-xl transition-all border border-gray-100 group transform"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Built for Modern Chamas
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Features that make managing your group effortless and transparent, right out of the box.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-colors border border-white/20"
              >
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-300 mt-1" />
                <span className="text-base font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 md:p-16 shadow-2xl border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Smartphone className="h-10 w-10 text-blue-600 mx-auto lg:mx-0 mb-4" />
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                Manage Your Chama On-the-Go
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-lg lg:max-w-none">
                Access all features from your mobile device. Perfect for meetings, 
                contribution collections, and instant updates—anywhere, anytime.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Get Mobile Access
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>
            <div className="flex-1 w-full max-w-sm">
              <div className="relative p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-inner border border-blue-200">
                <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h4 className="text-gray-800 font-bold mb-2 text-xl">Upcoming Event</h4>
                <p className="text-gray-700 font-semibold mb-1">
                  Quarterly Investment Review
                </p>
                <p className="text-blue-600 font-bold text-lg">
                  Saturday, <span className="text-purple-600">10:00 AM</span>
                </p>
                <div className="mt-4 text-xs text-gray-500">
                    Reminder set for all 15 members.
                </div>
                {/* Mock Phone UI detail */}
                <div className="absolute top-0 right-0 m-3 w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Live update enabled"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden ring-4 ring-blue-400/50"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <Zap className="h-16 w-16 mx-auto mb-6 text-yellow-300 fill-yellow-300" />
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Start Your Chama's Digital Journey Today
            </h2>
            <p className="text-xl mb-10 text-blue-200 max-w-3xl mx-auto">
              Join the hundreds of chamas that have transformed their financial management 
              and increased their savings growth with unmatched transparency.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-10 py-5 rounded-full bg-white text-blue-600 font-bold text-xl shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3 transform active:scale-95"
            >
              Create Your Chama Hub
              <ArrowRight className="h-6 w-6 text-purple-600" />
            </motion.button>
            <p className="mt-4 text-blue-200 text-sm">
              No credit card required • 14-day free trial • Setup in minutes
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="flex justify-center items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChamaHub</span>
            </div>
            <p className="text-gray-600 mb-2 md:mb-0 text-sm">
              Empowering African communities through transparent financial technology
            </p>
            <p className="text-gray-500 text-sm">
              &copy; 2024 ChamaHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
