'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { handleAssign, handleInvite, handleSuspend, suspendAllUsers, licenseUse } from '@/src/lib/atlassian';
import { useEffect, useState, useMemo } from "react";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import Loading from "@/src/components/loading";
import Sidebar from "@/src/components/sidebar";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

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

const showConfetti = () => {
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 0.5, y: 0.5 },
    decay: 0.9,
    gravity: 0.7,
  });
};

export default function Home() {
  const {data: session, status} = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [message, setMessage] = useState('');
  const [licenseData, setLicenseData] = useState({ used: 0, available: 0 });
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

  const fetchLicenseData = async () => {
    try {
      const response = await licenseUse() || 0;
      const available = Math.max(0, 400 - response); 
      setLicenseData({ available: available, used: response });
    } catch (error) {
      console.error("Erro ao buscar dados de licença:", error);
      showToast("error", "Erro ao carregar dados de licença.");
      setLicenseData({ available: 0, used: 0 });
    }
  };

  useEffect(() => {
    fetchLicenseData();
  }, []);

  const chartSeries = [
    licenseData?.available ?? 0,
    licenseData?.used ?? 0,
  ];
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: ["Licenças Disponíveis", "Licenças Consumidas",],
    colors: ["#00d084", "#5a53f7"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
    
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroup(e.target.value);
  };

  const handleAssignClick = async () => {
    try {
      if (!group || !email) {
        showToast("warn", "Preencha todos os campos obrigatórios.");
        return;
      }

      let result;

      switch (group) {
        case "invite":
          result = await handleInvite(email);
          break;
        case "suspend":
          result = await handleSuspend(email);
          break;
        case "remove":
          result = await suspendAllUsers();
          break;
        default:
          result = await handleAssign(group, email);
      }

      if (result === 201) {
        showToast("success", "Operação realizada com sucesso!");
        showConfetti();
      } else if (result === 400) {
        showToast("warn", "Operação não concluída. Verifique os dados.");
      } else {
        showToast("error", "Erro inesperado ao realizar a operação.");
      }
    } catch (error) {
      console.error("Error during operation:", error);
      showToast("error", "Ocorreu um erro. Tente novamente.");
    }
  };
  
  function showConfetti() {
    confetti({
      particleCount: 250,
      spread: 120,
      origin: { x: 1, y: 1 },
      decay: 0.9,
      gravity: 0.7
    });
  }

  if (status === "loading") {
    return <Loading />;
  }
  
  if (!session) {
    router.push("/");
    return null;
  } else {
    return (
      <>
      <div className="flex">
        <div className="fixed p-6 h-screen">
        {/* <Sidebar />   */}
      </div>
      <main className="flex-1 ml-64 p-6">
      <section>
      <div className="flex items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div>
            
              <h1 className="text-xl font-bold mb-4">Gerenciar Usuários do Jira</h1>
              <div>
                <div className="relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center">
                  <select
                    onChange={handleGroupChange}
                    id='Grupo'
                    className="p-4 pr-12 bg-transparent border-hidden text-gray-900 text-sm block w-40 md:w-auto rounded-lg border dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
                  >
                    <option value=''>Projeto</option>
                    <option value='db32e550-152b-4ce2-abbf-b4bd98a6844a'>Públicos</option>
                    <option value='9cdfaec0-4bdb-4b75-ac9a-1189efcb6993'>Aprovadores</option>
                    <option value='suspend'>Desativar usuário</option>
                    <option value='invite'>Adicionar ao diretorio</option>
                    <option value='6043a622-a670-4dc5-abef-60c6d9340976'>BS</option>
                    <option value='aac2baad-453f-484c-8bef-3fa10d6b4970'>CONT</option>
                    <option value='cf56d3f2-362c-4648-afc9-6fe9edf162f9'>DE</option>
                    <option value='3d517ec3-9e59-458d-912d-1ce49e7fcba5'>ENGT</option>
                    <option value='be0af1c1-0dac-49ac-8991-c4cf6bc33f63'>FAC</option>
                    <option value='060c2d66-f5eb-429a-94eb-cf19448a11ea'>FEF</option>
                    <option value='949d710e-a9af-4bf4-adb6-98bfff14e097'>FIN</option>
                    <option value='f9a853f3-8e3a-44be-ae4e-7b316b9e0239'>GDD</option>
                    <option value='da05199e-d62c-4342-9b9b-9e497f860ad2'>GMUD</option>
                    <option value='cf86d3cf-fdf3-4a00-a769-3e7d40000610'>GMUDT</option>
                    <option value='55383512-5870-4c97-b0a0-4bc7b1a334a7'>GSOP</option>
                    <option value='5eef44e5-533e-452d-8afd-9ab8d7a0a207'>GSTI</option>
                    <option value='e14a1076-e7b7-440a-8114-1f478167bc98'>MEEF</option>
                    <option value='b6b03ceb-0029-4849-b6b6-3d934d21c88c'>RUIET</option>
                    <option value='499d0950-349e-4a24-8c62-c59944377554'>BS Resolvedor</option>
                    <option value='828ff6f4-cf8a-4a67-b879-77d21e6e96bb'>ENGT Resolvedor</option>
                    <option value='c8f09917-c983-4ee4-89c1-017eab4cdc20'>FAC Resolvedor</option>
                    <option value='3dfc3e70-af6f-4997-9a2b-3322daaa55f2'>FEF Resolvedor</option>
                    <option value='190befbf-2b30-4b12-b401-73669acc1be9'>FIN Resolvedor</option>
                    <option value='9bf6cb3b-0b0f-42dd-a738-2f82079d31e7'>GSTI Resolvedor</option>
                    <option value='513fcad8-b73f-4709-b202-d8436ff21c58'>GSTI RH</option>
                    <option value='c5b88a13-0f89-4827-a982-fcc5dceae5d4'>GMUDT Resolvedor</option>
                    <option value='9b2f59e2-3155-4b0b-b1eb-a7c559cc8144'>GSOP Resolvedor</option>
                    <option value='16c83fec-ab80-4fba-8053-8cab7e84270c'>RHB Resolvedor</option>
                    <option value='69b4239b-7473-4cec-97b8-f6469fce5f51'>RHS Resolvedor</option>
                    <option value='aa826844-690a-4a34-b47c-0d6b110d9c52'>RUIET Resolvedor</option>
                    <option value='remove'>Desativar usuário</option>
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
              {chartSeries.every(series => typeof series === "number") ? (
              <Chart
                className="mt-4"
                options={chartOptions}
                series={chartSeries}
                type="donut"
                width={"100%"}
                height={150}
              />
              ) : (
                <div className="text-red-600">Erro ao carregar o gráfico.</div>
              )}

            </div>
            <button
              onClick={handleAssignClick}
              type="button"
              className="w-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
      <ToastContainer limit={4} />
          </section>
          </main>
        </div>
        </>
    )
  }
}
