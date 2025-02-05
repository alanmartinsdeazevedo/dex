"use client";
import { useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import { handleAssign } from '@/src/lib/atlassian';

function showConfetti() {
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 1, y: 1 },
    decay: 0.9,
    gravity: 0.7
  });
}

const Codex = () => {
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroup(e.target.value);
  };

  const handleAssignClick = async () => {
    try {
      const result = await handleAssign(group, email);
      if (result === 201) {
        toast.success('Usuário atribuído com sucesso!', {
          position: "bottom-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        console.log("Result 201: ", result);
        showConfetti();
      } else if (result === 400) {
        toast.info('Usuário já atribuído', {
          position: "bottom-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        console.log("Result 400: ", result);
      } else {
        throw new Error('Unexpected status code');
      }
    } catch (error) {
      setMessage('Ocorreu um erro ao atribuir o usuário.');
      console.error('Erro ao atribuir o usuário:', error);
    }
  };

  return (
    <section>
      
      <div className="flex items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div>
            
              <h1>Atribuir usuário a grupo do Jira</h1>
              <div>
                <div className="relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center">
                  <select
                    onChange={handleGroupChange}
                    id='Grupo'
                    className="p-4 pr-12 bg-transparent border-hidden text-gray-900 text-sm block w-40 md:w-auto rounded-lg border dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
                  >
                    <option value=''>Projeto</option>
                    <option value='db32e550-152b-4ce2-abbf-b4bd98a6844a'>Públicos</option>
                    <option value='060c2d66-f5eb-429a-94eb-cf19448a11ea'>FEF</option>
                    <option value='5eef44e5-533e-452d-8afd-9ab8d7a0a207'>GSTI</option>
                    <option value='f9a853f3-8e3a-44be-ae4e-7b316b9e0239'>GDD</option>
                    <option value='e986ac49-25dc-47a9-95df-1f052c014ff1'>GMUDT</option>
                    <option value='6043a622-a670-4dc5-abef-60c6d9340976'>BS</option>
                    <option value='16c83fec-ab80-4fba-8053-8cab7e84270c'>ADM RH</option>
                  </select>
                  <input
                    value={email}
                    onChange={handleEmailChange}
                    type="text"
                    id="default-search"
                    className="block w-full md:w-96 p-4 pl-12 bg-transparent text-sm text-gray-900 border border-hidden border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Informe o e-mail..."
                    required
                  />
                </div>
              </div>
              {message && <div className="text-red-600">{message}</div>}
            </div>
            <button
              onClick={handleAssignClick}
              type="button"
              className="w-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            >
              Atribuir
            </button>
          </div>
        </div>
      </div>
      <ToastContainer limit={4} />
    </section>
  );
};

export default Codex;
