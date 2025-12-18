import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Users,
  Award,
  MapPin,
  ExternalLink,
  CheckCircle,
  Share2,
  Download,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { educationService } from '../../services/apiService';
import type { Webinar, WebinarRegistration } from '../../types/api';
import { toast } from 'react-hot-toast';

export function WebinarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [registration, setRegistration] = useState<WebinarRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchWebinar();
      checkRegistration();
    }
  }, [id]);

  const fetchWebinar = async () => {
    try {
      const data = await educationService.getWebinar(Number(id));
      setWebinar(data);
    } catch (err) {
      console.error('Failed to fetch webinar:', err);
      toast.error('Failed to load webinar');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await educationService.getMyWebinarRegistrations();
      const reg = response.results.find((r) => r.webinar === Number(id));
      if (reg) {
        setRegistration(reg);
      }
    } catch (err) {
      console.error('Failed to check registration:', err);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const reg = await educationService.registerForWebinar(Number(id));
      setRegistration(reg);
      toast.success('Successfully registered for webinar!');
    } catch (err: any) {
      console.error('Failed to register:', err);
      toast.error(err.response?.data?.message || 'Failed to register for webinar');
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinWebinar = () => {
    if (webinar?.join_url) {
      window.open(webinar.join_url, '_blank');
      toast.success('Opening webinar...');
    }
  };

  const handleShare = async () => {
    try {
      if (webinar) {
        if (navigator.share) {
          await navigator.share({
            title: webinar.title,
            text: webinar.short_description,
            url: window.location.href,
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        }
      }
    } catch (err) {
      console.error('Failed to share:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'LIVE':
        return 'bg-green-100 text-green-700 animate-pulse';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      case 'RECORDING_AVAILABLE':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return Video;
  };

  if (loading || !webinar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading webinar...</p>
        </div>
      </div>
    );
  }

  const isLive = webinar.status === 'LIVE';
  const isUpcoming = webinar.status === 'SCHEDULED' && new Date(webinar.scheduled_at) > new Date();
  const isPast = webinar.status === 'COMPLETED' || new Date(webinar.scheduled_at) < new Date();
  const canJoin = registration && (isLive || isUpcoming);
  const spotsRemaining = webinar.max_participants - webinar.registered_count;

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
            <Badge className={getStatusColor(webinar.status)}>
              {isLive && '🔴 '}{webinar.status}
            </Badge>
            <Badge className={getDifficultyColor(webinar.difficulty)}>
              {webinar.difficulty}
            </Badge>
            {registration && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Registered
              </Badge>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <Card className="shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                    {webinar.platform}
                  </span>
                </div>
                <CardTitle className="text-4xl font-bold mb-4">{webinar.title}</CardTitle>
                <CardDescription className="text-lg">{webinar.short_description}</CardDescription>
              </div>
            </div>

            {/* Key Info */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(webinar.scheduled_at).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{new Date(webinar.scheduled_at).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{webinar.duration_minutes} minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Attendees</p>
                  <p className="font-semibold">{webinar.registered_count} / {webinar.max_participants}</p>
                  {spotsRemaining > 0 && spotsRemaining <= 10 && (
                    <p className="text-xs text-orange-600">Only {spotsRemaining} spots left!</p>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 mt-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!registration ? (
                <Button
                  onClick={handleRegister}
                  disabled={registering || spotsRemaining === 0 || isPast}
                  size="lg"
                  className="flex-1"
                >
                  {registering ? 'Registering...' : spotsRemaining === 0 ? 'Full' : 'Register Now'}
                </Button>
              ) : canJoin ? (
                <Button onClick={handleJoinWebinar} size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {isLive ? 'Join Live Session' : 'View Details'}
                </Button>
              ) : null}
              
              <Button onClick={handleShare} variant="outline" size="lg">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-2xl font-bold mb-3">About This Webinar</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{webinar.description}</p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="h-6 w-6 text-yellow-500" />
                    <h4 className="font-semibold">Rewards</h4>
                  </div>
                  <p className="text-muted-foreground">
                    Earn <span className="font-bold text-yellow-600">{webinar.points_reward} points</span> for attending
                  </p>
                  {webinar.certificate_available && (
                    <p className="text-sm text-muted-foreground mt-2">
                      ✓ Certificate of attendance included
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                    <h4 className="font-semibold">Interactive Features</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    {webinar.qna_enabled && <p className="text-muted-foreground">✓ Live Q&A session</p>}
                    {webinar.poll_enabled && <p className="text-muted-foreground">✓ Interactive polls</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resources */}
            {(webinar.slides_url || webinar.resources_url || webinar.recording_url) && (
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Download className="h-5 w-5 text-purple-600" />
                  Resources
                </h3>
                <div className="space-y-2">
                  {webinar.slides_url && (
                    <a
                      href={webinar.slides_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Download Presentation Slides
                    </a>
                  )}
                  {webinar.resources_url && (
                    <a
                      href={webinar.resources_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Additional Resources
                    </a>
                  )}
                  {webinar.recording_url && (
                    <a
                      href={webinar.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Video className="h-4 w-4" />
                      Watch Recording
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            {webinar.attended_count > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Webinar Stats
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{webinar.attended_count}</p>
                    <p className="text-sm text-muted-foreground">Total Attendees</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">{webinar.average_rating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{webinar.views_count}</p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timezone Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Timezone Information</p>
                  <p className="text-sm text-blue-700">All times shown in {webinar.timezone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
