import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (token && uid) {
      verifyEmail();
    } else {
      setError('Invalid verification link');
      setVerifying(false);
    }
  }, [token, uid]);

  const verifyEmail = async () => {
    try {
      await api.post('/accounts/verify-email/', { token, uid });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Verification failed. The link may be expired or invalid.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setError('');
    try {
      await api.post('/accounts/resend-verification/');
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mx-auto mb-4"
            >
              {verifying ? (
                <div className="h-20 w-20 mx-auto">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary"></div>
                </div>
              ) : success ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto"
                >
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </motion.div>
              )}
            </motion.div>
            <CardTitle className="text-3xl">
              {verifying
                ? 'Verifying Email...'
                : success
                ? 'Email Verified!'
                : 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {verifying
                ? 'Please wait while we verify your email address'
                : success
                ? "Your email has been successfully verified. You'll be redirected to login shortly."
                : error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!verifying && !success && (
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResendVerification}
                  disabled={resending || resent}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : resent ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Email Sent!
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      Resend Verification Email
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Back to Login
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-muted-foreground mb-4">
                  Redirecting to login page...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            Need help?{' '}
            <a href="mailto:support@chamahub.com" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
