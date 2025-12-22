import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  BookOpen,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Users,
  Zap,
  CheckCircle,
  Star
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
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200';
      case 'ADVANCED':
        return 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyGradient = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'from-emerald-400 to-green-500';
      case 'INTERMEDIATE':
        return 'from-amber-400 to-orange-500';
      case 'ADVANCED':
        return 'from-rose-400 to-red-500';
      default:
        return 'from-gray-400 to-slate-500';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <Target className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Discovering Learning Paths</h3>
            <p className="text-gray-600">Finding the perfect courses for your goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <button
              onClick={() => navigate('/education')}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group mb-6"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Back to Hub</span>
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Target className="h-10 w-10 md:h-12 md:w-12" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                    Learning Paths
                  </h1>
                </div>
                <p className="text-xl text-white/90 max-w-2xl">
                  Follow guided courses designed to achieve specific financial objectives
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Award className="h-5 w-5 text-amber-300" />
                  <span>{learningPaths.length} Structured Paths</span>
                </div>
                <p className="text-white/80 text-sm mt-1">Certified by financial experts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Find Your Path</h2>
                    <p className="text-gray-600 text-sm">Filter by difficulty level</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {learningPaths.length} {learningPaths.length === 1 ? 'path' : 'paths'} found
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all"></div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="relative w-full md:w-72 bg-white border-gray-200 hover:border-emerald-300 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-emerald-100 to-green-100 rounded">
                        <Zap className="h-3 w-3 text-emerald-600" />
                      </div>
                      <SelectValue placeholder="Select Difficulty Level" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 shadow-lg">
                    <SelectItem value="all" className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      All Levels
                    </SelectItem>
                    <SelectItem value="BEGINNER" className="text-emerald-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      🟢 Beginner
                    </SelectItem>
                    <SelectItem value="INTERMEDIATE" className="text-amber-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                      🟡 Intermediate
                    </SelectItem>
                    <SelectItem value="ADVANCED" className="text-rose-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                      🔴 Advanced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Enhanced Learning Paths Grid */}
        {learningPaths.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="py-16 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-10 rounded-full"></div>
                <Target className="relative h-16 w-16 mx-auto text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Learning Paths Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Try adjusting your difficulty filter to discover available paths
              </p>
              <button
                onClick={() => setDifficultyFilter('all')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Show All Paths
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Top Gradient */}
                <div className={`h-2 w-full bg-gradient-to-r ${getDifficultyGradient(path.difficulty)}`}></div>
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Content */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className={`${getDifficultyColor(path.difficulty)} font-medium px-3 py-1.5`}>
                              {getDifficultyIcon(path.difficulty)} {path.difficulty}
                            </Badge>
                            {path.is_featured && (
                              <Badge className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 font-medium px-3 py-1.5">
                                <Star className="h-3 w-3 inline mr-1 fill-amber-500" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {path.title}
                          </h3>
                          <p className="text-gray-600 text-lg">{path.description}</p>
                        </div>
                      </div>

                      {/* Path Stats */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Lessons</div>
                            <div className="font-bold text-gray-900">{path.contents.length}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Clock className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Duration</div>
                            <div className="font-bold text-gray-900">{path.total_duration_minutes} min</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <Users className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Level</div>
                            <div className="font-bold text-gray-900">{path.difficulty}</div>
                          </div>
                        </div>
                      </div>

                      {/* Content List */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-emerald-500" />
                          Course Contents
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {path.contents.slice(0, 4).map((content, index) => (
                            <div key={content.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                index === 0 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                index === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                                index === 2 ? 'bg-gradient-to-r from-purple-400 to-violet-500' :
                                'bg-gradient-to-r from-amber-400 to-orange-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{content.title}</div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {content.duration_minutes} min
                                  </div>
                                  <div className="px-2 py-0.5 bg-white border border-gray-200 rounded-full">
                                    {content.content_type}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {path.contents.length > 4 && (
                            <div className="md:col-span-2">
                              <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-emerald-700">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">+{path.contents.length - 4} more lessons included</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-emerald-500" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Panel */}
                    <div className="lg:w-64 space-y-4">
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                        <h4 className="font-semibold text-gray-900 mb-3">Start Learning</h4>
                        <div className="space-y-3">
                          <button
                            disabled
                            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <BookOpen className="h-4 w-4" />
                            View Details
                          </button>
                          <div className="text-xs text-gray-600 text-center">
                            ⭐ 4.8 average rating
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-2">Skills You'll Gain</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs">Financial Planning</span>
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs">Investment Strategy</span>
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs">Risk Management</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}