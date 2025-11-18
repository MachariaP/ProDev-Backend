import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Users, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

export function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<any>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groups, setGroups] = useState<Array<any>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/groups/');
      setGroups(response.data.results || response.data);
      if (response.data.results?.length > 0) {
        setSelectedGroup(response.data.results[0].id);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/messages/?group=${selectedGroup}`);
      setMessages(response.data.results || response.data);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/chat/messages/', {
        group_id: selectedGroup,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Group Chat</h1>
          <p className="text-muted-foreground">Real-time messaging with your group members</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groups.map((group) => (
                  <motion.button key={group.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedGroup === group.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}>
                    {group.name}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{groups.find(g => g.id === selectedGroup)?.name || 'Select a group'}</CardTitle>
                <button className="p-2 hover:bg-secondary rounded-lg"><Search className="h-5 w-5" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {messages.map((message, index) => (
                    <motion.div key={message.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${message.is_own ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        {!message.is_own && <p className="text-xs font-semibold mb-1">{message.user_name}</p>}
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(message.created_at).toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button type="button" className="p-2 hover:bg-secondary rounded-lg"><Paperclip className="h-5 w-5" /></button>
                  <button type="button" className="p-2 hover:bg-secondary rounded-lg"><Smile className="h-5 w-5" /></button>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
                    <Send className="h-5 w-5" />Send
                  </motion.button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
