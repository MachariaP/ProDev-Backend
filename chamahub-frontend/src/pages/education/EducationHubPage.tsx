import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Video,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Clock,
  Trophy,
  Play,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { educationService } from '../../services/apiService';
import type { EducationalContent, LearningPath, Webinar, SavingsChallenge, EducationDashboardStats } from '../../types/api';
import { formatCurrency } from '../../utils/formatting';

export function EducationHubPage() {
  const [featuredContent, setFeaturedContent] = useState<EducationalContent[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [upcomingWebinars, setUpcomingWebinars] = useState<Webinar[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<SavingsChallenge[]>([]);
  const [stats, setStats] = useState<EducationDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      const [contentRes, pathsRes, webinarsRes, challengesRes, statsRes] = await Promise.all([
        educationService.getEducationalContents({ is_featured: true, page: 1 }),
        educationService.getLearningPaths({ is_featured: true, page: 1 }),
        educationService.getWebinars({ status: 'SCHEDULED', page: 1 }),
        educationService.getSavingsChallenges({ status: 'ACTIVE', page: 1 }),
        educationService.getEducationDashboard(),
      ]);

      setFeaturedContent(contentRes.results.slice(0, 3));
      setLearningPaths(pathsRes.results.slice(0, 4));
      setUpcomingWebinars(webinarsRes.results.slice(0, 3));
      setActiveChallenges(challengesRes.results.slice(0, 3));
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to fetch education data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-700';
      case 'EXPERT':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return Video;
      case 'ARTICLE':
        return FileText;
      case 'QUIZ':
        return Award;
      default:
        return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Education Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <GraduationCap className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Education Hub</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-purple-100 max-w-2xl mb-8"
            >
              Empower yourself with financial literacy. Learn, grow, and achieve your financial goals through our comprehensive educational resources.
            </motion.p>
            
            {/* Quick Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">{stats.total_content || 0}</div>
                  <div className="text-sm text-purple-100">Learning Resources</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <GraduationCap className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">{stats.total_paths || 0}</div>
                  <div className="text-sm text-purple-100">Learning Paths</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Video className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">{stats.upcoming_webinars || 0}</div>
                  <div className="text-sm text-purple-100">Upcoming Webinars</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Trophy className="h-6 w-6 mb-2" />
                  <div className="text-2xl font-bold">{stats.active_challenges || 0}</div>
                  <div className="text-sm text-purple-100">Active Challenges</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Browse Content',
              description: 'Explore articles, videos & tutorials',
              icon: BookOpen,
              color: 'from-blue-500 to-blue-600',
              path: '/education/content',
            },
            {
              title: 'Learning Paths',
              description: 'Structured courses for your goals',
              icon: Target,
              color: 'from-purple-500 to-purple-600',
              path: '/education/learning-paths',
            },
            {
              title: 'Join Webinars',
              description: 'Live sessions with experts',
              icon: Video,
              color: 'from-green-500 to-green-600',
              path: '/education/webinars',
            },
            {
              title: 'Take Challenges',
              description: 'Savings challenges with rewards',
              icon: TrendingUp,
              color: 'from-orange-500 to-orange-600',
              path: '/education/challenges',
            },
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer hover:shadow-2xl transition-all border-0 overflow-hidden"
                onClick={() => navigate(action.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                <CardContent className="p-6">
                  <action.icon className={`h-10 w-10 mb-4 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
                  <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <div className="flex items-center text-sm font-medium text-purple-600">
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Learning Paths */}
        {learningPaths.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Featured Learning Paths
                </h2>
                <p className="text-muted-foreground mt-2">Structured courses to achieve your financial goals</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/education/learning-paths')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View All <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden"
                    onClick={() => navigate(`/education/learning-paths/${path.id}`)}
                  >
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{path.title}</CardTitle>
                        <Badge className={getDifficultyColor(path.difficulty)}>
                          {path.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{path.short_description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{path.contents_count} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{path.total_duration_hours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{path.enrolled_count} enrolled</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <span className="font-semibold">{path.total_points} points</span>
                        </div>
                        {path.completion_certificate && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Certificate
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Content */}
        {featuredContent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Featured Content
                </h2>
                <p className="text-muted-foreground mt-2">Handpicked resources to boost your financial knowledge</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/education/content')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View All <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredContent.map((content, index) => {
                const IconComponent = getContentTypeIcon(content.content_type);
                return (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden"
                      onClick={() => navigate(`/education/content/${content.id}`)}
                    >
                      {content.thumbnail_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={content.thumbnail_url}
                            alt={content.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="h-5 w-5 text-purple-600" />
                          <Badge variant="outline">{content.content_type}</Badge>
                          <Badge className={getDifficultyColor(content.difficulty)}>
                            {content.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{content.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{content.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{content.points_reward} pts</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming Webinars */}
        {upcomingWebinars.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Upcoming Webinars
                </h2>
                <p className="text-muted-foreground mt-2">Join live sessions with financial experts</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/education/webinars')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View All <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingWebinars.map((webinar, index) => (
                <motion.div
                  key={webinar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden"
                    onClick={() => navigate(`/education/webinars/${webinar.id}`)}
                  >
                    <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Play className="h-3 w-3 mr-1" />
                          {webinar.status}
                        </Badge>
                        <Badge className={getDifficultyColor(webinar.difficulty)}>
                          {webinar.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{webinar.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{webinar.short_description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(webinar.scheduled_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{webinar.duration_minutes} minutes</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{webinar.registered_count}/{webinar.max_participants}</span>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            {webinar.points_reward} pts
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Active Savings Challenges
                </h2>
                <p className="text-muted-foreground mt-2">Join challenges and earn rewards while saving</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/education/challenges')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View All <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden"
                    onClick={() => navigate(`/education/challenges/${challenge.id}`)}
                  >
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {challenge.challenge_type.replace('_', ' ')}
                        </Badge>
                        <Badge className="bg-green-100 text-green-700">{challenge.status}</Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{challenge.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{challenge.short_description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Target Amount</span>
                          <span className="font-bold text-lg">{formatCurrency(challenge.target_amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <span className="font-semibold">{challenge.duration_days} days</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{challenge.participants_count} joined</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{challenge.reward_points} pts</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* My Certificates CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
          onClick={() => navigate('/education/certificates')}
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-2xl transition-all">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">View Your Certificates</h3>
                    <p className="text-muted-foreground">
                      Check your earned certificates and badges from completed courses and challenges
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
