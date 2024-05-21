import React, { useState, useEffect, useRef } from 'react';

interface ReenviarProps {
  onAction: (action: string) => void;
  toast: () => void;
  action: string;
}

const Reenviar: React.FC<ReenviarProps> = ({ onAction, action }) => {
  const [botaodesativado, setBotaodesativado] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = () => {
    if (!botaodesativado) {
      onAction(action);
      setBotaodesativado(true);

      setTimeout(() => {
        if (isMounted.current) {
          setBotaodesativado(false);
        }
      }, 7000);
    }
  };

  if (action === '') {
    return null; // Retorna nulo para não renderizar o botão
  }

  return (
    <>
        <button
        onClick={handleClick}
        type="button"
        className={`px-5 py-2.5 text-sm font-medium text-white inline-flex items-center bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center ${
          botaodesativado
            ? 'hover:bg-gray-400 bg-gray-400 cursor-not-allowed' // Botão desabilitado
            : 'hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800' // Botão Ativo
        }`}
        disabled={botaodesativado || action === ''}>

        <svg className={`${botaodesativado
          ?'animate-spin h-5 w-5 mr-3'
          :'h-5 w-5 mr-3'}`} width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1.81042V6.54899H11M2 18.8692V14.1307H7M17 10.3398C17.0006 12.0121 16.4178 13.6377 15.3423 14.9634C14.2669 16.2892 12.759 17.2408 11.0536 17.6701C9.34823 18.0993 7.54091 17.9822 5.91303 17.3369C4.28515 16.6917 2.92805 15.5544 2.053 14.1023M1 10.3398C0.999397 8.66756 1.5822 7.04201 2.65767 5.71625C3.73315 4.39048 5.24095 3.43889 6.94636 3.00961C8.65177 2.58033 10.4591 2.69744 12.087 3.34273C13.7149 3.98801 15.072 5.12525 15.947 6.57742" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
          {action}
        </button>
    </>
  ) 
}
export default Reenviar