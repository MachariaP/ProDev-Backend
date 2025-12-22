import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Eye,
  Bookmark,
  Share2,
  CheckCircle,
  Video,
  FileText,
  TrendingUp,
  ChevronRight,
  ThumbsUp,
  Download,
  ExternalLink,
  BookOpen,
  Users,
  Calendar,
  Award,
  PlayCircle,
  BarChart,
  Target
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { mockEducationService, type EducationalContent } from '../../services/mockEducationService';

interface UserProgress {
  content_id: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  bookmarked: boolean;
  last_viewed_at?: string;
}

export function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [relatedContent, setRelatedContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (id) {
      fetchContent(parseInt(id));
    }
  }, [id]);

  const fetchContent = async (contentId: number) => {
    try {
      setLoading(true);
      const [contentData, related, progress] = await Promise.all([
        mockEducationService.getContentById(contentId),
        mockEducationService.getRelatedContent(contentId),
        mockEducationService.getProgressForContent(contentId),
      ]);
      
      if (contentData) {
        setContent(contentData);
        setRelatedContent(related);
        
        if (progress) {
          setUserProgress(progress);
          setBookmarked(progress.bookmarked);
          setCompleted(progress.status === 'COMPLETED');
        }
        
        // Track view
        await mockEducationService.trackView(contentId);
      } else {
        navigate('/education/content');
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      navigate('/education/content');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!content) return;
    try {
      const result = await mockEducationService.toggleBookmark(content.id);
      setBookmarked(result.bookmarked);
      setUserProgress(prev => prev ? { ...prev, bookmarked: result.bookmarked } : null);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleMarkCompleted = async () => {
    if (!content) return;
    try {
      await mockEducationService.markAsCompleted(content.id);
      setCompleted(true);
      setUserProgress(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
    } catch (error) {
      console.error('Failed to mark as completed:', error);
    }
  };

  const handleLike = async () => {
    if (!content) return;
    try {
      // Implement like functionality
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to like:', error);
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

  const getDifficultyTextColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'text-emerald-600',
      INTERMEDIATE: 'text-amber-600',
      ADVANCED: 'text-rose-600',
    };
    return colors[difficulty] || 'text-gray-600';
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <FileText className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Loading Content</h3>
            <p className="text-gray-600">Preparing your learning experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <FileText className="h-16 w-16 text-gray-400 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-900">Content Not Found</h3>
          <p className="text-gray-600">The content you're looking for doesn't exist or has been removed.</p>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={() => navigate('/education/content')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Browse Content
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

  const difficultyGradient = getDifficultyColor(content.difficulty);
  const difficultyTextColor = getDifficultyTextColor(content.difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate('/education/content')}
              variant="ghost"
              className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Library</span>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:text-white hover:bg-white/10"
                onClick={handleToggleBookmark}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-white' : ''}`} />
                <span className="ml-2">{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-2">Share</span>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${getCategoryColor(content.category)} font-medium px-4 py-2 text-base`}>
                <span className="mr-2">{categoryIcons[content.category]}</span>
                {formatCategory(content.category)}
              </Badge>
              <Badge className="bg-white/20 border-white/30 text-white font-medium px-4 py-2 text-base">
                {content.content_type === 'VIDEO' ? <Video className="h-4 w-4 mr-2 inline" /> : <FileText className="h-4 w-4 mr-2 inline" />}
                {content.content_type}
              </Badge>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${difficultyGradient} text-white font-medium text-base shadow-lg`}>
                {content.difficulty}
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{content.title}</h1>
            <p className="text-xl text-white/90 max-w-4xl">{content.description}</p>

            <div className="flex items-center gap-6 flex-wrap pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-white/80">Duration</div>
                  <div className="font-bold text-lg">{content.duration_minutes} minutes</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-white/80">Views</div>
                  <div className="font-bold text-lg">{content.views_count.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-white/80">Published</div>
                  <div className="font-bold text-lg">{formatDate(content.published_at)}</div>
                </div>
              </div>
              {content.is_featured && (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg">
                    <Award className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-sm text-white/80">Status</div>
                    <div className="font-bold text-lg text-amber-300">Featured Content</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Media */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {content.content_type === 'VIDEO' && content.video_url ? (
                <div className="relative rounded-t-2xl overflow-hidden">
                  <div className="aspect-video bg-black">
                    <iframe
                      src={content.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      title={content.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm">
                      <PlayCircle className="h-4 w-4" />
                      <span>Playing</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={content.thumbnail_url}
                    alt={content.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <FileText className="h-8 w-8 mb-2" />
                      <h3 className="text-xl font-bold">Read Article</h3>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Bar */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleMarkCompleted}
                      disabled={completed}
                      className={`flex items-center gap-2 ${
                        completed
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                          : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {completed ? 'Completed ✓' : 'Mark Complete'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      className={`flex items-center gap-2 ${liked ? 'text-rose-600 border-rose-200' : ''}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-rose-600' : ''}`} />
                      {liked ? 'Liked' : 'Like'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-gray-100">
                  <TabsList className="bg-transparent p-0 h-auto">
                    <TabsTrigger value="overview" className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="details" className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                      Resources
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="p-6">
                  <div className="prose prose-lg max-w-none">
                    {content.content_type === 'ARTICLE' && content.content ? (
                      <div dangerouslySetInnerHTML={{ __html: content.content }} />
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">About This {content.content_type}</h3>
                        <p className="text-gray-700">{content.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                          <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-500" />
                              Key Learning Objectives
                            </h4>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                                <span>Understand basic financial concepts</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                                <span>Apply principles to real-world scenarios</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                                <span>Develop practical financial skills</span>
                              </li>
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                              <BarChart className="h-5 w-5 text-emerald-500" />
                              Skill Level
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Difficulty</span>
                                <span className={`font-bold ${difficultyTextColor}`}>{content.difficulty}</span>
                              </div>
                              <Progress value={
                                content.difficulty === 'BEGINNER' ? 25 :
                                content.difficulty === 'INTERMEDIATE' ? 50 : 75
                              } className="h-2" />
                              <div className="text-sm text-gray-500">
                                {content.difficulty === 'BEGINNER' && 'Perfect for beginners starting their financial journey'}
                                {content.difficulty === 'INTERMEDIATE' && 'Builds on foundational knowledge'}
                                {content.difficulty === 'ADVANCED' && 'Advanced concepts for experienced learners'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900">Content Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Content Type</span>
                            <span className="font-medium">{content.content_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category</span>
                            <span className="font-medium">{formatCategory(content.category)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Difficulty</span>
                            <span className={`font-medium ${difficultyTextColor}`}>{content.difficulty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{content.duration_minutes} minutes</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900">Engagement</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Views</span>
                            <span className="font-medium">{content.views_count.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Published Date</span>
                            <span className="font-medium">{formatDate(content.published_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated</span>
                            <span className="font-medium">{formatDate(content.published_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900">Additional Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Download PDF Guide</h5>
                            <p className="text-sm text-gray-600">Comprehensive summary</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <Video className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Related Videos</h5>
                            <p className="text-sm text-gray-600">Visual explanations</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Your Progress
              </h3>
              <div className="space-y-4">
                {completed && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Completed</div>
                        <div className="text-sm text-gray-600">Great job! You've finished this content</div>
                      </div>
                    </div>
                  </div>
                )}
                {bookmarked && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bookmark className="h-5 w-5 text-blue-600 fill-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Bookmarked</div>
                        <div className="text-sm text-gray-600">Saved for later review</div>
                      </div>
                    </div>
                  </div>
                )}
                {userProgress?.last_viewed_at && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Last Viewed</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(userProgress.last_viewed_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/education/learning-paths')}
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span>Explore Learning Paths</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => navigate('/education/content')}
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span>Browse More Content</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Content */}
            {relatedContent.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Related Content
                </h3>
                <div className="space-y-3">
                  {relatedContent.map((related) => (
                    <Link
                      key={related.id}
                      to={`/education/content/${related.id}`}
                      className="group block p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all border border-gray-200 hover:border-blue-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={related.thumbnail_url}
                            alt={related.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          {related.content_type === 'VIDEO' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="p-1 bg-black/60 rounded-full">
                                <Video className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getCategoryColor(related.category)}`}>
                              {categoryIcons[related.category]}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{related.duration_minutes}m</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
                {relatedContent.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate(`/education/content?category=${content.category}`)}
                  >
                    View All Related Content
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-100 p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Content Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Views</div>
                      <div className="font-bold text-gray-900">{content.views_count.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-bold text-gray-900">{content.duration_minutes}m</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-blue-100">
                  <div className="text-sm text-gray-600 mb-2">Completion Rate</div>
                  <Progress value={content.views_count > 100 ? 85 : 65} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {content.views_count > 100 ? 'High completion rate' : 'Average completion rate'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}