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
  ChevronRight,
  Bookmark,
  Users,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { mockEducationService, type EducationalContent } from '../../services/mockEducationService';

interface ContentFilters {
  category?: string;
  difficulty?: string;
  content_type?: string;
  search?: string;
  sort_by?: string;
}

export function ContentBrowse() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
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

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, difficultyFilter, contentTypeFilter, debouncedSearchQuery, sortBy]);

  useEffect(() => {
    fetchContents();
  }, [categoryFilter, difficultyFilter, contentTypeFilter, debouncedSearchQuery, currentPage, sortBy]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const filters: ContentFilters = {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        content_type: contentTypeFilter !== 'all' ? contentTypeFilter : undefined,
        search: debouncedSearchQuery || undefined,
        sort_by: sortBy,
      };
      
      const response = await mockEducationService.getContentList(filters, currentPage, 12);
      setContents(currentPage === 1 ? response.results : [...contents, ...response.results]);
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
    const colors: Record<string, string> = {
      SAVINGS: 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200',
      INVESTMENTS: 'bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-200',
      LOANS: 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200',
      BUDGETING: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200',
      GROUP_MANAGEMENT: 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-200',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-600 border-gray-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'from-emerald-400 to-green-500',
      INTERMEDIATE: 'from-amber-400 to-orange-500',
      ADVANCED: 'from-rose-400 to-red-500',
    };
    return colors[difficulty] || 'from-gray-400 to-slate-500';
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

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const clearFilters = () => {
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setContentTypeFilter('all');
    setSearchQuery('');
    setSortBy('popular');
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/30 via-white to-emerald-50/30">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-emerald-50/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-6 md:p-8 lg:p-10 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => navigate('/education')}
                variant="ghost"
                className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Hub</span>
              </Button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <Flame className="h-4 w-4 text-orange-300" />
                <span className="font-semibold">{total}+ Resources</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <BookOpen className="h-10 w-10 md:h-12 md:w-12" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200 leading-tight">
                    Content Library
                  </h1>
                  <p className="text-xl text-white/90 mt-3 max-w-3xl">
                    Explore our curated collection of financial education resources. Master the skills you need to grow your chama.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-200" />
                  <span className="text-white/80">Expert-curated content</span>
                </div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="text-white/80">Featured resources</span>
                </div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                  <span className="text-white/80">Updated weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Refine Your Search</h2>
                <p className="text-gray-600 text-sm">Filter and sort to find exactly what you need</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="duration">Shortest First</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="Search topics, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="SAVINGS">💰 Savings & Wealth</SelectItem>
                <SelectItem value="INVESTMENTS">📈 Investments</SelectItem>
                <SelectItem value="LOANS">🏦 Loans & Credit</SelectItem>
                <SelectItem value="BUDGETING">📊 Budgeting</SelectItem>
                <SelectItem value="GROUP_MANAGEMENT">👥 Group Management</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <SelectValue placeholder="All Levels" />
                </div>
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
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-rose-600" />
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ARTICLE">📝 Articles</SelectItem>
                <SelectItem value="VIDEO">🎥 Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Bar */}
          {(categoryFilter !== 'all' || difficultyFilter !== 'all' || contentTypeFilter !== 'all' || searchQuery) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-blue-700">Active filters:</span>
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Category: {formatCategory(categoryFilter)}
                  </Badge>
                )}
                {difficultyFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Level: {difficultyFilter}
                  </Badge>
                )}
                {contentTypeFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                    Type: {contentTypeFilter}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    Search: "{searchQuery}"
                  </Badge>
                )}
              </div>
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 self-start sm:self-center"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {contents.length === 0 ? 'No Content Found' : `Showing ${contents.length} of ${total} Resources`}
              </h3>
              {contents.length > 0 && (
                <p className="text-gray-600 text-sm mt-1">
                  {sortBy === 'popular' && 'Sorted by popularity'}
                  {sortBy === 'recent' && 'Sorted by most recent'}
                  {sortBy === 'duration' && 'Sorted by duration'}
                  {sortBy === 'views' && 'Sorted by view count'}
                </p>
              )}
            </div>
          </div>

          {contents.length === 0 ? (
            <Card className="shadow-lg border-gray-200">
              <CardContent className="py-16 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">No Content Found</h3>
                  <p className="text-gray-600">
                    We couldn't find any content matching your criteria. Try adjusting your filters or search for something else.
                  </p>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button
                      onClick={clearFilters}
                      variant="default"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Clear All Filters
                    </Button>
                    <Button
                      onClick={() => navigate('/education')}
                      variant="outline"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {contents.map((content) => {
                  const difficultyGradient = getDifficultyColor(content.difficulty);
                  
                  return (
                    <Link
                      key={content.id}
                      to={`/education/content/${content.id}`}
                      className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      {/* Featured Badge */}
                      {content.is_featured && (
                        <div className="absolute top-3 left-3 z-20">
                          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                            <Star className="h-3 w-3 fill-white" />
                            Featured
                          </div>
                        </div>
                      )}

                      {/* Thumbnail */}
                      <div className="relative h-48 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10`} />
                        <img 
                          src={content.thumbnail_url} 
                          alt={content.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Content Type Badge */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full">
                            {content.content_type === 'VIDEO' ? (
                              <Video className="h-3 w-3 text-white" />
                            ) : (
                              <BookOpen className="h-3 w-3 text-white" />
                            )}
                            <span className="text-xs text-white font-medium ml-1">
                              {content.content_type}
                            </span>
                          </div>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="absolute bottom-3 left-3 z-20">
                          <div className={`px-2 py-1 bg-gradient-to-r ${difficultyGradient} text-white text-xs font-semibold rounded-full shadow-lg`}>
                            {content.difficulty}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`${getCategoryColor(content.category)} text-xs font-medium`}>
                            <span className="mr-1.5">{categoryIcons[content.category]}</span>
                            {formatCategory(content.category)}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 min-h-[3rem]">
                          {content.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
                          {content.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-gray-600" title="Duration">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">{content.duration_minutes}m</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600" title="Views">
                              <Eye className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {content.views_count >= 1000 
                                  ? `${(content.views_count / 1000).toFixed(1)}k` 
                                  : content.views_count}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Explore</span>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Load More */}
              {contents.length < total && (
                <div className="text-center pt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg border-2 hover:border-blue-500 hover:bg-blue-50 transition-all min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent mr-2" />
                        Loading More...
                      </>
                    ) : (
                      <>
                        Load More
                        <span className="ml-2 text-sm text-gray-500">
                          ({contents.length} of {total})
                        </span>
                      </>
                    )}
                  </Button>
                  <p className="text-gray-500 text-sm mt-3">
                    Scroll to load more content automatically
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}