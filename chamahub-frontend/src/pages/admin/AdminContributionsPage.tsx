import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function AdminContributionsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Contribution Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage member contributions
              </p>
            </div>
          </div>
        </motion.div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>All Contributions</CardTitle>
            <CardDescription>View and manage all contribution records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              Contribution management interface will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
