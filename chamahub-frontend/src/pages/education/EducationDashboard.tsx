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
  Award,
  Rocket,
  Users,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { mockEducationService, type DashboardStats, type EducationalContent, type LearningPath } from '../../services/mockEducationService';

export function EducationDashboard() {
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
        return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200';
      case 'INVESTMENTS':
        return 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200';
      case 'LOANS':
        return 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200';
      case 'BUDGETING':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200';
      case 'GROUP_MANAGEMENT':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-gradient-to-r from-emerald-400 to-green-500';
      case 'INTERMEDIATE':
        return 'bg-gradient-to-r from-amber-400 to-orange-500';
      case 'ADVANCED':
        return 'bg-gradient-to-r from-rose-400 to-red-500';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <GraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Preparing Your Learning Journey</h3>
            <p className="text-gray-600">Loading personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="h-10 w-10 md:h-12 md:w-12" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                Financial Education Hub
              </h1>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Award className="h-10 w-10 md:h-12 md:w-12" />
              </div>
            </div>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Master financial literacy and elevate your chama's success. 
              <span className="block mt-2 text-white/80">Access expert-curated content, structured learning paths, and practical insights.</span>
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="font-semibold">✨ Expert Curated</span>
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="font-semibold">🚀 Actionable Insights</span>
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="font-semibold">🎯 Goal-Oriented</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Hero Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-white/80" />
                  <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">+12%</div>
                </div>
                <div className="text-3xl font-bold mb-1">{stats.total_content}</div>
                <div className="text-white/90">Articles & Videos</div>
                <div className="mt-4 text-sm text-white/80">Updated daily</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8 text-white/80" />
                  <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">+8%</div>
                </div>
                <div className="text-3xl font-bold mb-1">{stats.total_learning_paths}</div>
                <div className="text-white/90">Learning Paths</div>
                <div className="mt-4 text-sm text-white/80">Guided courses</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="h-8 w-8 text-white/80" />
                  <div className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">+24%</div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {(stats.total_views / 1000).toFixed(1)}K
                </div>
                <div className="text-white/90">Total Views</div>
                <div className="mt-4 text-sm text-white/80">Community learning</div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Featured Content */}
        {stats?.featured_content && stats.featured_content.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Content</h2>
                  <p className="text-gray-600 mt-1">Expert-curated resources to accelerate your financial knowledge</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/education/content?featured=true')}
                className="group px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all font-semibold flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.featured_content.slice(0, 6).map((content: EducationalContent) => (
                <div
                  key={content.id}
                  onClick={() => navigate(`/education/content/${content.id}`)}
                  className="group cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative h-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className={`${getCategoryColor(content.category)} font-medium px-3 py-1`}>
                        {categoryIcons[content.category]} {formatCategory(content.category)}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 z-20">
                      <div className={`w-8 h-8 rounded-full ${getDifficultyColor(content.difficulty)} flex items-center justify-center shadow-lg`}>
                        <span className="text-xs font-bold text-white">
                          {content.difficulty.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {content.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{content.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">{content.views_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Learning Paths */}
        {learningPaths.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Learning Paths</h2>
                  <p className="text-gray-600 mt-1">Structured courses to achieve specific financial goals</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/education/learning-paths')}
                className="group px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 rounded-lg hover:from-emerald-100 hover:to-green-200 transition-all font-semibold flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => (
                <div
                  key={path.id}
                  onClick={() => navigate(`/education/learning-paths/${path.id}`)}
                  className="group cursor-pointer bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`px-3 py-1 ${getDifficultyColor(path.difficulty)} text-white font-medium`}>
                        {path.difficulty}
                      </Badge>
                      {path.is_featured && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full text-xs font-semibold">
                          <Sparkles className="h-3 w-3" />
                          Featured
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{path.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{path.contents.length} lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{path.total_duration_minutes} min</span>
                        </div>
                      </div>
                      
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-green-500"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                      
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Start Learning
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Recent Content */}
        {stats?.recent_content && stats.recent_content.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Latest Content</h2>
                  <p className="text-gray-600 mt-1">Fresh insights and newly added resources</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/education/content')}
                className="group px-4 py-2 bg-gradient-to-r from-purple-50 to-violet-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-violet-200 transition-all font-semibold flex items-center gap-2"
              >
                Browse All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recent_content.map((content: EducationalContent) => (
                <div
                  key={content.id}
                  onClick={() => navigate(`/education/content/${content.id}`)}
                  className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg ${getCategoryColor(content.category)} flex items-center justify-center`}>
                        <span className="text-lg">{categoryIcons[content.category]}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {content.title}
                        </h4>
                        <Badge variant="outline" className="text-xs bg-white border-gray-200">
                          {content.content_type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {content.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{content.duration_minutes}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{content.views_count}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getDifficultyColor(content.difficulty)}`} />
                          <span>{content.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Enhanced Category Quick Links */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Explore Topics
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose a category to discover relevant content tailored to your learning goals
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { 
                name: 'SAVINGS', 
                icon: '💰', 
                color: 'from-emerald-400 to-green-500', 
                bgColor: 'from-emerald-50 to-green-50',
                desc: 'Build wealth & secure future',
                iconBg: 'bg-emerald-100'
              },
              { 
                name: 'INVESTMENTS', 
                icon: '📈', 
                color: 'from-purple-400 to-purple-500',
                bgColor: 'from-purple-50 to-violet-50',
                desc: 'Grow assets strategically',
                iconBg: 'bg-purple-100'
              },
              { 
                name: 'LOANS', 
                icon: '🏦', 
                color: 'from-rose-400 to-pink-500',
                bgColor: 'from-rose-50 to-pink-50',
                desc: 'Manage debt wisely',
                iconBg: 'bg-rose-100'
              },
              { 
                name: 'BUDGETING', 
                icon: '📊', 
                color: 'from-amber-400 to-orange-500',
                bgColor: 'from-amber-50 to-orange-50',
                desc: 'Control spending habits',
                iconBg: 'bg-amber-100'
              },
              { 
                name: 'GROUP_MANAGEMENT', 
                icon: '👥', 
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-50',
                desc: 'Lead teams effectively',
                iconBg: 'bg-blue-100'
              },
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(`/education/content?category=${category.name}`)}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgColor} p-6 text-left hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${category.color} opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10 space-y-4">
                  <div className={`w-14 h-14 rounded-xl ${category.iconBg} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg mb-1">
                      {formatCategory(category.name)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {category.desc}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200/50">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      Explore
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
