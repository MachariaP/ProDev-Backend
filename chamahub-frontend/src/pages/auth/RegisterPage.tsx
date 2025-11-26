import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Crown, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { authService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Validate phone number
    if (!formData.phone_number || formData.phone_number.length < 10) {
      setError('Phone number must be at least 10 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);

      // Store tokens
      const { tokens, user } = response;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      // Use the auth hook to handle login
      login(tokens.access, {
        full_name: `${user.first_name} ${user.last_name}`,
        ...user
      });

    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle different error formats from the backend
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle field-specific errors
        if (errorData.email) {
          errorMessage = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.password) {
          errorMessage = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (errorData.password_confirm) {
          errorMessage = Array.isArray(errorData.password_confirm) ? errorData.password_confirm[0] : errorData.password_confirm;
        } else if (errorData.phone_number) {
          errorMessage = Array.isArray(errorData.phone_number) ? errorData.phone_number[0] : errorData.phone_number;
        } else if (errorData.first_name) {
          errorMessage = Array.isArray(errorData.first_name) ? errorData.first_name[0] : errorData.first_name;
        } else if (errorData.last_name) {
          errorMessage = Array.isArray(errorData.last_name) ? errorData.last_name[0] : errorData.last_name;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (Object.keys(errorData).length > 0) {
          // Show the first error found
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

  const benefits = [
    { icon: Shield, text: 'Bank-grade security', color: 'text-green-400' },
    { icon: Sparkles, text: '14-day free trial', color: 'text-yellow-400' },
    { icon: UserPlus, text: 'Unlimited members', color: 'text-blue-400' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 p-4 relative overflow-hidden">
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
        <FloatingShape 
          delay={1} 
          className="bottom-40 right-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl" 
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
            Start Your <span className="text-yellow-300">Digital Chama</span> Journey
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl mb-8 text-white/90 max-w-lg mx-auto lg:mx-0 leading-relaxed"
          >
            Join hundreds of chamas transforming their savings groups with transparent, efficient, and secure management tools.
          </motion.p>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4 mb-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <benefit.icon className={`h-4 w-4 ${benefit.color}`} />
                </div>
                <span className="font-medium">{benefit.text}</span>
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
            <span className="font-bold text-sm">Join 500+ Successful Chamas</span>
          </motion.div>
        </motion.div>

        {/* Right Side - Registration Form */}
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
                <UserPlus className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-black text-white">
                Create Account
              </CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Start your 14-day free trial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-red-500/20 text-red-100 text-sm border border-red-500/30 backdrop-blur-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="John"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-white">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="Doe"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="254700000000"
                      required
                      minLength={10}
                      maxLength={15}
                      pattern="[0-9]+"
                    />
                  </div>
                  <p className="text-xs text-white/60">
                    Enter numbers only (10-15 digits)
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  className="w-full py-4 rounded-2xl bg-white text-green-600 font-bold text-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"
                      />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Start Free Trial
                    </>
                  )}
                </motion.button>

                <div className="text-center text-white/80 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-white font-semibold hover:text-yellow-300 transition-colors">
                    Sign in here
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