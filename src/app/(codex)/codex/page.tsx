'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import Loading from "@/src/components/loading";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Badge } from "flowbite-react";

// ✅ Importar as novas funções do backend
import { 
  fetchLicenseUsage, 
  fetchDetailedLicenseUsage
} from '@/src/actions/atlassian';

// ✅ Importar utilitários separados
import {
  calculateLicenseStats,
  formatLicenseDisplay,
  getStatusColor,
  getStatusIcon,
  LicenseUsageData,
  LicenseStats,
  DEFAULT_TOTAL_LICENSES
} from '@/src/utils/atlassian';

// ✅ Importar função existente para chamados
import { fetchIssueCount } from '@/src/lib/atlassian';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

export default function CodexDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados para licenças
  const [licenseData, setLicenseData] = useState<LicenseUsageData | null>(null);
  const [detailedLicenseData, setDetailedLicenseData] = useState<LicenseUsageData[]>([]);
  const [licenseStats, setLicenseStats] = useState<LicenseStats | null>(null);
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  
  // Estados para chamados (mantido da implementação original)
  const [ticketData, setTicketData] = useState({
    Governança: 0,
    Infraestrutura: 0,
    "Controles Internos": 0,
    Billing: 0,
    "Massivo Total": 0,
    "Massivo Parcial": 0,
  });
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);

  // Configurações
  const TOTAL_LICENSES = DEFAULT_TOTAL_LICENSES; // Usando constante do utils
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

  // ✅ Função para buscar dados de licenças do backend
  const fetchLicenseData = async () => {
    try {
      setIsLoadingLicenses(true);
      setLicenseError(null);

      // Buscar dados principais (Jira Service Desk)
      const result = await fetchLicenseUsage();
      
      if (result.success && result.data) {
        setLicenseData(result.data);
        
        // Calcular estatísticas
        const stats = calculateLicenseStats(result.data, TOTAL_LICENSES);
        setLicenseStats(stats);
      } else {
        throw new Error(result.message || 'Erro ao carregar dados de licença');
      }

      // Buscar dados detalhados (opcional)
      const detailedResult = await fetchDetailedLicenseUsage();
      if (detailedResult.success && detailedResult.data) {
        setDetailedLicenseData(detailedResult.data);
      }

    } catch (error: any) {
      console.error("Erro ao buscar dados de licença:", error);
      setLicenseError(error.message || 'Erro desconhecido');
      showToast("error", "Erro ao carregar dados de licença.");
    } finally {
      setIsLoadingLicenses(false);
    }
  };

  // Função para buscar dados de chamados (mantida da implementação original)
  const fetchTicketData = async () => {
    try {
      setIsLoadingTickets(true);
      const responseIssueCount = await fetchIssueCount();
      
      if (responseIssueCount) {
        setTicketData({
          Governança: responseIssueCount.Governança || 0,
          Infraestrutura: responseIssueCount.Infraestrutura || 0,
          "Controles Internos": responseIssueCount["Controles Internos"] || 0,
          Billing: responseIssueCount.Billing || 0,
          "Massivo Total": responseIssueCount["Massivo Total"] || 0,
          "Massivo Parcial": responseIssueCount["Massivo Parcial"] || 0,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados de chamados:", error);
      showToast("error", "Erro ao carregar dados de chamados.");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // ✅ Carregar dados na inicialização e configurar refresh automático
  useEffect(() => {
    fetchLicenseData();
    fetchTicketData();

    // Configurar refresh automático apenas para licenças
    const interval = setInterval(fetchLicenseData, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  // ✅ Configurações do gráfico de licenças melhoradas
  const chartSeries = licenseStats ? [licenseStats.available, licenseStats.used] : [0, 0];
  
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    labels: ["Licenças Disponíveis", "Licenças Utilizadas"],
    colors: licenseStats 
      ? licenseStats.status === 'critical' 
        ? ["#10b981", "#ef4444"] // Verde/Vermelho para crítico
        : licenseStats.status === 'warning'
        ? ["#10b981", "#f59e0b"] // Verde/Amarelo para atenção
        : ["#10b981", "#3b82f6"] // Verde/Azul para normal
      : ["#e5e7eb", "#9ca3af"], // Cinza para loading
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 'bold',
              formatter: function (val: string) {
                return val;
              },
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 400,
              formatter: function () {
                return TOTAL_LICENSES.toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        return opts.w.config.series[opts.seriesIndex];
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          const percentage = licenseStats ? ((val / TOTAL_LICENSES) * 100).toFixed(1) : '0';
          return `${val} licenças (${percentage}%)`;
        },
      },
    },
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

  // Configurações do gráfico de chamados (mantidas da implementação original)
  const ticketChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
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
      labels: {
        style: {
          fontSize: '12px',
        },
      },
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
    colors: ["#3b82f6"],
    grid: {
      borderColor: '#e5e7eb',
    },
  };

  const ticketChartSeries = [
    {
      name: "Chamados Abertos",
      data: Object.values(ticketData),
    },
  ];

  // ✅ Função para determinar cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      default: return 'green';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return 'mdi:alert-circle';
      case 'warning': return 'mdi:alert';
      default: return 'mdi:check-circle';
    }
  };

  // Loading e redirecionamentos
  if (status === "loading") {
    return <Loading />;
  }
  
  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center py-8 mx-auto gap-4 md:h-screen lg:py-0">
        
        {/* ✅ Header com estatísticas rápidas */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Licenças Utilizadas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Utilizadas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {isLoadingLicenses ? '...' : licenseStats?.used || 0}
                  </p>
                </div>
                <Icon icon="mdi:account-multiple" className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Licenças Disponíveis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Disponíveis</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {isLoadingLicenses ? '...' : licenseStats?.available || 0}
                  </p>
                </div>
                <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Percentual de Uso */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Percentual de Uso</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {isLoadingLicenses ? '...' : `${licenseStats?.usagePercentage || 0}%`}
                  </p>
                </div>
                <Icon icon="mdi:chart-donut" className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status do Sistema</p>
                  <div className="flex items-center gap-2">
                    {isLoadingLicenses ? (
                      <span className="text-gray-500">Carregando...</span>
                    ) : licenseStats ? (
                      <>
                        <Badge 
                          color={getStatusColor(licenseStats.status)} 
                          icon={() => <Icon icon={getStatusIcon(licenseStats.status)} className="w-3 h-3" />}
                        >
                          {licenseStats.status === 'critical' ? 'Crítico' : 
                           licenseStats.status === 'warning' ? 'Atenção' : 'Normal'}
                        </Badge>
                      </>
                    ) : (
                      <Badge color="gray">Indisponível</Badge>
                    )}
                  </div>
                </div>
                <Icon icon="mdi:shield-check" className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Gráficos Principais */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
          
          {/* Gráfico de Licenças Melhorado */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Uso de Licenças Jira
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {licenseData ? formatLicenseDisplay(licenseData).formattedTimestamp : 'Carregando...'}
                </p>
              </div>
              <button
                onClick={fetchLicenseData}
                disabled={isLoadingLicenses}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <Icon 
                  icon="mdi:refresh" 
                  className={`w-5 h-5 ${isLoadingLicenses ? 'animate-spin' : ''}`} 
                />
              </button>
            </div>
            
            <div className="w-full h-[350px]">
              {licenseError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 dark:text-red-400">Erro ao carregar dados</p>
                    <p className="text-sm text-gray-500">{licenseError}</p>
                    <button
                      onClick={fetchLicenseData}
                      className="mt-2 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-md transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : isLoadingLicenses ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon icon="mdi:loading" className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Carregando licenças...</p>
                  </div>
                </div>
              ) : chartSeries.every(series => typeof series === "number") ? (
                <Chart
                  className="mt-4"
                  options={chartOptions}
                  series={chartSeries}
                  type="donut"
                  width="100%"
                  height="100%"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-red-600 dark:text-red-400">Erro ao carregar o gráfico.</p>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Chamados (mantido) */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Áreas Demandadas (GSTI)
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chamados por categoria
                </p>
              </div>
              <button
                onClick={fetchTicketData}
                disabled={isLoadingTickets}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <Icon 
                  icon="mdi:refresh" 
                  className={`w-5 h-5 ${isLoadingTickets ? 'animate-spin' : ''}`} 
                />
              </button>
            </div>
            
            <div className="w-full h-[350px]">
              {isLoadingTickets ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Icon icon="mdi:loading" className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Carregando chamados...</p>
                  </div>
                </div>
              ) : (
                <Chart
                  options={ticketChartOptions}
                  series={ticketChartSeries}
                  type="bar"
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>

        {/* ✅ Cards de produtos detalhados (se disponível) */}
        {detailedLicenseData.length > 0 && (
          <div className="w-full px-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalhamento por Produto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {detailedLicenseData.map((data) => {
                const formatted = formatLicenseDisplay(data);
                const productStats = calculateLicenseStats(data, TOTAL_LICENSES);
                
                return (
                  <div key={data.product} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatted.productDisplayName}
                      </h4>
                      <Badge color={getStatusColor(productStats.status)} size="sm">
                        {productStats.usagePercentage}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Utilizadas:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{data.currentUsage}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            productStats.status === 'critical' ? 'bg-red-500' :
                            productStats.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(productStats.usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ToastContainer limit={4} />
    </>
  );
}