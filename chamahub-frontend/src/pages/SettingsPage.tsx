import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Mail,
  Phone,
  Save,
  Check,
  X,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  contribution_reminders: boolean;
  loan_reminders: boolean;
  meeting_reminders: boolean;
  newsletter: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  two_factor_enabled: boolean;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
  });

  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    contribution_reminders: true,
    loan_reminders: true,
    meeting_reminders: true,
    newsletter: false,
    theme: 'auto',
    language: 'en',
    timezone: 'Africa/Nairobi',
    two_factor_enabled: false,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        api.get('/accounts/users/me/'),
        api.get('/accounts/settings/'),
      ]);
      setProfile(profileRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/accounts/users/me/', profile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/accounts/settings/', settings);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await api.post('/accounts/change-password/', {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profile.first_name}
                          onChange={(e) =>
                            setProfile({ ...profile, first_name: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profile.last_name}
                          onChange={(e) =>
                            setProfile({ ...profile, last_name: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone_number}
                        onChange={(e) =>
                          setProfile({ ...profile, phone_number: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profile.date_of_birth}
                        onChange={(e) =>
                          setProfile({ ...profile, date_of_birth: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address
                      </label>
                      <textarea
                        value={profile.address}
                        onChange={(e) =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Channels</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-secondary transition-colors">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive updates via email
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.email_notifications}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                email_notifications: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-secondary transition-colors">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">SMS Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive text messages
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.sms_notifications}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                sms_notifications: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-secondary transition-colors">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Push Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Browser/mobile push alerts
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.push_notifications}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                push_notifications: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Reminders</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-secondary transition-colors">
                          <span>Contribution Reminders</span>
                          <input
                            type="checkbox"
                            checked={settings.contribution_reminders}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                contribution_reminders: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-secondary transition-colors">
                          <span>Loan Reminders</span>
                          <input
                            type="checkbox"
                            checked={settings.loan_reminders}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                loan_reminders: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-secondary transition-colors">
                          <span>Meeting Reminders</span>
                          <input
                            type="checkbox"
                            checked={settings.meeting_reminders}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                meeting_reminders: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </label>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and two-factor authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Lock className="h-5 w-5" />
                      {saving ? 'Changing...' : 'Change Password'}
                    </motion.button>
                  </form>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium">2FA Status</p>
                        <p className="text-sm text-muted-foreground">
                          {settings.two_factor_enabled
                            ? 'Two-factor authentication is enabled'
                            : 'Two-factor authentication is disabled'}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/two-factor-auth')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {settings.two_factor_enabled ? 'Manage' : 'Enable'}
                      </motion.button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <motion.button
                            key={theme}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              setSettings({
                                ...settings,
                                theme: theme as 'light' | 'dark' | 'auto',
                              })
                            }
                            className={`p-4 border-2 rounded-lg transition-colors ${
                              settings.theme === theme
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-300 hover:border-primary/50'
                            }`}
                          >
                            <Palette className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium capitalize">{theme}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {saving ? 'Saving...' : 'Save Appearance'}
                    </motion.button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your regional preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) =>
                          setSettings({ ...settings, language: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) =>
                          setSettings({ ...settings, timezone: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="Africa/Nairobi">
                          East Africa Time (EAT)
                        </option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
