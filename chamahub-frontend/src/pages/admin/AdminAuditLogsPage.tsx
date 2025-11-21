import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Calendar, User, Activity } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { adminApi, type AuditLog } from '../../services/adminApi';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 50;

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(currentPage, perPage);
      setLogs(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [logs, searchTerm]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600';
    if (action.includes('delete')) return 'text-red-600';
    if (action.includes('update')) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Audit Logs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review system activity and security trails
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs by action or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Comprehensive audit trail of system activities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {log.user_email && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user_email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.created_at)}
                          </span>
                          {log.resource_type && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                              {log.resource_type}
                            </span>
                          )}
                        </div>
                        {log.details && (
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No audit logs found
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {totalCount > perPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center gap-2"
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-orange-600 text-white rounded-lg">
              Page {currentPage} of {Math.ceil(totalCount / perPage)}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalCount / perPage)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
