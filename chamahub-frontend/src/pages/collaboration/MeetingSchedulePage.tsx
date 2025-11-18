import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

export function MeetingSchedulePage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Array<any>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    is_virtual: false,
    group_id: '',
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings/');
      setMeetings(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/meetings/', formData);
      setShowCreateModal(false);
      fetchMeetings();
      setFormData({ title: '', description: '', date: '', time: '', location: '', is_virtual: false, group_id: '' });
    } catch (err) {
      console.error('Failed to create meeting:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Meeting Schedule</h1>
              <p className="text-muted-foreground">Schedule and manage group meetings</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus className="h-5 w-5" />Schedule Meeting
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {meetings.map((meeting, index) => (
            <motion.div key={meeting.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">{meeting.title}</CardTitle>
                    {meeting.is_virtual && <Video className="h-5 w-5 text-primary" />}
                  </div>
                  <CardDescription>{meeting.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.location || 'Virtual Meeting'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.attendees_count || 0} attendees</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    {meeting.is_virtual ? 'Join Meeting' : 'View Details'}
                  </motion.button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Schedule New Meeting</h2>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meeting Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Enter location or leave blank for virtual" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_virtual} onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                  <span>Virtual Meeting</span>
                </label>
                <div className="flex gap-3 pt-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Create Meeting</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
