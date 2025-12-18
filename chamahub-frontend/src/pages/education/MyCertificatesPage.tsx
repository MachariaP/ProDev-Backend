import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Download, Share2, CheckCircle2, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { educationService } from '../../services/apiService';
import type { Certificate } from '../../types/api';

export function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await educationService.getMyCertificates();
      setCertificates(response.results);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-background to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/education')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </motion.button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Award className="h-10 w-10 text-yellow-500" />
              My Certificates
            </h1>
            <p className="text-muted-foreground mt-2">Your earned certificates and achievements</p>
          </div>
        </div>

        {certificates.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete learning paths to earn certificates
              </p>
              <Button onClick={() => navigate('/education/learning-paths')}>
                Browse Learning Paths
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{cert.title}</CardTitle>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <Award className="h-12 w-12 text-yellow-500" />
                    </div>
                    <CardDescription>{cert.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Issued</span>
                        <span className="font-semibold">
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </span>
                      </div>
                      {cert.grade && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Grade</span>
                          <Badge>{cert.grade}</Badge>
                        </div>
                      )}
                      {cert.score && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-bold text-lg">{cert.score}%</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-3 border-t">
                        <span className="text-muted-foreground">Verification Code</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {cert.verification_code}
                        </code>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button variant="outline" className="flex-1" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
