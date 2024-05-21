import axios from 'axios';

const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;

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

export const handleFixitDeezer = async (cleanedID: string, username: string) => {
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
        response: 404,
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
        const ativarResponse = await axios.post('api/log', {
          user: username,
          customer: cleanedID,
          action: "Fixit",
          sva: 'Deezer',
          ip: '127.0.0.1',
        });

        return {
          status: 200,
          message: "Refreshed",
        };
      }
    } else if (resInfo.status === 500) {
      return {
        status: 500,
        message: "API_DOWN",
      };
    }
  } catch (error) {
    console.error('Erro durante o processamento:', error)
  }
};