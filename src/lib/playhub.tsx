"use server"
import axios from 'axios';
import { handleLog } from './log';
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
    const productId = resProduct.data.data

    if (productId.some((product: { ProductId: string }) => product.ProductId === 'P01')) {
      serviceStatus = 'Vinculado';
      services = 'Max';
    } else if (productId.some((product: { ProductId: string }) => product.ProductId !== 'P01')) {
      serviceStatus = 'canceled';
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
        phone: "+55"+response.data.data.Mobile,
        email: cleanedEmail,
        services: services,
        product_id: 0,
        status: serviceStatus,
        statusCode: 200,
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
      let services = 'Deezer';

      const product = {
        method: "GET",
        url: `${gateway}/deezer/product/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        }
      }
      const resProduct = await axios.request(product);

      const productId = resProduct.data.data

      if (productId.some((product: { ProductId: string }) => product.ProductId === 'DZ1')) {
        serviceStatus = 'Vinculado';
      } else if (productId.some((product: { ProductId: string }) => product.ProductId !== 'DZ1')) {
        serviceStatus = 'canceled';
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
          services: services,
          product_id: 0,
          status: serviceStatus,
          statusCode: 200,
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
    const rawSend = JSON.stringify({
      "MSISDN":phone,
      "ACTIVATION_TYPE":"msisdn",
      "PARTNER_ID":"7d4c27c1-29ff-44cc-87f2-0df37f929795",
      "PARTNER_LEGACY_ID":165,
      "COUNTRY":"BR"
    })

    const sendSMS = await fetch('https://www.deezer.com/ajax/gw-light.php?method=activate.validateSubscription&input=3&api_version=1.0&api_token=DpqdFjbu%7EuQBFDOCmwe6HX0%7Ebbkzj5pR&cid=967828361', {
      method: 'POST',
      headers: {
          'accept': '*/*',
          'accept-language': 'pt,en-US;q=0.9,en;q=0.8,es;q=0.7',
          'content-type': 'text/plain;charset=UTF-8',
          'cookie': 'dzr_uniq_id=dzr_uniq_id_frd7892a37272e4ef6f25c735efa93410b114e08; euconsent-v2=CQCrCAAQCrCAAA7ACBENA-FsAP_gAEPgAAqIKXNV_G__bWlr8X73aftkeY1P9_h77sQxBhfJE-4FzLvW_JwXx2ExNA36tqIKmRIAu3bBIQNlHJDUTVCgaogVryDMak2coTNKJ6BkiFMRO2dYCF5vmwtj-QKY5vr993dx2B-t_dr83dzyz4VHn3a5_2a0WJCdA5-tDfv9bROb-9IOd_58v4v8_F_rE2_eT1l_tevp7D9-cts7_XW-9_fff79Ln_-uB_-wUuALMNCogDLIkJCDQMIIEAKgrCAigQAAAAkDRAQAmDAp2BgEusJEAIAUAAwQAgABRkACAAASABCIAIACgQAAQCBQABgAQDAQAMDAAGACwEAgABAdAhTAggUCwASMyIhTAhCASCAlsqEEgCBBXCEIs8CCAREwUAAAJABWAAICwWBxJICViQQJcQbQAAEACAQQAVCKTswBBAGbLVXiybRlaQFo-YLntMAgAAAA.flgAAAAAAAAA; noIabVendors=[1]; ry_ry-d33z3rbr_realytics=eyJpZCI6InJ5X0Q4NEVCRkU3LTgwMEMtNDhCQi1BQjAwLTE0OUJDQ0E1MkZEMCIsImNpZCI6bnVsbCwiZXhwIjoxNzU0MDgwNDc5ODE3LCJjcyI6bnVsbH0%3D; _ga=GA1.1.511000462.1722544480; _tt_enable_cookie=1; _ttp=pp9RgNuTX23PyPKokuu-WxubO4J; _scid=76ed043a-35b7-4f3e-bbad-e04682841250; _gcl_au=1.1.869275531.1722544481; sid=fr5f195c936fd285e15b4a0543fa7e28c91d97ca; dz_lang=br; _abck=044A4133A5409BB8215A5C2B53272BC5~0~YAAQqxIuF+5OeTSRAQAArTc/PgwfHkOIy/EZ7RKNH+HIjttqWS5c8xohmv5an6m/wJELlHNkF0BFdswVGct4VP4er/PI73lre+qIBEN+MUGKaAbIwJ+angS0OwT/oZiWfWwFlUFcMuXTNWmk6fC3R/6oUP3gFtGbtMdVa84CG0CQZb51rwbMl1aGTFnCZN3pmHVsdom8t1o+mCW9x/+tP6ZuG/GP6WA84Qx0mr++uSHBJj4KfYWfq4ELal0FMlxnS//DFhUDdb69wtUVMmYbKU5CgIODuLy/pyMQiH1M/UtnE6slraF8vUlvUYtfTUETY9TDPVHQ7A2SgcgIIwN0ois8twY6FfDt5hy7PuUFpomExIUyUvYL1CrYIWV78jXDXJHFCOqQzvSMxGK+WlB+jqJqfwNbHdUB~-1~-1~-1; bm_sz=5A27B397A02A2E897C460553288A62F2~YAAQqxIuF+9OeTSRAQAArTc/PhjmzjgdbzRcGLnrv8fl5cSe/0BL+8sUBKNsLZLNobWXfE+F2uMd4P351p8NGWIgJO4OjVJkb4Dxm674x6zx8h7yt9ILDKArHwtzUyukH+oja7YAAM0NwLCrpafBF7uBJZJQpAAN9A12+wL0JkSmGE5Vr5mHJIiTZXVSKg7Tfo2jesVM9ZhbzgexduMwIwW5enr1BxSmCf38eybOHlgvLqdmDwRQvvKhOfB45UFyz73r5SHKiwDyhN4Gsp8yu2cKHsvSMGuy5X847FxkhKQLAJK/ihnKVj8Wxy4jdSfiyJZCDZD+cZpfupEosaJ7DuHPEc5uP5PrCSDUGM3jL3hYkny782Kz0D1BglI+EpexcnAP7f4XGAGu2ePUYw==~3422257~4408373; pageviewCount=1; consentMarketing=1; consentStatistics=1; _scid_r=76ed043a-35b7-4f3e-bbad-e04682841250; _ScCbts=%5B%5D; ry_ry-d33z3rbr_so_realytics=eyJpZCI6InJ5X0Q4NEVCRkU3LTgwMEMtNDhCQi1BQjAwLTE0OUJDQ0E1MkZEMCIsImNpZCI6bnVsbCwib3JpZ2luIjp0cnVlLCJyZWYiOm51bGwsImNvbnQiOm51bGwsIm5zIjpmYWxzZSwic2MiOm51bGwsInNwIjoiZGVlemVyIn0%3D; _ga_QHEXZ4K1SH=GS1.1.1723326220.2.1.1723326269.11.0.0',
          'origin': 'https://www.deezer.com',
          'priority': 'u=1, i',
          'referer': 'https://www.deezer.com/br/activate/playhubbr',
          'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'same-origin',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
          'x-deezer-user': '0'
      },
      body: rawSend
    });

    if (!sendSMS.ok) {
      throw new Error(`HTTP error! status: ${sendSMS.status}`);
    }
    
    const resSend = await sendSMS.json();
    console.log("Resposta:", resSend);

    if (resSend.results === true) {
      const resultLog = await handleLog(username, cleanedID, 'Deezer', "Reenviar link", "127.0.0.1");
          return "Sent";

      } else if (resSend.data.response === "Is already active") {
          return "Active";
        }  else {
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
          statusCode: 200,
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
        statusCode: 404,
        message: "EMAIL_NOT_FOUND",
      };
    } else if (resInfo.status === 200) {
      console.log('resInfo: ', resInfo.data);

      const Name = resInfo.data.name.trim();
      const Mobile = resInfo.data.phone.substr(3).replace('-',"")
      const Email = resInfo.data.email.trim();

      const fixit = {
        method: "POST",
        url: `${gateway}/deezer/fixit/${cleanedID}`,
        headers: {
          apikey: `${apikey}`,
        },
        data: {
          Password: cleanedID,
          Name: Name,
          Email: Email,
          Mobile: Mobile,
        },
      };

      console.log('fixit: ', fixit.data);

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