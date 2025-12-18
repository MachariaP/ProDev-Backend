import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Trophy,
  Users,
  Calendar,
  Target,
  DollarSign,
  Award,
  Flame,
  Share2,
  BarChart3,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { educationService } from '../../services/apiService';
import type { SavingsChallenge, ChallengeParticipant } from '../../types/api';
import { formatCurrency } from '../../utils/formatting';
import { toast } from 'react-hot-toast';

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<SavingsChallenge | null>(null);
  const [participation, setParticipation] = useState<ChallengeParticipant | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [customTarget, setCustomTarget] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchChallenge();
      checkParticipation();
    }
  }, [id]);

  const fetchChallenge = async () => {
    try {
      const data = await educationService.getSavingsChallenge(Number(id));
      setChallenge(data);
      setCustomTarget(data.target_amount.toString());
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      toast.error('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const checkParticipation = async () => {
    try {
      const response = await educationService.getMyChallenges();
      const part = response.results.find((p) => p.challenge === Number(id));
      if (part) {
        setParticipation(part);
      }
    } catch (err) {
      console.error('Failed to check participation:', err);
    }
  };

  const handleJoinChallenge = async () => {
    try {
      setJoining(true);
      const targetAmount = parseFloat(customTarget) || challenge?.target_amount || 0;
      const dailyTarget = targetAmount / (challenge?.duration_days || 1);
      
      const part = await educationService.joinChallenge(Number(id), {
        target_amount: targetAmount,
        daily_target: dailyTarget,
      });
      
      setParticipation(part);
      setShowJoinForm(false);
      toast.success('Successfully joined the challenge! 🎉');
    } catch (err: any) {
      console.error('Failed to join challenge:', err);
      toast.error(err.response?.data?.message || 'Failed to join challenge');
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateProgress = async (amount: number) => {
    if (!participation) return;
    
    try {
      const updated = await educationService.updateChallengeProgress(participation.id, {
        current_amount: participation.current_amount + amount,
      });
      setParticipation(updated);
      toast.success(`Added ${formatCurrency(amount)} to your progress!`);
    } catch (err) {
      console.error('Failed to update progress:', err);
      toast.error('Failed to update progress');
    }
  };

  const handleShare = async () => {
    try {
      if (challenge) {
        if (navigator.share) {
          await navigator.share({
            title: challenge.title,
            text: `Join me in the ${challenge.title} challenge!`,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-700';
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  const isActive = challenge.status === 'ACTIVE';
  const isUpcoming = challenge.status === 'UPCOMING';
  const isCompleted = challenge.status === 'COMPLETED';
  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercentage = (challenge.total_amount_saved / (challenge.target_amount * challenge.participants_count)) * 100;

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
            <Badge className={getStatusColor(challenge.status)}>
              {challenge.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {challenge.challenge_type.replace('_', ' ')}
            </Badge>
            {participation && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Participating
              </Badge>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <Card className="shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
                    Savings Challenge
                  </span>
                </div>
                <CardTitle className="text-4xl font-bold mb-4">{challenge.title}</CardTitle>
                <CardDescription className="text-lg">{challenge.short_description}</CardDescription>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Target className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-bold text-lg">{formatCurrency(challenge.target_amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{challenge.duration_days} days</p>
                  {isActive && <p className="text-xs text-orange-600">{daysRemaining} days left</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="font-semibold">{challenge.participants_count}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Rewards</p>
                  <p className="font-semibold">{challenge.reward_points} pts</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 mt-6">
            {/* Participation Actions */}
            {!participation && !showJoinForm && (isActive || isUpcoming) && (
              <Button
                onClick={() => setShowJoinForm(true)}
                size="lg"
                className="w-full"
                disabled={challenge.participants_count >= challenge.max_participants}
              >
                {challenge.participants_count >= challenge.max_participants ? 'Challenge Full' : 'Join Challenge'}
              </Button>
            )}

            {showJoinForm && !participation && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="target">Your Savings Target (Optional)</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="target"
                        type="number"
                        value={customTarget}
                        onChange={(e) => setCustomTarget(e.target.value)}
                        className="pl-10"
                        placeholder={`Default: ${challenge.target_amount}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Daily target: {formatCurrency((parseFloat(customTarget) || challenge.target_amount) / challenge.duration_days)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleJoinChallenge} disabled={joining} className="flex-1">
                      {joining ? 'Joining...' : 'Confirm & Join'}
                    </Button>
                    <Button onClick={() => setShowJoinForm(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {participation && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Your Progress</h4>
                    <div className="flex items-center gap-2">
                      {participation.streak_days > 0 && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          <Flame className="h-3 w-3 mr-1" />
                          {participation.streak_days} day streak
                        </Badge>
                      )}
                      {participation.completed && (
                        <Badge className="bg-green-100 text-green-700">
                          <Trophy className="h-3 w-3 mr-1" />
                          Completed!
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {formatCurrency(participation.current_amount)}</span>
                      <span className="font-semibold">{participation.progress_percentage}%</span>
                      <span>Target: {formatCurrency(participation.target_amount || challenge.target_amount)}</span>
                    </div>
                    <Progress value={participation.progress_percentage} className="h-3" />
                  </div>
                  
                  {!participation.completed && isActive && (
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                      {[10, 50, 100].map((amount) => (
                        <Button
                          key={amount}
                          onClick={() => handleUpdateProgress(amount)}
                          variant="outline"
                          size="sm"
                        >
                          +{formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-2xl font-bold mb-3">About This Challenge</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
            </div>

            {/* Challenge Stats */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Challenge Stats
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold text-orange-600">{formatCurrency(challenge.total_amount_saved)}</p>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">{challenge.success_rate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{challenge.participants_count}</p>
                  <p className="text-sm text-muted-foreground">Active Participants</p>
                </div>
              </div>
              
              {challenge.participants_count > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Community Progress</span>
                    <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </div>

            {/* Challenge Timeline */}
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Start Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(challenge.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-semibold">End Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(challenge.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards */}
            {(challenge.reward_points > 0 || challenge.reward_badge) && (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Rewards
                  </h3>
                  <div className="space-y-2">
                    {challenge.reward_points > 0 && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <span>Earn <strong>{challenge.reward_points} points</strong> upon completion</span>
                      </div>
                    )}
                    {challenge.reward_badge && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <span>Unlock the <strong>{challenge.reward_badge}</strong> badge</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Button */}
            <Button onClick={handleShare} variant="outline" size="lg" className="w-full">
              <Share2 className="h-5 w-5 mr-2" />
              Share Challenge
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
