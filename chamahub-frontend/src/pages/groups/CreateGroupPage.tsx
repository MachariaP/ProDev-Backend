import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { groupsService } from '../../services/apiService';

export function CreateGroupPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'SAVINGS',
    objectives: '',
    contribution_frequency: 'MONTHLY',
    minimum_contribution: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const group = await groupsService.createGroup({
        name: formData.name,
        description: formData.description,
        group_type: formData.group_type as 'SAVINGS' | 'INVESTMENT' | 'WELFARE' | 'MIXED',
        objectives: formData.objectives,
        contribution_frequency: formData.contribution_frequency as 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
        minimum_contribution: Number(formData.minimum_contribution),
      });
      navigate(`/groups/${group.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Groups
          </motion.button>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto bg-primary/10 p-4 rounded-full w-fit"
            >
              <Users className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create New Group
            </CardTitle>
            <CardDescription className="text-center">
              Set up a new savings or investment group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g., Sunrise Savings Group"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Group Type *</label>
                <select
                  name="group_type"
                  value={formData.group_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                >
                  <option value="SAVINGS">Savings Group</option>
                  <option value="INVESTMENT">Investment Group</option>
                  <option value="WELFARE">Welfare Group</option>
                  <option value="MIXED">Mixed Purpose</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[100px]"
                  placeholder="Brief description of the group"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Objectives *</label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px]"
                  placeholder="What are the goals and objectives of this group?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contribution Frequency *</label>
                  <select
                    name="contribution_frequency"
                    value={formData.contribution_frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Contribution (KES) *</label>
                  <input
                    type="number"
                    name="minimum_contribution"
                    value={formData.minimum_contribution}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="1000"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/groups')}
                  className="flex-1 py-3 rounded-lg border border-border bg-background text-foreground font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {loading ? 'Creating...' : 'Create Group'}
                </motion.button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
