import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Vote as VoteIcon, CheckCircle, XCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { governanceService } from '../../services/apiService';
import type { Vote } from '../../types/api';

export function VotingPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [castingVote, setCastingVote] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const response = await governanceService.getVotes();
      setVotes(response.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async (voteId: number, choice: 'YES' | 'NO' | 'ABSTAIN') => {
    setCastingVote(true);
    try {
      await governanceService.castVote(voteId, { choice });
      // Refresh votes to get updated counts
      await fetchVotes();
      setShowVoteModal(false);
      setSelectedVote(null);
      // Show success message
      alert('Vote cast successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to cast vote';
      alert(errorMessage);
    } finally {
      setCastingVote(false);
    }
  };

  const openVoteModal = (vote: Vote) => {
    setSelectedVote(vote);
    setShowVoteModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVotePercentage = (vote: Vote, type: 'yes' | 'no' | 'abstain') => {
    const total = vote.total_votes_cast || 0;
    if (total === 0) return 0;
    
    const count = type === 'yes' ? (vote.yes_votes || 0) : 
                  type === 'no' ? (vote.no_votes || 0) : 
                  (vote.abstain_votes || 0);
    
    return Math.round((count / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading votes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Voting & Polls
              </h1>
              <p className="text-muted-foreground mt-2">Participate in group decisions</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Vote
          </motion.button>
        </div>

        {votes.length === 0 ? (
          <Card className="shadow-2xl">
            <CardContent className="py-16 text-center">
              <VoteIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Votes</h3>
              <p className="text-muted-foreground">Create a vote to make group decisions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {votes.map((vote) => (
              <motion.div
                key={vote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-lg hover:shadow-2xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{vote.title}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vote.status)}`}>
                        {vote.status}
                      </span>
                    </div>
                    <CardDescription className="mt-2">{vote.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Type: {vote.vote_type.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{vote.total_votes_cast || 0}/{vote.total_eligible_voters || 0}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Yes</span>
                          </div>
                          <span className="font-semibold">{vote.yes_votes || 0} ({getVotePercentage(vote, 'yes')}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getVotePercentage(vote, 'yes')}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm">No</span>
                          </div>
                          <span className="font-semibold">{vote.no_votes || 0} ({getVotePercentage(vote, 'no')}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getVotePercentage(vote, 'no')}%` }}
                          />
                        </div>
                      </div>
                      
                      {(vote.abstain_votes || 0) > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-gray-600" />
                              <span className="text-sm">Abstain</span>
                            </div>
                            <span className="font-semibold">{vote.abstain_votes || 0} ({getVotePercentage(vote, 'abstain')}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getVotePercentage(vote, 'abstain')}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {vote.status === 'ACTIVE' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openVoteModal(vote)}
                        className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                      >
                        Cast Your Vote
                      </motion.button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Vote Modal */}
      <AnimatePresence>
        {showVoteModal && selectedVote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <h2 className="text-2xl font-bold">{selectedVote.title}</h2>
              <p className="text-muted-foreground">{selectedVote.description}</p>
              
              <div className="space-y-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCastVote(selectedVote.id, 'YES')}
                  disabled={castingVote}
                  className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vote YES
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCastVote(selectedVote.id, 'NO')}
                  disabled={castingVote}
                  className="w-full py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vote NO
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCastVote(selectedVote.id, 'ABSTAIN')}
                  disabled={castingVote}
                  className="w-full py-3 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Abstain
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowVoteModal(false)}
                className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
