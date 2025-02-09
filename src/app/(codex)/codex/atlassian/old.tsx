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
import Logo from "@/src/components/icons";
import { Alert, Avatar, DarkThemeToggle } from "flowbite-react";

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

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault()

      console.log("SubscriberData: ")
    }

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
      <nav className="block w-full max-w-screen-xl px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
      {/* User Actions ficam em uma coluna para telas pequenas */}
      <div className="flex flex-row items-center justify-between w-full sm:w-auto sm:gap-4 mb-4 sm:mb-0">

        <div className="flex items-center min-w-96 mx-auto p-4">
          <form onSubmit={handleSearch}>
          <div className="flex items-center relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
            <input
              value={email}
              onChange={handleEmailChange}
              type="text"
              id="default-search"
              className="block w-full md:w-96 p-4 pl-12 bg-transparent text-sm text-gray-900 border border-hidden border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Informe o e-mail..."
              required
            />
            <button
              onClick={handleAssignClick}
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
        {/* <div className="flex items-center justify-end sm:justify-end gap-4 mt-4 sm:mt-0">
          <Alert />
          <DarkThemeToggle />
          <Avatar />
        </div> */}
      </div>

      {/* Search Section */}
    </nav>
      <div className="flex items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div>
            
              <h1 className="text-xl font-bold mb-4">Gerenciar Usuários do Jira</h1>
              <div>
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
        </>
    )
  }
}
