import axios from 'axios';
import { handleLog

 } from './log';
const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;

export const handleSearchMax = async (cleanedID: string) => {

  try {
    let serviceStatus = 'canceled';
    let services = 'Max';

    // Verifica o produto
    const product = {
      method: "GET",
      url: `${gateway}/deezer/product/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      }
    };

    const resProduct = await axios.request(product);
    const productId = resProduct.data.data[0]?.ProductId;

    if (productId === 'HBX') {
      serviceStatus = 'active';
      services = 'Max';
    } else if (productId === 'P01') {
      serviceStatus = 'checkout';
      services = 'Max';
    }

    const options = {
      method: "GET",
      url: `${gateway}/deezer/info/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      }
    };

    const response = await axios.request(options);

    let cleanedEmail = response.data.data.Email;
    if (cleanedEmail === null) {
      cleanedEmail = 'Não informado';
    }

    if (response.status === 200) {
      const cleanedResult = {
        name: response.data.data.Name,
        document: response.data.data.Document,
        phone: "+55"+response.data.data.Mobile ?? '',
        email: cleanedEmail,
        services: services,
        product_id: 0,
        status: serviceStatus,
        toastcode: 200,
      };
      console.log("cleanedResult: ",cleanedResult)
      return cleanedResult;
    } else if (response.status === 404) {
      console.log('Cliente não localizado');
    }
  } catch (error) {
    console.log('Deu erro ', error);
  }
};

export const handleSearchDeezer = async (cleanedID: string) => {
  
  try {
      let serviceStatus = 'canceled';
      const product = {
        method: "GET",
        url: `${gateway}/deezer/product/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        }
      }
      const resProduct = await axios.request(product);
      if (resProduct.data.data[0]?.ProductId === 'DZ1') {
        serviceStatus = 'active'
      } else if (resProduct.data.data[0]?.ProductId != 'DZ1') {
        serviceStatus = 'canceled'
      }

      const options = {
        method: "GET",
        url: `${gateway}/deezer/info/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        }
      }
      const response = await axios.request(options);

      let cleanedEmail = response.data.data.Email;
      if (cleanedEmail === null) {
        cleanedEmail = 'Não informado'
      }

      if (response.status === 200) {
        const cleanedResult = {
          name: response.data.data.Name,
          document: response.data.data.Document,
          phone: '+55'+response.data.data.Mobile,
          email: cleanedEmail,
          services: 'Deezer',
          product_id: 0,
          status: serviceStatus,
          toastcode: 200,
        }
        return cleanedResult;

      } else if (response.status === 404) {
        console.log('Cliente não localizado')
      }
  } catch (error) {
      console.log('Deu erro ' ,error);
    }
}

export const handleReenviarDeezer = async (cleanedID: string, phone: string, username: string) => {

  
  try {
    const send = {
      method: "POST",
      url: `${gateway}/deezer/resend-sms/${phone}`,
      headers: {
        apikey: `${apikey}`,
      }
    }
    const resSend = await axios.request(send);
    
    if (resSend.status === 200) {
      if (resSend.data.response === "The SMS was sent successfully"){
          const ativarResponse = await axios.post('api/log',
            {
              user: username,
              customer: cleanedID,
              action: "Reenviar link",
              sva: 'Deezer',
              ip: '127.0.0.1'
            }
          )
          return "Sent";

      } else if (resSend.data.response === "Is already active") {
        return "Active";
      } 
    } else {
      let resError = "Erro na requisição: "+resSend.data;
      return resError;
    }
  } catch (error) {
    console.log("Erro:", error);
    return "Erro na requisição";
  }
};

export const handleSearchPortal = async (cleanedID: string) => {
  
  try {
      const options = {
        method: "GET",
        url: `${gateway}/deezer/info/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        }
      }
      const response = await axios.request(options);

      let cleanedEmail = response.data.data.Email;
      if (cleanedEmail === null) {
        cleanedEmail = 'Não informado'
      }

      if (response.status === 200) {
        const cleanedResult = {
          name: response.data.data.Name,
          document: response.data.data.Document,
          phone: '+55'+response.data.data.Mobile,
          email: cleanedEmail,
          services: 'Portal',
          product_id: 0,
          status: 'active',
          toastcode: 200,
        }
        return cleanedResult;

      } else if (response.status === 404) {
        console.log('Cliente não localizado')
      }
  } catch (error) {
      console.log('Deu erro ' ,error);
    }
}

export const handleFixitDeezer = async (cleanedID: string, username: string, product_name: string) => {
  try {
    console.log('Verificando App');
    const info = {
      method: "GET",
      url: `${gateway}/appalares/info/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      },
    };
    const resInfo = await axios.request(info);

    if (resInfo.data.email.length === 0) {
      return {
        code: 404,
        message: "EMAIL_NOT_FOUND",
      };
    } else if (resInfo.status === 200) {
      console.log('Refreshed');
      const Mobile = resInfo.data.phone;
      const fixit = {
        method: "POST",
        url: `${gateway}/deezer/fixit/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        },
        data: {
          Password: cleanedID,
          Name: resInfo.data.name,
          Email: resInfo.data.email,
          Mobile: resInfo.data.phone.substr(3).replace('-',""),
        },
      };

      const resFixit = await axios.request(fixit);

      if (resFixit.status === 200) {
        const resultLog = await handleLog(username, cleanedID, product_name, "Fixit", "127.0.0.1");
        return resultLog;
      }
    }
  } catch (erro) {
    console.log('Erro ao registrar Log Fixit', erro);
  }
};