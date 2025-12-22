import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  Video,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { mockEducationService, type LearningPath, type EducationalContent } from '../../services/mockEducationService';

export function SimplifiedLearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchLearningPath();
    }
  }, [id]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      const path = await mockEducationService.getLearningPathById(Number(id));
      if (path) {
        setLearningPath(path);
        // Load user progress
        const progress = await mockEducationService.getUserProgress();
        const completed = new Set(
          progress
            .filter(p => p.status === 'COMPLETED' && path.contents.some(c => c.id === p.content_id))
            .map(p => p.content_id)
        );
        setCompletedLessons(completed);
      }
    } catch (error) {
      console.error('Failed to fetch learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (contentId: number) => {
    navigate(`/education/content/${contentId}`);
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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return Video;
      case 'ARTICLE':
        return FileText;
      default:
        return BookOpen;
    }
  };

  const progressPercentage = learningPath 
    ? (completedLessons.size / learningPath.contents.length) * 100 
    : 0;

  if (loading || !learningPath) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/education/learning-paths')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Paths</span>
          </button>
          <Badge className={getDifficultyColor(learningPath.difficulty)} variant="outline">
            {learningPath.difficulty}
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <div className={`h-2 ${
            learningPath.difficulty === 'BEGINNER' ? 'bg-green-500' :
            learningPath.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-8 w-8 text-emerald-500" />
              <CardTitle className="text-2xl md:text-3xl">{learningPath.title}</CardTitle>
            </div>
            <CardDescription className="text-base">{learningPath.description}</CardDescription>
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 mt-4 flex-wrap">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{learningPath.contents.length} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{learningPath.total_duration_minutes} min total</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedLessons.size} completed</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your Progress</span>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Contents</h3>
              <div className="space-y-3">
                {learningPath.contents.map((content: EducationalContent, index: number) => {
                  const isCompleted = completedLessons.has(content.id);
                  const Icon = getContentTypeIcon(content.content_type);
                  
                  return (
                    <button
                      key={content.id}
                      onClick={() => handleLessonClick(content.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Lesson Number / Status */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Lesson Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800 line-clamp-2">
                              {content.title}
                            </h4>
                            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {content.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Icon className="h-4 w-4" />
                              <span className="capitalize">{content.content_type.toLowerCase()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{content.duration_minutes} min</span>
                            </div>
                            {isCompleted && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 space-y-3">
              {progressPercentage === 0 ? (
                <button
                  onClick={() => handleLessonClick(learningPath.contents[0].id)}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Start Learning Path
                </button>
              ) : progressPercentage === 100 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-gray-600">
                    You've completed all lessons in this learning path.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    // Find first incomplete lesson
                    const nextLesson = learningPath.contents.find(
                      c => !completedLessons.has(c.id)
                    );
                    if (nextLesson) {
                      handleLessonClick(nextLesson.id);
                    }
                  }}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Continue Learning
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
