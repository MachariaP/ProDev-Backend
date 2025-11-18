import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, TrendingUp, Target, Zap, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { StatsCard } from '../components/StatsCard';
import api from '../services/api';

export function WealthEnginePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    potential_return: number;
    risk_level: string;
    amount: number;
  }>>([]);
  const [stats, setStats] = useState({
    total_automated: 0,
    projected_returns: 0,
    active_investments: 0,
  });

  useEffect(() => {
    fetchWealthEngineData();
  }, []);

  const fetchWealthEngineData = async () => {
    try {
      const response = await api.get('/investments/wealth-engine/');
      setIsActive(response.data.is_active);
      setRecommendations(response.data.recommendations || []);
      setStats(response.data.stats || stats);
    } catch (err) {
      console.error('Failed to load wealth engine data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEngine = async () => {
    try {
      await api.post('/investments/wealth-engine/toggle/', { active: !isActive });
      setIsActive(!isActive);
    } catch (err) {
      console.error('Failed to toggle wealth engine:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Wealth Engine</h1>
                <p className="text-muted-foreground">Automated investment recommendations powered by AI</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleEngine}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              {isActive ? <><Pause className="h-5 w-5" />Pause Engine</> : <><Play className="h-5 w-5" />Activate Engine</>}
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Automated Investments" value={`KES ${stats.total_automated.toLocaleString()}`} icon={Zap} iconClassName="bg-purple-100 text-purple-600" />
          <StatsCard title="Projected Returns" value={`KES ${stats.projected_returns.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-green-100 text-green-600" />
          <StatsCard title="Active Investments" value={stats.active_investments} icon={Target} iconClassName="bg-blue-100 text-blue-600" />
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Investment Recommendations</CardTitle>
            <CardDescription>AI-powered suggestions based on your portfolio and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <motion.div key={rec.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs ${rec.risk_level === 'low' ? 'bg-green-100 text-green-700' : rec.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {rec.risk_level} risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                      <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">KES {rec.amount.toLocaleString()}</span></div>
                      <div><span className="text-muted-foreground">Est. Return:</span> <span className="font-medium text-green-600">{rec.potential_return}%</span></div>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                      Invest Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
