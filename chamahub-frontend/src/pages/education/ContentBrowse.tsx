import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Video,
  Search,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockEducationService, type EducationalContent } from '../../services/mockEducationService';

export function ContentBrowse() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Read initial filters from URL
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    if (category) {
      setCategoryFilter(category);
    }
    if (featured) {
      fetchFeaturedContent();
    } else {
      fetchContents();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchContents();
  }, [categoryFilter, difficultyFilter, contentTypeFilter, searchQuery, currentPage]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await mockEducationService.getContentList(
        {
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
          content_type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
          search: searchQuery || undefined,
        },
        currentPage,
        12
      );
      setContents(response.results);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);
      const featured = await mockEducationService.getFeaturedContent();
      setContents(featured);
      setTotal(featured.length);
    } catch (error) {
      console.error('Failed to fetch featured content:', error);
    } finally {
      setLoading(false);
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

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const categoryIcons: Record<string, string> = {
    SAVINGS: '💰',
    INVESTMENTS: '📈',
    LOANS: '🏦',
    BUDGETING: '📊',
    GROUP_MANAGEMENT: '👥',
  };

  if (loading && currentPage === 1) {
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/education')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Hub</span>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              Browse Content
            </h1>
            <p className="text-gray-600 mt-1">Discover articles, videos, and resources to expand your financial knowledge</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="SAVINGS">💰 Savings</SelectItem>
                  <SelectItem value="INVESTMENTS">📈 Investments</SelectItem>
                  <SelectItem value="LOANS">🏦 Loans</SelectItem>
                  <SelectItem value="BUDGETING">📊 Budgeting</SelectItem>
                  <SelectItem value="GROUP_MANAGEMENT">👥 Group Management</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">🟢 Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">🟡 Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">🔴 Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Content Type Filter */}
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ARTICLE">📝 Articles</SelectItem>
                  <SelectItem value="VIDEO">🎥 Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Showing {contents.length} of {total} results
              </span>
              {(categoryFilter !== 'all' || difficultyFilter !== 'all' || contentTypeFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setDifficultyFilter('all');
                    setContentTypeFilter('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {contents.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Content Found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {contents.map((content) => (
              <Card
                key={content.id}
                className="hover:shadow-xl transition-all overflow-hidden border border-gray-200"
              >
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={content.thumbnail_url} 
                    alt={content.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {content.content_type === 'VIDEO' && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {content.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                      Featured
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <Badge className={getCategoryColor(content.category)} variant="outline">
                      {categoryIcons[content.category]} {formatCategory(content.category)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${getDifficultyColor(content.difficulty)}`} 
                        title={content.difficulty}
                      />
                      <Badge variant="outline" className="text-xs">
                        {content.content_type}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{content.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{content.duration_minutes}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{content.views_count}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {contents.length < total && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : `Load More (${contents.length} of ${total})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
