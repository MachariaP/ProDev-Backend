// src/pages/dashboard/AnalyticsPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, AlertCircle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import api from '../../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type Group = { id: string; name: string };
type AnalyticsData = {
  contributions_over_time: Array<{ date: string; amount: number }>;
  member_activity: Array<{ member_name: string; transactions: number }>;
  category_breakdown: Array<{ name: string; value: number }>;
  growth_trends: Array<{ month: string; growth: number }>;
};

export function AnalyticsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    contributions_over_time: [],
    member_activity: [],
    category_breakdown: [],
    growth_trends: [],
  });

  // Load user's groups
  useEffect(() => {
    api.get('/groups/my-groups/')
      .then(res => {
        setGroups(res.data);
        if (res.data.length > 0) {
          setSelectedGroupId(res.data[0].id);
        }
      })
      .catch(() => setError('Failed to load your chamas'))
      .finally(() => setLoading(false));
  }, []);

  // Load analytics when group changes
  useEffect(() => {
    if (!selectedGroupId) return;

    setFetching(true);
    setError(null);

    api.get(`/analytics/dashboard/?group_id=${selectedGroupId}`)
      .then(res => setAnalyticsData(res.data))
      .catch(err => {
        const msg = err.response?.data?.error || 'Failed to load analytics';
        setError(
          msg.includes('generated') || err.response?.status === 503
            ? 'Analytics are being generated for the first time — please wait 2–5 minutes and refresh!'
            : msg
        );
      })
      .finally(() => setFetching(false));
  }, [selectedGroupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">Real-time insights for your chama</p>
              </div>
            </div>

            {/* Native HTML Select — no shadcn/ui dependency */}
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={fetching || groups.length === 0}
              className="px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none min-w-64"
            >
              {groups.length === 0 ? (
                <option>No chamas found</option>
              ) : (
                groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </motion.div>

        {/* Simple Error Alert — no external component needed */}
        {error && (
          <div className="mb-8 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {fetching && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Contributions Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Contributions Over Time</CardTitle>
              <CardDescription>Daily contribution trends (last 12 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.contributions_over_time}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Member Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Most Active Members</CardTitle>
              <CardDescription>Top contributors by transaction count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.member_activity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis type="number" />
                  <YAxis dataKey="member_name" type="category" width={130} />
                  <Tooltip formatter={(v: number) => `${v} transactions`} />
                  <Bar dataKey="transactions" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Categories</CardTitle>
              <CardDescription>How money is being spent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.category_breakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {analyticsData.category_breakdown.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 4. Monthly Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Growth</CardTitle>
              <CardDescription>Total contributions per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.growth_trends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                  <Bar dataKey="growth" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
