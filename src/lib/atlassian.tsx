"use server"

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", "Basic YWxhbi5hemV2ZWRvQGFsYXJlc2ludGVybmV0LmNvbS5icjpBVEFUVDN4RmZHRjA5bk1FVFdhOHlXOXd4TVVqTU5seHRUV1pGQWk5M0lBQVp4ZVNJai0yTjAtdGhPZnFQVnk2Z2cyTGt6dk1HN2NsRnB3LVFiczd2SWZpTWZ2Smp0OEZBdTJBT0hxempqbGhvTUV4SU5JQkhBYmNYakwwckh6X2xxdFVmcFd1aFVoYURwVzFXTmtsOHRWcWh4OC1WdnZvS1dtZjhtSEV5QkVNZFhvS1EwOEpDbVk9OEVDN0MwM0U=");

  const codexHeaders = new Headers();
  codexHeaders.append("Accept", "application/json");
  codexHeaders.append("Authorization", "Bearer ATCTT3xFfGN0Q82CRla25iwBKkxCr_ezjciWjHKExZf-aeGu27kSWIw0uXUVt8DEv4G8CSt5APEFZ2uur0aEAoNYYGXSikdi_RyVz4IwgjElzS1d5dEK5XyHFjfmHmP7hgNf4Ulsimr4QugVLb7myoHeLRPYua4U572yNXnC36bnoU9wcT7Isk0=9C7AB7E4");

  const usersSuspended = [
  "kXt7S@example.com",]

  async function getUserGroups(groupId: string) {
    try {
      const response = await fetch(`https://alares.atlassian.net/rest/api/3/user/groups?accountId=${groupId}`, {
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
      const getUser = await fetch(`https://alares.atlassian.net/rest/api/3/user/search?query=${email}`, {
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
        user: userData[0],
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
    const getUser = await fetch(`https://alares.atlassian.net/rest/api/3/user/search?query=${email}`, {
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

    const addDefault = await fetch(`https://alares.atlassian.net/rest/api/3/group/user?groupId=db32e550-152b-4ce2-abbf-b4bd98a6844a`, {
      method: 'POST',
      headers: myHeaders,
      body: rawGroup,
      redirect: "follow"
    });

    const addGroup = await fetch(`https://alares.atlassian.net/rest/api/3/group/user?groupId=${groupId}`, {
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
    const sendInvite = await fetch("https://alares.atlassian.net/rest/api/3/user", {
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
    return null
  }
}

export const handleSuspend = async (email: string) => {

  try {
    console.log(`Iniciando suspensão para: ${email}`);
    const getUser = await fetch(`https://alares.atlassian.net/rest/api/3/user/search?query=${email}`, {
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
      headers: codexHeaders,
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
    const response = await fetch("https://alares.atlassian.net/rest/api/3/license/approximateLicenseCount/product/jira-servicedesk", {
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