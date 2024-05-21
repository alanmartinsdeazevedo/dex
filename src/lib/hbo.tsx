import axios from 'axios';

const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;

export const handleSearchHBO = async (cleanedID: string) => {

  try {
    let serviceStatus = 'canceled';
    let services = 'Deezer';

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
        phone: response.data.Mobile.replace(/(\d{2})(\d{5})(\d{4})/, '+55 ($1) $2-$3'),
        email: cleanedEmail,
        services: services,
        product_id: 0,
        status: serviceStatus,
        toastcode: 200,
      };
      return cleanedResult;
    } else if (response.status === 404) {
      console.log('Cliente não localizado');
    }
  } catch (error) {
    console.log('Deu erro ', error);
  }
};

export const handleResetHBO = async (cleanedID: string, username: string) => {
  try {
    const options = {
      method: "PUT",
      url: `https://interesting-aid-gw.aws-usw2.cloud-ara.tyk.io/playhub/customers/${cleanedID}`,
      headers: {
        IntegrationSecret: 'fa2895c6-a7eb-43c1-88b2-11143a4029f4',
      },
      data: {
        Password: cleanedID,
      }
    }
    const resetHBO = await axios.request(options)


      if (resetHBO.status === 200) {
        const ativarResponse = await axios.post('api/log',
          {
            user: username,
            customer: cleanedID,
            action: "Reset de senha",
            sva: `HBO`,
            ip: "127.0.0.1"
          }
        )
        return 200;
      } 

  } catch (error) {
    console.log(error);
    }
}
