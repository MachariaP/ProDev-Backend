// chamahub-frontend/src/components/StatsCard.tsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatting';

interface StatsCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  formatAsCurrency?: boolean;
  animateValue?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  iconClassName, 
  formatAsCurrency = true,
  animateValue = true
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(animateValue ? 0 : value);
  const isPositive = trend >= 0;
  
  useEffect(() => {
    if (!animateValue) return;
    
    const duration = 1500; // Animation duration in ms
    const steps = 60; // Number of animation steps
    const stepValue = value / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.min(stepValue * currentStep, value));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value); // Ensure final value is exact
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, animateValue]);
  
  const formattedValue = formatAsCurrency 
    ? formatCurrency(displayValue)
    : Math.round(displayValue).toLocaleString();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-6 rounded-3xl border border-gray-200/30 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-14 w-14 rounded-2xl ${iconClassName} flex items-center justify-center shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
          isPositive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {formatPercentage(trend)}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
          {formattedValue}
        </p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
      {/* Subtle progress indicator */}
      <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.abs(trend) * 2, 100)}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
        />
      </div>
    </motion.div>
  );
}
