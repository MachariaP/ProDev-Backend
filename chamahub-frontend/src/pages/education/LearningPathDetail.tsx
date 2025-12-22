import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  Video,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { mockEducationService, type LearningPath, type EducationalContent } from '../../services/mockEducationService';

export function LearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedContent, setExpandedContent] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchLearningPath(parseInt(id));
    }
  }, [id]);

  const fetchLearningPath = async (pathId: number) => {
    try {
      setLoading(true);
      const pathData = await mockEducationService.getLearningPathById(pathId);
      
      if (pathData) {
        setLearningPath(pathData);
      } else {
        navigate('/education/learning-paths');
      }
    } catch (error) {
      console.error('Failed to fetch learning path:', error);
      navigate('/education/learning-paths');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <Target className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Loading Learning Path</h3>
            <p className="text-gray-600">Preparing your structured course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return null;
  }

  const completedLessons = 0; // This would come from user progress in a real implementation
  const progressPercentage = (completedLessons / learningPath.contents.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-8">
          <button
            onClick={() => navigate('/education/learning-paths')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group mb-6"
          >
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium">Back to Learning Paths</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getDifficultyColor(learningPath.difficulty)} font-medium px-4 py-2 text-base`}>
                  {learningPath.difficulty}
                </Badge>
                {learningPath.is_featured && (
                  <Badge className="bg-white/20 border-white/30 text-white font-medium px-4 py-2 text-base">
                    <Award className="h-4 w-4 mr-2 inline" />
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold">{learningPath.title}</h1>
              <p className="text-xl text-white/90">{learningPath.description}</p>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">{learningPath.contents.length} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{learningPath.total_duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">{learningPath.difficulty} level</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold text-lg mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/90">Completion</span>
                    <span className="text-lg font-bold">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90">Completed</span>
                    <span className="font-bold">{completedLessons} / {learningPath.contents.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90">Time Investment</span>
                    <span className="font-bold">{learningPath.total_duration_minutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Course Curriculum */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                <div className="text-sm text-gray-600">
                  {learningPath.contents.length} lessons
                </div>
              </div>

              <div className="space-y-4">
                {learningPath.contents.map((content: EducationalContent, index: number) => (
                  <div
                    key={content.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Lesson Header */}
                    <div
                      className="p-5 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
                      onClick={() => setExpandedContent(expandedContent === content.id ? null : content.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                          index === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                          index === 2 ? 'bg-gradient-to-r from-purple-400 to-violet-500' :
                          'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{content.title}</h3>
                            <ChevronRight 
                              className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                                expandedContent === content.id ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{content.description}</p>
                          
                          <div className="flex items-center gap-4 flex-wrap">
                            <Badge className={`${getCategoryColor(content.category)} text-xs px-2 py-1`}>
                              <span className="mr-1">{categoryIcons[content.category]}</span>
                              {formatCategory(content.category)}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              {content.content_type === 'VIDEO' ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                              <span>{content.content_type}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{content.duration_minutes} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content Details */}
                    {expandedContent === content.id && (
                      <div className="p-5 bg-white border-t border-gray-100">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">About this lesson</h4>
                            <p className="text-gray-600">{content.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Duration</div>
                              <div className="font-bold text-gray-900">{content.duration_minutes} min</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Views</div>
                              <div className="font-bold text-gray-900">{content.views_count}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">Level</div>
                              <div className="font-bold text-gray-900">{content.difficulty}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/education/content/${content.id}`)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                          >
                            <PlayCircle className="h-5 w-5" />
                            Start Lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Skills You'll Gain</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium">
                  Financial Planning
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                  Strategy
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 rounded-full text-sm font-medium">
                  Risk Management
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                  Decision Making
                </span>
              </div>
            </div>

            {/* Certificate Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Certificate</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Complete all lessons in this learning path to earn a certificate of completion
              </p>
              <div className="flex items-center gap-2 text-amber-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Shareable on LinkedIn</span>
              </div>
            </div>

            {/* Start Button */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-bold text-xl mb-3">Ready to Begin?</h3>
              <p className="text-white/90 text-sm mb-6">
                Start your learning journey and gain valuable financial skills
              </p>
              <button
                onClick={() => {
                  if (learningPath.contents.length > 0) {
                    navigate(`/education/content/${learningPath.contents[0].id}`);
                  }
                }}
                className="w-full px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-bold flex items-center justify-center gap-2"
              >
                <PlayCircle className="h-5 w-5" />
                Start First Lesson
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
