import axios from 'axios';

export const authPLH = async () => {
  try {
    const response = await axios.post('https://interesting-aid-gw.aws-usw2.cloud-ara.tyk.io/playhub/authentication/tokens', {
      
    });
    const tokenPLH = response.data.AccessToken;
    console.log('Autenticado');
    return tokenPLH;
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    return null;
  }
  
}