// chamahub-frontend/src/services/apiService.ts
import api from './api';
import type {
  User,
  MemberWallet,
  RegisterRequest,
  RegisterResponse,
  ChamaGroup,
  GroupMembership,
  GroupGoal,
  Contribution,
  Loan,
  LoanRepayment,
  Expense,
  DisbursementApproval,
  ApprovalSignature,
  Vote,
  VoteBallot,
  Fine,
  Document,
  Investment,
  StockHolding,
  Portfolio,
  PaginatedResponse,
  DashboardStats,
  RecentActivity,
} from '../types/api';

// Authentication Services
export const authService = {
  async login(credentials: { email: string; password: string }): Promise<{ 
    access: string; 
    refresh: string;
  }> {
    const response = await api.post('/token/', credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post('/accounts/users/register/', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/accounts/users/me/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/accounts/users/me/', data);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post('/accounts/users/request_password_reset/', { email });
    return response.data;
  },

  async resetPassword(uid: string, token: string, new_password: string): Promise<{ message: string }> {
    const response = await api.post('/accounts/users/reset_password/', {
      uid,
      token,
      new_password,
    });
    return response.data;
  },

  async getMyWallet(): Promise<MemberWallet> {
    const response = await api.get('/accounts/wallets/my_wallet/');
    return response.data;
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    const response = await api.post('/accounts/users/logout/', { refresh: refreshToken });
    return response.data;
  },
};

// Groups Services
export const groupsService = {
  async getGroups(params?: { page?: number; group_type?: string }): Promise<PaginatedResponse<ChamaGroup>> {
    const response = await api.get('/groups/chama-groups/', { params });
    return response.data;
  },

  async getMyGroups(): Promise<ChamaGroup[]> {
    try {
      console.log('📊 Fetching user groups...');
      const response = await api.get('/groups/chama-groups/my_groups/');
      console.log('✅ Groups fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch groups:', error);
      return [];
    }
  },

  async getGroup(id: number): Promise<ChamaGroup> {
    const response = await api.get(`/groups/chama-groups/${id}/`);
    return response.data;
  },

  async createGroup(data: Partial<ChamaGroup>): Promise<ChamaGroup> {
    const response = await api.post('/groups/chama-groups/', data);
    return response.data;
  },

  async updateGroup(id: number, data: Partial<ChamaGroup>): Promise<ChamaGroup> {
    const response = await api.patch(`/groups/chama-groups/${id}/`, data);
    return response.data;
  },

  async deleteGroup(id: number): Promise<void> {
    await api.delete(`/groups/chama-groups/${id}/`);
  },

  async getGroupDashboard(id: number): Promise<Record<string, unknown>> {
    const response = await api.get(`/groups/chama-groups/${id}/dashboard/`);
    return response.data;
  },

  async getGroupMembers(groupId: number): Promise<PaginatedResponse<GroupMembership>> {
    const response = await api.get('/groups/memberships/', {
      params: { group: groupId },
    });
    return response.data;
  },

  async addGroupMember(data: Partial<GroupMembership>): Promise<GroupMembership> {
    const response = await api.post('/groups/memberships/', data);
    return response.data;
  },

  async approveMembership(id: number): Promise<GroupMembership> {
    const response = await api.post(`/groups/memberships/${id}/approve/`);
    return response.data;
  },

  async suspendMembership(id: number): Promise<GroupMembership> {
    const response = await api.post(`/groups/memberships/${id}/suspend/`);
    return response.data;
  },

  async getGroupGoals(groupId: number): Promise<PaginatedResponse<GroupGoal>> {
    const response = await api.get('/groups/goals/', {
      params: { group: groupId },
    });
    return response.data;
  },

  async createGoal(data: Partial<GroupGoal>): Promise<GroupGoal> {
    const response = await api.post('/groups/goals/', data);
    return response.data;
  },

  async markGoalAchieved(id: number): Promise<GroupGoal> {
    const response = await api.post(`/groups/goals/${id}/mark_achieved/`);
    return response.data;
  },
};

// Finance Services
export const financeService = {
  // Contributions
  async getContributions(params?: { 
    group?: number; 
    member?: number; 
    status?: string; 
    payment_method?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Contribution>> {
    const response = await api.get('/finance/contributions/', { params });
    return response.data;
  },

  async createContribution(data: Partial<Contribution>): Promise<Contribution> {
    const response = await api.post('/finance/contributions/', data);
    return response.data;
  },

  async reconcileContribution(id: number): Promise<Contribution> {
    const response = await api.post(`/finance/contributions/${id}/reconcile/`);
    return response.data;
  },

  async exportContributions(params?: { status?: string }): Promise<Blob> {
    const response = await api.get('/finance/contributions/export/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Loans
  async getLoans(params?: { 
    group?: number; 
    borrower?: number; 
    status?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Loan>> {
    const response = await api.get('/finance/loans/', { params });
    return response.data;
  },

  async applyForLoan(data: Partial<Loan>): Promise<Loan> {
    const response = await api.post('/finance/loans/', data);
    return response.data;
  },

  async getLoan(id: number): Promise<Loan> {
    const response = await api.get(`/finance/loans/${id}/`);
    return response.data;
  },

  async calculateLoan(data: { 
    group_id: number; 
    amount: number; 
    duration_months: number; 
  }): Promise<{
    monthly_payment: number;
    total_interest: number;
    total_repayment: number;
  }> {
    const response = await api.post('/finance/loans/calculate/', data);
    return response.data;
  },

  // Loan Repayments
  async getLoanRepayments(loanId: number): Promise<PaginatedResponse<LoanRepayment>> {
    const response = await api.get('/finance/loan-repayments/', {
      params: { loan: loanId },
    });
    return response.data;
  },

  async createLoanRepayment(data: Partial<LoanRepayment>): Promise<LoanRepayment> {
    const response = await api.post('/finance/loan-repayments/', data);
    return response.data;
  },

  // Expenses
  async getExpenses(params?: { 
    group?: number; 
    category?: string; 
    status?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Expense>> {
    const response = await api.get('/finance/expenses/', { params });
    return response.data;
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const response = await api.post('/finance/expenses/', data);
    return response.data;
  },

  // Disbursement Approvals
  async getDisbursementApprovals(params?: { 
    group?: number; 
    approval_type?: string; 
    status?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<DisbursementApproval>> {
    const response = await api.get('/finance/disbursement-approvals/', { params });
    return response.data;
  },

  async createDisbursementApproval(data: Partial<DisbursementApproval>): Promise<DisbursementApproval> {
    const response = await api.post('/finance/disbursement-approvals/', data);
    return response.data;
  },

  // Approval Signatures
  async getApprovalSignatures(params?: { 
    approval?: number; 
    approver?: number; 
    approved?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<ApprovalSignature>> {
    const response = await api.get('/finance/approval-signatures/', { params });
    return response.data;
  },

  async createApprovalSignature(data: Partial<ApprovalSignature>): Promise<ApprovalSignature> {
    const response = await api.post('/finance/approval-signatures/', data);
    return response.data;
  },

  // Transaction History
  async getTransactions(params?: { 
    group?: number; 
    type?: string; 
    status?: string; 
    date_from?: string; 
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<any>> {
    const response = await api.get('/finance/transactions/', { params });
    return response.data;
  },

  async exportTransactions(params?: { 
    type?: string; 
    status?: string; 
    date_from?: string; 
    date_to?: string;
  }): Promise<Blob> {
    const response = await api.get('/finance/transactions/export/', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

// Governance Services
export const governanceService = {
  async getVotes(params?: { 
    group?: number; 
    status?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Vote>> {
    const response = await api.get('/governance/votes/', { params });
    return response.data;
  },

  async createVote(data: Partial<Vote>): Promise<Vote> {
    const response = await api.post('/governance/votes/', data);
    return response.data;
  },

  async getVote(id: number): Promise<Vote> {
    const response = await api.get(`/governance/votes/${id}/`);
    return response.data;
  },

  async activateVote(id: number): Promise<Vote> {
    const response = await api.post(`/governance/votes/${id}/activate/`);
    return response.data;
  },

  async closeVote(id: number): Promise<Vote> {
    const response = await api.post(`/governance/votes/${id}/close/`);
    return response.data;
  },

  async castVote(voteId: number, data: { 
    choice: 'YES' | 'NO' | 'ABSTAIN'; 
    comments?: string; 
  }): Promise<{
    ballot: VoteBallot;
    vote: Vote;
    message: string;
  }> {
    const response = await api.post(`/governance/votes/${voteId}/cast_vote/`, data);
    return response.data;
  },

  async castVoteBallot(data: Partial<VoteBallot>): Promise<VoteBallot> {
    const response = await api.post('/governance/vote-ballots/', data);
    return response.data;
  },

  async getFines(params?: { 
    group?: number; 
    member?: number; 
    status?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Fine>> {
    const response = await api.get('/governance/fines/', { params });
    return response.data;
  },

  async createFine(data: Partial<Fine>): Promise<Fine> {
    const response = await api.post('/governance/fines/', data);
    return response.data;
  },

  async getDocuments(params?: { 
    group?: number; 
    document_type?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Document>> {
    const response = await api.get('/governance/documents/', { params });
    return response.data;
  },

  async uploadDocument(data: FormData): Promise<Document> {
    const response = await api.post('/governance/documents/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Investment Services
export const investmentService = {
  async getInvestments(params?: { 
    group?: number; 
    investment_type?: string; 
    status?: string; 
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Investment>> {
    const response = await api.get('/investments/investments/', { params });
    return response.data;
  },

  async createInvestment(data: Partial<Investment>): Promise<Investment> {
    const response = await api.post('/investments/investments/', data);
    return response.data;
  },

  async getInvestment(id: number): Promise<Investment> {
    const response = await api.get(`/investments/investments/${id}/`);
    return response.data;
  },

  async getStockHoldings(groupId: number): Promise<PaginatedResponse<StockHolding>> {
    const response = await api.get('/investments/stocks/', {
      params: { group: groupId },
    });
    return response.data;
  },

  async getPortfolio(groupId: number): Promise<Portfolio> {
    const response = await api.get('/investments/portfolios/', {
      params: { group: groupId },
    });
    return response.data.results?.[0] || null;
  },

  async getInvestmentPortfolio(): Promise<{ results: Investment[] }> {
    const response = await api.get('/investments/portfolio/');
    return response.data;
  },
};

// Analytics Services - FIXED ENDPOINTS
export const analyticsService = {
  async getDashboardAnalytics(groupId: number): Promise<{
    contributions_over_time: Array<{ date: string; amount: number }>;
    member_activity: Array<{ member_name: string; transactions: number }>;
    category_breakdown: Array<{ name: string; value: number }>;
    growth_trends: Array<{ month: string; growth: number }>;
  }> {
    console.log(`📈 Fetching dashboard analytics for group ${groupId}...`);
    const response = await api.get(`/analytics/dashboard/?group_id=${groupId}`);
    return response.data;
  },

  async getGroupStats(groupId: number): Promise<DashboardStats> {
    console.log(`📊 Fetching group stats for group ${groupId}...`);
    const response = await api.get(`/analytics/groups/${groupId}/stats/`);
    return response.data;
  },

  async getRecentActivity(groupId: number): Promise<RecentActivity[]> {
    console.log(`🔄 Fetching recent activity for group ${groupId}...`);
    const response = await api.get(`/analytics/groups/${groupId}/recent-activity/`);
    return response.data;
  },
};

// Combined Dashboard Service for easier data fetching
export const dashboardService = {
  async getFullDashboard(groupId: number) {
    try {
      console.log(`🚀 Fetching full dashboard for group ${groupId}...`);
      
      const [stats, analytics, recentActivity, transactions] = await Promise.all([
        analyticsService.getGroupStats(groupId),
        analyticsService.getDashboardAnalytics(groupId),
        analyticsService.getRecentActivity(groupId),
        financeService.getTransactions({ 
          group: groupId, 
          page: 1, 
          page_size: 10,
          ordering: '-created_at'
        })
      ]);

      return {
        stats,
        analytics,
        recentActivity,
        transactions: transactions.results || [],
      };
    } catch (error) {
      console.error('❌ Failed to fetch full dashboard:', error);
      throw error;
    }
  }
};

export default {
  auth: authService,
  groups: groupsService,
  finance: financeService,
  governance: governanceService,
  investments: investmentService,
  analytics: analyticsService,
  dashboard: dashboardService,
};
