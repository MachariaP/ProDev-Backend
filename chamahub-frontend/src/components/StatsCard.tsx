import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className={cn('overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/95', className)}>
        <CardContent className="p-6 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
          
          <div className="flex items-center justify-between relative">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              <motion.p
                className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                {value}
              </motion.p>
              {trend !== undefined && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    'flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full w-fit',
                    isPositiveTrend 
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                      : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  <span className="text-base">{isPositiveTrend ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend).toFixed(1)}%</span>
                </motion.div>
              )}
            </div>
            <motion.div
              className={cn(
                'rounded-xl p-4 shadow-md',
                iconClassName || 'bg-gradient-to-br from-primary to-primary/80'
              )}
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-8 w-8 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
