// User and Authentication Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_kyc_verified: boolean;
  credit_score: number;
  profile_picture?: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

// Wallet Types
export interface Wallet {
  id: number;
  user: number;
  balance: string;
  created_at: string;
  updated_at: string;
}

// Group Types
export interface ChamaGroup {
  id: number;
  name: string;
  description: string;
  group_type: 'SAVINGS' | 'INVESTMENT' | 'WELFARE' | 'MIXED';
  objectives: string;
  contribution_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  minimum_contribution: string;
  created_by: number;
  member_count?: number;
  total_balance?: string;
  created_at: string;
}

export interface GroupMembership {
  id: number;
  group: number;
  user: number;
  role: 'ADMIN' | 'CHAIRPERSON' | 'TREASURER' | 'SECRETARY' | 'MEMBER';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXITED';
  joined_at: string;
}

export interface GroupGoal {
  id: number;
  group: number;
  title: string;
  description: string;
  target_amount: string;
  current_amount: string;
  progress_percentage: number;
  status: 'ACTIVE' | 'ACHIEVED' | 'CANCELLED';
  deadline: string;
  created_at: string;
}

// Finance Types
export interface Contribution {
  id: number;
  group: number;
  member: number;
  member_name?: string;
  amount: string;
  payment_method: 'MPESA' | 'BANK' | 'CASH';
  reference_number: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  contribution_date: string;
  created_at: string;
}

export interface Loan {
  id: number;
  group: number;
  applicant: number;
  applicant_name?: string;
  principal_amount: string;
  interest_rate: string;
  duration_months: number;
  monthly_payment: string;
  total_repayable: string;
  outstanding_balance: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  application_date: string;
  approval_date?: string;
  disbursement_date?: string;
}

export interface LoanRepayment {
  id: number;
  loan: number;
  amount: string;
  payment_method: 'MPESA' | 'BANK' | 'CASH';
  reference_number: string;
  repayment_date: string;
  created_at: string;
}

export interface Expense {
  id: number;
  group: number;
  requested_by: number;
  amount: string;
  category: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  request_date: string;
  approval_date?: string;
}

// Dashboard Types
export interface DashboardStats {
  total_balance: string;
  total_loans: string;
  total_contributions: string;
  total_investments: string;
  member_count: number;
  recent_transactions: Transaction[];
}

export interface Transaction {
  id: number;
  type: 'contribution' | 'loan' | 'expense' | 'repayment';
  amount: string;
  description: string;
  member_name: string;
  date: string;
  status: string;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface ContributionTrend {
  month: string;
  amount: number;
}

export interface InvestmentPerformance {
  type: string;
  value: number;
  returns: number;
}
