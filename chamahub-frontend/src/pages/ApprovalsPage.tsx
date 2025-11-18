import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

interface DisbursementApproval {
  id: number;
  group: number;
  group_name: string;
  approval_type: 'LOAN' | 'EXPENSE' | 'WITHDRAWAL';
  amount: number;
  description: string;
  loan?: number;
  expense?: number;
  required_approvals: number;
  approvals_count: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: number;
  requested_by_name: string;
  signatures: ApprovalSignature[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface ApprovalSignature {
  id: number;
  approver: number;
  approver_name: string;
  approved: boolean;
  comments: string;
  signed_at: string;
}

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<DisbursementApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<DisbursementApproval | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/finance/disbursement-approvals/');
      const results = response.data.results || response.data;
      setApprovals(results);
      
      // Calculate stats
      const total = results.length;
      const pending = results.filter((a: DisbursementApproval) => a.status === 'PENDING').length;
      const approved = results.filter((a: DisbursementApproval) => a.status === 'APPROVED').length;
      const rejected = results.filter((a: DisbursementApproval) => a.status === 'REJECTED').length;
      
      setStats({ total, pending, approved, rejected });
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (approvalId: number, approved: boolean) => {
    try {
      await api.post('/finance/approval-signatures/', {
        approval: approvalId,
        approved: approved,
        comments: approved ? 'Approved' : 'Rejected',
      });
      
      // Refresh approvals
      await fetchApprovals();
      setSelectedApproval(null);
    } catch (err) {
      console.error('Error signing approval:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LOAN':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'EXPENSE':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'WITHDRAWAL':
        return <Users className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </motion.button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Approvals
              </h1>
              <p className="text-muted-foreground mt-2">Review and approve disbursement requests</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approvals List */}
        {approvals.length === 0 ? (
          <Card className="shadow-2xl">
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Approval Requests</h3>
              <p className="text-muted-foreground">There are no pending approvals at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>All Approval Requests</CardTitle>
              <CardDescription>Review and approve disbursement requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100">
                          {getTypeIcon(approval.approval_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {approval.approval_type} Disbursement
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {approval.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-blue-600">
                          KES {Number(approval.amount).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(approval.status)}
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(approval.status)}`}>
                            {approval.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Approval Progress</span>
                        <span className="text-sm font-semibold">
                          {approval.approvals_count} / {approval.required_approvals} signatures
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            approval.is_approved ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${(approval.approvals_count / approval.required_approvals) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <span>Requested by: {approval.requested_by_name}</span>
                        <span>•</span>
                        <span>{new Date(approval.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs">
                        {approval.signatures.length} signature{approval.signatures.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background p-8 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedApproval.approval_type} Approval
                </h2>
                <p className="text-muted-foreground">{selectedApproval.description}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedApproval.status)}`}>
                {selectedApproval.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  KES {Number(selectedApproval.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Group</p>
                <p className="text-lg font-semibold">{selectedApproval.group_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="text-lg font-semibold">{selectedApproval.requested_by_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Requested</p>
                <p className="text-lg font-semibold">
                  {new Date(selectedApproval.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Signatures ({selectedApproval.signatures.length})</h3>
              <div className="space-y-2">
                {selectedApproval.signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      {signature.approved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{signature.approver_name}</p>
                        <p className="text-xs text-muted-foreground">{signature.comments}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(signature.signed_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedApproval.status === 'PENDING' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSign(selectedApproval.id, true)}
                    className="flex-1 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSign(selectedApproval.id, false)}
                    className="flex-1 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-5 w-5 inline mr-2" />
                    Reject
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedApproval(null)}
                className="px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
