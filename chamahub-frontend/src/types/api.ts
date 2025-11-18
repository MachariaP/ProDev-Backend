// API Type Definitions for ChamaHub

// User & Authentication Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture?: string;
  date_of_birth?: string;
  address?: string;
  id_number?: string;
  kra_pin?: string;
  kyc_verified: boolean;
  kyc_verified_at?: string;
  is_kyc_complete: boolean;
  credit_score: number;
  created_at: string;
  updated_at: string;
}

export interface MemberWallet {
  id: number;
  user: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface RegisterResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

// Group Types
export interface ChamaGroup {
  id: number;
  name: string;
  description: string;
  group_type: 'SAVINGS' | 'INVESTMENT' | 'WELFARE' | 'MIXED';
  objectives: string;
  contribution_frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  minimum_contribution: number;
  total_balance: number;
  is_active: boolean;
  kyb_verified: boolean;
  kyb_verified_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMembership {
  id: number;
  group: number;
  user: number;
  role: 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  joined_at: string;
  approved_at?: string;
}

export interface GroupGoal {
  id: number;
  group: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'CANCELLED';
  achieved_at?: string;
  created_by: number;
  created_at: string;
}

// Finance Types
export interface Contribution {
  id: number;
  group: number;
  member: number;
  amount: number;
  payment_method: 'MPESA' | 'CASH' | 'BANK' | 'OTHER';
  transaction_ref: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  contribution_date: string;
  notes?: string;
  created_at: string;
}

export interface Loan {
  id: number;
  group: number;
  borrower: number;
  amount: number;
  interest_rate: number;
  duration_months: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REPAYING' | 'COMPLETED' | 'DEFAULTED';
  application_date: string;
  approval_date?: string;
  disbursement_date?: string;
  due_date?: string;
  total_repaid: number;
  created_at: string;
}

export interface LoanRepayment {
  id: number;
  loan: number;
  amount: number;
  payment_method: 'MPESA' | 'CASH' | 'BANK' | 'OTHER';
  transaction_ref: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  payment_date: string;
  created_at: string;
}

export interface Expense {
  id: number;
  group: number;
  category: 'OPERATIONAL' | 'MEETING' | 'WELFARE' | 'OTHER';
  description: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  requested_by: number;
  approved_by?: number;
  created_at: string;
}

// Governance Types
export interface Vote {
  id: number;
  group: number;
  title: string;
  description: string;
  vote_type: 'SIMPLE' | 'SUPER_MAJORITY' | 'UNANIMOUS';
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  start_date: string;
  end_date: string;
  created_by: number;
  created_at: string;
  yes_votes?: number;
  no_votes?: number;
  abstain_votes?: number;
}

export interface VoteBallot {
  id: number;
  vote: number;
  voter: number;
  choice: 'YES' | 'NO' | 'ABSTAIN';
  is_proxy: boolean;
  proxy_for?: number;
  voted_at: string;
}

export interface Fine {
  id: number;
  group: number;
  member: number;
  fine_type: 'LATE_CONTRIBUTION' | 'MISSED_MEETING' | 'LOAN_DEFAULT' | 'CONDUCT' | 'OTHER';
  amount: number;
  reason: string;
  status: 'PENDING' | 'PAID' | 'WAIVED';
  issued_by: number;
  issued_at: string;
  paid_at?: string;
}

export interface Document {
  id: number;
  group: number;
  title: string;
  document_type: 'CONSTITUTION' | 'MINUTES' | 'FINANCIAL' | 'MEMBER' | 'OTHER';
  file: string;
  description?: string;
  is_public: boolean;
  uploaded_by: number;
  uploaded_at: string;
}

// Investment Types
export interface Investment {
  id: number;
  group: number;
  investment_type: 'TREASURY_BILLS' | 'STOCKS' | 'BONDS' | 'REAL_ESTATE' | 'OTHER';
  name: string;
  description: string;
  amount_invested: number;
  current_value: number;
  expected_return: number;
  status: 'ACTIVE' | 'MATURED' | 'SOLD' | 'CANCELLED';
  investment_date: string;
  maturity_date?: string;
  created_by: number;
  created_at: string;
}

export interface StockHolding {
  id: number;
  group: number;
  stock_symbol: string;
  stock_name: string;
  exchange: 'NSE' | 'OTHER';
  shares: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
}

export interface Portfolio {
  id: number;
  group: number;
  total_value: number;
  total_invested: number;
  total_returns: number;
  return_percentage: number;
  last_updated: string;
}

// Dashboard Types
export interface DashboardStats {
  total_balance: number;
  total_members: number;
  active_loans: number;
  total_investments: number;
  monthly_contributions: number;
  pending_approvals: number;
}

export interface RecentActivity {
  id: number;
  type: 'contribution' | 'loan' | 'expense' | 'vote' | 'investment';
  description: string;
  amount?: number;
  user: string;
  timestamp: string;
  is_positive: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error Response
export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
