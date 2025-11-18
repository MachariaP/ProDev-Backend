import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Download, Filter, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { financeService } from '../../services/apiService';
import type { Loan } from '../../types/api';

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    try {
      const res = await financeService.getLoans();
      setLoans(res.results || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = {
    active: loans.filter(l => ['ACTIVE','DISBURSED'].includes(l.status)).length,
    completed: loans.filter(l => l.status === 'COMPLETED').length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    totalAmount: loans.reduce((s, l) => s + Number(l.amount), 0)
  };

  const progress = (loan: Loan) => (loan.total_repaid || 0) / (loan.amount || 1) * 100;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading loans...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/finance')} className="p-3 rounded-2xl bg-white shadow-md hover:shadow-lg group">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Loans Management
              </h1>
              <p className="text-gray-600 mt-1">Track applications & repayments</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg border">
              <Download className="h-4 w-4" /> Export
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">
              <Plus className="h-5 w-5" /> Apply for Loan
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Active Loans", value: stats.active, icon: Clock, color: "blue" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "green" },
            { label: "Pending", value: stats.pending, icon: AlertCircle, color: "yellow" },
            { label: "Total Portfolio", value: `KES ${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: "purple" },
          ].map((s, i) => (
            <Card key={i} className={`shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-${s.color}-500`}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{s.label}</p>
                    <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-${s.color}-100`}><s.icon className={`h-8 w-8 text-${s.color}-600`} /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loans List */}
        {loans.length === 0 ? (
          <Card className="shadow-2xl text-center py-20">
            <CardContent>
              <div className="p-6 rounded-3xl bg-blue-100 w-fit mx-auto mb-6">
                <DollarSign className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Loans Yet</h3>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg">
                Apply Now
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">All Loans</CardTitle>
                  <CardDescription>View loan details and repayment progress</CardDescription>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-xl"><Filter className="h-4 w-4" /> Filter</button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input placeholder="Search loans..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {loans.map((loan) => (
                  <motion.div key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 hover:bg-gray-50/50 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50">
                          <DollarSign className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">KES {Number(loan.amount).toLocaleString()}</h3>
                          <p className="text-gray-600">{loan.purpose}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                        loan.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                        ['ACTIVE','DISBURSED'].includes(loan.status) ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-600">Interest</p><p className="font-bold">{loan.interest_rate}%</p></div>
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-600">Duration</p><p className="font-bold">{loan.duration_months} mo</p></div>
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-600">Repaid</p><p className="font-bold text-green-600">KES {(loan.total_repaid||0).toLocaleString()}</p></div>
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-600">Due</p><p className="font-bold flex items-center justify-center gap-1"><Calendar className="h-4 w-4" /> {loan.due_date ? new Date(loan.due_date).toLocaleDateString().slice(0,10) : '—'}</p></div>
                    </div>
                    {['ACTIVE','DISBURSED'].includes(loan.status) && (
                      <div>
                        <div className="flex justify-between text-sm mb-2"><span>Repayment Progress</span><span>{progress(loan).toFixed(0)}%</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress(loan)}%` }} className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Modal placeholder */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
            <h2 className="text-3xl font-bold mb-4">Apply for Loan</h2>
            <p className="text-gray-600 mb-8">Loan application form coming soon...</p>
            <button onClick={() => setShowForm(false)} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg">
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}