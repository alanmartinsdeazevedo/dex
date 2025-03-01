import React from 'react';
import { useState, useEffect } from 'react';
import Avatar from './avatar';
import Reenviar from './reenviar';
import Fixit from './fixit';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react'
import { handleReenviarCLH, handleSearchGloboPlay, handleSearchTelecine, handleFixitGloboPlay, handleSearchPremiere} from '@/src/lib/celetihub';
import { handleFixitApp, handleResetPass, handleSearchCentral } from '@/src/lib/central';
import { handleSearchMax, handleFixitDeezer, handleReenviarDeezer, handleSearchDeezer, handleSearchPortal } from '@/src/lib/playhub';
import { handleSearchExitLag, handleReenviarSP, handleFixitSP } from '@/src/lib/superplayer';
import { getNotifications } from '../app/api/auth/[...nextauth]/notifications';
import { DarkThemeToggle, Alert } from 'flowbite-react';
import Logo from './icons';

interface Subscriber {
  name: string;
  document: string;
  phone: string;
  email: string;
  services: string;
  product_id: number;
  status: string;
  statusCode: number
}

interface Custumer {
  statusCode: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  password: string
}

function showConfetti() {
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 1, y: 1 },
    decay: 0.9,
    gravity: 0.7
  });
}

export default function Index(){
  const [cpf, setCpf] = useState('')
  const [subscriberData, setSubscriberData] = useState<Subscriber | null>();
  const [subscriberApp, setSubscriberApp] = useState<Custumer | null>();
  const [newPass, setNewPass] = useState<string | null>()
  const [isSuperUser, setIsSuperUser] = useState<boolean | null>(false)
  const [dataFetched, setDataFetched] = useState(false)
  const [svaSelect, setSvaSelect] = useState('Globoplay')
  const notify = () => toast("Wow")
  const { data: session } = useSession()
  const userName = session?.user?.name
  const userEmail = session?.user?.email
  const userImage = session?.user?.image
  //const notifications = getNotifications('1')
  const cleanCpf = (inputCpf: string) => {
    return inputCpf.replace(/[./-\s]/g, '')
  }
  const cleanedID = cleanCpf(cpf)
  console.log("Session: ", session)

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      position: "bottom-right",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const showWarnToast = (message: string) => {
    toast.warn(message, {
      position: "bottom-right",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: "bottom-right",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  let action = svaSelect && {
    'App': 'Resetar senha',
    'Deezer': 'Reenviar SMS',
    'Globoplay': 'Reenviar link',
    'ExitLag': 'Reenviar link',
    'Telecine': 'Reenviar link',
    'Premiere': 'Reenviar link',
    'Max': '',
    'Portal': ''
  }[svaSelect] || '';

  useEffect(() => {
    if (subscriberData?.statusCode === 200 || subscriberApp?.statusCode === 200) {
      toast.success('Localizado!', {
        position: "bottom-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else if (subscriberData === null || subscriberApp === null) {
      toast.error('CPF não localizado', {
        position: "bottom-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [subscriberData, subscriberApp]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (session?.user.role !== 'Colaborador') {
      setIsSuperUser(true);
    }

    if (svaSelect === "Globoplay") {
      console.log('App: ', svaSelect)
      const resultGP = await handleSearchGloboPlay(cleanedID);
      setSubscriberApp(null);
      setSubscriberData(resultGP);
    } else if (svaSelect === "Telecine") {
      const resultTLC = await handleSearchTelecine(cleanedID);
      setSubscriberApp(null)
      setSubscriberData(resultTLC)
    } else if (svaSelect === "Premiere") {
      const resultPRM = await handleSearchPremiere(cleanedID);
      setSubscriberApp(null)
      setSubscriberData(resultPRM)
    } else if (svaSelect === "Deezer") {
      const resultDZR = await handleSearchDeezer(cleanedID);
      setSubscriberApp(null)
      setSubscriberData(resultDZR || null)
    } else if (svaSelect === "Max") {
      console.log('Max')
      const resultHBO = await handleSearchMax(cleanedID);
      console.log(resultHBO)
      setSubscriberData(resultHBO || null);
    } else if (svaSelect === "ExitLag") {
      const resultExitLag = await handleSearchExitLag(cleanedID);
      setSubscriberApp(null)
      setSubscriberData(resultExitLag || null)
      console.log(resultExitLag)
    }else if (svaSelect === "App") {
      console.log('App: ', svaSelect)
      const resultApp = await handleSearchCentral(cleanedID);
      console.log(resultApp)
      setNewPass(null)
      setSubscriberData(null)
      setSubscriberApp(resultApp);
      setDataFetched(true);
    } else if (svaSelect === "Portal") {
      const resultPortal = await handleSearchPortal(cleanedID);
      setSubscriberApp(null)
      setSubscriberData(resultPortal || null)
    } else {
      console.log('Opção não definida')
    }
    console.log("SubscriberData: ", subscriberData)
  }
  
  const handleAction = async () => {
    const { status, product_id, phone, services, email } = subscriberData ?? {};

    if (svaSelect === 'Globoplay' || svaSelect === 'Telecine' || svaSelect === 'Premiere') {
      if (status === 'checkout') {
        const result = await handleReenviarCLH(cleanedID, product_id ?? 0, userName || '');
        toast.success('Link de ativação enviado!', {
          position: 'bottom-right',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      } else if (status === 'active') {
        toast.error(`Ops! Cliente esperto. Já ativou o ${services}. 😎`, {
          position: 'bottom-right',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      } 
    } else if (svaSelect === 'Deezer') {
      const result = await handleReenviarDeezer(cleanedID, phone ?? '', userName || '');
      if (result === 'Sent') {
        showSuccessToast('SMS de ativação enviado!');
      } else if (result === 'Active') {
        showErrorToast('A festa está rolando! | Já foi ativado');
      }
    } else if (svaSelect === 'ExitLag' && status === 'active') {
      const result = await handleReenviarSP( email || '', cleanedID);
      console.log(result)
      if (result === 'Resended') {
        showSuccessToast('Link de ativação enviado!');
      } else {
        showErrorToast('Sinto uma perturbação na força 😖. Por favor, tente novamente mais tarde.');
      }

    } else if (svaSelect === 'App') {
      const result = await handleResetPass(cleanedID, userName || '', 'App/Central');
      if (result.statusCode === 200) {
        setNewPass(result.password);
        showSuccessToast('Senha resetada com sucesso!');
      } else if (result.statusCode === 500) {
        showErrorToast('Cliente não realizou o primeiro acesso');
      }
    } else if (status === 'suspend') {
      showWarnToast('O SVA está cancelado ou supenso.');
    }
  };

  const handleFixit = async () => {
    console.log('svaSelect:', svaSelect);
    const services = subscriberData?.services ?? 'Erro Product Name';

    if (svaSelect === 'Globoplay' || svaSelect === 'Telecine' || svaSelect === 'Premiere') {
      const resultFixit = await handleFixitGloboPlay(cleanedID, userName||'', services);
      if (resultFixit === 201) {
        showSuccessToast('Cliente atualizado! 🎉');
        showConfetti();
      } else if (resultFixit === 404) {
        showWarnToast('Por favor, verifique o email. 📭');
      } else {
        showErrorToast('Sistema indisponivel 😖, tente novamente mais tarde');
      }
    } else if (svaSelect === 'App') {
      const resultFixit = await handleFixitApp(cleanedID, userName||'', 'App/Central');
      console.log('resultFixit: ', resultFixit)
      if (resultFixit?.statusCode === 201) {
        setNewPass(resultFixit.password);
        showSuccessToast('Cliente registrado! 🎉');
        showConfetti();
      } else if (resultFixit?.statusCode === 422) {
        showWarnToast('Cliente já está registrado. 😾');
      } else {
        showErrorToast('Sinto uma perturbação na força 😖. Por favor, tente novamente mais tarde.');
      }
    } else if (svaSelect === 'Deezer' || svaSelect === 'Portal' || svaSelect === 'Max') {
      const resultFixit = await handleFixitDeezer(cleanedID, userName||'', services);
      if (resultFixit === 201) {
        showSuccessToast('Cliente atualizado! 🎉');
        showConfetti();
      } else if (resultFixit === 400) {
        showWarnToast('Por favor, corrija os dados no i-Manager 👨‍💻');
      } else {
        showErrorToast('Sistema indisponivel 😖, tente novamente mais tarde');
      }
    }
  }

  return (
    
    <>
    <nav className="block w-full max-w-screen-xl px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3 mt-4">
      {/* Logo e User Actions ficam em uma coluna para telas pequenas */}
      <div className="flex flex-row items-center justify-between w-full sm:w-auto sm:gap-4 mb-4 sm:mb-0">
        {/* Logo Section */}
        <div className="flex items-center justify-start sm:justify-start">
          <Logo className="h-8 mr-3 dark:text-white" />
          <span className="text-2xl font-semibold whitespace-nowrap dark:text-white">Dex</span>
        </div>

        <div className="flex items-center min-w-96 mx-auto p-4">
          <form onSubmit={handleSearch}>
          <div className="flex items-center relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
            
          <select 
            onChange={(e) => {setSvaSelect(e.target.value)}} 
            id="sva" 
            className="px-4 bg-transparent border-hidden text-gray-900 text-sm block md:w-auto rounded-lg border dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white">
            <option value="Globoplay">Globoplay</option>
            <option value="Telecine">Telecine</option>
            <option value="Premiere">Premiere</option>
            <option value="Deezer">Deezer</option>
            <option value="Max">Max</option>
            <option value="ExitLag">ExitLag</option>
            <option value="App">App/Central</option>
            <option value="Portal">Portal do Assinante</option>
          </select>
            <input
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              type="text"
              id="default-search"
              className="block w-full p-4 pl-12 bg-transparent text-sm text-gray-900 border border-hidden border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Informe o CPF..."
              required
            />
            <button
              type="submit"
              className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg className="w-4 h-4 text-white-500 dark:text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </button>
            </div>
          </form>
      </div>

        {/* User Actions Section */}
        <div className="flex items-center justify-end sm:justify-end gap-4 mt-4 sm:mt-0">
          <Alert />
          <DarkThemeToggle />
          <Avatar />
        </div>
      </div>

      {/* Search Section */}
    </nav>

    <div className='flex items-center justify-center pt-20'> 
    <div className="flex items-center justify-center px-6 py-8 mx-auto h-96 lg:py-0">
      <div className='flex flex-row items-center justify-center'>

      {subscriberApp && (
        <div className='flex max-w-7xl sm:px-6 lg:px-8'>
        <div className="w-96 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-700 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">App | Central</h5>
          {(<Fixit onFixit={handleFixit} toast={notify} action={action} />)}
        </div>

        <div className="flex items-baseline text-gray-900 dark:text-white">
            <span className="ml-1 text-xl font-normal text-gray-500 dark:text-gray-400">
                {subscriberApp.name}
            </span>
        </div>
        <ul role="list" className="space-y-5 my-7">
            <li className="flex space-x-3 items-center">
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.656 12.115a3 3 0 0 1 5.682-.015M13 5h3m-3 3h3m-3 3h3M2 1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Zm6.5 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
              </svg>
              <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                {subscriberApp.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
              </span>
            </li>
            <li className="flex space-x-3">
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.344 12.168-1.4-1.4a1.98 1.98 0 0 0-2.8 0l-.7.7a1.98 1.98 0 0 1-2.8 0l-2.1-2.1a1.98 1.98 0 0 1 0-2.8l.7-.7a1.981 1.981 0 0 0 0-2.8l-1.4-1.4a1.828 1.828 0 0 0-2.8 0C-.638 5.323 1.1 9.542 4.78 13.22c3.68 3.678 7.9 5.418 11.564 1.752a1.828 1.828 0 0 0 0-2.804Z"/>
              </svg>
              <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
              {subscriberApp.phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 ($2) $3-$4')}
              </span>
            </li>
            <li className="flex space-x-3">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4a4 4 0 0 1 4 4v6M5 4a4 4 0 0 0-4 4v6h8M5 4h9M9 14h10V8a3.999 3.999 0 0 0-2.066-3.5M9 14v5m0-5h4v5m-9-8h2m8-4V1h2"/>
                </svg>
                <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                  {subscriberApp.email}
                </span>
            </li>
            <li className="flex space-x-3">
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 3 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"/>
            </svg>
                <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                  {newPass || subscriberApp.password}
                </span>
            </li>
        </ul>
        <div className='text-gray-500 dark:text-white'>
        <h3>Devido a uma alteração na central do assinante, esta opção foi desabilitada.</h3>
        <h3>Voltaremos em breve com essa funcionalidade atualizada.</h3>
        {/* <Reenviar onAction={handleAction} toast={notify} action={action} /> */}
        </div>
        </div>
        
        </div>

      )}  


      {subscriberData && (
        <div className='flex max-w-7xl sm:px-6 lg:px-8'>
        <div className="w-96 p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">

        <div className="flex items-center justify-between">
        <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">{subscriberData.services}</h5>
        {isSuperUser && (
          <Fixit onFixit={handleFixit} toast={notify} action={action} />
        )}
        </div>

        <div className="flex items-baseline text-gray-900 dark:text-white">
            <span className="ml-1 text-xl font-normal text-gray-500 dark:text-gray-400">
                {subscriberData.name}
            </span>
        </div>
        <ul role="list" className="space-y-5 my-7">
            <li className="flex space-x-3 items-center">
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.656 12.115a3 3 0 0 1 5.682-.015M13 5h3m-3 3h3m-3 3h3M2 1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Zm6.5 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
              </svg>
              <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                {subscriberData.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
              </span>
            </li>
            <li className="flex space-x-3">
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.344 12.168-1.4-1.4a1.98 1.98 0 0 0-2.8 0l-.7.7a1.98 1.98 0 0 1-2.8 0l-2.1-2.1a1.98 1.98 0 0 1 0-2.8l.7-.7a1.981 1.981 0 0 0 0-2.8l-1.4-1.4a1.828 1.828 0 0 0-2.8 0C-.638 5.323 1.1 9.542 4.78 13.22c3.68 3.678 7.9 5.418 11.564 1.752a1.828 1.828 0 0 0 0-2.804Z"/>
              </svg>
              <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                {subscriberData.phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 ($2) $3-$4')}
              </span>
            </li>
            <li className="flex space-x-3">
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.994 19a8.999 8.999 0 1 1 3.53-17.281M5.995 9l4 4 7-8m-1 8v5m-2.5-2.5h5"/>
              </svg>  
              <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                {subscriberData.status.replace('suspend', 'Suspenso').replace('checkout', 'Aguardando ativação').replace('active', 'Oferta ativada!').replace('canceled', 'Cancelado!')}
              </span>
            </li>
            <li className="flex space-x-3">
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4a4 4 0 0 1 4 4v6M5 4a4 4 0 0 0-4 4v6h8M5 4h9M9 14h10V8a3.999 3.999 0 0 0-2.066-3.5M9 14v5m0-5h4v5m-9-8h2m8-4V1h2"/>
                </svg>
                <span className="text-base font-normal leading-tight text-gray-500 dark:text-gray-400">
                  {subscriberData.email}
                </span>
            </li>
        </ul>
        
        <Reenviar onAction={handleAction} toast={notify} action={action} />
        
        </div>
        </div>
      )}

      <div className="toast-container"><ToastContainer limit={4}/></div>
      </div>
    <>
    
    </>
    </div>
    </div>
    </>
  ) 
}
