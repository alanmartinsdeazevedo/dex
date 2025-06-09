// ============================================
// TIPOS PARA USUÁRIOS DO DEX
// ============================================

export interface SystemUser {
  id: string;
  ms_id: string;
  name: string;
  email: string;
  profile_image?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  role_id: string;
  role: {
    id: string;
    role: string;
    description: string;
  };
  _count?: {
    Log: number;
    AtlassianLog: number;
  };
  stats?: UserStats;
}

export interface SystemRole {
  id: string;
  role: string;
  description: string;
}

export interface UserStats {
  totalLogs: number;
  systemLogs: {
    total: number;
    last30Days: number;
    last7Days: number;
  };
  atlassianLogs: {
    total: number;
    last30Days: number;
    last7Days: number;
  };
  topActions: Array<{
    action: string;
    count: number;
  }>;
  accountAge: number;
  lastLoginDaysAgo: number | null;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentUsers: number;
  activeUsersLast30Days: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  activityRate: number;
}

export interface UsersFilters {
  isActive?: boolean;
  roleId?: string;
  search?: string;
  orderBy?: "name" | "email" | "created_at" | "last_login";
  orderDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ComponentUsersFilters {
  search: string;
  isActive?: boolean;
  roleId?: string;
  orderBy: "name" | "email" | "created_at" | "last_login";
  orderDirection: "asc" | "desc";
  limit: number;
  offset: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role_id?: string;
  is_active?: boolean;
}

export interface UserLog {
  id: string;
  action: string;
  response: string;
  created_at: string;
  type: 'system' | 'atlassian';
  group?: {
    group_name: string;
  };
}

export interface UserLogsResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  logs: UserLog[];
  stats: {
    systemLogs: number;
    atlassianLogs: number;
    totalLogs: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface UserLogsOptions {
  type?: "all" | "system" | "atlassian";
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
}