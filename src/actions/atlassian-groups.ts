'use server'

import {
  AtlassianGroup,
  ApiResponse,
  buildApiUrl,
} from '@/src/utils/atlassian';

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

// ==================== INTERFACES PARA GRUPOS DA ATLASSIAN ====================

export interface AtlassianGroupFromApi {
  name: string;
  groupId?: string;
  self?: string;
  html?: string;
  labels?: any[];
  users?: {
    size: number;
    items: any[];
    'max-results': number;
    'start-index': number;
    'end-index': number;
  };
  expand?: string;
  inDatabase?: boolean;
}

export interface AtlassianGroupsResponse {
  groups: AtlassianGroupFromApi[];
  total: number;
  maxResults: number;
  startAt: number;
  isLast: boolean;
}

// ==================== FUNÇÕES DE GRUPOS DO CODEX ====================

/**
 * ✅ Busca todos os grupos do Codex com filtros e paginação
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
    console.log('🔍 Buscando grupos do Codex:', url);

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
    console.log('✅ Resposta do backend (grupos Codex):', result);
    
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
    console.error('❌ Erro ao buscar grupos do Codex:', error);
    return {
      success: false,
      message: 'Erro ao buscar grupos do Codex',
      error: error.message,
    };
  }
}

/**
 * ✅ Busca um grupo específico do Codex por ID
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
    console.error('Erro ao buscar grupo do Codex:', error);
    return {
      success: false,
      message: 'Erro ao buscar grupo do Codex',
      error: error.message,
    };
  }
}

/**
 * ✅ Cria um novo grupo no Codex
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

    if (!userId.trim()) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
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
    console.error('Erro ao criar grupo no Codex:', error);
    return {
      success: false,
      message: 'Erro ao criar grupo no Codex',
      error: error.message,
    };
  }
}

/**
 * ✅ Atualiza um grupo existente no Codex
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

    if (!userId.trim()) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
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
    console.error('Erro ao atualizar grupo no Codex:', error);
    return {
      success: false,
      message: 'Erro ao atualizar grupo no Codex',
      error: error.message,
    };
  }
}

/**
 * ✅ Remove um grupo do Codex
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

    if (!userId.trim()) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
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
    console.error('Erro ao remover grupo do Codex:', error);
    return {
      success: false,
      message: 'Erro ao remover grupo do Codex',
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

// ==================== FUNÇÕES DE GRUPOS DA ATLASSIAN (API DIRETA) ====================

/**
 * ✅ Busca grupos diretamente da Atlassian (não do Codex)
 */
export async function fetchAtlassianGroupsFromApi(
  maxResults: number = 50,
  startAt: number = 0,
  search?: string
): Promise<ApiResponse<AtlassianGroupsResponse>> {
  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      startAt: startAt.toString(),
    });

    if (search?.trim()) {
      params.append('search', search.trim());
    }

    console.log('🔍 Buscando grupos diretamente da Atlassian:', params.toString());

    const response = await fetch(
      `${BACKEND_URL}/atlassian/atlassian-groups?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Resposta da Atlassian:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao buscar grupos da Atlassian:', error);
    return {
      success: false,
      message: 'Erro ao buscar grupos da Atlassian',
      error: error.message,
    };
  }
}

/**
 * ✅ Cria um novo grupo diretamente na Atlassian
 */
export async function createGroupInAtlassian(
  groupName: string,
  userId: string
): Promise<ApiResponse<any>> {
  try {
    if (!groupName.trim()) {
      return {
        success: false,
        message: 'Nome do grupo é obrigatório',
      };
    }

    if (!userId.trim()) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    console.log('🚀 Criando grupo na Atlassian:', groupName);

    const response = await fetch(`${BACKEND_URL}/atlassian/atlassian-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ groupName: groupName.trim() }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Grupo criado na Atlassian:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao criar grupo na Atlassian:', error);
    return {
      success: false,
      message: 'Erro ao criar grupo na Atlassian',
      error: error.message,
    };
  }
}

/**
 * ✅ Adiciona um grupo da Atlassian à base de dados local (Codex)
 */
export async function addAtlassianGroupToDatabase(
  groupName: string,
  groupData: {
    groupId?: string;
    description?: string;
    order?: number;
  },
  userId: string
): Promise<ApiResponse<any>> {
  try {
    if (!groupName.trim()) {
      return {
        success: false,
        message: 'Nome do grupo é obrigatório',
      };
    }

    if (!userId.trim()) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    console.log('📊 Adicionando grupo da Atlassian ao Codex:', groupName);

    const requestData = {
      groupId: groupData.groupId || groupName,
      description: groupData.description || `Grupo "${groupName}" importado da Atlassian`,
      order: groupData.order || 1,
    };

    const response = await fetch(
      `${BACKEND_URL}/atlassian/atlassian-groups/${encodeURIComponent(groupName)}/add-to-database`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify(requestData),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Grupo adicionado ao Codex:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao adicionar grupo à base de dados:', error);
    return {
      success: false,
      message: 'Erro ao adicionar grupo à base de dados',
      error: error.message,
    };
  }
}

/**
 * ✅ Verifica se um grupo da Atlassian já está na base de dados (Codex)
 */
export async function checkGroupInDatabase(
  groupName: string
): Promise<ApiResponse<{ groupName: string; inDatabase: boolean }>> {
  try {
    if (!groupName.trim()) {
      return {
        success: false,
        message: 'Nome do grupo é obrigatório',
      };
    }

    const response = await fetch(
      `${BACKEND_URL}/atlassian/atlassian-groups/${encodeURIComponent(groupName)}/check-database`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao verificar grupo na base de dados:', error);
    return {
      success: false,
      message: 'Erro ao verificar grupo na base de dados',
      error: error.message,
    };
  }
}