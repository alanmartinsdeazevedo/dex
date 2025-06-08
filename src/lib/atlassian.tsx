'use server';
import { GroupList } from "@/src/types/group";

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", `Basic ${process.env.ATLASSIAN_TOKEN}`);
  
  const usersSuspended = [
    "X0l9K@example.com",]

  async function getUserGroups(groupId: string) {
    try {
      const response = await fetch(`${process.env.ATLASSIAN_URL}/3/user/groups?accountId=${groupId}`, {
        method: "GET",
        headers: myHeaders,
      });
  
      if (!response.ok) {
        throw new Error(`Erro ao buscar grupos: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.error("Erro:", error);
      return null;
    }
  }
  
    
  export const searchUser = async (email: string) => {
    try {
      const getUser = await fetch(`${process.env.ATLASSIAN_URL}/3/user/search?query=${email}`, {
        method: 'GET',
        headers: myHeaders,
      });
  
      if (!getUser.ok) {
        throw new Error(`HTTP error! status: ${getUser.status}`);
      }
  
      const userData = await getUser.json();
      const atlassianUser = userData.find((user: { accountType: string; }) => user.accountType === "atlassian")?.accountId;
      const accountId = atlassianUser ? atlassianUser : userData[0]?.accountId;
  
      if (!accountId) {
        return 404;
      }
  
      const groups = await getUserGroups(accountId);
  
      const returnData = {
        user: userData.find((user: { accountType: string; }) => user.accountType === "atlassian") || userData[0],
        groups: groups,
      };
  
      console.log("User and Groups: ", returnData);
  
      return returnData;
  
    } catch (erro) {
      console.log(erro);
      return 404;
    }
  }
  
export const handleAssign = async (groupId: string, email: string) => {

  try {
    const getUser = await fetch(`${process.env.ATLASSIAN_URL}/3/user/search?query=${email}`, {
      method: 'GET',
      headers: myHeaders,
    });

    if (!getUser.ok) {
      throw new Error(`HTTP error! status: ${getUser.status}`);
    }

    const userData = await getUser.json();
    console.log("Res Data: ", userData);

    const atlassianUser = userData.find((user: { accountType: string; }) => user.accountType === "atlassian")?.accountId;
    const accountId = atlassianUser ? atlassianUser : userData.accountId;
    console.log("Res ID: ", accountId);

    if (!accountId) {
      return 404;
    }

    const rawGroup = JSON.stringify({
      "accountId": accountId
    });
    
    const groupOptions = {
      method: "POST",
      headers: myHeaders,
      body: rawGroup,
      redirect: "follow"
    };

    const addDefault = await fetch(`${process.env.ATLASSIAN_URL}/3/group/user?groupId=db32e550-152b-4ce2-abbf-b4bd98a6844a`, {
      method: 'POST',
      headers: myHeaders,
      body: rawGroup,
      redirect: "follow"
    });

    const addGroup = await fetch(`${process.env.ATLASSIAN_URL}/3/group/user?groupId=${groupId}`, {
      method: 'POST',
      headers: myHeaders,
      body: rawGroup,
      redirect: "follow"
    });

    console.log("Res4 Group: ", groupId);
    console.log("Res4 addGroup: ", addGroup);
    console.log("Res5: ", rawGroup);

    if (!addGroup.ok) {
      throw new Error(`HTTP error! status: ${addGroup.status}`);
    }

    const addDefaultData  = await addDefault.json();
    const addGroupData    = await addGroup.json();
    console.log("Res5: ", rawGroup);

    if (addGroup.status === 201) {
      return 201;
    } else if (addGroup.status === 400) {
      return 400;
    }

  } catch (erro) {
    console.error('Erro ao atribuir o usuário ao grupo:', erro);
    return 400;
  }
}


export const handleInvite = async (email: string) => {
  try {
    console.log("Email: ", email);
    const sendInvite = await fetch(`${process.env.ATLASSIAN_URL}/3/user`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        "emailAddress": email,
        "products": []
      })
    })
    console.log("Res Invite: ", sendInvite);
    if (sendInvite.status === 201) {
      return 201
    } else if (sendInvite.status === 400) {
      return 400
    }

  } catch (error) {
    return 500
  }
}

export const handleSuspend = async (email: string) => {

  try {
    console.log(`Iniciando suspensão para: ${email}`);
    const getUser = await fetch(`${process.env.ATLASSIAN_URL}/3/user/search?query=${email}`, {
      method: 'GET',
      headers: myHeaders,
    });

    if (!getUser.ok) {
      throw new Error(`HTTP error! status: ${getUser.status}`);
    }

    const userData = await getUser.json();
    console.log("Res Data: ", userData);

    const atlassianUser = userData.find((user: { accountType: string; }) => user.accountType === "atlassian" || user.accountType === "customer")?.accountId;
    const accountId = atlassianUser ? atlassianUser : userData.accountId;
    console.log("Res ID: ", accountId);

    if (!accountId) {
      return 404;
    }

    console.log("Account ID: ", accountId);
    const suspendUser = await fetch(`https://api.atlassian.com/admin/v1/orgs/da3430ak-c808-100k-k86a-c36978j6dkkj/directory/users/${accountId}/suspend-access`, {
      method: 'POST',
      headers: myHeaders,
      redirect: "follow"
    })

    if (suspendUser.status === 200) {
      return 201
    } else if (suspendUser.status === 400) {
      return 400
    }

  } catch (error) {
    return null
  }
}



export const suspendAllUsers = async () => {
  for (const email of usersSuspended) {
    try {
      const result = await handleSuspend(email);
      console.log(`Resultado da suspensão para ${email}: ${result}`);
    } catch (error) {
      console.error(`Falha ao suspender ${email}: `, error);
    }
  }
};

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


    if (data) {
      return parseInt(data.value); // Retorna o número 400 como inteiro
    } else {
      console.error("Campo <value> não encontrado no XML.");
      return 0; // Retorna null se não encontrar o valor
    }
  } catch (error) {
    console.error("Erro ao buscar dados de licença:", error);
    return 0; // Retorna null em caso de erro
  }
};

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
      console.log(`Buscando ${jql}...`);
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
    console.log("fetchAllGroups: ", data.values);

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
  const response = await fetch("${process.env.ATLASSIAN_URL}/3/group", {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      "name": name,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao criar grupo: ${response.statusText}`);
  }

  return
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  const response = await fetch(`${process.env.ATLASSIAN_URL}/3/group?groupId=${groupId}`, {
    method: 'DELETE',
    headers: myHeaders,
  });
  console.log("ID: ", groupId);
  console.log("Res Delete: ", response);

  if (!response.ok) {
    throw new Error(`Erro ao deletar grupo: ${response.statusText}`);
  }

  return;
};

export const updateGroup = async (groupId: string, newName: string): Promise<any> => {
  // Chamar API do Jira para atualizar o nome de um grupo
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
      console.log("UsersGroup: ", data.values);

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

export const fetchUserLdap = async (username: string) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/ad/user/${username}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuário: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

export const disableLdapUser = async (username: string) => {
  
}