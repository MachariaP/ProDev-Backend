import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Users,
  TrendingUp,
  Shield,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,


} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to ChamaHub!',
    description:
      'Your all-in-one platform for managing savings groups, investments, and financial growth.',
    icon: Sparkles,
    features: [
      'Track contributions and expenses',
      'Manage group loans',
      'Invest in treasury bills',
      'Generate financial reports',
    ],
  },
  {
    id: 2,
    title: 'Join or Create Groups',
    description:
      'Connect with your savings group (chama) or create a new one to start your financial journey.',
    icon: Users,
    features: [
      'Create multiple groups',
      'Invite members via email',
      'Set contribution schedules',
      'Define group rules and goals',
    ],
  },
  {
    id: 3,
    title: 'Track Your Finances',
    description:
      'Stay on top of your contributions, loans, and investments with real-time updates.',
    icon: Wallet,
    features: [
      'Real-time balance tracking',
      'Automated reminders',
      'Transaction history',
      'M-Pesa integration',
    ],
  },
  {
    id: 4,
    title: 'Grow Your Wealth',
    description:
      'Access loans, invest idle funds, and watch your wealth grow with our automated wealth engine.',
    icon: TrendingUp,
    features: [
      'Low-interest group loans',
      'Treasury bill investments',
      'Automated wealth engine',
      'Investment portfolio tracking',
    ],
  },
  {
    id: 5,
    title: 'Bank-Level Security',
    description:
      'Your financial data is protected with enterprise-grade security and encryption.',
    icon: Shield,
    features: [
      'End-to-end encryption',
      'Two-factor authentication',
      'Audit logs and compliance',
      'Secure M-Pesa integration',
    ],
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Skip Tour
            </button>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-2xl">
              <CardContent className="p-8 md:p-12">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-8"
                >
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg">
                    <Icon className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                {/* Title and Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {step.description}
                  </p>
                </motion.div>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                >
                  {step.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Navigation Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Previous
                  </motion.button>

                  <div className="flex gap-2">
                    {onboardingSteps.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          index === currentStep
                            ? 'bg-primary w-8'
                            : index < currentStep
                            ? 'bg-primary/50'
                            : 'bg-secondary'
                        }`}
                      />
                    ))}
                  </div>

                  {isLastStep ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleComplete}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Get Started
                      <Sparkles className="h-5 w-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Next
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            You can access this tour again from Settings → Help
          </p>
        </motion.div>
      </div>
    </div>
  );
}
