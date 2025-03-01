'use server'
import { handleLog } from './log';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const https = require('https');

export const handleSearchCentral = async (cleanedID: string) => {
  console.log("CleanedID: ", cleanedID);

  try {
    const infoCentral = await fetch(
      "https://atlassian-hub-fla.go.akamai-access.com/central/assinante",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpfcnpj: cleanedID }),
      }
    );

    const response = await infoCentral.json(); // Chama .json() apenas uma vez
    console.log("Resposta completa: ", response);

    if (infoCentral) {
      return {
        statusCode: 200,
        name: response.nomeassinante,
        document: response.cpfcnpj,
        email: response.email.split(";")[0],
        password: "********",
        phone: response.telefones[0].ddd+" "+response.telefones[0].telefone,
      };
    } else if (response.message === "NAO_ENCONTRADO") {
      return null;
    } else if (response.message === "Central Cansada") {
      console.log("API Down");
    }

  } catch (error) {
    console.error("Erro ao buscar dados: ", error);
  }
};
      


export const handleResetPass = async (cleanedID: string, username: string, product_name: string) => {
  try {
    const resetPassword = await fetch(`https://atlassian-hub-fla.go.akamai-access.com/central/reset-password/${cleanedID}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resPassword = await resetPassword.json();
    console.log("Resposta da API:", resPassword);

    if (resPassword.statusCode === 200) {
      const password = resPassword.password; // Senha gerada pela API
      // await handleLog(username, cleanedID, product_name, "Fixit", "127.0.0.1");

      return {
        statusCode: 200,
        password: password,
      };
    } else {
      console.log("Erro ao resetar senha:", resPassword);
      return {
        statusCode: 500,
        password: null,
      };
    }
  } catch (error) {
    console.error("Erro ao chamar API:", error);
    throw error;
  }
};


export const handleFixitApp = async (cleanedID: string, username: string, product_name: string) => {
  try {
    const infoCentral = await fetch(`https://atlassian-hub-fla.go.akamai-access.com/central/firstaccess/${cleanedID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resInfo = await infoCentral.json();
    console.log("Resposta da API:", resInfo);

    if (infoCentral.status === 404 || infoCentral.status === 422) {
      console.log("Caiu no: INTER_CREATE");
      return {
        statusCode: 422,
        message: "INTER_CREATE",
      };
    } 
    
    if (resInfo.statusCode === 200) {
        return {
          statusCode: 201,
          message: "Cliente registrado",
          password: resInfo.password,
        };
      } else if (resInfo.statusCode === 422) {
        return {
          statusCode: 422,
          message: "INTER_CREATE",
        };
      } else {
        return {
          statusCode: 500,
          message: "Erro interno ao criar assinante",
        };
      }
  } catch (error) {
    console.error("Erro ao executar Fixit App:", error);
    return {
      statusCode: 500,
      message: "Erro inesperado",
    };
  }
};