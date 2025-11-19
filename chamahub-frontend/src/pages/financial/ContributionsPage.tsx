import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, DollarSign, CheckCircle, AlertCircle, XCircle, 
  Download, Filter, Search, TrendingUp, Users, Calendar, Eye, MoreHorizontal 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { financeService } from '../../services/apiService';
import api from '../../services/api';
import type { Contribution } from '../../types/api';

export function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchContributions(); }, []);

  const fetchContributions = async () => {
    try {
      const response = await financeService.getContributions();
      setContributions(response.results || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleReconcile = async (id: number) => {
    setReconciling(id);
    try {
      await api.post(`/finance/contributions/${id}/reconcile/`);
      await fetchContributions();
    } catch (err) { console.error(err); }
    finally { setReconciling(null); }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RECONCILED': case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDING': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'FAILED': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECONCILED': case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Realistic mock stats
  const stats = { total: 2_850_000, monthly: 485_000, pending: 3, members: 28 };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading contributions...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/finance')} className="p-3 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all group">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Contributions
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2"><Calendar className="h-4 w-4" /> Track member contributions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg border">
              <Download className="h-4 w-4" /> Export
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30">
              <Plus className="h-5 w-5" /> New Contribution
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Total Contributions", value: `KES ${stats.total.toLocaleString()}`, icon: DollarSign, color: "green" },
            { label: "This Month", value: `KES ${stats.monthly.toLocaleString()}`, icon: TrendingUp, color: "blue" },
            { label: "Pending", value: stats.pending, icon: AlertCircle, color: "yellow" },
            { label: "Active Members", value: stats.members, icon: Users, color: "purple" },
          ].map((s, i) => (
            <Card key={i} className={`shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-${s.color}-500`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{s.label}</p>
                    <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-${s.color}-100`}>
                    <s.icon className={`h-8 w-8 text-${s.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* List */}
        {contributions.length === 0 ? (
          <Card className="shadow-2xl text-center py-20">
            <CardContent>
              <div className="p-6 rounded-3xl bg-green-100 w-fit mx-auto mb-6">
                <DollarSign className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Contributions Yet</h3>
              <p className="text-gray-600 mb-8">Start recording member contributions</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg">
                Record First Contribution
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">Recent Contributions</CardTitle>
                  <CardDescription>All member payments and statuses</CardDescription>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50">
                    <Filter className="h-4 w-4" /> Filter
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {contributions.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50">
                          <DollarSign className="h-7 w-7 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Member #{c.member}</p>
                          <p className="text-sm text-gray-600">{c.payment_method}</p>
                          {c.reference_number && <p className="text-xs text-gray-500 mt-1">Ref: {c.reference_number}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-xl text-green-600">KES {Number(c.amount).toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2 justify-end">
                            {getStatusIcon(c.status)}
                            <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(c.status)}`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          {c.status === 'COMPLETED' && (
                            <button onClick={() => handleReconcile(c.id)}
                              disabled={reconciling === c.id}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50">
                              {reconciling === c.id ? 'Reconciling...' : 'Reconcile'}
                            </button>
                          )}
                          <button className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="h-4 w-4" /></button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreHorizontal className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}