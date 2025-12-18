import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle2,
  Lock,
  Play,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { educationService } from '../../services/apiService';
import type { LearningPath, LearningPathEnrollment } from '../../types/api';

export function LearningPathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [enrollment, setEnrollment] = useState<LearningPathEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPathDetails();
    }
  }, [id]);

  const fetchPathDetails = async () => {
    try {
      const pathData = await educationService.getLearningPath(Number(id));
      setPath(pathData);
      
      // Try to get enrollment status
      try {
        const enrollments = await educationService.getMyEnrollments();
        const userEnrollment = enrollments.results.find(
          (e) => e.learning_path === pathData.id
        );
        if (userEnrollment) {
          setEnrollment(userEnrollment);
        }
      } catch (err) {
        console.log('No enrollment found');
      }
    } catch (err) {
      console.error('Failed to fetch learning path:', err);
      alert('Failed to load learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!path) return;
    
    try {
      setEnrolling(true);
      const newEnrollment = await educationService.enrollInLearningPath(path.id);
      setEnrollment(newEnrollment);
      // Note: Using browser alert temporarily - should be replaced with toast notifications (e.g., sonner)
      alert('Successfully enrolled in learning path!');
    } catch (err) {
      console.error('Failed to enroll:', err);
      // Note: Using browser alert temporarily - should be replaced with toast notifications (e.g., sonner)
      alert('Failed to enroll in learning path');
    } finally {
      setEnrolling(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading learning path...</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <Card className="max-w-md">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Learning path not found</p>
            <Button onClick={() => navigate('/education/learning-paths')} className="mt-4">
              Back to Learning Paths
            </Button>
          </CardContent>
        </Card>
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
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/education/learning-paths')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </motion.button>
        </div>

        {/* Hero Card */}
        <Card className="shadow-2xl overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-purple-500 to-blue-500"></div>
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getDifficultyColor(path.difficulty)}>{path.difficulty}</Badge>
                  {path.is_featured && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-4">{path.title}</h1>
                <p className="text-lg text-muted-foreground">{path.description}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-purple-900">{path.contents_count}</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-900">{path.total_duration_hours}h</div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-900">{path.enrolled_count}</div>
                <div className="text-sm text-muted-foreground">Enrolled</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600 mb-2" />
                <div className="text-2xl font-bold text-yellow-900">{path.total_points}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
            </div>

            {/* Enrollment Status / CTA */}
            {enrollment ? (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Your Progress</h3>
                    <p className="text-muted-foreground">
                      Status: <Badge className="ml-2">{enrollment.status}</Badge>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{enrollment.progress_percentage}%</div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
                <Progress value={enrollment.progress_percentage} className="mb-4" />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>
                      <Clock className="inline h-4 w-4 mr-1" />
                      {enrollment.total_time_spent_minutes} mins spent
                    </span>
                    <span>
                      <Award className="inline h-4 w-4 mr-1 text-yellow-500" />
                      {enrollment.earned_points} points earned
                    </span>
                  </div>
                  <Button onClick={() => alert('Continue learning feature coming soon!')}>
                    Continue Learning
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
                {path.completion_certificate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span>Certificate upon completion</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Course Curriculum
            </CardTitle>
            <CardDescription>
              Complete all {path.contents_count} lessons to earn your certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(path.contents_count)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      {enrollment && enrollment.progress_percentage > (index / path.contents_count) * 100 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : enrollment ? (
                        <Play className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">Lesson {index + 1}</h4>
                      <p className="text-sm text-muted-foreground">Module content</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(path.total_duration_hours / path.contents_count * 60)} min
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Section */}
        {path.completion_certificate && (
          <Card className="shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                Completion Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                  <Award className="h-10 w-10 text-yellow-500" />
                  <div>
                    <h4 className="font-bold">Certificate of Completion</h4>
                    <p className="text-sm text-muted-foreground">
                      Shareable certificate with verification code
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                  <TrendingUp className="h-10 w-10 text-purple-500" />
                  <div>
                    <h4 className="font-bold">{path.total_points} Learning Points</h4>
                    <p className="text-sm text-muted-foreground">
                      Redeem for exclusive benefits
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
