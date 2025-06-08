'use server'

// Tipos para as respostas do backend
interface LdapUserData {
  distinguishedName: string;
  sAMAccountName: string;
  description?: string;
  userPrincipalName: string;
  givenName?: string;
  sn?: string;
  displayName: string;
  telephoneNumber?: string;
  title?: string;
  department?: string;
  memberOf?: string[];
  userAccountControl: string;
  manager?: string;
  dn?: string;
  accountExpires?: string;
  pwdLastSet?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  username: string;
  newPassword?: string;
}

interface AuthTestResponse {
  success: boolean;
  message: string;
  username: string;
  userInfo?: any;
  authTime?: number;
  debugInfo?: any;
  error?: string;
}

interface ResetAndTestResponse {
  success: boolean;
  message: string;
  username: string;
  newPassword?: string;
  resetResult?: {
    success: boolean;
    message: string;
  };
  authResult?: {
    success: boolean;
    message: string;
    error?: string;
    authTime?: number;
    debugInfo?: any;
  };
}

// URL base da API (ajuste conforme necessário)
const API_BASE_URL = process.env.BACKEND_URL;

/**
 * Busca um usuário no Active Directory
 */
export async function fetchUserLdap(searchTerm: string): Promise<LdapUserData | null> {
  try {
    if (!searchTerm.trim()) {
      throw new Error('Termo de busca é obrigatório');
    }

    const response = await fetch(`${API_BASE_URL}/ad/user/${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Sempre buscar dados atuais
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Usuário não encontrado
      }
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as LdapUserData;

  } catch (error) {
    console.error('Erro ao buscar usuário LDAP:', error);
    throw error;
  }
}

/**
 * Desativa um usuário no Active Directory
 */
export async function disableLdapUser(username: string): Promise<ApiResponse<boolean>> {
  try {
    if (!username.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }

    // Assumindo que você tem um endpoint para desativar usuário
    // Se não tiver, você pode usar o método deactivateUser do seu backend
    const response = await fetch(`${API_BASE_URL}/ad/user/${encodeURIComponent(username)}/disable`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success || true,
      message: data.message || 'Usuário desativado com sucesso',
      data: data.success || true,
    };

  } catch (error) {
    console.error('Erro ao desativar usuário LDAP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * 🏴‍☠️ Reseta a senha de um usuário (gera senha One Piece automaticamente)
 */
export async function resetUserPassword(username: string, customPassword?: string): Promise<ResetPasswordResponse> {
  try {
    if (!username.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }

    const requestBody = customPassword ? { newPassword: customPassword } : {};

    const response = await fetch(`${API_BASE_URL}/ad/user/${encodeURIComponent(username)}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data as ResetPasswordResponse;

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido ao resetar senha',
      username: username,
    };
  }
}

/**
 * 🧪 Testa se uma senha funciona para autenticação
 */
export async function testUserAuthentication(username: string, password: string): Promise<AuthTestResponse> {
  try {
    if (!username.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }

    if (!password.trim()) {
      throw new Error('Senha é obrigatória');
    }

    const response = await fetch(`${API_BASE_URL}/ad/user/${encodeURIComponent(username)}/test-authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data as AuthTestResponse;

  } catch (error) {
    console.error('Erro ao testar autenticação:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido no teste de autenticação',
      username: username,
      error: 'TEST_ERROR',
    };
  }
}

/**
 * 🚀 Reset + Teste: Reseta senha e testa autenticação em uma operação
 */
export async function resetAndTestPassword(username: string, customPassword?: string): Promise<ResetAndTestResponse> {
  try {
    if (!username.trim()) {
      throw new Error('Nome de usuário é obrigatório');
    }

    const requestBody = customPassword ? { newPassword: customPassword } : {};

    const response = await fetch(`${API_BASE_URL}/ad/user/${encodeURIComponent(username)}/reset-and-test`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }

    const data = await response.json();
    return data as ResetAndTestResponse;

  } catch (error) {
    console.error('Erro no reset e teste:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido no reset e teste',
      username: username,
    };
  }
}

/**
 * 🔧 Utilitário: Determina o status da conta baseado no userAccountControl
 */
export async function getUserAccountStatus(userAccountControl: string): Promise<{
  status: 'Habilitado' | 'Desabilitado' | 'Bloqueado' | 'Desconhecido';
  color: 'green' | 'red' | 'yellow' | 'gray';
  description: string;
}> {
  const uacValue = parseInt(userAccountControl, 10);
  
  if (isNaN(uacValue)) {
    return {
      status: 'Desconhecido',
      color: 'gray',
      description: 'Status da conta não pode ser determinado'
    };
  }

  // Flags do Active Directory
  const ADS_UF_ACCOUNTDISABLE = 0x0002;    // Conta desabilitada
  const ADS_UF_LOCKOUT = 0x0010;           // Conta bloqueada
  const ADS_UF_PASSWORD_EXPIRED = 0x800000; // Senha expirada

  if ((uacValue & ADS_UF_ACCOUNTDISABLE) === ADS_UF_ACCOUNTDISABLE) {
    return {
      status: 'Desabilitado',
      color: 'red',
      description: 'Conta desabilitada - usuário não pode fazer login'
    };
  }

  if ((uacValue & ADS_UF_LOCKOUT) === ADS_UF_LOCKOUT) {
    return {
      status: 'Bloqueado',
      color: 'yellow',
      description: 'Conta bloqueada - muitas tentativas de login falharam'
    };
  }

  return {
    status: 'Habilitado',
    color: 'green',
    description: 'Conta ativa e funcional'
  };
}

/**
 * 🎯 Utilitário: Formata nome de grupo do DN
 */
export async function formatGroupName(groupDN: string): Promise<string> {
  const match = groupDN.match(/CN=([^,]+)/);
  return match ? match[1] : groupDN;
}

/**
 * 📅 Utilitário: Converte FileTime do AD para Date
 */
export async function convertADFileTime(fileTime: string): Promise<Date | null> {
  try {
    const fileTimeValue = parseInt(fileTime, 10);
    if (isNaN(fileTimeValue) || fileTimeValue === 0 || fileTimeValue === 9223372036854775807) {
      return null; // "Nunca" ou valor inválido
    }
    // Conversão FileTime para Unix timestamp
    return new Date(fileTimeValue / 10000 - 11644473600000);
  } catch {
    return null;
  }
}