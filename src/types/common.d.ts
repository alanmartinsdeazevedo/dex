// ============================================
// TIPOS COMUNS PARA TODA A APLICAÇÃO DEX
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface StatusInfo {
  status: string;
  color: 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'purple' | 'info';
  text: string;
  description?: string;
}

export interface FilterOptions {
  search?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ConfirmModalProps {
  show: boolean;
  title: string;
  description: string | React.ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  confirmButtonColor?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
}

export type ToastType = "success" | "warn" | "error" | "info";

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}