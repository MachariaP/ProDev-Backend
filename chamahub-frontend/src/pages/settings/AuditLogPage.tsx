import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Search, FileText, User, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

export function AuditLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchAuditLogs();
  }, [filterAction]);

  const fetchAuditLogs = async () => {
    try {
      const params = filterAction !== 'all' ? `?action=${filterAction}` : '';
      const response = await api.get(`/audit/logs/${params}`);
      setLogs(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Settings
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Audit Log</h1>
              <p className="text-muted-foreground">Security and activity monitoring</p>
            </div>
          </div>
        </motion.div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>{filteredLogs.length} log entries</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <motion.div key={log.id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{log.action || 'Unknown action'}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="h-4 w-4" />{log.user_email || 'System'}</span>
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{log.ip_address || 'N/A'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
