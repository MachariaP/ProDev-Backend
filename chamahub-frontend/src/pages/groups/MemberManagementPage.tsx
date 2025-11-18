import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  Crown,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

interface Member {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
  role: string;
  joined_at: string;
  total_contributions: number;
  is_active: boolean;
  can_approve: boolean;
}

const roles = [
  { value: 'admin', label: 'Administrator', icon: Crown, color: 'text-yellow-600' },
  { value: 'treasurer', label: 'Treasurer', icon: Shield, color: 'text-blue-600' },
  { value: 'secretary', label: 'Secretary', icon: Shield, color: 'text-green-600' },
  { value: 'member', label: 'Member', icon: Users, color: 'text-gray-600' },
];

export function MemberManagementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/groups/groups/${id}/members/`);
      setMembers(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post(`/groups/groups/${id}/invite/`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setSuccess('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/groups/groups/${id}/members/${memberId}/`);
      setSuccess('Member removed successfully!');
      fetchMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove member');
      console.error(err);
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await api.patch(`/groups/groups/${id}/members/${memberId}/`, {
        role: newRole,
      });
      setSuccess('Role updated successfully!');
      fetchMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update role');
      console.error(err);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/groups/${id}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Group Details
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Member Management</h1>
              <p className="text-muted-foreground">
                Manage group members, roles, and permissions
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            >
              <UserPlus className="h-5 w-5" />
              Invite Member
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => {
            const roleInfo = roles.find((r) => r.value === member.role) || roles[3];
            const RoleIcon = roleInfo.icon;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                        {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                      </div>
                      <div className="flex items-center gap-2">
                        <RoleIcon className={`h-5 w-5 ${roleInfo.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl">
                      {member.user.first_name} {member.user.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{member.user.email}</span>
                      </div>
                      {member.user.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{member.user.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">Total Contributions</p>
                        <p className="text-lg font-bold text-primary">
                          KES {member.total_contributions.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>

                      {member.role !== 'admin' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRemoveMember(member.id)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <UserMinus className="h-4 w-4" />
                          Remove Member
                        </motion.button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No members found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedRole !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by inviting members to your group'}
            </p>
          </Card>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Invite New Member</h2>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="member@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Send Invitation
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
