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
  Vote,
  VoteBallot,
  Fine,
  Document,
  Investment,
  StockHolding,
  Portfolio,
  PaginatedResponse,
} from '../types/api';

// Authentication Services
export const authService = {
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
};

// Groups Services
export const groupsService = {
  async getGroups(params?: { page?: number; group_type?: string }): Promise<PaginatedResponse<ChamaGroup>> {
    const response = await api.get('/groups/chama-groups/', { params });
    return response.data;
  },

  async getMyGroups(): Promise<ChamaGroup[]> {
    const response = await api.get('/groups/chama-groups/my_groups/');
    return response.data;
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

  async getGroupDashboard(id: number): Promise<any> {
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
  async getContributions(params?: { group?: number; member?: number; page?: number }): Promise<PaginatedResponse<Contribution>> {
    const response = await api.get('/finance/contributions/', { params });
    return response.data;
  },

  async createContribution(data: Partial<Contribution>): Promise<Contribution> {
    const response = await api.post('/finance/contributions/', data);
    return response.data;
  },

  async getLoans(params?: { group?: number; borrower?: number; status?: string; page?: number }): Promise<PaginatedResponse<Loan>> {
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

  async getLoanRepayments(loanId: number): Promise<PaginatedResponse<LoanRepayment>> {
    const response = await api.get('/finance/repayments/', {
      params: { loan: loanId },
    });
    return response.data;
  },

  async createLoanRepayment(data: Partial<LoanRepayment>): Promise<LoanRepayment> {
    const response = await api.post('/finance/repayments/', data);
    return response.data;
  },

  async getExpenses(params?: { group?: number; category?: string; status?: string; page?: number }): Promise<PaginatedResponse<Expense>> {
    const response = await api.get('/finance/expenses/', { params });
    return response.data;
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const response = await api.post('/finance/expenses/', data);
    return response.data;
  },
};

// Governance Services
export const governanceService = {
  async getVotes(params?: { group?: number; status?: string; page?: number }): Promise<PaginatedResponse<Vote>> {
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

  async castVote(data: Partial<VoteBallot>): Promise<VoteBallot> {
    const response = await api.post('/governance/ballots/', data);
    return response.data;
  },

  async getFines(params?: { group?: number; member?: number; status?: string; page?: number }): Promise<PaginatedResponse<Fine>> {
    const response = await api.get('/governance/fines/', { params });
    return response.data;
  },

  async createFine(data: Partial<Fine>): Promise<Fine> {
    const response = await api.post('/governance/fines/', data);
    return response.data;
  },

  async getDocuments(params?: { group?: number; document_type?: string; page?: number }): Promise<PaginatedResponse<Document>> {
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
  async getInvestments(params?: { group?: number; investment_type?: string; status?: string; page?: number }): Promise<PaginatedResponse<Investment>> {
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
    return response.data.results[0];
  },
};

export default {
  auth: authService,
  groups: groupsService,
  finance: financeService,
  governance: governanceService,
  investments: investmentService,
};
