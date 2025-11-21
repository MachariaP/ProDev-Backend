import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Download, Filter, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { financeService } from '../../services/apiService';
import type { Loan } from '../../types/api';

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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
    totalAmount: loans.reduce((s, l) => s + Number(l.principal_amount), 0)
  };

  const progress = (loan: Loan) => (loan.total_repaid || 0) / (Number(loan.principal_amount) || 1) * 100;

  const handleExport = () => {
    setExporting(true);
    try {
      // Prepare CSV data
      const headers = ['Loan ID', 'Borrower', 'Amount (KES)', 'Interest Rate (%)', 'Duration (Months)', 'Status', 'Purpose', 'Applied Date', 'Total Repaid (KES)', 'Outstanding (KES)'];
      const rows = loans.map(loan => [
        loan.id,
        loan.borrower_name || 'Unknown Borrower',
        Number(loan.principal_amount).toFixed(2),
        loan.interest_rate,
        loan.duration_months,
        loan.status,
        loan.purpose,
        new Date(loan.applied_at).toLocaleDateString(),
        (loan.total_repaid || 0).toFixed(2),
        Number(loan.outstanding_balance).toFixed(2)
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `loans_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export loans. Please try again.');
    } finally {
      setExporting(false);
    }
  };

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
            <button 
              onClick={handleExport}
              disabled={exporting || loans.length === 0}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Download className="h-4 w-4" /> 
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/loans/apply')}
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
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/loans/apply')}
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
                          <h3 className="font-bold text-xl">KES {Number(loan.principal_amount).toLocaleString()}</h3>
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
    </div>
  );
}