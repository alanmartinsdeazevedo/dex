// src/actions/atlassian.ts
'use server'

import {
  LicenseUsageData,
  AtlassianUser,
  ApiResponse,
  AtlassianGroup,
  buildApiUrl,
  isValidEmail,
} from '@/src/utils/atlassian';

// ==================== CONFIGURAÇÕES ====================

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

// ==================== FUNÇÕES DE LICENÇAS ====================

/**
 * ✅ Consulta o uso de licenças para Jira Service Desk
 */
export async function fetchLicenseUsage(): Promise<ApiResponse<LicenseUsageData>> {
  try {
    const response = await fetch(`${BACKEND_URL}/atlassian/licenses/usage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Sempre buscar dados frescos
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao consultar uso de licenças:', error);
    return {
      success: false,
      message: 'Erro ao consultar uso de licenças',
      error: error.message,
    };
  }
}

/**
 * ✅ Consulta o uso de licenças para um produto específico
 */
export async function fetchLicenseUsageByProduct(product: string): Promise<ApiResponse<LicenseUsageData>> {
  try {
    if (!product) {
      return {
        success: false,
        message: 'Produto é obrigatório',
      };
    }

    const response = await fetch(`${BACKEND_URL}/atlassian/licenses/usage/${encodeURIComponent(product)}`, {
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
    console.error(`Erro ao consultar uso de licenças para ${product}:`, error);
    return {
      success: false,
      message: `Erro ao consultar uso de licenças para ${product}`,
      error: error.message,
    };
  }
}

/**
 * ✅ Consulta detalhada de licenças para múltiplos produtos
 */
export async function fetchDetailedLicenseUsage(): Promise<ApiResponse<LicenseUsageData[]>> {
  try {
    const response = await fetch(`${BACKEND_URL}/atlassian/licenses/detailed`, {
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
    console.error('Erro ao consultar uso detalhado de licenças:', error);
    return {
      success: false,
      message: 'Erro ao consultar uso detalhado de licenças',
      error: error.message,
    };
  }
}

// ==================== FUNÇÕES DE USUÁRIOS ====================

/**
 * ✅ Busca usuários no Atlassian
 */
export async function searchAtlassianUser(query: string): Promise<ApiResponse<AtlassianUser[]>> {
  try {
    if (!query.trim()) {
      return {
        success: false,
        message: 'Query de busca é obrigatória',
      };
    }

    const response = await fetch(
      `${BACKEND_URL}/atlassian/users/search?query=${encodeURIComponent(query)}`,
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
    console.error('Erro ao buscar usuário no Atlassian:', error);
    return {
      success: false,
      message: 'Erro ao buscar usuário no Atlassian',
      error: error.message,
    };
  }
}

/**
 * ✅ Convida usuário para o Atlassian
 */
export async function inviteUserToAtlassian(
  email: string,
  userId: string
): Promise<ApiResponse<any>> {
  try {
    if (!email.trim()) {
      return {
        success: false,
        message: 'Email é obrigatório',
      };
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Email inválido',
      };
    }

    if (!userId.trim()) {
      return {
        success: false,
        message: 'ID do usuário é obrigatório',
      };
    }

    const response = await fetch(`${BACKEND_URL}/atlassian/users/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao convidar usuário:', error);
    return {
      success: false,
      message: 'Erro ao convidar usuário',
      error: error.message,
    };
  }
}

/**
 * ✅ Adiciona usuário a um grupo na Atlassian
 */
export async function addUserToAtlassianGroup(
  accountId: string,
  groupName: string,
  userId: string
): Promise<ApiResponse<any>> {
  try {
    if (!accountId.trim()) {
      return {
        success: false,
        message: 'Account ID é obrigatório',
      };
    }

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

    const response = await fetch(`${BACKEND_URL}/atlassian/users/add-to-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ 
        accountId, 
        groupName 
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao adicionar usuário ao grupo:', error);
    return {
      success: false,
      message: 'Erro ao adicionar usuário ao grupo',
      error: error.message,
    };
  }
}

/**
 * ✅ Remove usuário de um grupo na Atlassian
 */
export async function removeUserFromAtlassianGroup(
  accountId: string,
  groupName: string,
  userId: string
): Promise<ApiResponse<any>> {
  try {
    if (!accountId.trim()) {
      return {
        success: false,
        message: 'Account ID é obrigatório',
      };
    }

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

    const response = await fetch(`${BACKEND_URL}/atlassian/users/remove-from-group`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ 
        accountId, 
        groupName 
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Erro ao remover usuário do grupo:', error);
    return {
      success: false,
      message: 'Erro ao remover usuário do grupo',
      error: error.message,
    };
  }
}

/**
 * ✅ Busca descrição de um grupo
 */
export async function getGroupDescription(groupIdentifier: string): Promise<ApiResponse<{ description: string }>> {
  try {
    if (!groupIdentifier.trim()) {
      return {
        success: false,
        message: 'Identificador do grupo é obrigatório',
      };
    }

    const response = await fetch(
      `${BACKEND_URL}/atlassian/groups/description/${encodeURIComponent(groupIdentifier)}`,
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
    console.error('Erro ao buscar descrição do grupo:', error);
    return {
      success: false,
      message: 'Erro ao buscar descrição do grupo',
      error: error.message,
    };
  }
}

// ==================== FUNÇÕES DE GRUPOS ====================

/**
 * ✅ Busca grupos do Atlassian
 */
export async function fetchAtlassianGroups(filters?: {
  isActive?: boolean;
  search?: string;
  orderBy?: 'order' | 'name' | 'created_at';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<AtlassianGroup[]>> {
  try {
    const url = buildApiUrl(BACKEND_URL, '/atlassian/groups', filters);

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
    console.error('Erro ao buscar grupos do Atlassian:', error);
    return {
      success: false,
      message: 'Erro ao buscar grupos do Atlassian',
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