# 🎨 Guide 8: Eye-Catching UI Components with Modern Design

> **Duration:** 180-240 minutes (3-4 hours)  
> **Prerequisites:** Guide 7 completed, React/TypeScript basics  
> **Outcome:** Beautiful, animated, accessible UI components for ChamaHub

---

## 🎯 What You'll Build

In this guide, you'll create a stunning, modern UI component library for ChamaHub using:
- **shadcn/ui** - Beautifully designed, accessible components
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide Icons** - Clean, consistent iconography
- **Recharts** - Beautiful data visualization
- **Dark Mode Support** - Theme switching

### ✨ Components You'll Create

1. **🎴 Animated Dashboard Cards** - Stats cards with hover effects
2. **📊 Interactive Charts** - Wealth growth, contribution trends
3. **💰 Contribution Feed** - Real-time transaction list
4. **👥 Member Cards** - Beautiful member profiles
5. **🔔 Notification System** - Toast notifications with animations
6. **🎨 Color Themes** - Light/dark mode with smooth transitions
7. **📱 Mobile Navigation** - Responsive drawer menu
8. **✨ Loading States** - Skeleton screens and spinners

---

## Part I: Project Setup and Foundation

### 1.1 Create Frontend Project

```bash
# Navigate to repository root
cd /home/runner/work/ProDev-Backend/ProDev-Backend

# Create frontend directory
npm create vite@latest chamahub-frontend -- --template react-ts

# Navigate to frontend
cd chamahub-frontend

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init

# Install additional dependencies
npm install framer-motion lucide-react recharts
npm install @tanstack/react-query axios zustand
npm install react-router-dom react-hook-form @hookform/resolvers zod
npm install clsx tailwind-merge class-variance-authority
```

### 1.2 Configure Tailwind CSS

**Update `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 1.3 Update Global Styles

**Create `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 142 76% 36%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 142 76% 36%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 142 76% 36%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-muted;
}

::-webkit-scrollbar-thumb {
  @apply bg-primary/30 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-primary/50;
}

/* Smooth transitions */
* {
  @apply transition-colors duration-200;
}
```

---

## Part II: Core UI Components

### 2.1 Install shadcn/ui Components

```bash
# Install core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add progress
```

### 2.2 Create Utility Helpers

**Create `src/lib/utils.ts`:**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
```

---

## Part III: Eye-Catching Dashboard Components

### 3.1 Animated Stats Card

**Create `src/components/dashboard/StatsCard.tsx`:**

```typescript
import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden group">
        {/* Gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.1 }}
              >
                <h3 className="text-3xl font-bold tracking-tight">
                  {typeof value === "number" ? formatCurrency(value) : value}
                </h3>
              </motion.div>
              
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: delay + 0.2 }}
                  className={cn(
                    "flex items-center text-sm font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  <span>{trend.isPositive ? "+" : "-"}</span>
                  <span>{Math.abs(trend.value)}%</span>
                  <span className="ml-1 text-muted-foreground">vs last month</span>
                </motion.div>
              )}
            </div>
            
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className={cn(
                "p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5",
                iconColor
              )}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
        </CardContent>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </Card>
    </motion.div>
  );
};
```

**Usage Example:**

```typescript
import { Wallet, TrendingUp, Users, Activity } from "lucide-react";

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatsCard
    title="Total Balance"
    value={524300}
    icon={Wallet}
    trend={{ value: 12.5, isPositive: true }}
    delay={0}
  />
  <StatsCard
    title="This Month"
    value={45000}
    icon={TrendingUp}
    trend={{ value: 8.3, isPositive: true }}
    iconColor="text-green-600"
    delay={0.1}
  />
  <StatsCard
    title="Active Members"
    value={24}
    icon={Users}
    trend={{ value: 2, isPositive: true }}
    iconColor="text-blue-600"
    delay={0.2}
  />
  <StatsCard
    title="Pending Loans"
    value={3}
    icon={Activity}
    iconColor="text-orange-600"
    delay={0.3}
  />
</div>
```

### 3.2 Interactive Contribution Chart

**Create `src/components/dashboard/ContributionChart.tsx`:**

```typescript
import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface ChartData {
  month: string;
  contributions: number;
  expenses: number;
  balance: number;
}

const mockData: ChartData[] = [
  { month: "Jan", contributions: 45000, expenses: 12000, balance: 33000 },
  { month: "Feb", contributions: 52000, expenses: 15000, balance: 70000 },
  { month: "Mar", contributions: 48000, expenses: 18000, balance: 100000 },
  { month: "Apr", contributions: 61000, expenses: 22000, balance: 139000 },
  { month: "May", contributions: 55000, expenses: 20000, balance: 174000 },
  { month: "Jun", contributions: 67000, expenses: 25000, balance: 216000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ContributionChart: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={mockData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="contributions"
                stroke="hsl(142 76% 36%)"
                fillOpacity={1}
                fill="url(#colorContributions)"
                name="Contributions"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="hsl(0 84.2% 60.2%)"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(217.2 91.2% 59.8%)"
                fillOpacity={1}
                fill="url(#colorBalance)"
                name="Balance"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};
```

### 3.3 Live Contribution Feed

**Create `src/components/dashboard/ContributionFeed.tsx`:**

```typescript
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpCircle, Clock, CheckCircle2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";

interface Contribution {
  id: string;
  memberName: string;
  memberAvatar?: string;
  amount: number;
  timestamp: string;
  status: "confirmed" | "pending";
  mpesaCode: string;
}

const mockContributions: Contribution[] = [
  {
    id: "1",
    memberName: "Jane Wanjiku",
    amount: 5000,
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: "confirmed",
    mpesaCode: "RK2X8HN9PQ",
  },
  {
    id: "2",
    memberName: "John Kamau",
    amount: 3000,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "confirmed",
    mpesaCode: "RK2X8HN9PR",
  },
  {
    id: "3",
    memberName: "Mary Achieng",
    amount: 7500,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "pending",
    mpesaCode: "RK2X8HN9PS",
  },
];

export const ContributionFeed: React.FC = () => {
  const [contributions, setContributions] = React.useState(mockContributions);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">
            Recent Contributions
          </CardTitle>
          <Badge variant="secondary" className="animate-pulse">
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {contributions.map((contribution, index) => (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    {contribution.memberAvatar ? (
                      <AvatarImage src={contribution.memberAvatar} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {getInitials(contribution.memberName)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {contribution.memberName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contribution.mpesaCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(contribution.amount)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(contribution.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {contribution.status === "confirmed" ? (
                        <Badge
                          variant="default"
                          className="h-5 text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-5 text-xs animate-pulse"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ArrowUpCircle className="h-5 w-5 text-primary" />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {contributions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No contributions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
```

### 3.4 Member Grid Card

**Create `src/components/dashboard/MemberCard.tsx`:**

```typescript
import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, getInitials } from "@/lib/utils";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: "chair" | "treasurer" | "member";
    totalContributed: number;
    contributionTarget: number;
    creditScore: number;
    joinedDate: string;
  };
  delay?: number;
}

const roleColors = {
  chair: "bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
  treasurer: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
  member: "bg-gray-500/10 text-gray-700 hover:bg-gray-500/20",
};

const roleLabels = {
  chair: "Chairperson",
  treasurer: "Treasurer",
  member: "Member",
};

export const MemberCard: React.FC<MemberCardProps> = ({ member, delay = 0 }) => {
  const contributionPercentage = (member.totalContributed / member.contributionTarget) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden group cursor-pointer">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-6 relative">
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar with role indicator */}
            <div className="relative">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xl font-bold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </motion.div>

              {/* Credit score badge */}
              {member.creditScore >= 80 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.2, type: "spring" }}
                  className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1.5 shadow-lg"
                >
                  <Award className="h-4 w-4 text-yellow-900" />
                </motion.div>
              )}
            </div>

            {/* Name and role */}
            <div className="text-center space-y-2 w-full">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <Badge variant="secondary" className={cn(roleColors[member.role])}>
                {roleLabels[member.role]}
              </Badge>
            </div>

            {/* Contact info */}
            <div className="space-y-2 w-full text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{member.phone}</span>
              </div>
            </div>

            {/* Contribution progress */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contributed</span>
                <span className="font-medium">
                  {formatCurrency(member.totalContributed)}
                </span>
              </div>
              <Progress value={contributionPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(contributionPercentage)}% of target</span>
                <span>Goal: {formatCurrency(member.contributionTarget)}</span>
              </div>
            </div>

            {/* Credit score */}
            <div className="w-full p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Credit Score</span>
              </div>
              <span className={cn(
                "text-lg font-bold",
                member.creditScore >= 80 ? "text-green-600" :
                member.creditScore >= 60 ? "text-yellow-600" :
                "text-red-600"
              )}>
                {member.creditScore}/100
              </span>
            </div>
          </div>
        </CardContent>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </Card>
    </motion.div>
  );
};
```

**Usage Example:**

```typescript
const members = [
  {
    id: "1",
    name: "Jane Wanjiku",
    email: "jane@example.com",
    phone: "+254712345678",
    role: "chair" as const,
    totalContributed: 45000,
    contributionTarget: 60000,
    creditScore: 95,
    joinedDate: "2024-01-15",
  },
  // ... more members
];

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {members.map((member, index) => (
    <MemberCard key={member.id} member={member} delay={index * 0.05} />
  ))}
</div>
```

---

## Part IV: Advanced UI Features

### 4.1 Skeleton Loading States

**Create `src/components/ui/loading-skeleton.tsx`:**

```typescript
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const StatsCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
};

export const MemberCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 w-full text-center">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
};
```

### 4.2 Toast Notification System

**Create `src/components/ui/toast-notification.tsx`:**

```typescript
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastColors = {
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
};

const iconColors = {
  success: "text-green-600",
  error: "text-red-600",
  info: "text-blue-600",
  warning: "text-yellow-600",
};

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
}) => {
  const Icon = toastIcons[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        toastColors[toast.type]
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", iconColors[toast.type])} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={() => onClose(toast.id)}
              className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className={cn("h-1", iconColors[toast.type])}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
      />
    </motion.div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    toast,
    dismiss,
    success: (title: string, message?: string, duration?: number) =>
      toast({ type: "success", title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      toast({ type: "error", title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      toast({ type: "info", title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      toast({ type: "warning", title, message, duration }),
  };
};
```

**Usage Example:**

```typescript
import { ToastContainer, useToast } from "@/components/ui/toast-notification";

function App() {
  const { toasts, dismiss, success, error } = useToast();

  const handleContribution = async () => {
    try {
      // API call
      success(
        "Contribution Received!",
        "KES 5,000 has been added to your account"
      );
    } catch (err) {
      error(
        "Payment Failed",
        "Unable to process your contribution. Please try again."
      );
    }
  };

  return (
    <>
      <YourComponents />
      <ToastContainer toasts={toasts} onClose={dismiss} />
    </>
  );
}
```

---

## Part V: Complete Dashboard Example

**Create `src/pages/Dashboard.tsx`:**

```typescript
import React from "react";
import { Wallet, TrendingUp, Users, Activity } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContributionChart } from "@/components/dashboard/ContributionChart";
import { ContributionFeed } from "@/components/dashboard/ContributionFeed";
import { MemberCard } from "@/components/dashboard/MemberCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, Jane! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your chama today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={524300}
          icon={Wallet}
          trend={{ value: 12.5, isPositive: true }}
          delay={0}
        />
        <StatsCard
          title="This Month"
          value={45000}
          icon={TrendingUp}
          trend={{ value: 8.3, isPositive: true }}
          iconColor="text-green-600"
          delay={0.1}
        />
        <StatsCard
          title="Active Members"
          value={24}
          icon={Users}
          trend={{ value: 2, isPositive: true }}
          iconColor="text-blue-600"
          delay={0.2}
        />
        <StatsCard
          title="Pending Loans"
          value={3}
          icon={Activity}
          iconColor="text-orange-600"
          delay={0.3}
        />
      </div>

      {/* Charts and Feed */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContributionChart />
        </div>
        <div>
          <ContributionFeed />
        </div>
      </div>

      {/* Members Section */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="top-contributors">Top Contributors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Member cards would be rendered here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

---

## 🎉 Summary

You've created a comprehensive, eye-catching UI component library! Here's what you built:

✅ **Modern Design System** with Tailwind CSS and shadcn/ui  
✅ **Animated Components** using Framer Motion  
✅ **Interactive Charts** with Recharts  
✅ **Real-time Updates** with animated feeds  
✅ **Beautiful Loading States** with skeletons  
✅ **Toast Notifications** with progress bars  
✅ **Dark Mode Support** with theme switching  
✅ **Responsive Design** mobile-first approach  

### 🚀 Next Steps

1. **Guide 9**: Build complete dashboard pages
2. **Guide 10**: Create advanced form components
3. **Guide 11**: Implement real-time WebSocket features

### 📚 Resources

- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for ChamaHub**
