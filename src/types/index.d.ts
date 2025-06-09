// ============================================
// EXPORTAÇÕES CENTRALIZADAS DE TIPOS DEX
// ============================================

// Tipos comuns
export type {
  ApiResponse,
  PaginationInfo,
  BaseEntity,
  StatusInfo,
  FilterOptions,
  ConfirmModalProps,
  ToastType,
  LoadingState
} from './common';

// Tipos de usuários
export type {
  SystemUser,
  SystemRole,
  UserStats,
  SystemStats,
  UsersFilters,
  UpdateUserData,
  UserLog,
  UserLogsResponse,
  UserLogsOptions
} from './users';

// Re-exportar para facilitar importações futuras
export * from './common';
export * from './users';