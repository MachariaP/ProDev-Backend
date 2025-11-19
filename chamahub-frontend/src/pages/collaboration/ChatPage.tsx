import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile, Users, Search, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';
import type { GroupMessage, ChamaGroup } from '../../types';

interface MessageWithUser extends GroupMessage {
  user_name: string;
  user_email: string;
}

export function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<ChamaGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/chama-groups/');
      const groupsData = response.data.results || response.data;
      setGroups(groupsData);
      if (groupsData.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedGroup) return;
    
    try {
      const response = await api.get(`/groups/messages/?group=${selectedGroup}`);
      const messagesData = response.data.results || response.data;
      setMessages(messagesData);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      await api.post('/groups/messages/', {
        group: selectedGroup,
        content: newMessage,
      });
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleEditMessage = async (messageId: number) => {
    if (!editContent.trim()) return;

    try {
      await api.patch(`/groups/messages/${messageId}/edit/`, {
        content: editContent,
      });
      setEditingMessage(null);
      setEditContent('');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const startEditing = (message: MessageWithUser) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const filteredMessages = searchTerm
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  const selectedGroupData = groups.find(g => g.id === selectedGroup);

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
          {/* Groups Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groups.map((group) => (
                  <motion.button
                    key={group.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedGroup === group.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div className="font-semibold">{group.name}</div>
                    <div className="text-xs opacity-80">{group.group_type}</div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedGroupData?.name || 'Select a group'}</CardTitle>
                <button
                  onClick={() => setIsSearching(!isSearching)}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
              {isSearching && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[600px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.is_own
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {!message.is_own && (
                          <p className="text-xs font-semibold mb-1">{message.user_name}</p>
                        )}
                        {editingMessage === message.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm bg-background text-foreground"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditMessage(message.id)}
                                className="text-xs px-2 py-1 bg-green-500 text-white rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-xs px-2 py-1 bg-gray-500 text-white rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{message.content}</p>
                            {message.attachment && (
                              <div className="mt-2 p-2 bg-white/10 rounded">
                                <a
                                  href={message.attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm underline"
                                >
                                  📎 {message.attachment_name || 'Attachment'}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(message.created_at).toLocaleTimeString()}
                                {message.is_edited && ' (edited)'}
                              </p>
                              {message.is_own && !editingMessage && (
                                <button
                                  onClick={() => startEditing(message)}
                                  className="text-xs opacity-70 hover:opacity-100"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      // File upload handling can be implemented later
                      console.log('File selected:', e.target.files?.[0]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-secondary rounded-lg"
                    title="Attach file (coming soon)"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-secondary rounded-lg"
                    title="Emoji picker (coming soon)"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                    Send
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
