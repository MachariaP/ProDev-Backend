import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
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
  Smartphone,
  Crown,
  Gem,
  Rocket,
  Target,
  HeartHandshake,
  Coins,
  Building,
  Clock,
  Award,
  Sparkles,
  PlayCircle,
  Globe // Add this import
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Smart Group Management',
      description: 'Easily manage members, roles, and permissions with intuitive tools designed for chama committees.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: PiggyBank,
      title: 'Automated Contributions',
      description: 'Set up recurring contributions, send automatic reminders, and track savings goals effortlessly.',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      title: 'Investment Monitoring',
      description: 'Track your chama investments in real-time with performance analytics and growth insights.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.3
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Make data-driven decisions with comprehensive financial reports and visual dashboards.',
      gradient: 'from-orange-500 to-amber-500',
      delay: 0.4
    },
    {
      icon: Vote,
      title: 'Transparent Voting',
      description: 'Conduct fair elections and make collective decisions with our secure voting system.',
      gradient: 'from-indigo-500 to-blue-500',
      delay: 0.5
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your data is protected with enterprise-level security and regular automated backups.',
      gradient: 'from-teal-500 to-cyan-500',
      delay: 0.6
    }
  ];

  const benefits = [
    { icon: Coins, text: 'Instant transaction tracking', color: 'text-green-500' },
    { icon: Building, text: 'Automated financial statements', color: 'text-blue-500' },
    { icon: Smartphone, text: 'Seamless M-Pesa integration', color: 'text-purple-500' },
    { icon: TrendingUp, text: 'Smart loan management', color: 'text-orange-500' },
    { icon: Clock, text: 'Mobile-first design', color: 'text-pink-500' },
    { icon: BarChart3, text: 'Customizable reports', color: 'text-indigo-500' },
    { icon: Calendar, text: 'Meeting scheduling', color: 'text-teal-500' },
    { icon: Globe, text: 'Multi-language support', color: 'text-amber-500' } // Now Globe is imported
  ];

  const stats = [
    { value: '500+', label: 'Active Chamas', icon: Users, color: 'text-blue-500' },
    { value: 'KSh 50M+', label: 'Managed Assets', icon: Coins, color: 'text-green-500' },
    { value: '98%', label: 'Satisfaction Rate', icon: Star, color: 'text-yellow-500' },
    { value: '24/7', label: 'Support Available', icon: Clock, color: 'text-purple-500' }
  ];

  const testimonials = [
    {
      name: 'Sarah Mwangi',
      role: 'Treasurer, Umoja Women Group',
      content: 'ChamaHub transformed our savings group. We\'ve grown our investments by 300% in just one year!',
      avatar: 'SM'
    },
    {
      name: 'David Ochieng',
      role: 'Chairman, Victory Investors',
      content: 'The transparency and ease of use has brought so much trust among our 25 members. Highly recommended!',
      avatar: 'DO'
    },
    {
      name: 'Grace Wanjiku',
      role: 'Secretary, Smart Savers Chama',
      content: 'From contribution tracking to investment monitoring, everything is seamless. Our chama has never been more organized.',
      avatar: 'GW'
    }
  ];

  const FloatingElement = ({ children, delay = 0 }) => (
    <motion.div
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -20, 0],
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans overflow-hidden">
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

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 sticky top-0 bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ChamaHub
                </span>
                <div className="text-xs text-gray-500 font-medium">Modern Chama Management</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth/login')}
                className="px-6 py-2.5 text-gray-700 font-semibold hover:text-blue-600 transition-colors hidden md:block"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
              >
                <Rocket className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg mb-12"
            >
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-700 font-bold">Trusted by 500+ Chamas across Kenya</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Modern Chama
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Management
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Transform your savings group with all-in-one financial management, 
              <span className="text-blue-600 font-semibold"> transparent voting</span>, and 
              <span className="text-purple-600 font-semibold"> smart investment tracking</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="group px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/demo')}
                className="group px-12 py-5 rounded-2xl border-3 border-gray-300 text-gray-700 font-bold text-xl hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm"
              >
                <PlayCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 text-center group"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color.replace('text', 'from')} to-${stat.color.split('-')[1]}-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`text-4xl font-black mb-2 ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-semibold text-sm">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Gem className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Grow Together</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Comprehensive tools designed specifically for African savings groups and investment clubs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: feature.delay, duration: 0.6 }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    boxShadow: "0 50px 80px -20px rgba(0, 0, 0, 0.15)"
                  }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 group cursor-pointer transform-gpu"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <HeartHandshake className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Loved by <span className="text-yellow-400">Chamas</span> Across Kenya
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See how ChamaHub is transforming savings groups and investment clubs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-white group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center font-bold text-gray-900">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-yellow-200 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-200 leading-relaxed text-lg">{testimonial.content}</p>
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-32 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Award className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built for <span className="text-yellow-300">Modern Chamas</span>
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto font-medium">
              Features that make managing your group effortless and transparent, right out of the box.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white hover:bg-white/20 transition-all border border-white/20 group"
                >
                  <Icon className={`h-8 w-8 flex-shrink-0 ${benefit.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-lg font-semibold">{benefit.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-4xl p-8 md:p-16 shadow-2xl border border-gray-200/50 backdrop-blur-sm"
          >
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-2xl"
                >
                  <Smartphone className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  Manage Your Chama <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">On-the-Go</span>
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-lg lg:max-w-none leading-relaxed">
                  Access all features from your mobile device. Perfect for meetings, 
                  contribution collections, and instant updates—anywhere, anytime.
                </p>
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto lg:mx-0 w-fit"
                >
                  <Rocket className="h-5 w-5" />
                  Get Mobile Access
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="flex-1 w-full max-w-md">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="relative p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl border border-blue-200/50 backdrop-blur-sm"
                >
                  <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-gray-800 font-black text-2xl mb-3 text-center">Upcoming Event</h4>
                  <p className="text-gray-700 font-bold text-xl mb-2 text-center">
                    Quarterly Investment Review
                  </p>
                  <p className="text-blue-600 font-black text-2xl text-center mb-4">
                    Saturday, <span className="text-purple-600">10:00 AM</span>
                  </p>
                  <div className="text-center text-gray-500 font-medium">
                    15 members confirmed • Reminders sent
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-4xl p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden ring-4 ring-blue-400/30"
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <Zap className="h-12 w-12 text-white" />
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Start Your Chama's <span className="text-yellow-300">Digital Journey</span> Today
              </h2>
              
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto font-medium leading-relaxed">
                Join hundreds of chamas that have transformed their financial management 
                and increased savings growth with unmatched transparency.
              </p>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 30px 60px rgba(255, 255, 255, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-16 py-5 rounded-2xl bg-white text-blue-600 font-black text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-4 mb-4"
              >
                <Crown className="h-6 w-6" />
                Create Your Chama Hub
                <ArrowRight className="h-6 w-6" />
              </motion.button>
              
              <p className="text-blue-200 text-lg font-medium">
                No credit card required • 14-day free trial • Setup in minutes
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
                >
                  <Crown className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <span className="text-xl font-black text-gray-900">ChamaHub</span>
                  <div className="text-xs text-gray-500 font-medium">Modern Chama Management</div>
                </div>
              </div>
              <p className="text-gray-600 text-center lg:text-left max-w-md">
                Empowering African communities through transparent financial technology and digital transformation.
              </p>
            </div>
            
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Support', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  whileHover={{ y: -2, color: '#4f46e5' }}
                  className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; 2025 ChamaHub. Empowering communities across Africa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}