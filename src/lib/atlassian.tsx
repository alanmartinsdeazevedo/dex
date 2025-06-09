'use server';
import { GroupList } from "@/src/types/group";

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", `Basic ${process.env.ATLASSIAN_TOKEN}`);

const usersSuspended = [
  "X0l9K@example.com",
];

// ==================== FUNÇÕES AUXILIARES ====================

async function getUserGroups(accountId: string) {
  try {
    const response = await fetch(`${process.env.ATLASSIAN_URL}/3/user/groups?accountId=${accountId}`, {
      method: "GET",
      headers: myHeaders,
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar grupos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar grupos do usuário:", error);
    return null;
  }
}

async function checkUserSuspensionStatus(accountId: string) {
  try {
    const response = await fetch(`https://api.atlassian.com/admin/v1/orgs/da3430ak-c808-100k-k86a-c36978j6dkkj/directory/users/${accountId}`, {
      method: "GET",
      headers: myHeaders,
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        exists: true,
        suspended: userData.account_status === 'suspended' || userData.status === 'suspended',
        userData: userData
      };
    }
    
    return { exists: false, suspended: false, userData: null };
  } catch (error) {
    console.error("Erro ao verificar status de suspensão:", error);
    return { exists: false, suspended: false, userData: null };
  }
}

// ==================== FUNÇÕES DE USUÁRIOS ====================

export const searchUser = async (email: string) => {
  try {
    console.log(`Buscando usuário: ${email}`);
    
    // Primeira tentativa: busca padrão no Jira
    const getUser = await fetch(`${process.env.ATLASSIAN_URL}/3/user/search?query=${email}`, {
      method: 'GET',
      headers: myHeaders,
    });

    if (!getUser.ok) {
      throw new Error(`HTTP error! status: ${getUser.status}`);
    }

    const userData = await getUser.json();
    console.log("Dados da busca inicial:", userData);

    // Se encontrou usuário na busca padrão
    if (userData && userData.length > 0) {
      const atlassianUser = userData.find((user: { accountType: string; }) => user.accountType === "atlassian");
      const selectedUser = atlassianUser || userData[0];
      const accountId = selectedUser?.accountId;

      if (accountId) {
        // Verificar status de suspensão via API Admin
        const suspensionStatus = await checkUserSuspensionStatus(accountId);
        const groups = await getUserGroups(accountId);

        const returnData = {
          user: {
            ...selectedUser,
            suspended: suspensionStatus.suspended,
            adminData: suspensionStatus.userData
          },
          groups: groups || [],
          foundViaAdmin: false
        };

        console.log("Usuário encontrado (busca padrão):", returnData);
        return returnData;
      }
    }

    // Segunda tentativa: busca via API Admin (para usuários suspensos)
    console.log("Usuário não encontrado na busca padrão, tentando API Admin...");
    
    try {
      const adminSearchResponse = await fetch(`https://api.atlassian.com/admin/v1/orgs/da3430ak-c808-100k-k86a-c36978j6dkkj/directory/users/search?query=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: myHeaders,
      });

      if (adminSearchResponse.ok) {
        const adminData = await adminSearchResponse.json();
        console.log("Dados da busca Admin:", adminData);

        if (adminData && adminData.data && adminData.data.length > 0) {
          const adminUser = adminData.data.find((user: any) => 
            user.email?.toLowerCase() === email.toLowerCase()
          );

          if (adminUser) {
            // Criar objeto compatível com a estrutura esperada
            const compatibleUser = {
              accountId: adminUser.account_id,
              displayName: adminUser.name || adminUser.email,
              emailAddress: adminUser.email,
              accountType: "atlassian",
              active: adminUser.account_status !== 'suspended',
              suspended: adminUser.account_status === 'suspended',
              avatarUrls: {
                "48x48": adminUser.picture || "",
                "24x24": adminUser.picture || "",
                "16x16": adminUser.picture || ""
              },
              adminData: adminUser
            };

            const groups = await getUserGroups(adminUser.account_id) || [];

            const returnData = {
              user: compatibleUser,
              groups: groups,
              foundViaAdmin: true
            };

            console.log("Usuário encontrado (via Admin API):", returnData);
            return returnData;
          }
        }
      }
    } catch (adminError) {
      console.error("Erro na busca Admin:", adminError);
    }

    // Se chegou até aqui, usuário não foi encontrado
    console.log("Usuário não encontrado em nenhuma busca");
    return 404;

  } catch (error) {
    console.error("Erro geral na busca do usuário:", error);
    return 404;
  }
};

export const handleAssign = async (groupId: string, email: string) => {
  try {
    console.log(`Atribuindo usuário ${email} ao grupo ${groupId}`);
    
    // Buscar o usuário primeiro
    const userSearchResult = await searchUser(email);
    
    if (userSearchResult === 404) {
      console.log("Usuário não encontrado para atribuição");
      return 404;
    }

    const accountId = userSearchResult.user.accountId;
    console.log("Account ID para atribuição:", accountId);

    if (!accountId) {
      return 404;
    }

    const rawGroup = JSON.stringify({
      "accountId": accountId
    });
    
    // Adicionar ao grupo padrão "Públicos"
    const addDefault = await fetch(`${process.env.ATLASSIAN_URL}/3/group/user?groupId=db32e550-152b-4ce2-abbf-b4bd98a6844a`, {
      method: 'POST',
      headers: myHeaders,
      body: rawGroup,
      redirect: "follow"
    });

    // Adicionar ao grupo específico
    const addGroup = await fetch(`${process.env.ATLASSIAN_URL}/3/group/user?groupId=${groupId}`, {
      method: 'POST',
      headers: myHeaders,
      body: rawGroup,
      redirect: "follow"
    });

    console.log("Resposta da atribuição:", addGroup.status);

    if (addGroup.status === 201) {
      return 201;
    } else if (addGroup.status === 400) {
      return 400;
    } else {
      return 500;
    }

  } catch (error) {
    console.error('Erro ao atribuir o usuário ao grupo:', error);
    return 500;
  }
};

export const handleInvite = async (email: string) => {
  try {
    console.log(`Enviando convite para: ${email}`);
    
    const sendInvite = await fetch(`${process.env.ATLASSIAN_URL}/3/user`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        "emailAddress": email,
        "products": []
      })
    });

    console.log("Resposta do convite:", sendInvite.status);
    
    if (sendInvite.status === 201) {
      return 201;
    } else if (sendInvite.status === 400) {
      return 400;
    } else {
      return 500;
    }

  } catch (error) {
    console.error("Erro ao enviar convite:", error);
    return 500;
  }
};

export const handleSuspend = async (email: string) => {
  try {
    console.log(`Suspendendo usuário: ${email}`);
    
    // Buscar o usuário primeiro
    const userSearchResult = await searchUser(email);
    
    if (userSearchResult === 404) {
      console.log("Usuário não encontrado para suspensão");
      return 404;
    }

    const accountId = userSearchResult.user.accountId;
    
    if (!accountId) {
      console.log("Account ID não encontrado");
      return 404;
    }

    console.log("Account ID para suspensão:", accountId);
    
    const suspendUser = await fetch(`https://api.atlassian.com/admin/v1/orgs/da3430ak-c808-100k-k86a-c36978j6dkkj/directory/users/${accountId}/suspend-access`, {
      method: 'POST',
      headers: myHeaders,
      redirect: "follow"
    });

    console.log("Resposta da suspensão:", suspendUser.status);

    if (suspendUser.status === 200 || suspendUser.status === 204) {
      return 201;
    } else if (suspendUser.status === 400) {
      return 400;
    } else {
      return 500;
    }

  } catch (error) {
    console.error("Erro ao suspender usuário:", error);
    return 500;
  }
};

export const handleReactivate = async (email: string) => {
  try {
    console.log(`Reativando usuário: ${email}`);
    
    const userSearchResult = await searchUser(email);
    
    if (userSearchResult === 404) {
      console.log("Usuário não encontrado para reativação");
      return 404;
    }

    const accountId = userSearchResult.user.accountId;
    
    if (!accountId) {
      console.log("Account ID não encontrado");
      return 404;
    }

    console.log("Account ID para reativação:", accountId);
    
    const reactivateUser = await fetch(`https://api.atlassian.com/admin/v1/orgs/da3430ak-c808-100k-k86a-c36978j6dkkj/directory/users/${accountId}/restore-access`, {
      method: 'POST',
      headers: myHeaders,
      redirect: "follow"
    });

    console.log("Resposta da reativação:", reactivateUser.status);

    if (reactivateUser.status === 200 || reactivateUser.status === 204) {
      return 201;
    } else if (reactivateUser.status === 400) {
      return 400;
    } else {
      return 500;
    }

  } catch (error) {
    console.error("Erro ao reativar usuário:", error);
    return 500;
  }
};

export const suspendAllUsers = async () => {
  console.log("Suspendendo todos os usuários da lista...");
  
  for (const email of usersSuspended) {
    try {
      const result = await handleSuspend(email);
      console.log(`Resultado da suspensão para ${email}: ${result}`);
    } catch (error) {
      console.error(`Falha ao suspender ${email}: `, error);
    }
  }
};

// ==================== FUNÇÕES DE LICENÇAS ====================

export const licenseUse = async (): Promise<number | null> => {
  try {
    const response = await fetch(`${process.env.ATLASSIAN_URL}/3/license/approximateLicenseCount/product/jira-servicedesk`, {
      method: 'GET',
      headers: myHeaders,
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.value) {
      return parseInt(data.value);
    } else {
      console.error("Campo <value> não encontrado na resposta.");
      return 0;
    }
  } catch (error) {
    console.error("Erro ao buscar dados de licença:", error);
    return 0;
  }
};

// ==================== FUNÇÕES DE ISSUES ====================

export const fetchIssueCount = async () => {
  const ISSUE_TYPES_JQL: Record<string, string> = {
    "Governança": 'project = GSTI AND resolution = Unresolved AND status NOT IN ("Em validação", "Aguardando Controles Internos", "Aguardando Solicitante") AND "grupo solucionador[dropdown]" = "Governança de TI"',
    "Infraestrutura": 'project = GSTI AND resolution = Unresolved AND status NOT IN ("Em validação", "Aguardando Controles Internos", "Aguardando Solicitante") AND "grupo solucionador[dropdown]" = "Infraestrutura"',
    "Controles Internos": 'project = GSTI AND resolution = Unresolved AND status NOT IN ("Em validação", "Aguardando Controles Internos", "Aguardando Solicitante") AND "grupo solucionador[dropdown]" = "Controles Internos"',
    "Billing": 'project = GSTI AND resolution = Unresolved AND status NOT IN ("Em validação", "Aguardando Controles Internos", "Aguardando Solicitante") AND "grupo solucionador[dropdown]" = "Billing & Financial"',
    "Massivo Total": 'project = GSTI AND resolution = Unresolved AND status NOT IN ("Em validação", "Aguardando Controles Internos", "Aguardando Solicitante") AND "gravidade do incidente[dropdown]" = "Massivo Total"',
    "Massivo Parcial": 'project = GSTI AND resolution = Unresolved AND status NOT IN ("Em validação", "Aguardando Controles Internos", "Aguardando Solicitante") AND "gravidade do incidente[dropdown]" = "Massivo Parcial"',
  };

  const results: Record<string, number> = {};

  try {
    for (const [type, jql] of Object.entries(ISSUE_TYPES_JQL)) {
      console.log(`Buscando ${type}...`);
      const response = await fetch(`${process.env.ATLASSIAN_URL}/3/search/approximate-count`, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ jql }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar ${type}: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Total de ${type}: ${data.count}`);
      results[type] = data.count || 0;
    }

    return results;
  } catch (error) {
    console.error("Erro ao buscar dados do Jira:", error);
    return Object.fromEntries(Object.keys(ISSUE_TYPES_JQL).map(key => [key, 0]));
  }
};

// ==================== FUNÇÕES DE GRUPOS ====================

export const fetchAllGroups = async (startAt: number = 0, maxResults: number = 10): Promise<GroupList> => {
  try {
    const response = await fetch(`${process.env.ATLASSIAN_URL}/3/group/bulk?startAt=${startAt}&maxResults=${maxResults}`, {
      method: 'GET',
      headers: myHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetchAllGroups:", data.values);

    return {
      values: data.values ?? [],
      startAt: data.startAt ?? 0,
      maxResults: data.maxResults ?? 10,
      total: data.total ?? 0,
      isLast: data.isLast ?? true,
    };
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return { values: [], startAt, maxResults, total: 0, isLast: true };
  }
};

export const createGroup = async (name: string): Promise<any> => {
  try {
    const response = await fetch(`${process.env.ATLASSIAN_URL}/3/group`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        "name": name,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar grupo: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  try {
    const response = await fetch(`${process.env.ATLASSIAN_URL}/3/group?groupId=${groupId}`, {
      method: 'DELETE',
      headers: myHeaders,
    });
    
    console.log("Deletando grupo ID:", groupId);
    console.log("Resposta da exclusão:", response.status);

    if (!response.ok) {
      throw new Error(`Erro ao deletar grupo: ${response.statusText}`);
    }

    return;
  } catch (error) {
    console.error("Erro ao deletar grupo:", error);
    throw error;
  }
};

export const updateGroup = async (groupId: string, newName: string): Promise<any> => {
  // TODO: Implementar atualização de grupo quando necessário
  console.log(`Atualizar grupo ${groupId} para ${newName} - Não implementado`);
};

export const fetchGroupUsers = async (groupId: string, startAt: number = 0, maxResults: number = 10) => {
  try {
    const response = await fetch(`${process.env.ATLASSIAN_URL}/3/group/member?groupId=${groupId}&startAt=${startAt}&maxResults=${maxResults}`, {
      method: "GET",
      headers: myHeaders,
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuários do grupo: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Usuários do grupo:", data.values);

    return data;

  } catch (error) {
    console.error("Erro ao buscar usuários do grupo:", error);
    return {
      values: [],
      startAt: 0,
      maxResults: 0,
      total: 0,
      isLast: true,
    };
  }
};

// ==================== FUNÇÕES LDAP ====================

export const fetchUserLdap = async (username: string) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/ad/user/${username}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário LDAP: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar usuário LDAP:", error);
    return null;
  }
};

export const disableLdapUser = async (username: string) => {
  // TODO: Implementar desabilitação de usuário LDAP quando necessário
  console.log(`Desabilitar usuário LDAP ${username} - Não implementado`);
};