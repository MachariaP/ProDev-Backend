import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

const reportTemplates = [
  { id: 'financial-summary', name: 'Financial Summary', description: 'Overview of all financial activities' },
  { id: 'member-contributions', name: 'Member Contributions', description: 'Detailed contribution records' },
  { id: 'loan-report', name: 'Loan Report', description: 'All loans and repayment status' },
  { id: 'investment-performance', name: 'Investment Performance', description: 'ROI and portfolio analysis' },
  { id: 'tax-report', name: 'Tax Report', description: 'Annual tax documentation' },
  { id: 'audit-trail', name: 'Audit Trail', description: 'Complete transaction history' },
];

export function ReportsPage() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const handleGenerateReport = async (templateId: string) => {
    setGenerating(templateId);
    try {
      const response = await api.post(`/reports/generate/${templateId}/`, dateRange, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${templateId}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Custom Reports</h1>
          <p className="text-muted-foreground">Generate detailed reports for analysis and compliance</p>
        </motion.div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map((template, index) => (
            <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleGenerateReport(template.id)}
                    disabled={generating === template.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {generating === template.id ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Generating...</> : <><Download className="h-5 w-5" />Generate PDF</>}
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
