import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  BookOpen,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockEducationService, type LearningPath } from '../../services/mockEducationService';

export function LearningPaths() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLearningPaths();
  }, [difficultyFilter]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const paths = await mockEducationService.getLearningPaths({
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
      });
      setLearningPaths(paths);
    } catch (error) {
      console.error('Failed to fetch learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return '🟢';
      case 'INTERMEDIATE':
        return '🟡';
      case 'ADVANCED':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/education')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 flex items-center gap-3">
              <Target className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />
              Learning Paths
            </h1>
            <p className="text-gray-600 mt-1">Structured courses to achieve your financial goals</p>
          </div>
        </div>

        {/* Filter */}
        <Card className="shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Difficulty:</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">🟢 Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">🟡 Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">🔴 Advanced</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                {learningPaths.length} {learningPaths.length === 1 ? 'path' : 'paths'} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths Grid */}
        {learningPaths.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Learning Paths Found</h3>
              <p className="text-gray-600">Try adjusting your filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <Card
                key={path.id}
                className="hover:shadow-xl transition-all border border-gray-200 overflow-hidden"
              >
                <div className={`h-2 ${
                  path.difficulty === 'BEGINNER' ? 'bg-green-500' :
                  path.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDifficultyColor(path.difficulty)} variant="outline">
                      {getDifficultyIcon(path.difficulty)} {path.difficulty}
                    </Badge>
                    {path.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200" variant="outline">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl md:text-2xl">{path.title}</CardTitle>
                  <CardDescription className="text-base">{path.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Path Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{path.contents.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{path.total_duration_minutes} min total</span>
                    </div>
                  </div>

                  {/* Content List */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Course Contents:</h4>
                    <ul className="space-y-2">
                      {path.contents.slice(0, 4).map((content, index) => (
                        <li key={content.id} className="flex items-start gap-2 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="text-gray-800">{content.title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {content.duration_minutes} min
                              <span className="ml-auto">
                                {content.content_type}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                      {path.contents.length > 4 && (
                        <li className="text-sm text-gray-500 pl-8">
                          +{path.contents.length - 4} more lessons
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/education/learning-paths/${path.id}`)}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    Start Learning
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
