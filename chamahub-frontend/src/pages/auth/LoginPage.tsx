import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Crown, Sparkles, Users, Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { authService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the API service to login - NOW USING CORRECT ENDPOINT
      const response = await authService.login({ email, password });
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Fetch user data after successful login
      try {
        const userData = await authService.getCurrentUser();
        const userInfo = {
          full_name: `${userData.first_name} ${userData.last_name}`,
          ...userData
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        // Use the auth hook to update state and navigate
        login(response.access, userInfo);
        
      } catch (userErr) {
        console.error('Failed to fetch user data:', userErr);
        // Even if user fetch fails, we can still proceed with login
        // Just use the tokens we have
        login(response.access);
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.response?.data?.detail || 
        err?.response?.data?.message ||
        err?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const FloatingShape = ({ delay = 0, className = "" }) => (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: [0, -30, 0],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`absolute ${className}`}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape 
          delay={0} 
          className="top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" 
        />
        <FloatingShape 
          delay={2} 
          className="top-40 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" 
        />
        <FloatingShape 
          delay={4} 
          className="bottom-20 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" 
        />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left text-white"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-3 justify-center lg:justify-start mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">ChamaHub</h1>
              <p className="text-white/80 font-medium">Modern Chama Management</p>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl lg:text-6xl font-black mb-6 leading-tight"
          >
            Welcome Back to Your <span className="text-yellow-300">Chama</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl mb-8 text-white/90 max-w-lg mx-auto lg:mx-0 leading-relaxed"
          >
            Continue managing your savings group with powerful tools for transparency, growth, and collaboration.
          </motion.p>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4 mb-8"
          >
            {[
              { icon: Users, text: 'Smart Member Management' },
              { icon: Coins, text: 'Automated Contribution Tracking' },
              { icon: Sparkles, text: 'Real-time Financial Insights' }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Sparkles key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-bold text-sm">Trusted by 500+ Chamas</span>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-xl rounded-3xl">
            <CardHeader className="space-y-3 text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="mx-auto bg-white/20 p-4 rounded-2xl w-fit"
              >
                <LogIn className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-black text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Sign in to continue your chama's journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-red-500/20 text-red-100 text-sm border border-red-500/30 backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-white">Password</label>
                    <Link to="/forgot-password" className="text-xs text-white/80 hover:text-white transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-white text-blue-600 font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Sign In to Your Account
                    </>
                  )}
                </motion.button>

                <div className="text-center text-white/80 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-white font-semibold hover:text-yellow-300 transition-colors">
                    Create one now
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}