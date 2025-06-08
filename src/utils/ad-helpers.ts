/**
 * 🔧 Utilitários client-side para funções que não precisam ser server actions
 */

/**
 * Determina o status da conta baseado no userAccountControl
 */
export function getUserAccountStatus(userAccountControl: string): {
  status: 'Habilitado' | 'Desabilitado' | 'Bloqueado' | 'Desconhecido';
  color: 'green' | 'red' | 'yellow' | 'gray';
  description: string;
} {
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
 * Formata nome de grupo do DN
 */
export function formatGroupName(groupDN: string): string {
  const match = groupDN.match(/CN=([^,]+)/);
  return match ? match[1] : groupDN;
}

/**
 * Converte FileTime do AD para Date
 */
export function convertADFileTime(fileTime: string): Date | null {
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