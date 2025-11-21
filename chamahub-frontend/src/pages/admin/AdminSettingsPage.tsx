import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                System Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure platform settings and preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Platform-wide configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    defaultValue="ChamaHub"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    defaultValue="support@chamahub.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Currency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white">
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Save className="h-4 w-4" />
                  Save Settings
                </button>
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
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Authentication and security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Email Verification
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Users must verify their email before accessing the platform
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require KYC Verification
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Users must complete KYC to make transactions
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Two-Factor Authentication
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow users to enable 2FA for their accounts
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Save className="h-4 w-4" />
                  Save Security Settings
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>Configure financial parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Contribution Amount
                  </label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Loan Amount
                  </label>
                  <input
                    type="number"
                    defaultValue="1000000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue="12.5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Save className="h-4 w-4" />
                  Save Financial Settings
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send email notifications for important events
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      SMS Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send SMS notifications for transactions
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Push Notifications
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send push notifications to mobile apps
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 text-red-600" />
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Save className="h-4 w-4" />
                  Save Notification Settings
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
