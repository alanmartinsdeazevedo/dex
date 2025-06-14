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

// ==================== INTERFACES ADICIONAIS ====================

export interface ValidationResponse {
  isValid: boolean;
  exists: boolean;
  message?: string;
}

export interface CreateGroupDto {
  group_id: string;
  group_name: string;
  description?: string;
  order?: number;
}

export interface UpdateGroupDto {
  group_name?: string;
  description?: string;
  order?: number;
  is_active?: boolean;
}

export interface GroupFilters {
  isActive?: boolean;
  search?: string;
  orderBy?: "order" | "name" | "created_at";
  orderDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface InviteUserDto {
  email: string;
}

export interface SearchUserQueryDto {
  query: string;
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

export const VALIDATION_RULES = {
  GROUP_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
  },
  GROUP_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  UUID: {
    PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  },
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_UUID: 'UUID inválido',
  GROUP_NAME_TOO_SHORT: `Nome deve ter pelo menos ${VALIDATION_RULES.GROUP_NAME.MIN_LENGTH} caracteres`,
  GROUP_NAME_TOO_LONG: `Nome deve ter no máximo ${VALIDATION_RULES.GROUP_NAME.MAX_LENGTH} caracteres`,
  GROUP_NAME_INVALID_CHARS: 'Nome contém caracteres inválidos',
  GROUP_DESCRIPTION_TOO_LONG: `Descrição deve ter no máximo ${VALIDATION_RULES.GROUP_DESCRIPTION.MAX_LENGTH} caracteres`,
  GROUP_NAME_EXISTS: 'Este nome de grupo já está em uso',
  GROUP_ID_EXISTS: 'Este ID do Atlassian já está em uso',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  UNAUTHORIZED: 'Não autorizado. Faça login novamente.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
} as const;

// ==================== FUNÇÕES PRINCIPAIS ====================

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
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
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

// ==================== FUNÇÕES UTILITÁRIAS ADICIONAIS ====================

/**
 * Retorna cor CSS baseada no status
 */
export function getStatusColorCSS(status: "normal" | "warning" | "critical"): string {
  switch (status) {
    case "normal":
      return "text-green-600 bg-green-100";
    case "warning":
      return "text-yellow-600 bg-yellow-100";
    case "critical":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Formata exibição de licenças
 */
export function formatLicenseDisplaySimple(stats: LicenseStats): string {
  return `${stats.used}/${stats.total} (${stats.usagePercentage}%)`;
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata nome para exibição
 */
export function formatDisplayName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gera UUID simples (para fins de exemplo - use uma biblioteca apropriada em produção)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Debounce function para otimizar busca
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Sanitiza string para uso em URLs
 */
export function sanitizeForUrl(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Verifica se string é UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  return VALIDATION_RULES.UUID.PATTERN.test(uuid);
}

/**
 * Trunca texto com ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converte camelCase para snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converte snake_case para camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

/**
 * Valida nome do grupo
 */
export function validateGroupName(name: string): string | null {
  if (!name.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (name.length < VALIDATION_RULES.GROUP_NAME.MIN_LENGTH) {
    return ERROR_MESSAGES.GROUP_NAME_TOO_SHORT;
  }
  
  if (name.length > VALIDATION_RULES.GROUP_NAME.MAX_LENGTH) {
    return ERROR_MESSAGES.GROUP_NAME_TOO_LONG;
  }
  
  if (!VALIDATION_RULES.GROUP_NAME.PATTERN.test(name)) {
    return ERROR_MESSAGES.GROUP_NAME_INVALID_CHARS;
  }
  
  return null;
}

/**
 * Valida descrição do grupo
 */
export function validateGroupDescription(description: string): string | null {
  if (description.length > VALIDATION_RULES.GROUP_DESCRIPTION.MAX_LENGTH) {
    return ERROR_MESSAGES.GROUP_DESCRIPTION_TOO_LONG;
  }
  
  return null;
}

/**
 * Valida UUID
 */
export function validateUUID(uuid: string): string | null {
  if (!uuid.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (!VALIDATION_RULES.UUID.PATTERN.test(uuid)) {
    return ERROR_MESSAGES.INVALID_UUID;
  }
  
  return null;
}

/**
 * Valida email
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  
  return null;
}