import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { groupsService } from '../services/apiService';
import type { ChamaGroup } from '../types/api';

export function GroupsListPage() {
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsService.getMyGroups();
      setGroups(response);
    } catch (err) {
      setError('Failed to load groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'bg-green-100 text-green-700';
      case 'INVESTMENT':
        return 'bg-blue-100 text-blue-700';
      case 'WELFARE':
        return 'bg-purple-100 text-purple-700';
      case 'MIXED':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getGroupTypeName = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'Savings Group';
      case 'INVESTMENT':
        return 'Investment Group';
      case 'WELFARE':
        return 'Welfare Group';
      case 'MIXED':
        return 'Mixed Purpose';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                My Groups
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your savings and investment groups
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/groups/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Group
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-lg bg-destructive/10 text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <Card className="shadow-2xl">
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Groups Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first group to start saving and investing together
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/groups/create')}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5 inline mr-2" />
                Create Your First Group
              </motion.button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {group.name}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {group.description || group.objectives}
                        </CardDescription>
                      </div>
                      {group.kyb_verified ? (
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-orange-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(
                          group.group_type
                        )}`}
                      >
                        {getGroupTypeName(group.group_type)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          group.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {group.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>Total Balance</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          KES {Number(group.total_balance).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Members</span>
                        </div>
                        <span className="font-semibold">{group.member_count || 0}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Contribution</span>
                        </div>
                        <span className="font-semibold capitalize">
                          {group.contribution_frequency.toLowerCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <span>Min. Contribution</span>
                        </div>
                        <span className="font-semibold">
                          KES {Number(group.minimum_contribution).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/groups/${group.id}`);
                      }}
                      className="w-full mt-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                    >
                      View Details
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
