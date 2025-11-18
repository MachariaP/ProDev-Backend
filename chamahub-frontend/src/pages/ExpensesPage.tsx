import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, DollarSign, CheckCircle, Clock, XCircle, AlertCircle, Download, Filter, Search, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { financeService } from '../services/apiService';
import type { Expense } from '../types/api';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await financeService.getExpenses();
      setExpenses(res.results || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'PENDING').length,
    approved: expenses.filter(e => e.status === 'APPROVED').length,
    totalAmount: expenses.reduce((s, e) => s + Number(e.amount), 0)
  };

  const categoryIcon = (cat: string) => {
    const map: Record<string, string> = { OPERATIONAL: '🔧', ADMINISTRATIVE: '📋', WELFARE: '❤️', INVESTMENT: '💰' };
    return map[cat] || '📝';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading expenses...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/finance')} className="p-3 rounded-2xl bg-white shadow-md hover:shadow-lg group">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Expenses
              </h1>
              <p className="text-gray-600 mt-1">Manage group spending</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg border">
              <Download className="h-4 w-4" /> Export
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30">
              <Plus className="h-5 w-5" /> Request Expense
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Total Expenses", value: stats.total, icon: Receipt, color: "purple" },
            { label: "Pending", value: stats.pending, icon: AlertCircle, color: "yellow" },
            { label: "Approved", value: stats.approved, icon: Clock, color: "blue" },
            { label: "Total Amount", value: `KES ${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: "green" },
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

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <Card className="shadow-2xl text-center py-20">
            <CardContent>
              <div className="p-6 rounded-3xl bg-purple-100 w-fit mx-auto mb-6">
                <Receipt className="h-16 w-16 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Expenses Yet</h3>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg">
                Request Expense
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">All Expenses</CardTitle>
                  <CardDescription>Expense requests and approvals</CardDescription>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-xl"><Filter className="h-4 w-4" /> Filter</button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {expenses.map((e) => (
                  <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 hover:bg-gray-50/50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-5">
                        <div className="text-4xl">{categoryIcon(e.category)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-3 py-1 bg-gray-100 rounded-full">{e.category}</span>
                          </div>
                          <p className="font-semibold text-lg">{e.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-purple-600">KES {Number(e.amount).toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2 justify-end">
                          {e.status === 'DISBURSED' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                           e.status === 'APPROVED' ? <Clock className="h-5 w-5 text-blue-600" /> :
                           e.status === 'PENDING' ? <AlertCircle className="h-5 w-5 text-yellow-600" /> :
                           <XCircle className="h-5 w-5 text-red-600" />}
                          <span className={`text-xs px-3 py-1 rounded-full border ${
                            e.status === 'DISBURSED' ? 'bg-green-100 text-green-700 border-green-200' :
                            e.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            e.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {e.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm text-gray-500 flex justify-between">
                      <div className="flex items-center gap-4">
                        <span><Users className="inline h-4 w-4" /> Member #{e.requested_by}</span>
                        <span>•</span>
                        <span>{new Date(e.created_at).toLocaleDateString()}</span>
                      </div>
                      {e.approved_by && <span>Approved by Member #{e.approved_by}</span>}
                    </div>
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
            <h2 className="text-3xl font-bold mb-4">Request Expense</h2>
            <p className="text-gray-600 mb-8">Expense request form coming soon...</p>
            <button onClick={() => setShowForm(false)} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg">
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}