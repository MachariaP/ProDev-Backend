import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  BarChart,
  CheckCircle,
  Star,
  Zap,
  TrendingDown
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { mockEducationService, type DashboardStats, type EducationalContent, type LearningPath } from '../../services/mockEducationService';

interface QuickStats {
  totalContent: number;
  totalPaths: number;
  totalViews: number;
  completionRate: number;
}

export function EducationDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalContent: 0,
    totalPaths: 0,
    totalViews: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, pathsData, progressData] = await Promise.all([
        mockEducationService.getDashboardStats(),
        mockEducationService.getLearningPaths(),
        mockEducationService.getUserProgress()
      ]);
      
      setStats(statsData);
      setLearningPaths(pathsData.filter(p => p.is_featured).slice(0, 3));
      
      // Calculate quick stats
      if (statsData) {
        setQuickStats({
          totalContent: statsData.total_content,
          totalPaths: statsData.total_learning_paths,
          totalViews: statsData.total_views,
          completionRate: Math.floor(Math.random() * 30) + 70 // Mock completion rate
        });
      }
      
      // Calculate user progress
      if (progressData && progressData.length > 0) {
        const completed = progressData.filter(p => p.status === 'COMPLETED').length;
        const total = Math.max(progressData.length, 1);
        setUserProgress(Math.round((completed / total) * 100));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SAVINGS: 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 border-emerald-200',
      INVESTMENTS: 'bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 border-purple-200',
      LOANS: 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 border-rose-200',
      BUDGETING: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 border-amber-200',
      GROUP_MANAGEMENT: 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 border-blue-200',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'from-emerald-400 to-green-500',
      INTERMEDIATE: 'from-amber-400 to-orange-500',
      ADVANCED: 'from-rose-400 to-red-500',
    };
    return colors[difficulty] || 'from-gray-400 to-slate-500';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <GraduationCap className="h-10 w-10 md:h-12 md:w-12" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200 leading-tight">
                      Financial Education Hub
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mt-3">
                      Master financial literacy and elevate your chama's success
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span className="font-semibold">Expert Curated</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Rocket className="h-4 w-4 text-blue-300" />
                    <span className="font-semibold">Actionable Insights</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Target className="h-4 w-4 text-emerald-300" />
                    <span className="font-semibold">Goal-Oriented</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Your Progress</div>
                      <div className="text-2xl font-bold">{userProgress}%</div>
                    </div>
                  </div>
                  <Progress value={userProgress} className="h-2 bg-white/20" />
                  <div className="text-sm text-white/80">
                    {userProgress > 75 ? 'Great progress! Keep going!' : 
                     userProgress > 50 ? 'Good progress! Almost there!' : 
                     'Start your learning journey!'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl mb-1">{quickStats.totalContent}+</CardTitle>
              <CardDescription className="text-white/90">Articles & Videos</CardDescription>
              <div className="text-sm text-white/80 mt-2">Expert-curated content</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  +8%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl mb-1">{quickStats.totalPaths}</CardTitle>
              <CardDescription className="text-white/90">Learning Paths</CardDescription>
              <div className="text-sm text-white/80 mt-2">Guided courses</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Eye className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  +24%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl mb-1">
                {(quickStats.totalViews / 1000).toFixed(1)}K
              </CardTitle>
              <CardDescription className="text-white/90">Total Views</CardDescription>
              <div className="text-sm text-white/80 mt-2">Community learning</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  +15%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl mb-1">{quickStats.completionRate}%</CardTitle>
              <CardDescription className="text-white/90">Completion Rate</CardDescription>
              <div className="text-sm text-white/80 mt-2">Average across users</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Content */}
        {stats?.featured_content && stats.featured_content.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Content</h2>
                  <p className="text-gray-600 mt-1">Handpicked resources to accelerate your financial knowledge</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/education/content?featured=true')}
                variant="outline"
                className="group border-blue-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <span>View All Featured</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.featured_content.slice(0, 6).map((content: EducationalContent) => {
                const difficultyGradient = getDifficultyColor(content.difficulty);
                
                return (
                  <Link
                    key={content.id}
                    to={`/education/content/${content.id}`}
                    className="group block bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
                      <img
                        src={content.thumbnail_url}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 z-20">
                        <Badge className={`${getCategoryColor(content.category)} font-medium`}>
                          {categoryIcons[content.category]} {formatCategory(content.category)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 z-20">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${difficultyGradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-xs font-bold text-white">
                            {content.difficulty.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                        {content.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {content.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-600" title="Duration">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">{content.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-2" title="Views">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {content.views_count >= 1000 
                                ? `${(content.views_count / 1000).toFixed(1)}k` 
                                : content.views_count}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Explore</span>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Learning Paths */}
        {learningPaths.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Learning Paths</h2>
                  <p className="text-gray-600 mt-1">Structured courses to achieve specific financial goals</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/education/learning-paths')}
                variant="outline"
                className="group border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span>View All Paths</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => {
                const difficultyGradient = getDifficultyColor(path.difficulty);
                
                return (
                  <Card key={path.id} className="border-gray-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`px-3 py-1 bg-gradient-to-r ${difficultyGradient} text-white font-medium`}>
                          {path.difficulty}
                        </Badge>
                        {path.is_featured && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full text-xs font-semibold">
                            <Star className="h-3 w-3 fill-amber-500" />
                            Featured
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-3 group-hover:text-emerald-600 transition-colors">
                        <Link to={`/education/learning-paths/${path.id}`} className="hover:underline">
                          {path.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                        
                        <Link
                          to={`/education/learning-paths/${path.id}`}
                          className="block w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg font-medium text-center group"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Rocket className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Start Learning
                          </span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Content & Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Content */}
          {stats?.recent_content && stats.recent_content.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Latest Content</h2>
                    <p className="text-gray-600 text-sm mt-1">Fresh insights and newly added resources</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {stats.recent_content.slice(0, 5).map((content: EducationalContent) => (
                  <Link
                    key={content.id}
                    to={`/education/content/${content.id}`}
                    className="group flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg ${getCategoryColor(content.category)} flex items-center justify-center`}>
                        <span className="text-xl">{categoryIcons[content.category]}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
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
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(content.difficulty)}`} />
                          <span>{content.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Button
                onClick={() => navigate('/education/content')}
                variant="outline"
                className="w-full border-gray-300 hover:border-gray-400"
              >
                <span>Browse All Content</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </section>
          )}

          {/* Categories Grid */}
          <section className="space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Explore Topics</h2>
              <p className="text-gray-600">Choose a category to discover relevant content tailored to your learning goals</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  name: 'SAVINGS', 
                  icon: '💰', 
                  color: 'from-emerald-400 to-green-500', 
                  bgColor: 'from-emerald-50 to-green-50',
                  desc: 'Build wealth & secure future',
                  iconBg: 'bg-emerald-100',
                  count: 42
                },
                { 
                  name: 'INVESTMENTS', 
                  icon: '📈', 
                  color: 'from-purple-400 to-purple-500',
                  bgColor: 'from-purple-50 to-violet-50',
                  desc: 'Grow assets strategically',
                  iconBg: 'bg-purple-100',
                  count: 28
                },
                { 
                  name: 'LOANS', 
                  icon: '🏦', 
                  color: 'from-rose-400 to-pink-500',
                  bgColor: 'from-rose-50 to-pink-50',
                  desc: 'Manage debt wisely',
                  iconBg: 'bg-rose-100',
                  count: 35
                },
                { 
                  name: 'BUDGETING', 
                  icon: '📊', 
                  color: 'from-amber-400 to-orange-500',
                  bgColor: 'from-amber-50 to-orange-50',
                  desc: 'Control spending habits',
                  iconBg: 'bg-amber-100',
                  count: 31
                },
                { 
                  name: 'GROUP_MANAGEMENT', 
                  icon: '👥', 
                  color: 'from-blue-400 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50',
                  desc: 'Lead teams effectively',
                  iconBg: 'bg-blue-100',
                  count: 24
                },
                { 
                  name: 'ALL', 
                  icon: '🌟', 
                  color: 'from-indigo-400 to-indigo-500',
                  bgColor: 'from-indigo-50 to-indigo-100',
                  desc: 'All categories',
                  iconBg: 'bg-indigo-100',
                  count: quickStats.totalContent
                },
              ].map((category) => (
                <Link
                  key={category.name}
                  to={`/education/content${category.name !== 'ALL' ? `?category=${category.name}` : ''}`}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgColor} p-4 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block border border-transparent hover:border-white/30`}
                >
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl ${category.iconBg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 bg-white/70 backdrop-blur-sm px-2 py-1 rounded-full">
                        {category.count}+
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg mb-1">
                        {category.name === 'ALL' ? 'All Topics' : formatCategory(category.name)}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {category.desc}
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Explore
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-8 text-white text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm inline-flex">
              <Zap className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Start Your Financial Journey Today</h2>
            <p className="text-xl text-white/90">
              Join thousands of chama members who are already transforming their financial knowledge
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => navigate('/education/content')}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Explore Content
              </Button>
              <Button
                onClick={() => navigate('/education/learning-paths')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 font-bold px-8 py-6 text-lg"
              >
                <Target className="h-5 w-5 mr-2" />
                View Learning Paths
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}