'use server'
import axios from "axios";
import { handleLog } from './log';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;
const appkey = process.env.NEXT_PUBLIC_APP_KEY;
const dataAtual = new Date();
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});
const fixitHeaders = new Headers();
      fixitHeaders.append("x-api-key", "55wxvkNoXH1OKuqYSkm1v8khrhxguP5z8KYSCfjm");
      fixitHeaders.append("Content-Type", "application/json");
const infoHeaders = new Headers();
      infoHeaders.append("alareskey", "e3d2dc47db72f1512b024d6ba9790b351006ef5a7cded42c36c7625977a9d253765713b7ed721117953286e3601264ddb3818140c134825a215eeb78d06fc30b");
      infoHeaders.append("alarestype", "APP");
      infoHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb3RvIjpudWxsLCJlbWFpbCI6Imp1bGlhbmF2aWVpcmFic2FudG9zQGdtYWlsLmNvbSIsInRpcG9BY2Vzc28iOjEsImRhdGFVbHRpbW9BY2VpdGUiOm51bGwsInJlZnJlc2hUb2tlbiI6IjdjMjQxODA4LTU1YTEtNDAzZi1iYWI5LTJmNTYzMzZjM2UyYSIsImFwcERlcGxveUlkIjo2NjUsImNvbnRyYXRvSWQiOjgzNSwicGVyZmlsSWQiOjIwOTEsInBlcmZpbE5vbWUiOm51bGwsInVzdWFyaW9JZCI6NTEwNSwidXN1YXJpb05vbWUiOiJKdWxpYW5hIiwidGVtYSI6bnVsbCwibG9naW4iOiI3MDQyNjU3NDQ2MCIsImNvbmNlc3NhbyI6IjIwMjMtMDgtMTJUMjA6MDI6NDQuNzY3NzM2My0wMzowMCIsImRhdGFFeHBpcmFjYW8iOiIyMDIzLTA4LTEzVDIwOjAyOjQ0Ljc2NzczNjYtMDM6MDAiLCJleHAiOjAsImlhdCI6MCwiYXVkIjpudWxsLCJpc3MiOm51bGwsImNvbnRyYXRvcyI6W10sInN1cGVyVXNlciI6ZmFsc2V9.EiHnfk0V5H3Bo5Mdg8hWTQVQEWCp3oYN-sFG7kzFzIg");
      infoHeaders.append("Content-Type", "application/json");

export const handleSearchCentral = async (cleanedID: string) => {
  try {
    
    const options = {
      method: "GET",
      url: `${gateway}/appalares/info/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      },
      agent: agent
    }

    const response = await axios.request(options);
    let cleanedResult
      if (response.status === 200) {
        const cleanedResult = {
          statusCode: 200,
          name: response.data.name,
          document: response.data.document,
          email: response.data.email,
          password: '********',
          phone: response.data.phone,
        }

        return cleanedResult;
        

      } else if (response.data.message === "NAO_ENCONTRADO") {
        cleanedResult = null
        return cleanedResult
      } else if (response.data.message === "Central Cansada") {
        console.log('API Down')
      }
  } catch (error) {
      console.log('Deu erro ' ,error);
    }
}


export const handleResetPass = async (cleanedID: string, username: string, product_name: string) => {
    try {
      const infoCentral = await fetch(`https://assinante.alaresinternet.com.br/api/jd/subscribers/${cleanedID}`, {
        method: 'GET',
        headers: infoHeaders,
        redirect: 'follow'
      });

      const resInfo = await infoCentral.json();
      const password = genPassword();
      const birthday = resInfo.birthday.split('-');
      
      const passwordRaw = JSON.stringify({
        "password": password,
        "confirmPassword": password,
        "birthDay": parseInt(birthday[2]).toString(),
        "birthMonth": parseInt(birthday[1]).toString(),
        "birthYear": parseInt(birthday[0]).toString()
      });

      const resetPassword = await fetch(`https://assinante.alaresinternet.com.br/api/jd/reset-password/${cleanedID}`, {
        method: 'PUT',
        headers: infoHeaders,
        body: passwordRaw,
      })
      const resPassword = await resetPassword.json();

      console.log(resPassword)

      if (resPassword == true) {
        const resetResponse = await handleLog(username, cleanedID, product_name, "Fixit", "127.0.0.1");
        return {
          statusCode: 200,
          password: password,
        };
      } else {
        console.log('Erro ao resetar senha')
        return {
          statusCode: 500,
          password: null,
        }
      }   
    } catch (error) {
        console.log('Deu erro ' ,error);
        throw error;
      }
}

export const handleFixitApp = async (cleanedID: string, username: string, product_name: string) => {
  try {
    const infoCentral = await fetch(`https://assinante.alaresinternet.com.br/api/jd/subscribers/${cleanedID}`, {
      method: 'GET',
      headers: {
        alareskey:
          "e3d2dc47db72f1512b024d6ba9790b351006ef5a7cded42c36c7625977a9d253765713b7ed721117953286e3601264ddb3818140c134825a215eeb78d06fc30b",
        alarestype: "APP",
        Authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb3RvIjpudWxsLCJlbWFpbCI6Imp1bGlhbmF2aWVpcmFic2FudG9zQGdtYWlsLmNvbSIsInRpcG9BY2Vzc28iOjEsImRhdGFVbHRpbW9BY2VpdGUiOm51bGwsInJlZnJlc2hUb2tlbiI6IjdjMjQxODA4LTU1YTEtNDAzZi1iYWI5LTJmNTYzMzZjM2UyYSIsImFwcERlcGxveUlkIjo2NjUsImNvbnRyYXRvSWQiOjgzNSwicGVyZmlsSWQiOjIwOTEsInBlcmZpbE5vbWUiOm51bGwsInVzdWFyaW9JZCI6NTEwNSwidXN1YXJpb05vbWUiOiJKdWxpYW5hIiwidGVtYSI6bnVsbCwibG9naW4iOiI3MDQyNjU3NDQ2MCIsImNvbmNlc3NhbyI6IjIwMjMtMDgtMTJUMjA6MDI6NDQuNzY3NzM2My0wMzowMCIsImRhdGFFeHBpcmFjYW8iOiIyMDIzLTA4LTEzVDIwOjAyOjQ0Ljc2NzczNjYtMDM6MDAiLCJleHAiOjAsImlhdCI6MCwiYXVkIjpudWxsLCJpc3MiOm51bGwsImNvbnRyYXRvcyI6W10sInN1cGVyVXNlciI6ZmFsc2V9.EiHnfk0V5H3Bo5Mdg8hWTQVQEWCp3oYN-sFG7kzFzIg",
      },
    });

    const resInfo = await infoCentral.json();

    console.log(resInfo);
    if ((infoCentral.status === 404) || (infoCentral.status === 422)) {
      console.log('Caiu no: EMAIL_NOT_FOUND');
      return {
        statusCode: 404,
        message: "EMAIL_NOT_FOUND",
      };
    } else if (infoCentral.ok) {
        const password = genPassword();
        const birthday = resInfo.birthday.split('-');
        console.log (birthday);

        const fixitRaw = JSON.stringify({
          "cpfCnpj": resInfo.cpfCnpj,
          "name": resInfo.subscriberName,
          "email": resInfo.emails[0].email+".csd",
          "password": password,
          "lastAcceptedTermsOfUse": dataAtual.toISOString(),
          "birthDay": parseInt(birthday[2]).toString(),
          "birthMonth": parseInt(birthday[1]).toString(),
          "birthYear": parseInt(birthday[0]).toString()
        });

        console.log(fixitRaw);
        const fixit = await fetch(`https://assinante.alaresinternet.com.br/api/jd/subscribers`, {
          method: 'POST',
          headers: fixitHeaders,
          body: fixitRaw,
          redirect: "follow"
        });
        const fixitResponse = await fixit.json();
        const resultLog = await handleLog(username, cleanedID, product_name, "Fixit", "127.0.0.1");
        
        console.log(fixitResponse);
        console.log(fixit)

        if (fixit.ok && resultLog.statusCode === 201) {
          console.log('Fixit resgistrado: ', resultLog);
          return {
            statusCode: 201,
            message: "Cliente resgistrado",
            password: password
          };
        } else if (!fixit.ok && fixit.status === 422) {
          return {
            statusCode: 422,
            message: "Inter create",
          }
        } else {
          return {
            statusCode: 500,
            message: "Erro interno",
          }
        }
      }
      
  } catch (erro) {
      console.error('Erro ao executar Fixit App', erro);
  }
};

function genPassword() {
  const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const caracteresEspeciais = '@#!';
  const primeiraLetra = letrasMaiusculas[Math.floor(Math.random() * letrasMaiusculas.length)];

  const outrasLetras = [];
  for (let i = 0; i < 5; i++) {
    outrasLetras.push(letrasMinusculas[Math.floor(Math.random() * letrasMinusculas.length)]);
  }

  const numero = numeros[Math.floor(Math.random() * numeros.length)];

  const caractereEspecial = caracteresEspeciais[Math.floor(Math.random() * caracteresEspeciais.length)];

  const password = primeiraLetra + outrasLetras.join('') + numero + caractereEspecial;

  return password;
}