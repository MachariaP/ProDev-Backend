import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Zap, 
  DollarSign, 
  Bell, 
  FileText, 
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  Play,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Grid3x3,
  List,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogBody,
  DialogFooter 
} from '../../components/ui/dialog';
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

type SortOption = 'name' | 'category' | 'parameters';
type ViewMode = 'grid' | 'list';

export function ActionsPage() {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAction, setSelectedAction] = useState<AutomationAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Sort actions
  const sortedActions = [...filteredActions].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.display_name.localeCompare(b.display_name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'parameters':
        return b.available_parameters.length - a.available_parameters.length;
      default:
        return 0;
    }
  });

  const handleActionClick = (action: AutomationAction) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0wIDUwYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back</span>
                </motion.button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">
                      Automation Actions
                    </h1>
                  </div>
                  <p className="text-white/90 text-lg">
                    Discover and configure powerful automation workflows for your chama
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Summary with Animations */}
        <div className="grid gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Actions</p>
                    <motion.p 
                      className="text-3xl font-bold text-primary mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      {actions.length}
                    </motion.p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Financial</p>
                    <motion.p 
                      className="text-3xl font-bold text-green-600 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      {actions.filter(a => a.category === 'financial').length}
                    </motion.p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Communication</p>
                    <motion.p 
                      className="text-3xl font-bold text-blue-600 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 }}
                    >
                      {actions.filter(a => a.category === 'communication').length}
                    </motion.p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                    <Bell className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Reporting</p>
                    <motion.p 
                      className="text-3xl font-bold text-purple-600 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.5 }}
                    >
                      {actions.filter(a => a.category === 'reporting').length}
                    </motion.p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Category Filters */}
              <div className="flex items-center gap-2 flex-1">
                <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <motion.div
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer capitalize px-4 py-2 text-sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sort and View Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort actions by"
                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                    <option value="parameters">Sort by Parameters</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Input */}
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions List/Grid */}
        {sortedActions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="shadow-xl">
              <CardContent className="py-20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <Zap className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2">No Actions Found</h3>
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? 'Try a different search term' : 'No automation actions available'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            <AnimatePresence mode="popLayout">
              {sortedActions.map((action, index) => {
                const Icon = getCategoryIcon(action.category);
                return (
                  <motion.div
                    key={action.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card 
                        className={`h-full shadow-lg hover:shadow-2xl transition-all cursor-pointer border-l-4 ${
                          action.category === 'financial' ? 'border-l-green-500' :
                          action.category === 'communication' ? 'border-l-blue-500' :
                          action.category === 'reporting' ? 'border-l-purple-500' :
                          'border-l-primary'
                        } group overflow-hidden relative`}
                        onClick={() => handleActionClick(action)}
                      >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <CardHeader className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`p-3 rounded-xl ${getCategoryColor(action.category)} group-hover:scale-110 transition-transform`}>
                              <Icon className="h-7 w-7" />
                            </div>
                            <Badge variant="outline" className="capitalize font-medium">
                              {action.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {action.display_name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            <span className="line-clamp-2 block overflow-hidden">{action.description}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              {action.requires_conditions ? (
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                  <TrendingUp className="h-4 w-4" />
                                  <span className="font-medium">Requires conditions</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-medium">No conditions required</span>
                                </div>
                              )}
                            </div>
                            
                            {action.available_parameters.length > 0 && (
                              <div className="pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">
                                  Parameters ({action.available_parameters.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {action.available_parameters.slice(0, 3).map((param, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {param.name}
                                      {param.required && <span className="text-destructive ml-1">*</span>}
                                    </Badge>
                                  ))}
                                  {action.available_parameters.length > 3 && (
                                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                      +{action.available_parameters.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Button */}
                            <motion.div
                              whileHover={{ x: 5 }}
                              className="pt-3"
                            >
                              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                <Eye className="h-4 w-4" />
                                <span>View Details</span>
                              </div>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Action Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader onClose={() => setIsDialogOpen(false)}>
              <div className="flex items-center gap-3">
                {selectedAction && (
                  <>
                    <div className={`p-3 rounded-xl ${getCategoryColor(selectedAction.category)}`}>
                      {(() => {
                        const Icon = getCategoryIcon(selectedAction.category);
                        return <Icon className="h-6 w-6" />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle>{selectedAction.display_name}</DialogTitle>
                      <DialogDescription>{selectedAction.category} action</DialogDescription>
                    </div>
                  </>
                )}
              </div>
            </DialogHeader>
            
            {selectedAction && (
              <DialogBody className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Description
                  </h4>
                  <p className="text-foreground">{selectedAction.description}</p>
                </div>

                {/* Conditions */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Conditions
                  </h4>
                  <div className="flex items-center gap-2">
                    {selectedAction.requires_conditions ? (
                      <>
                        <XCircle className="h-5 w-5 text-orange-600" />
                        <span className="text-foreground">This action requires conditions to be configured before execution</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-foreground">This action can be executed without any conditions</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Parameters */}
                {selectedAction.available_parameters.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      Available Parameters
                    </h4>
                    <div className="space-y-3">
                      {selectedAction.available_parameters.map((param, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">{param.name}</span>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {!param.required && (
                                <Badge variant="secondary" className="text-xs">Optional</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.options && (
                                <span className="text-muted-foreground">
                                  Options: {param.options.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Info */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Technical Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Action ID:</span>
                      <span className="ml-2 font-mono text-foreground">{selectedAction.id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Internal Name:</span>
                      <span className="ml-2 font-mono text-foreground text-xs">{selectedAction.name}</span>
                    </div>
                  </div>
                </div>
              </DialogBody>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  // Future: Navigate to automation rule creation with this action pre-selected
                  setIsDialogOpen(false);
                }}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Use This Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
