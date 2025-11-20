import api from './api';

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_groups: number;
  active_groups: number;
  total_transactions: number;
  transactions_today: number;
  total_contributions: string;
  total_loans: string;
  pending_kyc: number;
  pending_loans: number;
  recent_activities: RecentActivity[];
}

export interface RecentActivity {
  id: number;
  type: 'user_registration' | 'group_creation' | 'contribution' | 'loan_application' | 'expense_request';
  description: string;
  user?: string;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  kyc_verified: boolean;
  credit_score: string;
  created_at: string;
  last_login?: string;
}

export interface AdminGroup {
  id: number;
  name: string;
  group_type: string;
  total_balance: string;
  member_count: number;
  kyb_verified: boolean;
  is_active: boolean;
  created_at: string;
  created_by: number;
}

export interface AuditLog {
  id: number;
  user?: number;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: number;
  ip_address?: string;
  user_agent?: string;
  details?: string;
  created_at: string;
}

export interface AnalyticsData {
  contributions_trend: Array<{ date: string; amount: number }>;
  loans_by_status: Array<{ status: string; count: number }>;
  groups_by_type: Array<{ type: string; count: number }>;
  user_growth: Array<{ date: string; count: number }>;
}

export const adminApi = {
  // Get admin dashboard statistics
  async getStats(): Promise<AdminStats> {
    try {
      // Fetch data from multiple endpoints and aggregate
      const [usersRes, groupsRes, contributionsRes, loansRes] = await Promise.all([
        api.get('/accounts/users/'),
        api.get('/groups/chama-groups/'),
        api.get('/finance/contributions/'),
        api.get('/finance/loans/'),
      ]);

      const users = usersRes.data.results || usersRes.data;
      const groups = groupsRes.data.results || groupsRes.data;
      const contributions = contributionsRes.data.results || contributionsRes.data;
      const loans = loansRes.data.results || loansRes.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const transactionsToday = contributions.filter((c: any) => {
        const contribDate = new Date(c.created_at);
        contribDate.setHours(0, 0, 0, 0);
        return contribDate.getTime() === today.getTime();
      }).length;

      const totalContributions = contributions.reduce(
        (sum: number, c: any) => sum + parseFloat(c.amount || 0),
        0
      );

      const totalLoans = loans.reduce(
        (sum: number, l: any) => sum + parseFloat(l.principal_amount || 0),
        0
      );

      const pendingKyc = users.filter((u: any) => !u.kyc_verified).length;
      const pendingLoans = loans.filter((l: any) => l.status === 'PENDING').length;

      // Create recent activities from various sources
      const recentActivities: RecentActivity[] = [];
      
      users.slice(0, 5).forEach((u: any) => {
        recentActivities.push({
          id: u.id,
          type: 'user_registration',
          description: `New user registered: ${u.email}`,
          user: u.email,
          timestamp: u.created_at,
        });
      });

      groups.slice(0, 5).forEach((g: any) => {
        recentActivities.push({
          id: g.id,
          type: 'group_creation',
          description: `New group created: ${g.name}`,
          timestamp: g.created_at,
        });
      });

      // Sort by timestamp and take the 10 most recent
      recentActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        total_users: Array.isArray(users) ? users.length : 0,
        active_users: Array.isArray(users) ? users.filter((u: any) => u.is_active).length : 0,
        total_groups: Array.isArray(groups) ? groups.length : 0,
        active_groups: Array.isArray(groups) ? groups.filter((g: any) => g.is_active).length : 0,
        total_transactions: Array.isArray(contributions) ? contributions.length : 0,
        transactions_today: transactionsToday,
        total_contributions: totalContributions.toFixed(2),
        total_loans: totalLoans.toFixed(2),
        pending_kyc: pendingKyc,
        pending_loans: pendingLoans,
        recent_activities: recentActivities.slice(0, 10),
      };
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      throw error;
    }
  },

  // Get all users with admin details
  async getUsers(page = 1, perPage = 20): Promise<{ results: AdminUser[]; count: number }> {
    const response = await api.get(`/accounts/users/?page=${page}&page_size=${perPage}`);
    return {
      results: response.data.results || response.data,
      count: response.data.count || (response.data.results || response.data).length,
    };
  },

  // Get all groups with admin details
  async getGroups(page = 1, perPage = 20): Promise<{ results: AdminGroup[]; count: number }> {
    const response = await api.get(`/groups/chama-groups/?page=${page}&page_size=${perPage}`);
    return {
      results: response.data.results || response.data,
      count: response.data.count || (response.data.results || response.data).length,
    };
  },

  // Get audit logs
  async getAuditLogs(page = 1, perPage = 50): Promise<{ results: AuditLog[]; count: number }> {
    try {
      const response = await api.get(`/audit/audit-logs/?page=${page}&page_size=${perPage}`);
      return {
        results: response.data.results || response.data,
        count: response.data.count || (response.data.results || response.data).length,
      };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      // Return empty data if endpoint doesn't exist
      return { results: [], count: 0 };
    }
  },

  // Get analytics data
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const [contributionsRes, loansRes, groupsRes, usersRes] = await Promise.all([
        api.get('/finance/contributions/'),
        api.get('/finance/loans/'),
        api.get('/groups/chama-groups/'),
        api.get('/accounts/users/'),
      ]);

      const contributions = contributionsRes.data.results || contributionsRes.data;
      const loans = loansRes.data.results || loansRes.data;
      const groups = groupsRes.data.results || groupsRes.data;
      const users = usersRes.data.results || usersRes.data;

      // Process contributions trend (last 30 days)
      const contributionsTrend = this.processContributionsTrend(contributions);
      
      // Process loans by status
      const loansByStatus = this.processLoansByStatus(loans);
      
      // Process groups by type
      const groupsByType = this.processGroupsByType(groups);
      
      // Process user growth (last 12 months)
      const userGrowth = this.processUserGrowth(users);

      return {
        contributions_trend: contributionsTrend,
        loans_by_status: loansByStatus,
        groups_by_type: groupsByType,
        user_growth: userGrowth,
      };
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  // Update user status (activate/deactivate)
  async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
    await api.patch(`/accounts/users/${userId}/`, { is_active: isActive });
  },

  // Update user admin status
  async updateUserAdminStatus(userId: number, isStaff: boolean): Promise<void> {
    await api.patch(`/accounts/users/${userId}/`, { is_staff: isStaff });
  },

  // Helper methods for processing data
  processContributionsTrend(contributions: any[]): Array<{ date: string; amount: number }> {
    const last30Days = new Map<string, number>();
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.set(dateStr, 0);
    }

    contributions.forEach((c: any) => {
      const date = new Date(c.contribution_date || c.created_at).toISOString().split('T')[0];
      if (last30Days.has(date)) {
        last30Days.set(date, last30Days.get(date)! + parseFloat(c.amount || 0));
      }
    });

    return Array.from(last30Days.entries()).map(([date, amount]) => ({
      date,
      amount: Math.round(amount),
    }));
  },

  processLoansByStatus(loans: any[]): Array<{ status: string; count: number }> {
    const statusCounts = new Map<string, number>();
    loans.forEach((loan: any) => {
      const status = loan.status || 'UNKNOWN';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  },

  processGroupsByType(groups: any[]): Array<{ type: string; count: number }> {
    const typeCounts = new Map<string, number>();
    groups.forEach((group: any) => {
      const type = group.group_type || 'UNKNOWN';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });

    return Array.from(typeCounts.entries()).map(([type, count]) => ({
      type,
      count,
    }));
  },

  processUserGrowth(users: any[]): Array<{ date: string; count: number }> {
    const monthCounts = new Map<string, number>();
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts.set(monthKey, 0);
    }

    users.forEach((user: any) => {
      const createdDate = new Date(user.created_at);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthCounts.has(monthKey)) {
        monthCounts.set(monthKey, monthCounts.get(monthKey)! + 1);
      }
    });

    return Array.from(monthCounts.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  },
};
