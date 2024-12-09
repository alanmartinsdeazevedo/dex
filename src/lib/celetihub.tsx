"use server"
import axios from 'axios';
import { handleLog } from './log';

const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
const apikey = process.env.NEXT_PUBLIC_API_KEY;
const GloboplayID = [1, 2, 6, 7, 25];
const TelecineID = [4, 10];
const PremiereID = [3];

export const handleSearchGloboPlay = async (cleanedID: string) => {

  try {
    const options = {
      method: "GET",
      url: `${gateway}/globoplay/info/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      }
    }

    const response = await axios.request(options);
    if (response.status === 200) {
      const subscriber = response.data.subscriber;
      const isGPL = subscriber.services.find((service: { content_supplier_product_id: number; }) => 
        GloboplayID.includes(service.content_supplier_product_id)
        );
      const activeService = subscriber.services.find((service: {
        content_supplier_product_id: number; status: string; }) => 
          (service.status === 'checkout' || service.status === 'active' || service.status === 'suspend') && GloboplayID.includes(service.content_supplier_product_id) 
      );
        
  
      if (activeService && isGPL) {
        return {
          name: subscriber.name,
          document: subscriber.document,
          phone: subscriber.phone,
          email: subscriber.email,
          services: activeService.content_supplier_product_name,
          product_id: activeService.content_supplier_product_id,
          status: activeService.status,
          statusCode: 200,
        };
      }
      console.log("subscriber: ", subscriber)
    }
      
  } catch (error) {
      let cleanedResult = null
      return cleanedResult;
    }
}

export const handleSearchTelecine = async (cleanedID: string) => {

    try {
      const options = {
        method: "GET",
        url: `${gateway}/globoplay/info/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        }
      }
  
      const response = await axios.request(options);
    
    if (response.status === 200) {
      const subscriber = response.data.subscriber;
      const isTLC = subscriber.services.find((service: { content_supplier_product_id: number; }) => 
        TelecineID.includes(service.content_supplier_product_id)
        );
        console.info("isTLC: ", isTLC)
        const activeService = subscriber.services.find((service: {
          content_supplier_product_id: number; status: string; }) => 
          (service.status === 'checkout' || service.status === 'active' || service.status === 'suspend') && TelecineID.includes(service.content_supplier_product_id) 
        );
        console.info("activeService: ", activeService)
  
      if (activeService && isTLC) {
          return {
            name: subscriber.name,
            document: subscriber.document,
            phone: subscriber.phone,
            email: subscriber.email,
            services: 'Telecine',
            product_id: activeService.content_supplier_product_id,
            status: activeService.status,
            statusCode: 200,
          };
        }
      }
        
    } catch (error) {
        let cleanedResult = null
        return cleanedResult;
      }
}

export const handleSearchPremiere = async (cleanedID: string) => {

    try {
      const options = {
        method: "GET",
        url: `${gateway}/globoplay/info/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        }
      }
  
      const response = await axios.request(options);
      
      if (response.status === 200) {
        const subscriber = response.data.subscriber;
        const isPMR = subscriber.services.find((service: { content_supplier_product_id: number; }) => 
          PremiereID.includes(service.content_supplier_product_id)
          );
          const activeService = subscriber.services.find((service: {
            content_supplier_product_id: number; status: string; }) => 
              (service.status === 'checkout' || service.status === 'active' || service.status === 'suspend') && PremiereID.includes(service.content_supplier_product_id) 
          );
    
        if (activeService && isPMR) {
          return {
            name: subscriber.name,
            document: subscriber.document,
            phone: subscriber.phone,
            email: subscriber.email,
            services: 'Premiere',
            product_id: activeService.content_supplier_product_id,
            status: activeService.status,
            statusCode: 200,
          };
        }
      }
        
    } catch (error) {
        let cleanedResult = null
        return cleanedResult;
      }
}

export const handleReenviarCLH = async (cleanedID: string, product_id: number, username: string) => {

  function isProduct(product_id: number | undefined): string {
    if (product_id === undefined) {
      throw new Error('Product ID is undefined');
    }

    const product: Record<number, string> = {
      1: 'Globoplay',
      2: 'Globoplay',
      3: 'Premiere',
      4: 'Telecine',
      6: 'Globoplay',
      7: 'Globoplay',
      10: 'Telecine',
    };

    return product[product_id] || 'Globoplay';
  }
  const product_name = isProduct(product_id)

  try {
    const options = {
      method: "POST",
      url: `${gateway}/globoplay/resend-email/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      },
      data: {
        "product_id": product_id
      }
    }
    
    const resendGP = await axios.request(options)

      if (resendGP.status === 200) {
        const resultLog = await handleLog(username, cleanedID, product_name, "Reenviar link", "127.0.0.1" )
      } 
  } catch (error) {
    console.log(error)
  }
}

export const handleFixitGloboPlay = async (cleanedID: string, username: string, product_name: string) => {
  try {
    const info = {
      method: "GET",
      url: `${gateway}/appalares/info/${cleanedID}`,
      headers: {
        apikey: `${apikey}`,
      },
    };
    console.info("Fixit: ", info)
    const resInfo = await axios.request(info);

    if (resInfo.data.email === 'Por favor, verifique o email.') {
      console.log('Caiu no: EMAIL_NOT_FOUND');
      return {
        statusCode: 404,
        message: "EMAIL_NOT_FOUND",
      };
    } else if (resInfo.status === 200) {
      const fixit = {
        method: "POST",
        url: `${gateway}/globoplay/fixit/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        },
        data: {
          email: resInfo.data.email,
          name: resInfo.data.name,
          document: cleanedID,
          phone: resInfo.data.phone,
          internet_speed_id: 28,
          customer_plan: "",
        },
      };

      const resFixit = await axios.request(fixit);
      const resultLog = await handleLog(username, cleanedID, product_name, "Fixit", "127.0.0.1" )

      return resultLog
      };
      
  } catch (erro) {
    console.log('Erro ao registrar Log Fixit', erro)
    }
}