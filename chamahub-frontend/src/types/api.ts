// API Type Definitions for ChamaHub - Updated to match Django models

// User & Authentication Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
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
  role?: string;
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
  available_funds?: number;
  max_loan_amount?: number;
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
  user_details?: User;
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

// Finance Types - Updated to match Django models
export interface Contribution {
  id: number;
  group: number;
  member: number;
  member_name?: string;
  amount: string;
  payment_method: 'MPESA' | 'BANK' | 'CASH' | 'OTHER';
  reference_number: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'RECONCILED';
  reconciled_by?: number;
  reconciled_at?: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: number;
  group: number;
  group_name?: string;
  borrower: number;
  borrower_name?: string;
  principal_amount: string;
  interest_rate: string;
  duration_months: number;
  total_amount: string;
  monthly_payment: string;
  outstanding_balance: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'REJECTED';
  purpose: string;
  applied_at: string;
  approved_by?: number;
  approved_at?: string;
  disbursed_at?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  updated_at: string;
  // Frontend calculated fields
  total_repaid?: number;
  progress_percentage?: number;
}

export interface LoanRepayment {
  id: number;
  loan: number;
  amount: string;
  payment_method: string;
  reference_number: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paid_at: string;
  notes: string;
}

export interface Expense {
  id: number;
  group: number;
  group_name?: string;
  category: 'OPERATIONAL' | 'ADMINISTRATIVE' | 'WELFARE' | 'INVESTMENT' | 'OTHER';
  description: string;
  amount: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  receipt?: string;
  requested_by: number;
  requested_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  requested_at: string;
  approved_at?: string;
  disbursed_at?: string;
  notes: string;
}

export interface DisbursementApproval {
  id: number;
  group: number;
  group_name?: string;
  approval_type: 'LOAN' | 'EXPENSE' | 'WITHDRAWAL';
  amount: string;
  description: string;
  loan?: number;
  expense?: number;
  required_approvals: number;
  approvals_count: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: number;
  requested_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalSignature {
  id: number;
  approval: number;
  approver: number;
  approver_name?: string;
  approved: boolean;
  comments: string;
  signed_at: string;
}

// Governance Types
export interface Vote {
  id: number;
  group: number;
  group_name?: string;
  title: string;
  description: string;
  vote_type: 'SIMPLE' | 'TWO_THIRDS' | 'UNANIMOUS';
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  allow_proxy: boolean;
  start_date: string;
  end_date: string;
  total_eligible_voters: number;
  total_votes_cast: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  is_passed?: boolean;
}

export interface VoteBallot {
  id: number;
  vote: number;
  voter: number;
  voter_name?: string;
  choice: 'YES' | 'NO' | 'ABSTAIN';
  is_proxy: boolean;
  proxy_for?: number;
  voted_at: string;
}

export interface Fine {
  id: number;
  group: number;
  member: number;
  member_name?: string;
  fine_type: 'LATE_CONTRIBUTION' | 'MISSED_MEETING' | 'LOAN_DEFAULT' | 'CONDUCT' | 'OTHER';
  amount: string;
  reason: string;
  status: 'PENDING' | 'PAID' | 'WAIVED';
  issued_by: number;
  issued_by_name?: string;
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
  uploaded_by_name?: string;
  uploaded_at: string;
}

// Investment Types
export interface Investment {
  id: number;
  group: number;
  group_name?: string;
  investment_type: 'TREASURY_BILL' | 'TREASURY_BILLS' | 'MONEY_MARKET' | 'STOCKS' | 'BONDS' | 'REAL_ESTATE' | 'FIXED_DEPOSIT' | 'OTHER';
  name: string;
  description: string;
  principal_amount: string;
  amount_invested: string; // Alias for compatibility
  current_value: string;
  expected_return_rate: string;
  expected_return: string; // Alias for compatibility
  status: 'ACTIVE' | 'MATURED' | 'SOLD' | 'CANCELLED';
  purchase_date: string;
  investment_date: string; // Alias for compatibility
  maturity_date?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  certificate?: string;
  // Additional fields for portfolio
  returns?: number;
  roi?: string;
  roi_percentage?: number;
  profit_loss?: string;
}

export interface StockHolding {
  id: number;
  group: number;
  stock_symbol: string;
  stock_name: string;
  exchange: 'NSE' | 'OTHER';
  shares: number;
  purchase_price: string;
  current_price: string;
  purchase_date: string;
}

export interface Portfolio {
  id: number;
  group: number;
  total_value: string;
  total_invested: string;
  total_returns: string;
  return_percentage: string;
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
  growth_rates?: {
    balance: number;
    members: number;
    loans: number;
    investments: number;
  };
  quick_stats?: {
    pending_actions: number;
    upcoming_meetings: number;
    unread_notifications: number;
    loan_approvals: number;
  };
}

export interface RecentActivity {
  id: number;
  type: 'contribution' | 'loan' | 'expense' | 'vote' | 'investment' | 'loan_repayment' | 'fine';
  description: string;
  amount?: number;
  user: string;
  user_id: number;
  group_id: number;
  timestamp: string;
  is_positive?: boolean;
  status?: string;
}

// Analytics Types
export interface AnalyticsData {
  contributions_over_time: Array<{ date: string; amount: number; target?: number }>;
  member_activity: Array<{ member_name: string; transactions: number; contributions: number }>;
  category_breakdown: Array<{ name: string; value: number }>;
  growth_trends: Array<{ month: string; growth: number }>;
  weekly_activity: Array<{ name: string; contributions: number; loans: number; meetings: number }>;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read: boolean;
  action_url?: string;
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
  error?: string;
  [key: string]: unknown;
}

// Form Data Types
export interface LoanApplicationData {
  group_id: string;
  amount: string;
  purpose: string;
  duration_months: string;
  guarantors: string[];
  repayment_method: string;
}

export interface ContributionFormData {
  group_id: string;
  member_id: string;
  amount: string;
  payment_method: 'MPESA' | 'BANK' | 'CASH' | 'OTHER';
  reference_number: string;
  notes: string;
}

export interface ExpenseFormData {
  group_id: string;
  category: 'OPERATIONAL' | 'ADMINISTRATIVE' | 'WELFARE' | 'INVESTMENT' | 'OTHER';
  description: string;
  amount: string;
  receipt?: File;
  notes: string;
}

// Education Hub Types
export interface EducationalContent {
  id: number;
  title: string;
  slug: string;
  content_type: 'ARTICLE' | 'VIDEO' | 'TUTORIAL' | 'QUIZ' | 'WEBINAR' | 'COURSE' | 'EBOOK';
  category: 'SAVINGS' | 'INVESTMENTS' | 'LOANS' | 'BUDGETING' | 'FINANCIAL_PLANNING' | 'CREDIT_SCORE' | 'TAXES' | 'RETIREMENT' | 'INSURANCE' | 'ENTREPRENEURSHIP';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  description: string;
  content: string;
  video_url?: string;
  thumbnail_url?: string;
  learning_objectives: string[];
  tags: string[];
  duration_minutes: number;
  points_reward: number;
  certificate_available: boolean;
  quiz_questions?: any[];
  passing_score: number;
  is_published: boolean;
  is_featured: boolean;
  author?: number;
  views_count: number;
  likes_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface LearningPath {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  path_type: 'BEGINNER_FINANCIAL_LITERACY' | 'INVESTMENT_MASTERY' | 'DEBT_MANAGEMENT' | 'BUSINESS_FINANCE' | 'RETIREMENT_PLANNING' | 'WEALTH_BUILDING';
  icon_name: string;
  color_code: string;
  total_duration_hours: number;
  total_points: number;
  contents_count: number;
  is_published: boolean;
  is_featured: boolean;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  completion_badge: string;
  completion_certificate: boolean;
  enrolled_count: number;
  completed_count: number;
  created_at: string;
  updated_at: string;
}

export interface LearningPathEnrollment {
  id: number;
  user: number;
  learning_path: number;
  learning_path_details?: LearningPath;
  enrollment_id: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED' | 'PAUSED';
  current_content?: number;
  progress_percentage: number;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  last_accessed_at: string;
  total_time_spent_minutes: number;
  earned_points: number;
  notes: string;
}

export interface UserProgress {
  id: number;
  user: number;
  content: number;
  content_details?: EducationalContent;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWING';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  time_spent_minutes: number;
  quiz_score?: number;
  quiz_answers?: any;
  bookmarked: boolean;
  last_position: number;
}

export interface Certificate {
  id: number;
  certificate_id: string;
  user: number;
  learning_path?: number;
  content?: number;
  title: string;
  description: string;
  issued_at: string;
  valid_until?: string;
  grade: 'PASS' | 'MERIT' | 'DISTINCTION';
  score?: number;
  certificate_url: string;
  certificate_pdf?: string;
  verification_code: string;
  is_public: boolean;
}

export interface SavingsChallenge {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  challenge_type: 'WEEKLY_SAVINGS' | 'MONTHLY_SAVINGS' | 'SPECIAL_EVENT' | 'EMERGENCY_FUND' | 'INVESTMENT_CHALLENGE';
  target_amount: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
  min_participants: number;
  max_participants: number;
  participants_count: number;
  reward_points: number;
  reward_badge: string;
  learning_path?: number;
  created_by: number;
  created_at: string;
  total_amount_saved: number;
  success_rate: number;
}

export interface ChallengeParticipant {
  id: number;
  challenge: number;
  challenge_details?: SavingsChallenge;
  user: number;
  current_amount: number;
  target_amount?: number;
  progress_percentage: number;
  completed: boolean;
  streak_days: number;
  joined_at: string;
  started_at?: string;
  completed_at?: string;
  last_activity_at: string;
  learning_progress: number;
  daily_target?: number;
  weekly_target?: number;
  notes: string;
}

export interface Webinar {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  presenter?: number;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  platform: 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' | 'JITSI' | 'CUSTOM';
  meeting_id: string;
  meeting_url: string;
  join_url: string;
  password?: string;
  recording_url?: string;
  recording_available_at?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'RECORDING_AVAILABLE';
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  max_participants: number;
  registered_count: number;
  attended_count: number;
  learning_path?: number;
  slides_url?: string;
  resources_url?: string;
  qna_enabled: boolean;
  poll_enabled: boolean;
  points_reward: number;
  certificate_available: boolean;
  views_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface WebinarRegistration {
  id: number;
  webinar: number;
  webinar_details?: Webinar;
  user: number;
  registration_id: string;
  status: 'REGISTERED' | 'ATTENDED' | 'ABSENT' | 'CANCELLED' | 'WAITLISTED';
  registered_at: string;
  joined_at?: string;
  left_at?: string;
  attendance_duration: number;
  checked_in: boolean;
  rating?: number;
  feedback: string;
  reminder_sent: boolean;
  followup_sent: boolean;
}
