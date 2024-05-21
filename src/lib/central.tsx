import axios from "axios";

const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;

export const handleSearchCentral = async (cleanedID: string) => {
  try {
    
    const options = {
      method: "GET",
      url: `${gateway}/appalares/info/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      }
    }

    const response = await axios.request(options);
    let cleanedResult
      if (response.status === 200) {
        const cleanedResult = {
          toastcode: 200,
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


export const handleResetPass = async (cleanedID: string, username: string) => {
    try {      
        const options = {
          method: "POST",
          url: `${gateway}/appalares/reset-password/${cleanedID}`,
          headers: {
            apikey: `${apikey}`,
          },
          validateStatus: (status: number) => {
            return (status >= 200 && status < 300) || status == 404 || status == 422;
          },
        }
        const resOptions = await axios.request(options);

          if (resOptions.data.isActive === true) {
            let Result = resOptions.data;

            const resetResponse = await axios.post('api/log', {
              user: username,
              customer: cleanedID,
              action: "Resetar Senha",
              sva: 'Central/App',
              ip: '127.0.0.1',
            });

            return Result;
          } else if (resOptions.data.isActive === false) {
            return resOptions.data.isActive
          } 
    }
      catch (error) {
        console.log('Deu erro ' ,error);
      }
  }