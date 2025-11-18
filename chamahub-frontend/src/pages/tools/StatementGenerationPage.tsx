import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,


  Mail,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

interface StatementParams {
  group_id?: string;
  date_from: string;
  date_to: string;
  format: 'pdf' | 'excel';
  include_transactions: boolean;
  include_loans: boolean;
  include_investments: boolean;
}

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
      const response = await api.get('/groups/groups/');
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
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-2">Statement Generation</h1>
            <p className="text-muted-foreground">
              Generate PDF or Excel statements for your groups
            </p>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statement Generator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate New Statement
                </CardTitle>
                <CardDescription>
                  Configure and generate financial statements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Group (Optional - leave empty for all groups)
                    </label>
                    <select
                      value={params.group_id || ''}
                      onChange={(e) =>
                        setParams({ ...params, group_id: e.target.value || undefined })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
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
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Format</label>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setParams({ ...params, format: 'pdf' })}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          params.format === 'pdf'
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">PDF</p>
                        <p className="text-sm text-muted-foreground">
                          Professional reports
                        </p>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setParams({ ...params, format: 'excel' })}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          params.format === 'excel'
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        <Download className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">Excel</p>
                        <p className="text-sm text-muted-foreground">
                          Data analysis
                        </p>
                      </motion.button>
                    </div>
                  </div>

                  {/* Include Options */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Include in Statement
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={params.include_transactions}
                          onChange={(e) =>
                            setParams({
                              ...params,
                              include_transactions: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span>Transactions</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={params.include_loans}
                          onChange={(e) =>
                            setParams({ ...params, include_loans: e.target.checked })
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span>Loans</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={params.include_investments}
                          onChange={(e) =>
                            setParams({
                              ...params,
                              include_investments: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span>Investments</span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
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
          </motion.div>

          {/* Recent Statements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Statements
                </CardTitle>
                <CardDescription>Your generated statements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentStatements.slice(0, 10).map((statement, index) => (
                    <motion.div
                      key={statement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{statement.group_name}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${getStatusColor(
                            statement.status
                          )}`}
                        >
                          {statement.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
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
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </motion.a>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEmailStatement(statement.id)}
                              className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                            >
                              <Mail className="h-3 w-3" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {recentStatements.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No statements generated yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
