import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Mail,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3,
  PiggyBank,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

// Floating Background Elements
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ 
      y: [0, -15, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    {children}
  </motion.div>
);

interface StatementParams {
  group_id?: string;
  date_from: string;
  date_to: string;
  format: 'pdf' | 'excel';
  include_transactions: boolean;
  include_loans: boolean;
  include_investments: boolean;
}

// Statement Insights Component
const StatementInsights = () => {
  const insights = [
    {
      title: 'Most Generated',
      value: 'PDF',
      description: '80% of statements',
      color: 'text-purple-300',
      icon: FileText,
    },
    {
      title: 'Avg. Usage',
      value: '12/mo',
      description: 'Per group average',
      color: 'text-green-300',
      icon: TrendingUp,
    },
    {
      title: 'Popular Range',
      value: 'Monthly',
      description: 'Most common period',
      color: 'text-blue-300',
      icon: Calendar,
    },
  ];

  return (
    <Card className="shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity
            }}
          >
            <Sparkles className="h-6 w-6 text-yellow-300" />
          </motion.div>
          <div>
            <h3 className="font-bold text-xl">Statement Insights</h3>
            <p className="text-white/60 text-sm mt-1">Usage patterns and analytics</p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-200 text-sm">{insight.title}</p>
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
              </div>
              <p className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {insight.value}
              </p>
              <p className="text-xs opacity-75">{insight.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Quick Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-6 pt-6 border-t border-white/20"
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <PiggyBank className="h-4 w-4" />
              Reports
            </motion.button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export function StatementGenerationPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([]);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [recentStatements, setRecentStatements] = useState<Array<{
    id: number;
    group_name: string;
    date_from: string;
    date_to: string;
    created_at: string;
    status: string;
    download_url?: string;
  }>>([]);

  const [params, setParams] = useState<StatementParams>({
    date_from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    format: 'pdf',
    include_transactions: true,
    include_loans: true,
    include_investments: true,
  });

  useEffect(() => {
    fetchGroups();
    fetchRecentStatements();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/chama-groups/');
      setGroups(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const fetchRecentStatements = async () => {
    try {
      const response = await api.get('/finance/statements/');
      setRecentStatements(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load statements:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/finance/statements/generate/', params, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = params.format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute(
        'download',
        `statement_${params.date_from}_to_${params.date_to}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Statement generated successfully!');
      fetchRecentStatements();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to generate statement');
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailStatement = async (statementId: number) => {
    try {
      await api.post(`/finance/statements/${statementId}/email/`);
      setSuccess('Statement sent to your email!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to send email');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full blur-3xl opacity-20" />
        </FloatingElement>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ x: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')} 
              className="group flex items-center gap-2 p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </motion.button>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                Statement Generation
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-2 flex items-center gap-2 text-lg"
              >
                <Calendar className="h-5 w-5" />
                Generate PDF or Excel statements for your groups
              </motion.p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {}}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-purple-300"
            >
              <Download className="h-4 w-4" />
              Bulk Export
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Clock className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3"
            >
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Success</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Statement Generator Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl overflow-hidden border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-800 truncate">
                        Generate New Statement
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm mt-1">
                        Configure and generate financial statements
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Group (Optional - leave empty for all groups)
                    </label>
                    <select
                      value={params.group_id || ''}
                      onChange={(e) =>
                        setParams({ ...params, group_id: e.target.value || undefined })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                    >
                      <option value="">All Groups</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        From Date
                      </label>
                      <input
                        type="date"
                        value={params.date_from}
                        onChange={(e) =>
                          setParams({ ...params, date_from: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        To Date
                      </label>
                      <input
                        type="date"
                        value={params.date_to}
                        onChange={(e) =>
                          setParams({ ...params, date_to: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Format</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setParams({ ...params, format: 'pdf' })}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                          params.format === 'pdf'
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            params.format === 'pdf' 
                              ? 'bg-purple-100' 
                              : 'bg-gray-100'
                          }`}>
                            <FileText className={`h-6 w-6 ${
                              params.format === 'pdf' ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">PDF</p>
                            <p className="text-sm text-gray-500 mt-1">Professional reports</p>
                          </div>
                        </div>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setParams({ ...params, format: 'excel' })}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                          params.format === 'excel'
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            params.format === 'excel' 
                              ? 'bg-purple-100' 
                              : 'bg-gray-100'
                          }`}>
                            <Download className={`h-6 w-6 ${
                              params.format === 'excel' ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">Excel</p>
                            <p className="text-sm text-gray-500 mt-1">Data analysis</p>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Include Options */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Include in Statement
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={params.include_transactions}
                          onChange={(e) =>
                            setParams({
                              ...params,
                              include_transactions: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="font-medium">Transactions</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={params.include_loans}
                          onChange={(e) =>
                            setParams({ ...params, include_loans: e.target.checked })
                          }
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="font-medium">Loans</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={params.include_investments}
                          onChange={(e) =>
                            setParams({
                              ...params,
                              include_investments: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="font-medium">Investments</span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                        Generating Statement...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Generate Statement
                      </>
                    )}
                  </motion.button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Statements & Insights Sidebar */}
          <div className="space-y-8">
            {/* Recent Statements */}
            <Card className="shadow-2xl border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Recent Statements
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm mt-1">
                      Your generated statements
                    </CardDescription>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4 max-h-[400px] overflow-y-auto p-4">
                  {recentStatements.slice(0, 5).map((statement, index) => (
                    <motion.div
                      key={statement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-800 text-sm">{statement.group_name}</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            statement.status
                          )}`}
                        >
                          {statement.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(statement.date_from).toLocaleDateString()} -{' '}
                        {new Date(statement.date_to).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        {statement.download_url && (
                          <>
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={statement.download_url}
                              download
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </motion.a>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEmailStatement(statement.id)}
                              className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              <Mail className="h-3 w-3" />
                              Email
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {recentStatements.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        No statements generated yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statement Insights */}
            <StatementInsights />
          </div>
        </motion.div>
      </div>
    </div>
  );
}