"use server"
export const handleAssign = async (groupId: string, email: string) => {

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Authorization', `Basic ${Buffer.from(
      'alan.azevedo@alaresinternet.com.br:ATATT3xFfGF09nMETWa8yW9wxMUjMNlxtTWZFAi93IAAZxeSIj-2N0-thOfqPVy6gg2LkzvMG7clFpw-Qbs7vIfiMfvJjt8FAu2AOHqzjjlhoMExINIBHAbcXjL0rHz_lqtUfpWuhUhaDpW1WNkl8tVqhx8-VvvoKWmf8mHEyBEMdXoKQ08JCmY=8EC7C03E'
    ).toString('base64')}`);
    myHeaders.append("Cookie", "atlassian.xsrf.token=369a57a27da2da2dcbef97ea020d04f050ae2868_lin");

    const getUser = await fetch(`https://alares.atlassian.net/rest/api/3/user/search?query=${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          'alan.azevedo@alaresinternet.com.br:ATATT3xFfGF09nMETWa8yW9wxMUjMNlxtTWZFAi93IAAZxeSIj-2N0-thOfqPVy6gg2LkzvMG7clFpw-Qbs7vIfiMfvJjt8FAu2AOHqzjjlhoMExINIBHAbcXjL0rHz_lqtUfpWuhUhaDpW1WNkl8tVqhx8-VvvoKWmf8mHEyBEMdXoKQ08JCmY=8EC7C03E'
        ).toString('base64')}`,
        'Accept': 'application/json'
      }
    });

    if (!getUser.ok) {
      throw new Error(`HTTP error! status: ${getUser.status}`);
    }

    const userData = await getUser.json();
    console.log("Res1: ", userData);

    if (userData.length === 0) {
      console.log("Res2: ", userData.length);
      return 404;
    }

    const accountId = userData[0].accountId;
    const accountId2 = userData[1]?.accountId;
    console.log("Res3: ", accountId);

    const rawGroup = JSON.stringify({
      "accountId": accountId
    });
    const rawGroup2 = JSON.stringify({
      "accountId": accountId2
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

    const addGroup2 = await fetch(`https://alares.atlassian.net/rest/api/3/group/user?groupId=${groupId}`, {
      method: 'POST',
      headers: myHeaders,
      body: rawGroup2,
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
    const addGroupData2   = await addGroup2.json();
    console.log("Res5: ", rawGroup);

    if (addGroup.status === 201 || addGroup2.status === 201) {
      return 201;
    } else if (addGroup.status === 400 && addGroup2.status === 400) {
      return 400;
    }

  } catch (erro) {
    console.error('Erro ao atribuir o usuário ao grupo:', erro);
    return 400;
  }
}
