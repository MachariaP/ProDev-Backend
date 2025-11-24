import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Target, 
  Calendar,
  DollarSign,
  FileText,
  Building,
  TrendingUp,
  HeartHandshake,
  Sparkles,
  Crown,
  Zap,
  Rocket,
  CheckCircle2,
  Lightbulb,
  Shield,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
  AlertCircle,
  Clock,
  Filter,
  Search,
  BarChart3,
  PiggyBank
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { groupsService } from '../../services/apiService';

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

const groupTypes = [
  {
    value: 'SAVINGS',
    label: 'Savings Group',
    description: 'Regular contributions for collective savings and personal loans',
    icon: PiggyBank,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-100 to-emerald-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700'
  },
  {
    value: 'INVESTMENT',
    label: 'Investment Group',
    description: 'Pool funds for business ventures, stocks, and other investments',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  {
    value: 'WELFARE',
    label: 'Welfare Group',
    description: 'Support members during emergencies and special occasions',
    icon: HeartHandshake,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-100 to-pink-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  {
    value: 'MIXED',
    label: 'Mixed Purpose',
    description: 'Combine savings, investments, and welfare activities',
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-gradient-to-br from-orange-100 to-amber-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700'
  }
];

const frequencyOptions = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-Weekly' },
  { value: 'MONTHLY', label: 'Monthly' }
];

// Group Creation Insights Component
const GroupCreationInsights = () => {
  const insights = [
    {
      title: 'Success Rate',
      value: '95%',
      description: 'Groups become active',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Avg. Members',
      value: '24',
      description: 'Per group initially',
      color: 'text-blue-300',
      icon: Users,
    },
    {
      title: 'Growth Time',
      value: '2 Weeks',
      description: 'To full membership',
      color: 'text-purple-300',
      icon: Clock,
    },
  ];

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
            <h3 className="font-bold text-xl">Creation Insights</h3>
            <p className="text-white/60 text-sm mt-1">Key metrics for success</p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          {insights.map((insight, index) => (
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
            </motion.div>
          ))}
        </div>
        
        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-6 pt-6 border-t border-white/20"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-200 mb-2">Quick Tips:</p>
            {[
              "Start with clear objectives",
              "Set realistic contributions",
              "Invite trusted members",
              "Schedule regular meetings"
            ].map((tip, index) => (
              <div key={index} className="flex items-center gap-2 text-xs opacity-75">
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export function CreateGroupPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'SAVINGS',
    objectives: '',
    contribution_frequency: 'MONTHLY',
    minimum_contribution: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      group_type: type,
    });
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const group = await groupsService.createGroup({
        name: formData.name,
        description: formData.description,
        group_type: formData.group_type as 'SAVINGS' | 'INVESTMENT' | 'WELFARE' | 'MIXED',
        objectives: formData.objectives,
        contribution_frequency: formData.contribution_frequency as 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
        minimum_contribution: Number(formData.minimum_contribution),
      });
      navigate(`/groups/${group.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = groupTypes.find(type => type.value === formData.group_type);

  return (
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
              onClick={() => navigate('/groups')} 
              className="group flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Groups</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Create New Group
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <Calendar className="h-5 w-5" />
                Build your community and start growing together
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
              onClick={() => navigate('/groups')}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
            >
              <Download className="h-4 w-4" />
              View Templates
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Main Form Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-4">
                  {/* Progress Steps */}
                  <div className="flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                        {currentStep === 1 ? 'Choose Group Type' : 'Group Details'}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm mt-1">
                        {currentStep === 1 ? 'Select the purpose that best fits your goals' : 'Complete your group information'}
                      </CardDescription>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="flex items-center gap-4">
                      {[1, 2].map((step) => (
                        <div key={step} className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all ${
                            currentStep >= step 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-600 border-purple-500 text-white shadow-lg' 
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                          </div>
                          {step < 2 && (
                            <div className={`w-8 h-1 rounded-full ${
                              currentStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 1: Group Type Selection */}
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groupTypes.map((type) => {
                          const Icon = type.icon;
                          const isSelected = formData.group_type === type.value;
                          return (
                            <motion.button
                              key={type.value}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleTypeSelect(type.value)}
                              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                isSelected
                                  ? `${type.borderColor} ${type.bgColor} shadow-xl`
                                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <h4 className={`font-bold text-lg mb-3 ${isSelected ? type.textColor : 'text-gray-800'}`}>
                                {type.label}
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {type.description}
                              </p>
                              {isSelected && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="text-sm font-medium">Selected - Click to continue</span>
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 2: Group Details Form */}
                <AnimatePresence mode="wait">
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">Complete Group Setup</h3>
                          <p className="text-gray-600">Fill in the details to launch your group</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentStep(1)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-xl border border-gray-200 hover:border-purple-300"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Types
                        </motion.button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Group Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Group Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                            placeholder="e.g., Sunrise Savings Group"
                            required
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[100px] bg-white"
                            placeholder="Brief description of your group's purpose and values..."
                          />
                        </div>

                        {/* Objectives */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Objectives *
                          </label>
                          <textarea
                            name="objectives"
                            value={formData.objectives}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[120px] bg-white"
                            placeholder="What are the main goals and objectives of this group?"
                            required
                          />
                        </div>

                        {/* Contribution Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Contribution Frequency *
                            </label>
                            <select
                              name="contribution_frequency"
                              value={formData.contribution_frequency}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white appearance-none"
                              required
                            >
                              {frequencyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Minimum Contribution (KES) *
                            </label>
                            <input
                              type="number"
                              name="minimum_contribution"
                              value={formData.minimum_contribution}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                              placeholder="1000"
                              min="0"
                              step="100"
                              required
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => navigate('/groups')}
                            className="flex-1 py-4 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:border-red-500 hover:text-red-600 transition-all"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                            {loading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                  <Sparkles className="h-5 w-5" />
                                </motion.div>
                                Creating Group...
                              </>
                            ) : (
                              <>
                                <Rocket className="h-5 w-5" />
                                Launch Group
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Group Creation Insights Sidebar */}
          <GroupCreationInsights />
        </motion.div>
      </div>
    </div>
  );
}