// ==================== TIPOS ====================

export interface LicenseUsageData {
  product: string;
  currentUsage: number;
  approximateCount: number;
  timestamp: string;
}

export interface LicenseStats {
  used: number;
  available: number;
  total: number;
  usagePercentage: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface AtlassianUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  accountType: string;
  active: boolean;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface AtlassianGroup {
  id: string;
  group_id: string;
  group_name: string;
  description?: string;
  order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  updater?: {
    id: string;
    name: string;
    email: string;
  };
}

// ==================== CONSTANTES ====================

export const ATLASSIAN_PRODUCTS = {
  'jira-servicedesk': 'Jira Service Management',
  'jira-software': 'Jira Software',
  'confluence': 'Confluence',
} as const;

export const LICENSE_THRESHOLDS = {
  WARNING: 75,
  CRITICAL: 90,
} as const;

export const DEFAULT_TOTAL_LICENSES = 500;

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * ✅ Calcula estatísticas de licenças
 */
export function calculateLicenseStats(licenseData: LicenseUsageData, totalAvailable: number = DEFAULT_TOTAL_LICENSES): LicenseStats {
  const used = licenseData.currentUsage;
  const available = Math.max(0, totalAvailable - used);
  const usagePercentage = totalAvailable > 0 ? (used / totalAvailable) * 100 : 0;
  
  return {
    used,
    available,
    total: totalAvailable,
    usagePercentage: Math.round(usagePercentage * 100) / 100,
    status: usagePercentage > LICENSE_THRESHOLDS.CRITICAL ? 'critical' : 
             usagePercentage > LICENSE_THRESHOLDS.WARNING ? 'warning' : 'normal',
  };
}

/**
 * ✅ Formata dados de licença para exibição
 */
export function formatLicenseDisplay(licenseData: LicenseUsageData) {
  return {
    ...licenseData,
    formattedTimestamp: new Date(licenseData.timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    productDisplayName: ATLASSIAN_PRODUCTS[licenseData.product as keyof typeof ATLASSIAN_PRODUCTS] || licenseData.product,
  };
}

/**
 * ✅ Função para determinar cor baseada no status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'critical': return 'red';
    case 'warning': return 'yellow';
    default: return 'green';
  }
}

/**
 * ✅ Função para obter ícone baseado no status
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'critical': return 'mdi:alert-circle';
    case 'warning': return 'mdi:alert';
    default: return 'mdi:check-circle';
  }
}

/**
 * ✅ Função para determinar se precisa fazer refresh dos dados
 */
export function shouldRefreshData(lastUpdate: Date, intervalMinutes: number = 5): boolean {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  return diffMinutes >= intervalMinutes;
}

/**
 * ✅ Valida se um email é válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ✅ Formata percentual para exibição
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * ✅ Gera mensagem de status baseada nas estatísticas
 */
export function getStatusMessage(stats: LicenseStats): string {
  const { status, usagePercentage, available } = stats;
  
  switch (status) {
    case 'critical':
      return `Uso crítico! Apenas ${available} licenças disponíveis (${formatPercentage(usagePercentage)})`;
    case 'warning':
      return `Atenção: ${available} licenças disponíveis (${formatPercentage(usagePercentage)})`;
    default:
      return `Sistema normal: ${available} licenças disponíveis (${formatPercentage(usagePercentage)})`;
  }
}

/**
 * ✅ Converte timestamp para formato relativo
 */
export function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}

/**
 * ✅ Valida dados de licença
 */
export function validateLicenseData(data: any): data is LicenseUsageData {
  return (
    data &&
    typeof data.product === 'string' &&
    typeof data.currentUsage === 'number' &&
    typeof data.approximateCount === 'number' &&
    typeof data.timestamp === 'string'
  );
}

/**
 * ✅ Cria configuração de URL com parâmetros
 */
export function buildApiUrl(baseUrl: string, endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(endpoint, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  return url.toString();
}