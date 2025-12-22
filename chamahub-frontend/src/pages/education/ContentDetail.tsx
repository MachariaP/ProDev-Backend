import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { mockEducationService, type EducationalContent } from '../../services/mockEducationService';

export function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [relatedContent, setRelatedContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(false);

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
        setBookmarked(progress?.bookmarked || false);
        setCompleted(progress?.status === 'COMPLETED');
        
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
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleMarkCompleted = async () => {
    if (!content) return;
    try {
      await mockEducationService.markAsCompleted(content.id);
      setCompleted(true);
    } catch (error) {
      console.error('Failed to mark as completed:', error);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-8">
          <button
            onClick={() => navigate('/education/content')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group mb-6"
          >
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium">Back to Content</span>
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${getCategoryColor(content.category)} font-medium px-4 py-2 text-base`}>
                <span className="mr-2">{categoryIcons[content.category]}</span>
                {formatCategory(content.category)}
              </Badge>
              <Badge className="bg-white/20 border-white/30 text-white font-medium px-4 py-2 text-base">
                {content.content_type === 'VIDEO' ? <Video className="h-4 w-4 mr-2 inline" /> : <FileText className="h-4 w-4 mr-2 inline" />}
                {content.content_type}
              </Badge>
              <div className={`px-4 py-2 rounded-full ${getDifficultyColor(content.difficulty)} text-white font-medium text-base`}>
                {content.difficulty}
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold">{content.title}</h1>
            <p className="text-xl text-white/90">{content.description}</p>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">{content.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span className="font-medium">{content.views_count} views</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Published {new Date(content.published_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video or Thumbnail */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {content.content_type === 'VIDEO' && content.video_url ? (
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  {/* SECURITY NOTE: In production, validate video_url against allowed domains before rendering.
                      Consider using allow-same-origin only if required by the video provider.
                      Current sandbox settings provide protection while allowing video playback. */}
                  <iframe
                    src={content.video_url}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    title={content.title}
                    sandbox="allow-scripts allow-presentation"
                  />
                </div>
              ) : (
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="w-full h-96 object-cover"
                />
              )}
            </div>

            {/* Article Content */}
            {content.content_type === 'ARTICLE' && content.content && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* SECURITY WARNING: dangerouslySetInnerHTML without sanitization is a security risk.
                    This is acceptable ONLY because we're using controlled mock data.
                    In production, MUST use DOMPurify: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.content) }}
                    or implement server-side content sanitization. Never render untrusted HTML without sanitization. */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={handleMarkCompleted}
                  disabled={completed}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    completed
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  {completed ? 'Completed' : 'Mark as Complete'}
                </button>
                <button
                  onClick={handleToggleBookmark}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                    bookmarked
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-blue-700' : ''}`} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            {(bookmarked || completed) && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border border-emerald-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Your Progress</h3>
                <div className="space-y-3">
                  {completed && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Completed</span>
                    </div>
                  )}
                  {bookmarked && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bookmark className="h-5 w-5 text-blue-600 fill-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Bookmarked</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Content */}
            {relatedContent.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Related Content</h3>
                <div className="space-y-3">
                  {relatedContent.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => navigate(`/education/content/${related.id}`)}
                      className="group cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={related.thumbnail_url}
                          alt={related.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{related.duration_minutes}m</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explore More */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-bold text-gray-900 text-lg mb-3">Explore More</h3>
              <p className="text-gray-600 text-sm mb-4">
                Continue your learning journey with structured courses
              </p>
              <button
                onClick={() => navigate('/education/learning-paths')}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
              >
                View Learning Paths
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
