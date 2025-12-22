import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Clock,
  Eye,
  Target,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { mockEducationService, type DashboardStats, type EducationalContent, type LearningPath } from '../../services/mockEducationService';

export function SimplifiedEducationDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, pathsData] = await Promise.all([
        mockEducationService.getDashboardStats(),
        mockEducationService.getLearningPaths(),
      ]);
      setStats(statsData);
      setLearningPaths(pathsData.filter(p => p.is_featured).slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SAVINGS':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'INVESTMENTS':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'LOANS':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'BUDGETING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'GROUP_MANAGEMENT':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-400';
      case 'INTERMEDIATE':
        return 'bg-yellow-400';
      case 'ADVANCED':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const categoryIcons: Record<string, string> = {
    SAVINGS: '💰',
    INVESTMENTS: '📈',
    LOANS: '🏦',
    BUDGETING: '📊',
    GROUP_MANAGEMENT: '👥',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Education Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 md:h-12 md:w-12 text-blue-600" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800">
              Financial Education Hub
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Empower yourself with financial literacy for your chama journey
          </p>
        </div>

        {/* Hero Stats Card */}
        {stats && (
          <Card className="bg-gradient-to-br from-blue-600 to-emerald-500 text-white border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-90" />
                  <div className="text-3xl md:text-4xl font-bold">{stats.total_content}</div>
                  <div className="text-sm md:text-base opacity-90">Articles & Videos</div>
                </div>
                <div className="text-center">
                  <Target className="h-10 w-10 mx-auto mb-2 opacity-90" />
                  <div className="text-3xl md:text-4xl font-bold">{stats.total_learning_paths}</div>
                  <div className="text-sm md:text-base opacity-90">Learning Paths</div>
                </div>
                <div className="text-center">
                  <Eye className="h-10 w-10 mx-auto mb-2 opacity-90" />
                  <div className="text-3xl md:text-4xl font-bold">
                    {(stats.total_views / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm md:text-base opacity-90">Total Views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Content Section */}
        {stats?.featured_content && stats.featured_content.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
                  Featured Content
                </h2>
                <p className="text-gray-600 mt-1">Handpicked resources to boost your knowledge</p>
              </div>
              <button
                onClick={() => navigate('/education/content?featured=true')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.featured_content.slice(0, 6).map((content: EducationalContent) => (
                <Card
                  key={content.id}
                  className="cursor-pointer hover:shadow-lg transition-all overflow-hidden border border-gray-200"
                  onClick={() => navigate(`/education/content/${content.id}`)}
                >
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={getCategoryColor(content.category)} variant="outline">
                        {categoryIcons[content.category]} {formatCategory(content.category)}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getDifficultyColor(content.difficulty)}`} title={content.difficulty} />
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{content.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{content.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{content.views_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Learning Paths Section */}
        {learningPaths.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="h-6 w-6 md:h-7 md:w-7 text-emerald-500" />
                  Learning Paths
                </h2>
                <p className="text-gray-600 mt-1">Structured courses to achieve your goals</p>
              </div>
              <button
                onClick={() => navigate('/education/learning-paths')}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {learningPaths.map((path) => (
                <Card
                  key={path.id}
                  className="cursor-pointer hover:shadow-lg transition-all border border-gray-200"
                  onClick={() => navigate(`/education/learning-paths/${path.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getDifficultyColor(path.difficulty)} variant="outline">
                        {path.difficulty}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {path.total_duration_minutes} min
                      </div>
                    </div>
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 inline mr-1" />
                        {path.contents.length} lessons
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Start Learning
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recent Content Section */}
        {stats?.recent_content && stats.recent_content.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
                  Recent Content
                </h2>
                <p className="text-gray-600 mt-1">Latest additions to our library</p>
              </div>
              <button
                onClick={() => navigate('/education/content')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Browse All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.recent_content.map((content: EducationalContent) => (
                <Card
                  key={content.id}
                  className="cursor-pointer hover:shadow-lg transition-all border border-gray-200"
                  onClick={() => navigate(`/education/content/${content.id}`)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={getCategoryColor(content.category)} variant="outline">
                        {formatCategory(content.category)}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getDifficultyColor(content.difficulty)}`} title={content.difficulty} />
                    </div>
                    <CardTitle className="text-base line-clamp-2">{content.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{content.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{content.duration_minutes}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{content.views_count}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {content.content_type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Category Quick Links */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'SAVINGS', icon: '💰', color: 'from-green-500 to-emerald-600' },
              { name: 'INVESTMENTS', icon: '📈', color: 'from-purple-500 to-purple-600' },
              { name: 'LOANS', icon: '🏦', color: 'from-red-500 to-rose-600' },
              { name: 'BUDGETING', icon: '📊', color: 'from-yellow-500 to-orange-600' },
              { name: 'GROUP_MANAGEMENT', icon: '👥', color: 'from-blue-500 to-cyan-600' },
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(`/education/content?category=${category.name}`)}
                className={`p-6 rounded-xl bg-gradient-to-br ${category.color} text-white hover:shadow-lg transition-all`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm">{formatCategory(category.name)}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
