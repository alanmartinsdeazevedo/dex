import axios from 'axios';

const CLTH = process.env.NEXT_PUBLIC_CLH_API_KEY;

export const authCLH = async () => {
  try {
    const response = await axios.post('https://api.celetihub.com.br/api/authenticate', {
      access_token: CLTH,
    });

    const { tokenCLH } = response.data.authorization;
    console.log('Autenticado');
    return tokenCLH;
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    return null;
  }
  
}