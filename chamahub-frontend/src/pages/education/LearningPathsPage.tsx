import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Users, Award, GraduationCap, Target, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { educationService } from '../../services/apiService';
import type { LearningPath } from '../../types/api';

export function LearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLearningPaths();
  }, [difficultyFilter]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1 };
      if (difficultyFilter !== 'all') {
        params.difficulty = difficultyFilter;
      }
      const response = await educationService.getLearningPaths(params);
      setLearningPaths(response.results);
    } catch (err) {
      console.error('Failed to fetch learning paths:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EXPERT':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredPaths = learningPaths.filter((path) =>
    path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    path.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/education')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <Target className="h-10 w-10 text-purple-600" />
                Learning Paths
              </h1>
              <p className="text-muted-foreground mt-2">Structured courses to achieve your financial goals</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search learning paths..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="All Difficulties" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths Grid */}
        {filteredPaths.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Learning Paths Found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card
                  className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden h-full"
                  onClick={() => navigate(`/education/learning-paths/${path.id}`)}
                >
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{path.title}</CardTitle>
                        <Badge className={getDifficultyColor(path.difficulty)}>
                          {path.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-3">{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                          <BookOpen className="h-5 w-5 text-purple-600 mb-1" />
                          <span className="font-bold text-purple-900">{path.contents_count}</span>
                          <span className="text-xs text-muted-foreground">Lessons</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="font-bold text-blue-900">{path.total_duration_hours}h</span>
                          <span className="text-xs text-muted-foreground">Duration</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                          <Users className="h-5 w-5 text-green-600 mb-1" />
                          <span className="font-bold text-green-900">{path.enrolled_count}</span>
                          <span className="text-xs text-muted-foreground">Enrolled</span>
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <span className="font-bold text-lg">{path.total_points}</span>
                          <span className="text-sm text-muted-foreground">points</span>
                        </div>
                        {path.completion_certificate && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Award className="h-3 w-3 mr-1" />
                            Certificate
                          </Badge>
                        )}
                      </div>

                      {/* Progress indicator if enrolled */}
                      {path.enrolled_count > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Completion Rate</span>
                            <span className="font-semibold">
                              {path.completed_count > 0 ? Math.round((path.completed_count / path.enrolled_count) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                              style={{
                                width: `${path.completed_count > 0 ? (path.completed_count / path.enrolled_count) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
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
