import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Video,
  Search,
  Clock,
  Eye,
  Filter,
  Star,
  TrendingUp,
  Flame,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockEducationService, type EducationalContent } from '../../services/mockEducationService';

export function ContentBrowse() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, difficultyFilter, contentTypeFilter, debouncedSearchQuery]);

  useEffect(() => {
    fetchContents();
  }, [categoryFilter, difficultyFilter, contentTypeFilter, debouncedSearchQuery, currentPage]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await mockEducationService.getContentList(
        {
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
          content_type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
          search: debouncedSearchQuery || undefined,
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
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border border-emerald-200';
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
        return 'bg-gradient-to-r from-emerald-400 to-green-500 text-white';
      case 'INTERMEDIATE':
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
      case 'ADVANCED':
        return 'bg-gradient-to-r from-rose-400 to-red-500 text-white';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium animate-pulse">Discovering amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <button
                onClick={() => navigate('/education')}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span className="font-medium">Back to Hub</span>
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <BookOpen className="h-10 w-10 md:h-12 md:w-12" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                    Browse Content
                  </span>
                </h1>
                <p className="text-xl text-white/90 mt-3 max-w-2xl">
                  Discover articles, videos, and resources to expand your financial knowledge
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Flame className="h-5 w-5 text-orange-300" />
                <span>{total}+ Resources</span>
              </div>
              <p className="text-white/80 text-sm mt-1">Curated by financial experts</p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Refine Your Search</h2>
                <p className="text-gray-600 text-sm">Filter by category, difficulty, and type</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Enhanced Search */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all"></div>
                <div className="relative bg-white rounded-lg border border-gray-200">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded">
                      <BookOpen className="h-3 w-3 text-blue-600" />
                    </div>
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="SAVINGS" className="flex items-center gap-2">
                    <span>💰</span> Savings
                  </SelectItem>
                  <SelectItem value="INVESTMENTS" className="flex items-center gap-2">
                    <span>📈</span> Investments
                  </SelectItem>
                  <SelectItem value="LOANS" className="flex items-center gap-2">
                    <span>🏦</span> Loans
                  </SelectItem>
                  <SelectItem value="BUDGETING" className="flex items-center gap-2">
                    <span>📊</span> Budgeting
                  </SelectItem>
                  <SelectItem value="GROUP_MANAGEMENT" className="flex items-center gap-2">
                    <span>👥</span> Group Management
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-emerald-100 to-green-100 rounded">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    </div>
                    <SelectValue placeholder="All Levels" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER" className="text-emerald-600">
                    🟢 Beginner
                  </SelectItem>
                  <SelectItem value="INTERMEDIATE" className="text-amber-600">
                    🟡 Intermediate
                  </SelectItem>
                  <SelectItem value="ADVANCED" className="text-rose-600">
                    🔴 Advanced
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Content Type Filter */}
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger className="bg-white border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-rose-100 to-pink-100 rounded">
                      <Video className="h-3 w-3 text-rose-600" />
                    </div>
                    <SelectValue placeholder="All Types" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-gray-200 shadow-lg">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ARTICLE" className="flex items-center gap-2">
                    <span>📝</span> Articles
                  </SelectItem>
                  <SelectItem value="VIDEO" className="flex items-center gap-2">
                    <span>🎥</span> Videos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  Showing {contents.length} of {total} results
                </div>
                {(categoryFilter !== 'all' || difficultyFilter !== 'all' || contentTypeFilter !== 'all' || searchQuery) && (
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Active filters
                  </div>
                )}
              </div>
              {(categoryFilter !== 'all' || difficultyFilter !== 'all' || contentTypeFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setDifficultyFilter('all');
                    setContentTypeFilter('all');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 rounded-lg font-medium transition-all text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <Link
                key={content.id}
                to={`/education/content/${content.id}`}
                className="group block relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                aria-label={`View ${content.title} - ${content.description.slice(0, 100)}...`}
              >
                {/* Top Gradient Bar */}
                <div className={`h-1 w-full ${
                  content.difficulty === 'BEGINNER' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                  content.difficulty === 'INTERMEDIATE' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-rose-400 to-red-500'
                }`}></div>
                
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                  <img 
                    src={content.thumbnail_url} 
                    alt={content.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {content.content_type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  {content.is_featured && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        <Star className="h-3 w-3 fill-white" />
                        Featured
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <Badge className={`${getCategoryColor(content.category)} font-medium px-3 py-1`}>
                      <span className="mr-1.5">{categoryIcons[content.category]}</span>
                      {formatCategory(content.category)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getDifficultyColor(content.difficulty)} shadow-sm`} />
                      <Badge variant="outline" className="text-xs bg-white border-gray-200">
                        {content.content_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {content.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <div className="p-1 bg-blue-50 rounded">
                          <Clock className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">{content.duration_minutes}m</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <div className="p-1 bg-purple-50 rounded">
                          <Eye className="h-3 w-3 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">{content.views_count}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {contents.length < total && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                      {contents.length} of {total}
                    </span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity -z-10"></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
