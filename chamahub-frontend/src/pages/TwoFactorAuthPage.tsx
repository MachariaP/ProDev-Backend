import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Smartphone,
  Key,
  QrCode,
  Check,
  X,
  ArrowLeft,
  Copy,

  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

export function TwoFactorAuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'choose' | 'setup' | 'verify' | 'backup'>('choose');
  const [method, setMethod] = useState<'app' | 'sms'>('app');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/accounts/two-factor/enable/', {
        method,
      });
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setStep('setup');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/accounts/two-factor/verify/', {
        code: verificationCode,
      });
      setBackupCodes(response.data.backup_codes);
      setEnabled(true);
      setStep('backup');
      setSuccess('Two-factor authentication enabled successfully!');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/accounts/two-factor/disable/');
      setSuccess('Two-factor authentication disabled');
      setEnabled(false);
      setStep('choose');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chamahub-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

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
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Two-Factor Authentication</h1>
              <p className="text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
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
            <CheckCircle className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Choose Method Step */}
          {step === 'choose' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Choose Authentication Method</CardTitle>
                  <CardDescription>
                    Select how you'd like to receive your verification codes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMethod('app')}
                    className={`w-full p-6 rounded-lg border-2 transition-colors text-left ${
                      method === 'app'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          Authenticator App (Recommended)
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Use apps like Google Authenticator or Authy
                        </p>
                      </div>
                      {method === 'app' && <Check className="h-6 w-6 text-primary" />}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMethod('sms')}
                    className={`w-full p-6 rounded-lg border-2 transition-colors text-left ${
                      method === 'sms'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-300 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">SMS Text Message</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive codes via text message
                        </p>
                      </div>
                      {method === 'sms' && <Check className="h-6 w-6 text-primary" />}
                    </div>
                  </motion.button>

                  <div className="pt-4 space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEnable2FA}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Setting up...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Enable 2FA
                        </>
                      )}
                    </motion.button>

                    {enabled && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDisable2FA}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <X className="h-5 w-5" />
                        Disable 2FA
                      </motion.button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Setup Step */}
          {step === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>
                    Use your authenticator app to scan this QR code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center p-6 bg-white rounded-lg">
                    {qrCode ? (
                      <img src={qrCode} alt="QR Code" className="h-64 w-64" />
                    ) : (
                      <QrCode className="h-64 w-64 text-muted-foreground" />
                    )}
                  </div>

                  {/* Manual Entry */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Or enter this code manually:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-4 py-3 bg-secondary rounded-lg font-mono text-sm">
                        {secret}
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopySecret}
                        className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {copied ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Open your authenticator app</li>
                      <li>Select "Add account" or scan QR code option</li>
                      <li>Scan the QR code or enter the code manually</li>
                      <li>Enter the 6-digit code below to verify</li>
                    </ol>
                  </div>

                  {/* Verification */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('choose')}
                      className="flex-1 px-6 py-3 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleVerify}
                      disabled={loading || verificationCode.length !== 6}
                      className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                        </>
                      ) : (
                        'Verify & Enable'
                      )}
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Backup Codes Step */}
          {step === 'backup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    2FA Enabled Successfully!
                  </CardTitle>
                  <CardDescription>
                    Save these backup codes in a secure place
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      ⚠️ Important: Save Your Backup Codes
                    </h4>
                    <p className="text-sm text-yellow-700">
                      These codes can be used to access your account if you lose access to
                      your authenticator app. Each code can only be used once.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 bg-secondary rounded-lg font-mono text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadBackupCodes}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Key className="h-5 w-5" />
                      Download Codes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/settings')}
                      className="flex-1 px-6 py-3 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      Done
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
