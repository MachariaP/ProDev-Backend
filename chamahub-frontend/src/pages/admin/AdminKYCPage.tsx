import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function AdminKYCPage() {
  // Mock data - would be replaced with real API calls
  const kycSubmissions = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john@example.com',
      type: 'KYC',
      status: 'pending',
      submitted_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      user: 'Savings Group Ltd',
      email: 'info@savingsgroup.com',
      type: 'KYB',
      status: 'pending',
      submitted_at: '2024-01-14T14:20:00Z',
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                KYC/KYB Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and approve verification submissions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Submissions</p>
                  <p className="text-4xl font-bold mt-2">2</p>
                </div>
                <FileText className="h-10 w-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Approved</p>
                  <p className="text-4xl font-bold mt-2">145</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Rejected</p>
                  <p className="text-4xl font-bold mt-2">12</p>
                </div>
                <XCircle className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>Review and approve KYC/KYB documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kycSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {submission.user}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {submission.email}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                            {submission.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(submission.submitted_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        <Eye className="h-4 w-4" />
                        Review
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
