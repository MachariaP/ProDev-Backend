import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function AdminLoansPage() {
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
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Loan Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and manage loan applications
              </p>
            </div>
          </div>
        </motion.div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>All Loans</CardTitle>
            <CardDescription>View and manage loan applications and repayments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              Loan management interface will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
