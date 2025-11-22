import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, DollarSign, Clock, CheckCircle, 
  AlertCircle, Download, Filter, Search, Calendar,
  TrendingUp, Users, BarChart3, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { financeService } from '../../services/apiService';
import type { Loan } from '../../types/api';

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => { 
    fetchLoans(); 
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter]);

  const fetchLoans = async () => {
    try {
      const res = await financeService.getLoans();
      setLoans(res.results || []);
    } catch (err) { 
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  // Enhanced stats with growth indicators
  const stats = {
    active: loans.filter(l => ['ACTIVE','DISBURSED'].includes(l.status)).length,
    completed: loans.filter(l => l.status === 'COMPLETED').length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    totalAmount: loans.reduce((s, l) => s + Number(l.principal_amount), 0),
    totalInterest: loans.reduce((s, l) => s + (Number(l.principal_amount) * Number(l.interest_rate) / 100), 0)
  };

  // Filter loans based on search and status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, endIndex);

  const progress = (loan: Loan) => (loan.total_repaid || 0) / (Number(loan.principal_amount) || 1) * 100;

  const handleExport = () => {
    setExporting(true);
    try {
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

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `loans_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export loans. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"
        />
        <p className="mt-4 text-slate-600 font-medium">Loading your loans...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-4">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, x: -2 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/finance')} 
              className="p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl border border-slate-200/80 group transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </motion.button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
                Loans Management
              </h1>
              <p className="text-slate-600 mt-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Track applications & manage repayments
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={exporting || loans.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              <Download className="h-4 w-4 group-hover:scale-110 transition-transform" /> 
              {exporting ? 'Exporting...' : 'Export CSV'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => navigate('/loans/apply')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> 
              Apply for Loan
            </motion.button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              label: "Active Loans", 
              value: stats.active, 
              icon: Clock, 
              color: "blue",
              description: "Currently running"
            },
            { 
              label: "Completed", 
              value: stats.completed, 
              icon: CheckCircle, 
              color: "emerald",
              description: "Fully repaid"
            },
            { 
              label: "Pending", 
              value: stats.pending, 
              icon: AlertCircle, 
              color: "amber",
              description: "Awaiting approval"
            },
            { 
              label: "Total Portfolio", 
              value: `KES ${stats.totalAmount.toLocaleString()}`, 
              icon: TrendingUp, 
              color: "violet",
              description: "Total loan value"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50 group hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-2xl bg-${stat.color}-50 group-hover:scale-110 transition-transform duration-200`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Filter & Search Bar */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-800">Loan Portfolio</h3>
                <p className="text-sm text-slate-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} loans
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Items Per Page Selector */}
                <div className="relative">
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="appearance-none pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm font-medium"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm font-medium"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DISBURSED">Disbursed</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    placeholder="Search loans, borrowers, purpose..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Loans List with Pagination */}
        <AnimatePresence>
          {currentLoans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="shadow-2xl text-center py-20 border-0 bg-gradient-to-br from-white to-blue-50/30">
                <CardContent>
                  <div className="p-6 rounded-3xl bg-blue-100/50 w-fit mx-auto mb-6">
                    <DollarSign className="h-16 w-16 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800">
                    {loans.length === 0 ? 'No Loans Yet' : 'No Matching Loans'}
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    {loans.length === 0 
                      ? 'Start building your loan portfolio by creating your first loan application.'
                      : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                    }
                  </p>
                  {loans.length === 0 && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => navigate('/loans/apply')}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Apply for Your First Loan
                    </motion.button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <Card className="shadow-2xl overflow-hidden border-0">
                <CardHeader className="bg-slate-50/50 border-b">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl text-slate-800">Loan Applications</CardTitle>
                      <CardDescription>
                        Page {currentPage} of {totalPages} • {filteredLoans.length} total loans
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>{currentLoans.length} loans on this page</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200/60">
                    {currentLoans.map((loan, index) => (
                      <motion.div 
                        key={loan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer group"
                        onClick={() => navigate(`/loans/${loan.id}`)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-5">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 group-hover:scale-105 transition-transform duration-200">
                              <DollarSign className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                                KES {Number(loan.principal_amount).toLocaleString()}
                              </h3>
                              <p className="text-slate-600">{loan.purpose}</p>
                              <p className="text-sm text-slate-500 mt-1">{loan.borrower_name}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                            loan.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            ['ACTIVE','DISBURSED'].includes(loan.status) ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            loan.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          } group-hover:scale-105 transition-transform`}>
                            {loan.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center mb-4">
                          <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-600">Interest</p><p className="font-bold">{loan.interest_rate}%</p></div>
                          <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-600">Duration</p><p className="font-bold">{loan.duration_months} mo</p></div>
                          <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-600">Repaid</p><p className="font-bold text-green-600">KES {(loan.total_repaid||0).toLocaleString()}</p></div>
                          <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-600">Due</p><p className="font-bold flex items-center justify-center gap-1"><Calendar className="h-4 w-4" /> {loan.due_date ? new Date(loan.due_date).toLocaleDateString().slice(0,10) : '—'}</p></div>
                        </div>
                        
                        {['ACTIVE','DISBURSED'].includes(loan.status) && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-600">Repayment Progress</span>
                              <span className="font-medium">{progress(loan).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${progress(loan)}%` }} 
                                className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 shadow-sm"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="border-t border-slate-200/60 bg-slate-50/30 px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-slate-600">
                        Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredLoans.length)}</span> of{' '}
                        <span className="font-semibold">{filteredLoans.length}</span> loans
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* First Page Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => goToPage(1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </motion.button>

                        {/* Previous Page Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </motion.button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1 mx-2">
                          {getPageNumbers().map((page, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => typeof page === 'number' && goToPage(page)}
                              className={`min-w-[40px] h-10 rounded-lg border transition-all duration-200 ${
                                page === currentPage
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                              } ${page === '...' ? 'cursor-default hover:bg-transparent' : ''}`}
                              disabled={page === '...'}
                            >
                              {page}
                            </motion.button>
                          ))}
                        </div>

                        {/* Next Page Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>

                        {/* Last Page Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => goToPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </motion.button>
                      </div>

                      {/* Items Per Page Selector (Mobile) */}
                      <div className="sm:hidden">
                        <select 
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                        >
                          <option value="5">5 per page</option>
                          <option value="10">10 per page</option>
                          <option value="20">20 per page</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}