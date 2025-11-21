import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  DollarSign, 
  Bell, 
  FileText, 
  TrendingUp,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import axios from 'axios';

interface ActionParameter {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface AutomationAction {
  id: number;
  name: string;
  display_name: string;
  description: string;
  category: string;
  requires_conditions: boolean;
  available_parameters: ActionParameter[];
}

interface ActionsResponse {
  count: number;
  actions: AutomationAction[];
}

export function ActionsPage() {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use direct axios call to bypass auth interceptor since /actions allows AllowAny
      // Note: /actions endpoint is at root level, NOT under /api/v1/
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const apiUrl = baseUrl.replace('/api/v1', ''); // Remove /api/v1 suffix to get root URL
      const response = await axios.get<ActionsResponse>(`${apiUrl}/actions`);
      setActions(response.data.actions);
    } catch (err) {
      console.error('Failed to fetch actions:', err);
      setError('Failed to load automation actions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return DollarSign;
      case 'communication':
        return Bell;
      case 'reporting':
        return FileText;
      default:
        return Zap;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400';
      case 'communication':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400';
      case 'reporting':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const categories = ['all', ...Array.from(new Set(actions.map(a => a.category)))];

  const filteredActions = actions.filter(action => {
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      action.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading automation actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="max-w-md">
          <CardContent className="py-16 text-center">
            <Zap className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Actions</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchActions}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Retry
            </motion.button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Automation Actions
              </h1>
              <p className="text-muted-foreground mt-2">
                Configure automated workflows for your chama
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold text-primary">{actions.length}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Financial</p>
                  <p className="text-2xl font-bold text-green-600">
                    {actions.filter(a => a.category === 'financial').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Communication</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {actions.filter(a => a.category === 'communication').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions List */}
        {filteredActions.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="py-16 text-center">
              <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Actions Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'No automation actions available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map((action) => {
              const Icon = getCategoryIcon(action.category);
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-3 rounded-lg ${getCategoryColor(action.category)}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {action.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{action.display_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {action.requires_conditions ? (
                            <>
                              <TrendingUp className="h-4 w-4" />
                              <span>Requires conditions</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span>No conditions required</span>
                            </>
                          )}
                        </div>
                        
                        {action.available_parameters.length > 0 && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2 font-semibold">
                              Parameters ({action.available_parameters.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {action.available_parameters.slice(0, 3).map((param, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {param.name}
                                  {param.required && <span className="text-destructive ml-1">*</span>}
                                </Badge>
                              ))}
                              {action.available_parameters.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{action.available_parameters.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
