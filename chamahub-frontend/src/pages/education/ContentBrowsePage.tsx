import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Award,
  Search,
  Clock,
  Play,
  Eye,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { educationService } from '../../services/apiService';
import type { EducationalContent } from '../../types/api';

export function ContentBrowsePage() {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContents();
  }, [categoryFilter, difficultyFilter, contentTypeFilter]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (contentTypeFilter !== 'all') params.content_type = contentTypeFilter;
      
      const response = await educationService.getEducationalContents(params);
      setContents(response.results);
    } catch (err) {
      console.error('Failed to fetch educational content:', err);
    } finally {
      setLoading(false);
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

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'from-red-500 to-pink-500';
      case 'ARTICLE':
        return 'from-blue-500 to-cyan-500';
      case 'QUIZ':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-purple-500 to-indigo-500';
    }
  };

  const filteredContents = contents.filter((content) =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedByType = filteredContents.reduce((acc, content) => {
    const type = content.content_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(content);
    return acc;
  }, {} as Record<string, EducationalContent[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading educational content...</p>
        </div>
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
            onClick={() => navigate('/education')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </motion.button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-600" />
              Educational Content
            </h1>
            <p className="text-muted-foreground mt-2">Explore articles, videos, quizzes and more</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                  <SelectItem value="INVESTMENTS">Investments</SelectItem>
                  <SelectItem value="LOANS">Loans</SelectItem>
                  <SelectItem value="BUDGETING">Budgeting</SelectItem>
                  <SelectItem value="FINANCIAL_PLANNING">Financial Planning</SelectItem>
                  <SelectItem value="CREDIT_SCORE">Credit Score</SelectItem>
                  <SelectItem value="TAXES">Taxes</SelectItem>
                  <SelectItem value="RETIREMENT">Retirement</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                  <SelectItem value="ENTREPRENEURSHIP">Entrepreneurship</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>

              {/* Content Type Filter */}
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ARTICLE">Articles</SelectItem>
                  <SelectItem value="VIDEO">Videos</SelectItem>
                  <SelectItem value="TUTORIAL">Tutorials</SelectItem>
                  <SelectItem value="QUIZ">Quizzes</SelectItem>
                  <SelectItem value="COURSE">Courses</SelectItem>
                  <SelectItem value="EBOOK">E-Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({filteredContents.length})</TabsTrigger>
            <TabsTrigger value="VIDEO">Videos ({groupedByType.VIDEO?.length || 0})</TabsTrigger>
            <TabsTrigger value="ARTICLE">Articles ({groupedByType.ARTICLE?.length || 0})</TabsTrigger>
            <TabsTrigger value="QUIZ">Quizzes ({groupedByType.QUIZ?.length || 0})</TabsTrigger>
            <TabsTrigger value="TUTORIAL">Tutorials ({groupedByType.TUTORIAL?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredContents.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="py-16 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Content Found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content, index) => {
                  const Icon = getContentTypeIcon(content.content_type);
                  return (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden h-full"
                        onClick={() => navigate(`/education/content/${content.id}`)}
                      >
                        {content.thumbnail_url ? (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={content.thumbnail_url} 
                              alt={content.title}
                              className="w-full h-full object-cover"
                            />
                            {content.content_type === 'VIDEO' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`h-48 bg-gradient-to-br ${getContentTypeColor(content.content_type)} flex items-center justify-center`}>
                            <Icon className="h-16 w-16 text-white" />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getDifficultyColor(content.difficulty)}>
                              {content.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {content.content_type.toLowerCase()}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{content.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{content.duration_minutes}m</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{content.views_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{content.likes_count}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                              <Award className="h-4 w-4" />
                              <span>{content.points_reward}</span>
                            </div>
                          </div>
                          {content.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {content.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {content.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{content.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {Object.entries(groupedByType).map(([type, typeContents]) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typeContents.map((content, index) => {
                  const Icon = getContentTypeIcon(content.content_type);
                  return (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-2xl transition-all overflow-hidden h-full"
                        onClick={() => navigate(`/education/content/${content.id}`)}
                      >
                        {content.thumbnail_url ? (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={content.thumbnail_url} 
                              alt={content.title}
                              className="w-full h-full object-cover"
                            />
                            {content.content_type === 'VIDEO' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`h-48 bg-gradient-to-br ${getContentTypeColor(content.content_type)} flex items-center justify-center`}>
                            <Icon className="h-16 w-16 text-white" />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getDifficultyColor(content.difficulty)}>
                              {content.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {content.content_type.toLowerCase()}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{content.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
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
                            <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                              <Award className="h-4 w-4" />
                              <span>{content.points_reward}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}
