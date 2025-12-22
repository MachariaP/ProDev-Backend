import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Video as VideoIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { mockEducationService, type EducationalContent } from '../../services/mockEducationService';

export function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [relatedContent, setRelatedContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchContent();
      fetchProgress();
    }
  }, [id]);

  useEffect(() => {
    // Auto-mark as viewed after 30 seconds
    if (!hasViewed) {
      const viewTimer = setTimeout(() => {
        handleTrackView();
      }, 30000);

      return () => clearTimeout(viewTimer);
    }
  }, [hasViewed]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await mockEducationService.getContentById(Number(id));
      if (data) {
        setContent(data);
        // Fetch related content
        const related = await mockEducationService.getRelatedContent(Number(id), 3);
        setRelatedContent(related);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const progressData = await mockEducationService.getProgressForContent(Number(id));
      if (progressData) {
        setIsBookmarked(progressData.bookmarked);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleTrackView = async () => {
    try {
      await mockEducationService.trackView(Number(id));
      setHasViewed(true);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const result = await mockEducationService.toggleBookmark(Number(id));
      setIsBookmarked(result.bookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: content?.title || 'ChamaHub Education',
      text: content?.description || '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SAVINGS':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'INVESTMENTS':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'LOANS':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'BUDGETING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'GROUP_MANAGEMENT':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-400';
      case 'INTERMEDIATE':
        return 'bg-yellow-400';
      case 'ADVANCED':
        return 'bg-red-400';
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

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge className={getCategoryColor(content.category)} variant="outline">
              {categoryIcons[content.category]} {formatCategory(content.category)}
            </Badge>
            <div 
              className={`w-3 h-3 rounded-full ${getDifficultyColor(content.difficulty)}`} 
              title={content.difficulty}
            />
            <Badge variant="outline">{content.content_type}</Badge>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {content.title}
            </CardTitle>
            <p className="text-lg text-gray-600">{content.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{content.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{content.views_count} views</span>
              </div>
              <div className="text-gray-400">
                Published {new Date(content.published_at).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Video Content */}
            {content.content_type === 'VIDEO' && content.video_url && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={content.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={content.title}
                />
              </div>
            )}

            {/* Article Content */}
            {content.content_type === 'ARTICLE' && (
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t flex-wrap">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-5 w-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-5 w-5" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Related Content */}
        {relatedContent.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Related Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedContent.map((related) => (
                <Card
                  key={related.id}
                  className="cursor-pointer hover:shadow-lg transition-all border border-gray-200"
                  onClick={() => {
                    navigate(`/education/content/${related.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="h-32 overflow-hidden bg-gray-200">
                    <img
                      src={related.thumbnail_url}
                      alt={related.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(related.category)} text-xs`} variant="outline">
                        {formatCategory(related.category)}
                      </Badge>
                      {related.content_type === 'VIDEO' && (
                        <VideoIcon className="h-3 w-3 text-gray-500" />
                      )}
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{related.title}</CardTitle>
                  </CardHeader>
                  <div className="px-3 pb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{related.duration_minutes}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{related.views_count}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => navigate(`/education/content?category=${content.category}`)}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View More {formatCategory(content.category)} Content
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
