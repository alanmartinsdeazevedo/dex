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

const showToast = (type: "success" | "warn" | "error", message: string) => {
  toast[type](message, {
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

const AtlassianPage = () => {
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const groups = [
    { id: 'db32e550-152b-4ce2-abbf-b4bd98a6844a', name: 'Públicos' },
    { id: '9cdfaec0-4bdb-4b75-ac9a-1189efcb6993', name: 'Aprovadores' },
    { id: '6043a622-a670-4dc5-abef-60c6d9340976', name: 'BS' },
    { id: 'aac2baad-453f-484c-8bef-3fa10d6b4970', name: 'CONT' },
    { id: 'cf56d3f2-362c-4648-afc9-6fe9edf162f9', name: 'DE' },
    { id: '3d517ec3-9e59-458d-912d-1ce49e7fcba5', name: 'ENGT' },
    { id: 'be0af1c1-0dac-49ac-8991-c4cf6bc33f63', name: 'FAC' },
    { id: '060c2d66-f5eb-429a-94eb-cf19448a11ea', name: 'FEF' },
    { id: '949d710e-a9af-4bf4-adb6-98bfff14e097', name: 'FIN' },
    { id: 'f9a853f3-8e3a-44be-ae4e-7b316b9e0239', name: 'GDD' },
    { id: 'da05199e-d62c-4342-9b9b-9e497f860ad2', name: 'GMUD' },
    { id: 'cf86d3cf-fdf3-4a00-a769-3e7d40000610', name: 'GMUDT' },
    { id: '55383512-5870-4c97-b0a0-4bc7b1a334a7', name: 'GSOP' },
    { id: '5eef44e5-533e-452d-8afd-9ab8d7a0a207', name: 'GSTI' },
    { id: 'e14a1076-e7b7-440a-8114-1f478167bc98', name: 'MEEF' },
    { id: 'b6b03ceb-0029-4849-b6b6-3d934d21c88c', name: 'RUIET' },
    { id: '499d0950-349e-4a24-8c62-c59944377554', name: 'BS Resolvedor' },
    { id: '828ff6f4-cf8a-4a67-b879-77d21e6e96bb', name: 'ENGT Resolvedor' },
    { id: 'c8f09917-c983-4ee4-89c1-017eab4cdc20', name: 'FAC Resolvedor' },
    { id: '3dfc3e70-af6f-4997-9a2b-3322daaa55f2', name: 'FEF Resolvedor' },
    { id: '190befbf-2b30-4b12-b401-73669acc1be9', name: 'FIN Resolvedor' },
    { id: '9bf6cb3b-0b0f-42dd-a738-2f82079d31e7', name: 'GSTI Resolvedor' },
    { id: '513fcad8-b73f-4709-b202-d8436ff21c58', name: 'GSTI RH' },
    { id: 'c5b88a13-0f89-4827-a982-fcc5dceae5d4', name: 'GMUDT Resolvedor' },
    { id: '9b2f59e2-3155-4b0b-b1eb-a7c559cc8144', name: 'GSOP Resolvedor' },
    { id: '16c83fec-ab80-4fba-8053-8cab7e84270c', name: 'RHB Resolvedor' },
    { id: '69b4239b-7473-4cec-97b8-f6469fce5f51', name: 'RHS Resolvedor' },
    { id: 'aa826844-690a-4a34-b47c-0d6b110d9c52', name: 'RUIET Resolvedor' },
  ];

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setMessage(''); // Limpar mensagem ao digitar
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroup(e.target.value);
    setMessage(''); // Limpar mensagem ao mudar grupo
  };

  const handleAssignClick = async () => {
    // Validações
    if (!group) {
      showToast("warn", "Selecione um grupo.");
      return;
    }

    if (!email.trim()) {
      showToast("warn", "Informe o e-mail do usuário.");
      return;
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("warn", "Informe um e-mail válido.");
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await handleAssign(group, email);
      
      if (result === 201) {
        showToast("success", "Usuário atribuído com sucesso!");
        showConfetti();
        // Limpar campos após sucesso
        setEmail('');
        setGroup('');
      } else if (result === 400) {
        showToast("warn", "Usuário já está atribuído a este grupo ou erro na operação.");
      } else if (result === 404) {
        showToast("error", "Usuário não encontrado no Atlassian.");
      } else if (result === 500) {
        showToast("error", "Erro interno do servidor.");
      } else {
        showToast("error", "Erro inesperado ao atribuir usuário.");
      }
    } catch (error) {
      console.error('Erro ao atribuir o usuário:', error);
      setMessage('Ocorreu um erro ao atribuir o usuário.');
      showToast("error", "Ocorreu um erro ao atribuir o usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAssignClick();
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow-lg dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Atribuir Usuário a Grupo
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selecione um grupo e informe o e-mail do usuário
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              {/* Seleção de Grupo */}
              <div>
                <label htmlFor="group" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Grupo
                </label>
                <div className="relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <select
                    id="group"
                    value={group}
                    onChange={handleGroupChange}
                    className="block w-full p-4 bg-transparent border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
                    required
                  >
                    <option value="">Selecione um grupo...</option>
                    {groups.map((groupItem) => (
                      <option key={groupItem.id} value={groupItem.id}>
                        {groupItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campo de E-mail */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  E-mail do Usuário
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>

              {/* Mensagem de Erro */}
              {message && (
                <div className="p-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
                  {message}
                </div>
              )}

              {/* Botão de Atribuir */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-medium rounded-lg text-sm px-5 py-3 text-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Atribuindo...
                  </div>
                ) : (
                  'Atribuir ao Grupo'
                )}
              </button>
            </form>

            {/* Informações Adicionais */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>• O usuário será automaticamente adicionado ao grupo &quot;Públicos&quot;</p>
              <p>• Certifique-se de que o usuário existe no Atlassian</p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default AtlassianPage;