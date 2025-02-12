'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { searchUser, handleAssign, handleInvite, handleSuspend, suspendAllUsers, licenseUse } from '@/src/lib/atlassian';
import { useEffect, useState, useMemo } from "react";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import Loading from "@/src/components/loading";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react/dist/iconify.js";

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

interface UserData {
  displayName: string;
  accountType: string;
  emailAddress: string;
  active: boolean;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
  }
}

interface GroupData {
  map(arg0: (group: any) => import("react").JSX.Element): import("react").ReactNode;
  id: string;
  name: string;
  type: string;
}

export default function Home() {
  const {data: session, status} = useSession()
  const router = useRouter()
  const [licenseData, setLicenseData] = useState({ used: 0, available: 0 });
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const [ticketData, setTicketData] = useState({
    SVA: 0,
    Onboarding: 0,
    Offboarding: 0,
    Recursos: 0,
    Massivo: 0,
    "Massivo Parcial": 0,
  });

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

  const fetchTicketData = async () => {
    try {
      // Aqui você pode substituir por uma chamada real à API
      const mockData = {
        SVA: 30,
        Onboarding: 50,
        Offboarding: 20,
        Recursos: 40,
        Massivo: 10,
        "Massivo Parcial": 15,
      };
      setTicketData(mockData);
    } catch (error) {
      console.error("Erro ao buscar dados de chamados:", error);
      showToast("error", "Erro ao carregar dados de chamados.");
    }
  };

  useEffect(() => {
    fetchTicketData();
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

  const ticketChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: Object.keys(ticketData),
    },
    yaxis: {
      title: {
        text: "Quantidade de Chamados",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `${val} chamados`;
        },
      },
    },
    colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#FFA500"],
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 200,
          },
        },
      },
    ],
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

  const ticketChartSeries = [
    {
      name: "Chamados Abertos",
      data: Object.values(ticketData),
    },
  ];

  if (status === "loading") {
    return <Loading />;
  }
  
  if (!session) {
    router.push("/");
    return null;
  } else {
    return (
      <>
      <div className="flex flex-col items-center py-8 mx-auto gap-4 md:h-screen lg:py-0">
        {/* Gráficos Lado a Lado */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de Licenças */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Uso de Licenças
            </h2>
            <div className="w-full h-[300px]">
              {chartSeries.every(series => typeof series === "number") ? (
              <Chart
                className="mt-4"
                options={chartOptions}
                series={chartSeries}
                type="donut"
                width={"100%"}
                height="100%"
              />
              ) : (
                <div className="text-red-600">Erro ao carregar o gráfico.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Uso de Licenças
            </h2>
            <div className="w-full h-[300px]">
              
            </div>
          </div>

          {/* Gráfico de Chamados */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Histórico de Chamados Abertos
            </h2>
            <div className="w-full h-[350px]">
              <Chart
                options={ticketChartOptions}
                series={ticketChartSeries}
                type="bar"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>

        {/* Botão de Confete */}
        <button
          onClick={showConfetti}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          Celebrar!
        </button>
      </div>

      <ToastContainer limit={4} />
      </>
    )
  }
}
