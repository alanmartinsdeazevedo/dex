import React from "react";
import { useState, useEffect, useRef } from "react";

interface FixitProps {
  onFixit: (action: string) => void;
  toast: () => void;
  action: string;
}

const Fixit: React.FC<FixitProps> = ({ onFixit, action }) => {
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
      onFixit(action);
      setBotaodesativado(true);

      setTimeout(() => {
        if (isMounted.current) {
          setBotaodesativado(false);
        }
      }, 7000);
    }
  };

  return (
    <>
    <button onClick={handleClick} disabled={botaodesativado}>
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.9 9.7 20 6.6 17.4 4 4 17.4 6.6 20 16.9 9.7Zm0 0L14.3 7M6 7v2m0 0v2m0-2H4m2 0h2m7 7v2m0 0v2m0-2h-2m2 0h2M8 4h0v0h0v0Zm2 2h0v0h0v0Zm2-2h0v0h0v0Zm8 8h0v0h0v0Zm-2 2h0v0h0v0Zm2 2h0v0h0v0Z"/>
        </svg>
    </button>
    </>
  )    
}
export default Fixit