import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, Camera, Save, LogOut, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture?: string;
  date_of_birth?: string;
  address?: string;
  credit_score: number;
  kyc_verified: boolean;
  is_kyc_complete: boolean;
  created_at: string;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/accounts/users/me/');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone_number: response.data.phone_number || '',
        date_of_birth: response.data.date_of_birth || '',
        address: response.data.address || '',
      });
      // Set profile picture preview if exists
      if (response.data.profile_picture) {
        setProfilePicturePreview(response.data.profile_picture);
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      // Append profile picture if selected
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      const response = await api.patch('/accounts/users/me/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(response.data);
      if (response.data.profile_picture) {
        setProfilePicturePreview(response.data.profile_picture);
      }
      setProfilePicture(null); // Clear the file input
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-foreground">Loading your profile...</p>
          <p className="mt-2 text-sm text-muted-foreground">Please wait a moment</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-md"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>

        {/* Profile Header Card */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card via-card to-muted/20">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                {profilePicturePreview ? (
                  <div className="relative">
                    <img 
                      src={profilePicturePreview} 
                      alt="Profile" 
                      className="w-40 h-40 rounded-full object-cover border-4 border-primary/20 shadow-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-primary/20">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </div>
                )}
                <input
                  type="file"
                  id="profile-picture-input"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureChange}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => document.getElementById('profile-picture-input')?.click()}
                  className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-3 rounded-full shadow-xl hover:shadow-2xl transition-all border-2 border-background"
                  title="Upload profile picture"
                >
                  <Camera className="h-5 w-5" />
                </motion.button>
                {profilePicture && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                  >
                    New image selected
                  </motion.div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">{profile?.email}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
                      profile?.kyc_verified 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                    }`}
                  >
                    {profile?.kyc_verified ? '✓ KYC Verified' : '⏳ KYC Pending'}
                  </motion.span>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  >
                    Credit Score: {profile?.credit_score}
                  </motion.span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card via-card to-muted/10">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Edit Profile</CardTitle>
            <CardDescription className="text-base">Update your personal information below</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
                >
                  ✓ {success}
                </motion.div>
              )}

              {profilePicture && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium flex items-center justify-between"
                >
                  <span>📸 New profile picture ready to upload</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePicture(null);
                      setProfilePicturePreview(profile?.profile_picture || '');
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-foreground">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3.5 rounded-lg border-2 border-border bg-background hover:border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="John"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-foreground">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3.5 rounded-lg border-2 border-border bg-background hover:border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-foreground">Email (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg border-2 border-border bg-muted text-muted-foreground cursor-not-allowed"
                    disabled
                  />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg border-2 border-border bg-background hover:border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-foreground">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg border-2 border-border bg-background hover:border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-foreground">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg border-2 border-border bg-background hover:border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all min-h-[120px] resize-none"
                    placeholder="Enter your address"
                  />
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card via-card to-muted/10">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Account Information</CardTitle>
            <CardDescription className="text-base">Your account details and statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/20 shadow-md"
              >
                <p className="text-sm text-muted-foreground font-medium mb-2">Member Since</p>
                <p className="text-2xl font-bold text-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/20 shadow-md"
              >
                <p className="text-sm text-muted-foreground font-medium mb-2">Account Status</p>
                <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Active
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/20 shadow-md"
              >
                <p className="text-sm text-muted-foreground font-medium mb-2">KYC Status</p>
                <p className={`text-2xl font-bold ${profile?.is_kyc_complete ? 'text-green-600' : 'text-orange-600'}`}>
                  {profile?.is_kyc_complete ? '✓ Complete' : '⏳ Incomplete'}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/20 shadow-md"
              >
                <p className="text-sm text-muted-foreground font-medium mb-2">Credit Score</p>
                <p className="text-2xl font-bold text-primary">{profile?.credit_score}</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
