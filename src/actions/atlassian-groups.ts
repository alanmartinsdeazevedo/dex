'use server'

import {
  AtlassianGroup,
  ApiResponse,
  buildApiUrl,
} from '@/src/utils/atlassian';

// ==================== CONFIGURAÇÕES ====================

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

// ==================== INTERFACES LOCAIS ====================

interface GroupFilters {
  isActive?: boolean;
  search?: string;
  orderBy?: "order" | "name" | "created_at";
  orderDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

interface GroupsResponse {
  data: AtlassianGroup[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ==================== FUNÇÕES DE GRUPOS ====================

/**
 * ✅ Busca todos os grupos com filtros e paginação
 */
export async function fetchAtlassianGroups(
  filters: GroupFilters = {}
): Promise<ApiResponse<GroupsResponse>> {
  try {
    const params = new URLSearchParams();
    
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters.search) params.append('search', filters.search);
    if (filters.orderBy) params.append('orderBy', filters.orderBy);
    if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const url = `${BACKEND_URL}/atlassian/groups?${params.toString()}`;
    console.log('🔍 Buscando grupos:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resposta do backend:', result);
    
    // ✅ CORREÇÃO: Adaptar resposta do backend para o formato esperado pelo frontend
    return {
      success: result.success,
      message: result.message,
      data: {
        data: result.data || [],
        pagination: result.pagination || {
          total: 0,
          limit: filters.limit || 10,
          offset: filters.offset || 0,
          hasMore: false,
        },
      },
    };
  } catch (error: any) {
    console.error('❌ Erro ao buscar grupos:', error);
    return {
      success: false,
      message: 'Erro ao buscar grupos',
      error: error.message,
    };
  }
}

/**
 * ✅ Busca um grupo específico por ID
 */
export async function fetchAtlassianGroupById(
  groupId: string
): Promise<ApiResponse<AtlassianGroup>> {
  try {
    if (!groupId.trim()) {
      return {
        success: false,
        message: 'ID do grupo é obrigatório',
      };
    }

    const response = await fetch(`${BACKEND_URL}/atlassian/groups/${groupId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao buscar grupo:', error);
    return {
      success: false,
      message: 'Erro ao buscar grupo',
      error: error.message,
    };
  }
}

/**
 * ✅ Cria um novo grupo
 */
export async function createAtlassianGroup(
  groupData: {
    group_id: string;
    group_name: string;
    description?: string;
    order?: number;
  },
  userId: string
): Promise<ApiResponse<AtlassianGroup>> {
  try {
    if (!groupData.group_id || !groupData.group_name) {
      return {
        success: false,
        message: 'ID do grupo e nome são obrigatórios',
      };
    }

    const response = await fetch(`${BACKEND_URL}/atlassian/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(groupData),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao criar grupo:', error);
    return {
      success: false,
      message: 'Erro ao criar grupo',
      error: error.message,
    };
  }
}

/**
 * ✅ Atualiza um grupo existente
 */
export async function updateAtlassianGroup(
  groupId: string,
  groupData: {
    group_name?: string;
    description?: string;
    order?: number;
    is_active?: boolean;
  },
  userId: string
): Promise<ApiResponse<AtlassianGroup>> {
  try {
    if (!groupId.trim()) {
      return {
        success: false,
        message: 'ID do grupo é obrigatório',
      };
    }

    const response = await fetch(`${BACKEND_URL}/atlassian/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(groupData),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao atualizar grupo:', error);
    return {
      success: false,
      message: 'Erro ao atualizar grupo',
      error: error.message,
    };
  }
}

/**
 * ✅ Remove um grupo
 */
export async function deleteAtlassianGroup(
  groupId: string,
  userId: string
): Promise<ApiResponse<any>> {
  try {
    if (!groupId.trim()) {
      return {
        success: false,
        message: 'ID do grupo é obrigatório',
      };
    }

    const response = await fetch(`${BACKEND_URL}/atlassian/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao remover grupo:', error);
    return {
      success: false,
      message: 'Erro ao remover grupo',
      error: error.message,
    };
  }
}

// ==================== FUNÇÕES DE VALIDAÇÃO ====================

/**
 * ✅ Valida nome do grupo
 */
export async function validateGroupName(
  name: string,
  excludeId?: string
): Promise<ApiResponse<{ isValid: boolean; exists: boolean }>> {
  try {
    if (!name.trim()) {
      return {
        success: false,
        message: 'Nome do grupo é obrigatório',
      };
    }

    const params: Record<string, string> = {};
    if (excludeId) params.excludeId = excludeId;

    const url = buildApiUrl(BACKEND_URL, `/atlassian/groups/validate/name/${encodeURIComponent(name)}`, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao validar nome do grupo:', error);
    return {
      success: false,
      message: 'Erro ao validar nome do grupo',
      error: error.message,
    };
  }
}

/**
 * ✅ Valida ID do Atlassian
 */
export async function validateAtlassianId(
  groupId: string,
  excludeId?: string
): Promise<ApiResponse<{ isValid: boolean; exists: boolean }>> {
  try {
    if (!groupId.trim()) {
      return {
        success: false,
        message: 'ID do Atlassian é obrigatório',
      };
    }

    const params: Record<string, string> = {};
    if (excludeId) params.excludeId = excludeId;

    const url = buildApiUrl(BACKEND_URL, `/atlassian/groups/validate/atlassian-id/${encodeURIComponent(groupId)}`, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao validar ID do Atlassian:', error);
    return {
      success: false,
      message: 'Erro ao validar ID do Atlassian',
      error: error.message,
    };
  }
}