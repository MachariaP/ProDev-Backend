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
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { groupsService } from '../../services/apiService';

const groupTypes = [
  {
    value: 'SAVINGS',
    label: 'Savings Group',
    description: 'Regular contributions for collective savings and personal loans',
    icon: Building,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    value: 'INVESTMENT',
    label: 'Investment Group',
    description: 'Pool funds for business ventures, stocks, and other investments',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    value: 'WELFARE',
    label: 'Welfare Group',
    description: 'Support members during emergencies and special occasions',
    icon: HeartHandshake,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    value: 'MIXED',
    label: 'Mixed Purpose',
    description: 'Combine savings, investments, and welfare activities',
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  }
];

const frequencyOptions = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-Weekly' },
  { value: 'MONTHLY', label: 'Monthly' }
];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Groups
          </motion.button>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl w-fit"
            >
              <Users className="h-8 w-8 text-white" />
            </motion.div>
            <div className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Group
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Build your community and start growing together
              </CardDescription>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-4">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all ${
                      currentStep >= step 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                    </div>
                    <span className={`font-medium ${
                      currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {step === 1 ? 'Type' : 'Details'}
                    </span>
                    {step < 2 && (
                      <div className={`w-8 h-1 rounded-full ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
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
                  <FileText className="h-5 w-5 flex-shrink-0" />
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
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Group Type</h3>
                    <p className="text-gray-600">Select the purpose that best fits your group's goals</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h4 className={`font-bold text-lg mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                            {type.label}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {type.description}
                          </p>
                          {isSelected && (
                            <div className="flex items-center gap-1 mt-3 text-blue-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm font-medium">Selected</span>
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">Group Details</h3>
                      <p className="text-gray-600">Complete your group information</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Group Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Group Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., Sunrise Savings Group"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                        placeholder="Brief description of your group's purpose and values..."
                      />
                    </div>

                    {/* Objectives */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Objectives *
                      </label>
                      <textarea
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px]"
                        placeholder="What are the main goals and objectives of this group?"
                        required
                      />
                    </div>

                    {/* Contribution Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contribution Frequency *
                        </label>
                        <select
                          name="contribution_frequency"
                          value={formData.contribution_frequency}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Minimum Contribution (KES) *
                        </label>
                        <input
                          type="number"
                          name="minimum_contribution"
                          value={formData.minimum_contribution}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="1000"
                          min="0"
                          step="100"
                          required
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => navigate('/groups')}
                        className="flex-1 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:border-red-500 hover:text-red-600 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles className="h-5 w-5" />
                            </motion.div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-5 w-5" />
                            Create Group
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

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Lightbulb className="h-5 w-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Choose a clear, memorable name",
                "Set realistic contribution amounts",
                "Define clear objectives",
                "Start with a trial period",
                "Regular meetings build trust"
              ].map((tip, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="h-5 w-5" />
                Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Pool resources for bigger investments",
                "Build strong community bonds",
                "Achieve financial goals together",
                "Transparent and secure management"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}