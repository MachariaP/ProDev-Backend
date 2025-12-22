import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Users,
  Calendar,
  Sparkles,
  Lock,
  Unlock,
  BarChart,
  Download,
  Share2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { mockEducationService, type LearningPath, type EducationalContent, type UserProgress } from '../../services/mockEducationService';

interface PathProgress {
  completedLessons: number;
  progressPercentage: number;
  totalDuration: number;
  estimatedCompletion: string;
}

export function LearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [pathProgress, setPathProgress] = useState<PathProgress>({
    completedLessons: 0,
    progressPercentage: 0,
    totalDuration: 0,
    estimatedCompletion: '1 week'
  });
  const [activeTab, setActiveTab] = useState('curriculum');

  useEffect(() => {
    if (id) {
      fetchLearningPath(parseInt(id));
    }
  }, [id]);

  const fetchLearningPath = async (pathId: number) => {
    try {
      setLoading(true);
      const [pathData, progressData] = await Promise.all([
        mockEducationService.getLearningPathById(pathId),
        mockEducationService.getUserProgress(),
      ]);
      
      if (pathData) {
        setLearningPath(pathData);
        setUserProgress(progressData);
        
        // Calculate progress
        const completedLessons = progressData.filter(
          progress => progress.status === 'COMPLETED' && 
          pathData.contents.some(content => content.id === progress.content_id)
        ).length;
        
        const progressPercentage = pathData.contents.length > 0 
          ? Math.round((completedLessons / pathData.contents.length) * 100)
          : 0;
        
        setPathProgress({
          completedLessons,
          progressPercentage,
          totalDuration: pathData.total_duration_minutes,
          estimatedCompletion: progressPercentage > 50 ? '2-3 days' : '1 week'
        });
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
    const colors: Record<string, string> = {
      BEGINNER: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
      INTERMEDIATE: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200',
      ADVANCED: 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border-rose-200',
    };
    return colors[difficulty] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
  };

  const getDifficultyGradient = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'from-emerald-400 to-green-500',
      INTERMEDIATE: 'from-amber-400 to-orange-500',
      ADVANCED: 'from-rose-400 to-red-500',
    };
    return colors[difficulty] || 'from-gray-400 to-slate-500';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SAVINGS: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200',
      INVESTMENTS: 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200',
      LOANS: 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200',
      BUDGETING: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200',
      GROUP_MANAGEMENT: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleStartLearning = () => {
    if (learningPath?.contents && learningPath.contents.length > 0) {
      navigate(`/education/content/${learningPath.contents[0].id}`);
    }
  };

  const handleMarkLessonComplete = async (contentId: number) => {
    try {
      await mockEducationService.markAsCompleted(contentId);
      // Refresh progress
      fetchLearningPath(parseInt(id!));
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30">
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <Target className="h-16 w-16 text-gray-400 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-900">Learning Path Not Found</h3>
          <p className="text-gray-600">The learning path you're looking for doesn't exist or has been removed.</p>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={() => navigate('/education/learning-paths')}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              Browse Learning Paths
            </Button>
            <Button
              onClick={() => navigate('/education')}
              variant="outline"
            >
              Back to Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyGradient = getDifficultyGradient(learningPath.difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate('/education/learning-paths')}
              variant="ghost"
              className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Paths</span>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-2">Share</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                <span className="ml-2">Save</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getDifficultyColor(learningPath.difficulty)} font-medium px-4 py-2 text-base`}>
                  {learningPath.difficulty}
                </Badge>
                {learningPath.is_featured && (
                  <Badge className="bg-white/20 border-white/30 text-white font-medium px-4 py-2 text-base">
                    <Sparkles className="h-4 w-4 mr-2 inline" />
                    Featured
                  </Badge>
                )}
                <Badge className="bg-white/20 border-white/30 text-white font-medium px-4 py-2 text-base">
                  <Award className="h-4 w-4 mr-2 inline" />
                  Certificate Available
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{learningPath.title}</h1>
              <p className="text-xl text-white/90 max-w-4xl">{learningPath.description}</p>

              <div className="flex items-center gap-6 flex-wrap pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Lessons</div>
                    <div className="font-bold text-lg">{learningPath.contents.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Duration</div>
                    <div className="font-bold text-lg">{formatDuration(learningPath.total_duration_minutes)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Enrolled</div>
                    <div className="font-bold text-lg">2.5k+</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Est. Completion</div>
                    <div className="font-bold text-lg">{pathProgress.estimatedCompletion}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold text-lg mb-6">Your Progress</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/90">Course Completion</span>
                    <span className="text-xl font-bold">{pathProgress.progressPercentage}%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${pathProgress.progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90">Lessons Completed</span>
                    <span className="font-bold">{pathProgress.completedLessons} / {learningPath.contents.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90">Time Remaining</span>
                    <span className="font-bold">{formatDuration(learningPath.total_duration_minutes * (100 - pathProgress.progressPercentage) / 100)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90">Level</span>
                    <span className="font-bold">{learningPath.difficulty}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartLearning}
                  className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-bold py-3 mt-4"
                  disabled={learningPath.contents.length === 0}
                >
                  {pathProgress.completedLessons === 0 ? 'Start Learning' : 
                   pathProgress.completedLessons === learningPath.contents.length ? 'Course Completed' : 
                   'Continue Learning'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="curriculum" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="certificate" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
              <Award className="h-4 w-4 mr-2" />
              Certificate
            </TabsTrigger>
          </TabsList>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                  <p className="text-gray-600 mt-1">Follow the structured path to master this topic</p>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                  {learningPath.contents.length} lessons • {formatDuration(learningPath.total_duration_minutes)}
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {learningPath.contents.map((content: EducationalContent, index: number) => {
                  const isCompleted = userProgress.some(
                    progress => progress.content_id === content.id && progress.status === 'COMPLETED'
                  );
                  const isUnlocked = index === 0 || isCompleted || 
                    (index > 0 && userProgress.some(
                      progress => progress.content_id === learningPath.contents[index - 1].id && 
                      progress.status === 'COMPLETED'
                    ));
                  
                  return (
                    <AccordionItem 
                      key={content.id} 
                      value={`item-${content.id}`}
                      className={`border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all ${
                        isCompleted ? 'border-emerald-200 bg-emerald-50/30' : ''
                      }`}
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50">
                        <div className="flex items-start gap-4 w-full">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                            isCompleted ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                            isUnlocked ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                            'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}>
                            {isCompleted ? <CheckCircle className="h-6 w-6" /> : index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{content.title}</h3>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{content.description}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {isCompleted && (
                                  <Badge className="bg-emerald-100 text-emerald-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                                {!isUnlocked && (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-wrap mt-2">
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
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Eye className="h-3 w-3" />
                                <span>{content.views_count.toLocaleString()} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-6 pb-6">
                        <div className="space-y-6 pl-16">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900">About this lesson</h4>
                            <p className="text-gray-600">{content.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center p-3">
                              <div className="text-sm text-gray-600 mb-1">Duration</div>
                              <div className="font-bold text-gray-900">{content.duration_minutes} min</div>
                            </div>
                            <div className="text-center p-3">
                              <div className="text-sm text-gray-600 mb-1">Skill Level</div>
                              <div className="font-bold text-gray-900">{content.difficulty}</div>
                            </div>
                            <div className="text-center p-3">
                              <div className="text-sm text-gray-600 mb-1">Content Type</div>
                              <div className="font-bold text-gray-900">{content.content_type}</div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {isUnlocked ? (
                              <>
                                <Link
                                  to={`/education/content/${content.id}`}
                                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                                >
                                  <PlayCircle className="h-5 w-5" />
                                  {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                                </Link>
                                {!isCompleted && (
                                  <Button
                                    onClick={() => handleMarkLessonComplete(content.id)}
                                    variant="outline"
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                )}
                              </>
                            ) : (
                              <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Complete previous lesson to unlock
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Learning Objectives
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>Understand core financial concepts and principles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>Apply financial strategies to real-world scenarios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>Develop practical skills for financial management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>Create actionable financial plans for your chama</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Who Should Take This Path
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <span>Chama leaders and members</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <span>Individuals seeking financial literacy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <span>Small business owners</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <span>Financial advisors and consultants</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Prerequisites & Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-emerald-500" />
                      What You'll Need
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Basic understanding of mathematics
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Willingness to learn and apply concepts
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Notebook or digital note-taking app
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-blue-500" />
                      Skill Level
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Course Difficulty</span>
                        <span className={`font-bold ${getDifficultyColor(learningPath.difficulty).includes('emerald') ? 'text-emerald-600' : 
                          getDifficultyColor(learningPath.difficulty).includes('amber') ? 'text-amber-600' : 'text-rose-600'}`}>
                          {learningPath.difficulty}
                        </span>
                      </div>
                      <Progress value={
                        learningPath.difficulty === 'BEGINNER' ? 25 :
                        learningPath.difficulty === 'INTERMEDIATE' ? 50 : 75
                      } className="h-2" />
                      <div className="text-sm text-gray-500">
                        {learningPath.difficulty === 'BEGINNER' && 'Perfect for complete beginners'}
                        {learningPath.difficulty === 'INTERMEDIATE' && 'Some prior knowledge recommended'}
                        {learningPath.difficulty === 'ADVANCED' && 'Requires intermediate financial knowledge'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Downloadable Guides</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Comprehensive PDF guides for each module</p>
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Guides
                </Button>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    <Video className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Video Resources</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Additional video explanations and tutorials</p>
                <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Watch Videos
                </Button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Recommended Reading</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">Books and articles for further learning</p>
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Resources
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Certificate Tab */}
          <TabsContent value="certificate" className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200 p-8 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl inline-flex">
                  <Award className="h-16 w-16 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h3>
                  <p className="text-gray-600">
                    Complete all lessons in this learning path to earn a verified certificate that you can share on LinkedIn and other professional networks.
                  </p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Shareable on LinkedIn</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Verified by ChamaHub</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-amber-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Downloadable PDF</span>
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button
                    disabled={pathProgress.progressPercentage < 100}
                    className={`px-8 py-3 text-lg font-bold ${
                      pathProgress.progressPercentage < 100
                        ? 'bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    }`}
                  >
                    {pathProgress.progressPercentage < 100 ? (
                      <>Complete Course to Unlock Certificate</>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Download Certificate
                      </>
                    )}
                  </Button>
                  {pathProgress.progressPercentage < 100 && (
                    <p className="text-sm text-gray-500 mt-2">
                      {pathProgress.progressPercentage}% complete • {learningPath.contents.length - pathProgress.completedLessons} lessons remaining
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}