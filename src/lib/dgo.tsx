import axios from 'axios'

const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;

export const handleSearchDGO = async (cpf: string, accessToken: string) => {
  try {
    const options = {
      method: "GET",
      url: `${gateway}/alares/dgo/status/${cpf}`,
      headers: {
        apikey: `${apikey}`,
      }
    }

    const response = await axios.request(options);

    if (response.status === 200) {
      return response.data.subscriber;
    } else if (response.status === 404) {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
}