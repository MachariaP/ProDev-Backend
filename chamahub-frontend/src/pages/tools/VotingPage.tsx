import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Vote as VoteIcon, CheckCircle, XCircle, Clock, Users, TrendingUp, Award, BarChart3, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { governanceService, groupsService } from '../../services/apiService';
import type { Vote, ChamaGroup } from '../../types/api';

interface ToastMessage {
  type: 'success' | 'error';
  message: string;
}

export function VotingPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [castingVote, setCastingVote] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingVote, setCreatingVote] = useState(false);
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [createFormData, setCreateFormData] = useState({
    group: '',
    title: '',
    description: '',
    vote_type: 'SIMPLE' as 'SIMPLE' | 'TWO_THIRDS' | 'UNANIMOUS',
    allow_proxy: true,
    start_date: '',
    end_date: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchVotes();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const fetchGroups = async () => {
    try {
      const response = await groupsService.getMyGroups();
      setGroups(response);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date range
    const startDate = new Date(createFormData.start_date);
    const endDate = new Date(createFormData.end_date);
    const now = new Date();
    
    if (startDate < now) {
      showToast('error', 'Start date cannot be in the past');
      return;
    }
    
    if (endDate <= startDate) {
      showToast('error', 'End date must be after start date');
      return;
    }
    
    setCreatingVote(true);
    try {
      await governanceService.createVote({
        group: Number(createFormData.group),
        title: createFormData.title,
        description: createFormData.description,
        vote_type: createFormData.vote_type,
        allow_proxy: createFormData.allow_proxy,
        start_date: createFormData.start_date,
        end_date: createFormData.end_date,
      });
      // Refresh votes list
      await fetchVotes();
      setShowCreateModal(false);
      // Reset form
      setCreateFormData({
        group: '',
        title: '',
        description: '',
        vote_type: 'SIMPLE',
        allow_proxy: true,
        start_date: '',
        end_date: '',
      });
      showToast('success', 'Vote created successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; detail?: string } } };
      const errorMessage = error?.response?.data?.error || error?.response?.data?.detail || 'Failed to create vote';
      showToast('error', errorMessage);
    } finally {
      setCreatingVote(false);
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
      showToast('success', 'Vote cast successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error?.response?.data?.error || 'Failed to cast vote';
      showToast('error', errorMessage);
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
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg';
      case 'CLOSED':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
      case 'DRAFT':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
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

  const calculateParticipationPercentage = (votesList: Vote[]) => {
    if (votesList.length === 0) return 0;
    
    const { totalVotesCast, totalEligibleVoters } = votesList.reduce(
      (acc, vote) => ({
        totalVotesCast: acc.totalVotesCast + (vote.total_votes_cast || 0),
        totalEligibleVoters: acc.totalEligibleVoters + (vote.total_eligible_voters || 1),
      }),
      { totalVotesCast: 0, totalEligibleVoters: 0 }
    );
    
    return totalEligibleVoters > 0 
      ? Math.round((totalVotesCast / totalEligibleVoters) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-fuchsia-900/20">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-t-purple-600 border-r-fuchsia-600 border-b-violet-600 border-l-transparent mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-medium bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
            Loading votes...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-fuchsia-900/20 p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 relative z-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all text-gray-700 dark:text-gray-200 border border-purple-100 dark:border-purple-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-3"
              >
                <Sparkles className="h-10 w-10 text-purple-600 animate-pulse" />
                Voting & Polls
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 dark:text-gray-300 mt-2 text-lg font-medium"
              >
                Participate in group decisions and shape the future together
              </motion.p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-2xl transition-all border border-purple-400"
          >
            <Plus className="h-5 w-5" />
            Create Vote
          </motion.button>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Votes</p>
                  <p className="text-3xl font-bold mt-1">{votes.length}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fuchsia-100 text-sm font-medium">Active Votes</p>
                  <p className="text-3xl font-bold mt-1">
                    {votes.filter(v => v.status === 'ACTIVE').length}
                  </p>
                </div>
                <Award className="h-12 w-12 text-fuchsia-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm font-medium">Participation</p>
                  <p className="text-3xl font-bold mt-1">
                    {calculateParticipationPercentage(votes)}%
                  </p>
                </div>
                <Users className="h-12 w-12 text-violet-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {votes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800">
              <CardContent className="py-20 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <VoteIcon className="h-20 w-20 mx-auto text-purple-400 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  No Active Votes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Create a vote to make group decisions and engage members
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {votes.map((vote, index) => (
              <motion.div
                key={vote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="shadow-xl hover:shadow-2xl transition-all bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-purple-100 dark:border-purple-800 overflow-hidden group">
                  {/* Gradient top border */}
                  <div className="h-2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-500"></div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {vote.title}
                      </CardTitle>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-md ${getStatusColor(vote.status)}`}
                      >
                        {vote.status}
                      </motion.span>
                    </div>
                    <CardDescription className="mt-3 text-gray-600 dark:text-gray-300 text-base">
                      {vote.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between text-sm bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>{vote.vote_type.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                        <Users className="h-4 w-4 text-fuchsia-600" />
                        <span>{vote.total_votes_cast || 0}/{vote.total_eligible_voters || 0}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {/* YES votes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Yes</span>
                          </div>
                          <span className="font-bold text-green-600 text-lg">
                            {vote.yes_votes || 0} ({getVotePercentage(vote, 'yes')}%)
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getVotePercentage(vote, 'yes')}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-lg"
                          />
                        </div>
                      </div>
                      
                      {/* NO votes */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">No</span>
                          </div>
                          <span className="font-bold text-red-600 text-lg">
                            {vote.no_votes || 0} ({getVotePercentage(vote, 'no')}%)
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${getVotePercentage(vote, 'no')}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                            className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full shadow-lg"
                          />
                        </div>
                      </div>
                      
                      {/* ABSTAIN votes */}
                      {(vote.abstain_votes || 0) > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Abstain</span>
                            </div>
                            <span className="font-bold text-gray-600 text-lg">
                              {vote.abstain_votes || 0} ({getVotePercentage(vote, 'abstain')}%)
                            </span>
                          </div>
                          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${getVotePercentage(vote, 'abstain')}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                              className="bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-full shadow-lg"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {vote.status === 'ACTIVE' && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openVoteModal(vote)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <VoteIcon className="h-5 w-5" />
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.5 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`px-6 py-4 rounded-xl shadow-2xl ${
              toast.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            } text-white flex items-center gap-3 min-w-[300px] border-2 border-white/20`}>
              <motion.div
                animate={{ rotate: toast.type === 'success' ? [0, 360] : [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {toast.type === 'success' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </motion.div>
              <span className="font-semibold text-lg">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vote Modal */}
      <AnimatePresence>
        {showVoteModal && selectedVote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowVoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 border-2 border-purple-200 dark:border-purple-700"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <VoteIcon className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {selectedVote.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-3 text-base">
                  {selectedVote.description}
                </p>
              </div>
              
              <div className="space-y-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03, x: 5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCastVote(selectedVote.id, 'YES')}
                  disabled={castingVote}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-green-400"
                >
                  <CheckCircle className="h-5 w-5" />
                  Vote YES
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, x: 5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCastVote(selectedVote.id, 'NO')}
                  disabled={castingVote}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-lg hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-red-400"
                >
                  <XCircle className="h-5 w-5" />
                  Vote NO
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, x: 5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCastVote(selectedVote.id, 'ABSTAIN')}
                  disabled={castingVote}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-gray-400"
                >
                  <TrendingUp className="h-5 w-5" />
                  Abstain
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowVoteModal(false)}
                className="w-full py-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Vote Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 border-2 border-purple-200 dark:border-purple-700 my-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Plus className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Create New Vote
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-base">
                  Set up a new vote for your group to make collective decisions
                </p>
              </div>
              
              <form onSubmit={handleCreateVote} className="space-y-4">
                {/* Group Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Group *
                  </label>
                  <select
                    value={createFormData.group}
                    onChange={(e) => setCreateFormData({ ...createFormData, group: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vote Title *
                  </label>
                  <input
                    type="text"
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                    required
                    maxLength={200}
                    placeholder="e.g., Approve new loan policy"
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Provide details about what members are voting on..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Vote Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Vote Type *
                  </label>
                  <select
                    value={createFormData.vote_type}
                    onChange={(e) => setCreateFormData({ ...createFormData, vote_type: e.target.value as 'SIMPLE' | 'TWO_THIRDS' | 'UNANIMOUS' })}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                  >
                    <option value="SIMPLE">Simple Majority ({'>'}50%)</option>
                    <option value="TWO_THIRDS">Two-Thirds Majority (≥66.67%)</option>
                    <option value="UNANIMOUS">Unanimous (100%)</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={createFormData.start_date}
                      onChange={(e) => setCreateFormData({ ...createFormData, start_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={createFormData.end_date}
                      onChange={(e) => setCreateFormData({ ...createFormData, end_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Allow Proxy */}
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <input
                    type="checkbox"
                    id="allow_proxy"
                    checked={createFormData.allow_proxy}
                    onChange={(e) => setCreateFormData({ ...createFormData, allow_proxy: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded border-2 border-purple-300 focus:ring-2 focus:ring-purple-500"
                  />
                  <label htmlFor="allow_proxy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow proxy voting (members can vote on behalf of others)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={creatingVote}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold hover:from-purple-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingVote ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Create Vote
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
