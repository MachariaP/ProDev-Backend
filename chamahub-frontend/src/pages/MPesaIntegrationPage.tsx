import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Check, X, Phone, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

export function MPesaIntegrationPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  const handleLinkMPesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/finance/mpesa/link/', { phone_number: phoneNumber, pin });
      setSuccess('M-Pesa linked successfully!');
      setIsLinked(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to link M-Pesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Settings
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">M-Pesa Integration</h1>
              <p className="text-muted-foreground">Link your M-Pesa account for instant payments</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
            <X className="h-5 w-5" />{error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="h-5 w-5" />{success}
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Link M-Pesa Account</CardTitle>
              <CardDescription>Connect your Safaricom M-Pesa for seamless transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLinkMPesa} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />Phone Number
                  </label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="+254712345678"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">M-Pesa PIN (for verification)</label>
                  <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} required maxLength={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" placeholder="****" />
                  <p className="mt-2 text-xs text-muted-foreground">Your PIN is encrypted and never stored</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How it works:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>Verify your identity with your M-Pesa PIN</li>
                    <li>Approve the connection request on your phone</li>
                    <li>Start making instant payments!</li>
                  </ol>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || isLinked}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                  {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Linking...</> : isLinked ? <><Check className="h-5 w-5" />Linked Successfully</> : <><LinkIcon className="h-5 w-5" />Link M-Pesa</>}
                </motion.button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
