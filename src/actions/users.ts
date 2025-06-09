'use server'

import type {
  SystemUser,
  SystemRole,
  ApiResponse,
  UsersFilters,
  UpdateUserData,
  UserLogsResponse,
  UserLogsOptions,
  SystemStats
} from '@/src/types';

// URL base da API (ajuste conforme necessário)
const API_BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * 👥 Busca todos os usuários do sistema com filtros
 */
export async function fetchSystemUsers(filters: UsersFilters = {}): Promise<ApiResponse<SystemUser[]>> {
  try {
    const params = new URLSearchParams();
    
    // Converter boolean para string como esperado pelo backend
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters.roleId) params.append('roleId', filters.roleId);
    if (filters.search) params.append('search', filters.search);
    if (filters.orderBy) params.append('orderBy', filters.orderBy);
    if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    console.log(filters)
    const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message,
      data: data.data,
      pagination: data.pagination,
    };

  } catch (error) {
    console.error('Erro ao buscar usuários do sistema:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 👤 Busca um usuário específico por ID
 */
export async function fetchSystemUserById(id: string, includeStats: boolean = false): Promise<ApiResponse<SystemUser>> {
  try {
    if (!id.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    const params = includeStats ? '?includeStats=true' : '';
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: 'Usuário não encontrado',
          error: 'NOT_FOUND',
        };
      }
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message,
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * ✏️ Atualiza dados de um usuário
 */
export async function updateSystemUser(id: string, userData: UpdateUserData, updatedBy?: string): Promise<ApiResponse<SystemUser>> {
  try {
    if (!id.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (updatedBy) {
      headers['user-id'] = updatedBy;
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message || 'Usuário atualizado com sucesso',
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🔄 Alterna status ativo/inativo do usuário
 */
export async function toggleUserStatus(id: string, changedBy?: string): Promise<ApiResponse<SystemUser>> {
  try {
    if (!id.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (changedBy) {
      headers['user-id'] = changedBy;
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}/toggle-status`, {
      method: 'PATCH',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message || 'Status do usuário alterado com sucesso',
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🔐 Altera a role de um usuário
 */
export async function changeUserRole(id: string, roleId: string, changedBy?: string): Promise<ApiResponse<SystemUser>> {
  try {
    if (!id.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!roleId.trim()) {
      throw new Error('ID da role é obrigatório');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (changedBy) {
      headers['user-id'] = changedBy;
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role_id: roleId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message || 'Perfil alterado com sucesso',
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao alterar perfil do usuário:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🗑️ Remove um usuário do sistema (soft delete)
 */
export async function deleteSystemUser(id: string, deletedBy?: string): Promise<ApiResponse<{ message: string }>> {
  try {
    if (!id.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (deletedBy) {
      headers['user-id'] = deletedBy;
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message || 'Usuário removido com sucesso',
    };

  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 📊 Busca logs de um usuário específico
 */
export async function fetchUserLogs(
  id: string,
  options: UserLogsOptions = {}
): Promise<ApiResponse<UserLogsResponse>> {
  try {
    if (!id.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    const params = new URLSearchParams();
    if (options.type) params.append('type', options.type);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.action) params.append('action', options.action);

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(id)}/logs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message,
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao buscar logs do usuário:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 📈 Busca estatísticas do sistema
 */
export async function fetchSystemStats(): Promise<ApiResponse<SystemStats>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message,
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🎭 Busca usuários por role específica
 */
export async function fetchUsersByRole(roleId: string): Promise<ApiResponse<SystemUser[]>> {
  try {
    if (!roleId.trim()) {
      throw new Error('ID da role é obrigatório');
    }

    const response = await fetch(`${API_BASE_URL}/users/role/${encodeURIComponent(roleId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message,
      data: data.data,
    };

  } catch (error) {
    console.error('Erro ao buscar usuários por role:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}