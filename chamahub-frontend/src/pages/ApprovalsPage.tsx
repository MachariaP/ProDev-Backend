import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, DollarSign, FileText, Users, Download, Filter, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import api from '../services/api';

interface DisbursementApproval { id: number; approval_type: 'LOAN'|'EXPENSE'|'WITHDRAWAL'; amount: number; description: string; status: 'PENDING'|'APPROVED'|'REJECTED'; approvals_count: number; required_approvals: number; requested_by_name: string; created_at: string; signatures: any[]; }

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<DisbursementApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DisbursementApproval | null>(null);
  const navigate = useNavigate();

  useEffect(() => { fetchApprovals(); }, []);

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/finance/disbursement-approvals/');
      setApprovals((res.data.results || res.data) as DisbursementApproval[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSign = async (id: number, approved: boolean) => {
    await api.post('/finance/approval-signatures/', { approval: id, approved, comments: approved ? 'Approved' : 'Rejected' });
    fetchApprovals();
    setSelected(null);
  };

  const stats = {
    pending: approvals.filter(a => a.status === 'PENDING').length,
    approved: approvals.filter(a => a.status === 'APPROVED').length,
    totalAmount: approvals.reduce((s, a) => s + a.amount, 0)
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading approvals...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4">
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/finance')} className="p-3 rounded-2xl bg-white shadow-md hover:shadow-lg group">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition" />
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Approvals
              </h1>
              <p className="text-gray-600 mt-1">Multi-signature disbursement requests</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg border">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Pending", value: stats.pending, icon: Clock, color: "yellow" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "green" },
            { label: "Total Amount", value: `KES ${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: "purple" },
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

        {/* List */}
        {approvals.length === 0 ? (
          <Card className="shadow-2xl text-center py-20">
            <CardContent>
              <div className="p-6 rounded-3xl bg-orange-100 w-fit mx-auto mb-6">
                <CheckCircle className="h-16 w-16 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Pending Approvals</h3>
              <p className="text-gray-600">All clear!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Approval Requests</CardTitle>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-xl"><Filter className="h-4 w-4" /> Filter</button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {approvals.map((a) => (
                  <motion.div key={a.id} whileHover={{ backgroundColor: 'rgb(249 250 251)' }} className="p-6 cursor-pointer" onClick={() => setSelected(a)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-red-50">
                          {a.approval_type === 'LOAN' ? <DollarSign className="h-7 w-7 text-orange-600" /> :
                           a.approval_type === 'EXPENSE' ? <FileText className="h-7 w-7 text-purple-600" /> :
                           <Users className="h-7 w-7 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-xl">{a.approval_type} Request</p>
                          <p className="text-gray-600">{a.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-orange-600">KES {a.amount.toLocaleString()}</p>
                        <span className={`mt-2 inline-block px-4 py-2 rounded-full text-sm border ${
                          a.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                          a.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">Progress: {a.approvals_count} / {a.required_approvals} signatures</span>
                        <div className="w-64 bg-gray-200 rounded-full h-3 mt-2">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(a.approvals_count / a.required_approvals) * 100}%` }}
                            className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600" />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <Users className="inline h-4 w-4" /> {a.requested_by_name} • {new Date(a.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-4">{selected.approval_type} Approval</h2>
            <p className="text-xl text-gray-700 mb-6">KES {selected.amount.toLocaleString()}</p>
            <p className="text-gray-600 mb-8">{selected.description}</p>

            <div className="space-y-4 mb-8">
              {selected.signatures.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    {s.approved ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                    <div>
                      <p className="font-medium">{s.approver_name}</p>
                      <p className="text-sm text-gray-600">{s.comments}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(s.signed_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex gap-4">
                <button onClick={() => handleSign(selected.id, true)}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl">
                  <CheckCircle className="inline mr-2 h-5 w-5" /> Approve
                </button>
                <button onClick={() => handleSign(selected.id, false)}
                  className="flex-1 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl">
                  <XCircle className="inline mr-2 h-5 w-5" /> Reject
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}