import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Check,
  Play,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { educationService } from '../../services/apiService';
import type { EducationalContent, UserProgress } from '../../types/api';
import { toast } from 'react-hot-toast';

export function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchContent();
      fetchProgress();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      const data = await educationService.getEducationalContent(Number(id));
      setContent(data);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await educationService.getMyProgress({ content: Number(id) });
      if (response.results.length > 0) {
        setProgress(response.results[0]);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const handleStartContent = async () => {
    try {
      await educationService.updateProgress(Number(id), {
        status: 'IN_PROGRESS',
        progress_percentage: 0,
      });
      await fetchProgress();
      toast.success('Started learning!');
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to start content:', err);
      toast.error('Failed to start content');
    }
  };

  const handleCompleteContent = async (score?: number) => {
    try {
      await educationService.updateProgress(Number(id), {
        status: 'COMPLETED',
        progress_percentage: 100,
        quiz_score: score,
      });
      await fetchProgress();
      toast.success(`Completed! You earned ${content?.points_reward} points! 🎉`);
    } catch (err) {
      console.error('Failed to complete content:', err);
      toast.error('Failed to mark as complete');
    }
  };

  const handleLike = async () => {
    try {
      if (content) {
        await educationService.likeContent(content.id);
        setContent({ ...content, likes_count: content.likes_count + 1 });
        toast.success('Liked!');
      }
    } catch (err) {
      console.error('Failed to like content:', err);
      toast.error('Failed to like content');
    }
  };

  const handleShare = async () => {
    try {
      if (content) {
        await educationService.shareContent(content.id);
        if (navigator.share) {
          await navigator.share({
            title: content.title,
            text: content.description,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        }
      }
    } catch (err) {
      console.error('Failed to share content:', err);
      toast.error('Failed to share content');
    }
  };

  const handleBookmark = async () => {
    try {
      if (content) {
        await educationService.bookmarkContent(content.id);
        toast.success(progress?.bookmarked ? 'Bookmark removed' : 'Bookmarked!');
        await fetchProgress();
      }
    } catch (err) {
      console.error('Failed to bookmark content:', err);
      toast.error('Failed to bookmark content');
    }
  };

  const handleQuizSubmit = () => {
    if (!content?.quiz_questions) return;

    let correct = 0;
    content.quiz_questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.correct_answer) {
        correct++;
      }
    });

    const score = (correct / content.quiz_questions.length) * 100;
    setQuizScore(score);
    setShowQuizResults(true);

    if (score >= content.passing_score) {
      handleCompleteContent(score);
    } else {
      toast.error(`Score: ${score.toFixed(0)}%. Passing score is ${content.passing_score}%`);
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

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </motion.button>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(content.difficulty)}>
              {content.difficulty}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {content.content_type.toLowerCase()}
            </Badge>
            {progress?.status === 'COMPLETED' && (
              <Badge className="bg-green-100 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{content.title}</CardTitle>
            <CardDescription className="text-lg">{content.description}</CardDescription>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{content.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{content.views_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{content.points_reward} points</span>
              </div>
              {content.certificate_available && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  Certificate Available
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-semibold">{progress.progress_percentage}%</span>
                </div>
                <Progress value={progress.progress_percentage} className="h-2" />
              </div>
            )}

            {/* Video Content */}
            {content.content_type === 'VIDEO' && content.video_url && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {isPlaying ? (
                  <iframe
                    src={content.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={content.title}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center cursor-pointer bg-gradient-to-br from-purple-600 to-blue-600"
                    onClick={() => {
                      setIsPlaying(true);
                      if (!progress) handleStartContent();
                    }}
                  >
                    <div className="text-center">
                      <Play className="h-20 w-20 text-white mb-4 mx-auto" />
                      <p className="text-white text-xl font-semibold">Click to play</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Article Content */}
            {content.content_type === 'ARTICLE' && (
              <div className="prose max-w-none">
                <div 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            )}

            {/* Learning Objectives */}
            {content.learning_objectives.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {content.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quiz */}
            {content.content_type === 'QUIZ' && content.quiz_questions && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Quiz Questions</h3>
                  <Badge variant="outline">Passing Score: {content.passing_score}%</Badge>
                </div>

                {!showQuizResults ? (
                  <div className="space-y-6">
                    {content.quiz_questions.map((question: any, qIndex: number) => (
                      <Card key={qIndex}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Question {qIndex + 1}
                          </CardTitle>
                          <CardDescription>{question.question}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {question.options.map((option: string, oIndex: number) => (
                            <div
                              key={oIndex}
                              onClick={() =>
                                setQuizAnswers({ ...quizAnswers, [qIndex]: option })
                              }
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                quizAnswers[qIndex] === option
                                  ? 'border-purple-600 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    quizAnswers[qIndex] === option
                                      ? 'border-purple-600 bg-purple-600'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {quizAnswers[qIndex] === option && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length !== content.quiz_questions.length}
                      className="w-full"
                      size="lg"
                    >
                      Submit Quiz
                    </Button>
                  </div>
                ) : (
                  <Card className={quizScore >= content.passing_score ? 'border-green-500' : 'border-red-500'}>
                    <CardContent className="py-8 text-center">
                      <div className={`text-6xl font-bold mb-4 ${quizScore >= content.passing_score ? 'text-green-600' : 'text-red-600'}`}>
                        {quizScore.toFixed(0)}%
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {quizScore >= content.passing_score ? 'Congratulations! 🎉' : 'Keep Learning 📚'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {quizScore >= content.passing_score
                          ? `You passed the quiz and earned ${content.points_reward} points!`
                          : `You need ${content.passing_score}% to pass. Try again!`}
                      </p>
                      <Button
                        onClick={() => {
                          setShowQuizResults(false);
                          setQuizAnswers({});
                        }}
                        variant="outline"
                      >
                        Retake Quiz
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t">
              {progress?.status !== 'COMPLETED' && content.content_type !== 'QUIZ' && (
                <Button onClick={() => handleCompleteContent()} size="lg" className="flex-1">
                  <Check className="h-5 w-5 mr-2" />
                  Mark as Complete
                </Button>
              )}
              <Button onClick={handleLike} variant="outline" size="lg">
                <Heart className="h-5 w-5 mr-2" />
                Like ({content.likes_count})
              </Button>
              <Button onClick={handleShare} variant="outline" size="lg">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
              <Button onClick={handleBookmark} variant="outline" size="lg">
                <Bookmark className={`h-5 w-5 mr-2 ${progress?.bookmarked ? 'fill-current' : ''}`} />
                {progress?.bookmarked ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Tags */}
            {content.tags.length > 0 && (
              <div className="pt-6 border-t">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
