import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Download, Trash2, Eye, Search, Folder } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import api from '../../services/api';

export function DocumentSharingPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [filterType]);

  const fetchDocuments = async () => {
    try {
      const params = filterType !== 'all' ? `?type=${filterType}` : '';
      const response = await api.get(`/documents/${params}`);
      setDocuments(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      await api.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchDocuments();
    } catch (err) {
      console.error('Failed to upload document:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}/`);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
              <h1 className="text-4xl font-bold mb-2">Document Sharing</h1>
              <p className="text-muted-foreground">Share files and documents with your group</p>
            </div>
            <label className="cursor-pointer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                <Upload className="h-5 w-5" />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </motion.div>
              <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        </motion.div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="xls">Spreadsheet</option>
                <option value="img">Image</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Folder className="h-5 w-5" />Shared Documents</CardTitle>
            <CardDescription>{filteredDocuments.length} document(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(doc.size || 0)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Uploaded by {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm">
                      <Eye className="h-4 w-4" />View
                    </motion.a>
                    <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={doc.file_url} download
                      className="flex items-center justify-center px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
                      <Download className="h-4 w-4" />
                    </motion.a>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(doc.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No documents found. Upload some files to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
