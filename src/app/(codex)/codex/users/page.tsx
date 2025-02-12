'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { searchUser, handleAssign, handleInvite, handleSuspend, suspendAllUsers, licenseUse, fetchAllGroups } from '@/src/lib/atlassian';
import { useEffect, useState, useMemo } from "react";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import Loading from "@/src/components/loading";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Image from 'next/image';
import { Group, GroupList, GroupUser } from "@/src/types/group";
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
  id: string;
  name: string;
  type: string;
}

interface Groups {
  groupId: string;
  name: string;
  description: string;
}

export default function Home() {
  const {data: session, status} = useSession()
  const router = useRouter()
  const [search, setSearch] = useState<UserData | null>();
  const [email, setEmail] = useState('');
  const [groups, setGroups] = useState<GroupList[]>([]);
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [licenseData, setLicenseData] = useState({ used: 0, available: 0 });
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

  const groupList: GroupList[] = [
    {
      id: "1",
      groupId: "db32e550-152b-4ce2-abbf-b4bd98a6844a",
      groupName: "Públicos",
      description: "em desenvolvimento",
      order: 1,
      createdAt: "2024-01-01T12:00:00Z"
    },
    {
      id: "2",
      groupId: "9cdfaec0-4bdb-4b75-ac9a-1189efcb6993",
      groupName: "Aprovadores",
      description: "em desenvolvimento",
      order: 2,
      createdAt: "2024-01-02T12:00:00Z"
    },
    {
      id: "3",
      groupId: "6043a622-a670-4dc5-abef-60c6d9340976",
      groupName: "BS",
      description: "em desenvolvimento",
      order: 3,
      createdAt: "2024-01-03T12:00:00Z"
    },
    {
      id: "4",
      groupId: "aac2baad-453f-484c-8bef-3fa10d6b4970",
      groupName: "CONT",
      description: "em desenvolvimento",
      order: 4,
      createdAt: "2024-01-04T12:00:00Z"
    },
    {
      id: "5",
      groupId: "cf56d3f2-362c-4648-afc9-6fe9edf162f9",
      groupName: "DE",
      description: "em desenvolvimento",
      order: 5,
      createdAt: "2024-01-05T12:00:00Z"
    },
    {
      id: "6",
      groupId: "3d517ec3-9e59-458d-912d-1ce49e7fcba5",
      groupName: "ENGT",
      description: "em desenvolvimento",
      order: 6,
      createdAt: "2024-01-06T12:00:00Z"
    },
    {
      id: "7",
      groupId: "be0af1c1-0dac-49ac-8991-c4cf6bc33f63",
      groupName: "FAC",
      description: "em desenvolvimento",
      order: 7,
      createdAt: "2024-01-07T12:00:00Z"
    },
    {
      id: "8",
      groupId: "060c2d66-f5eb-429a-94eb-cf19448a11ea",
      groupName: "FEF",
      description: "em desenvolvimento",
      order: 8,
      createdAt: "2024-01-08T12:00:00Z"
    },
    {
      id: "9",
      groupId: "949d710e-a9af-4bf4-adb6-98bfff14e097",
      groupName: "FIN",
      description: "em desenvolvimento",
      order: 9,
      createdAt: "2024-01-09T12:00:00Z"
    },
    {
      id: "10",
      groupId: "f9a853f3-8e3a-44be-ae4e-7b316b9e0239",
      groupName: "GDD",
      description: "em desenvolvimento",
      order: 10,
      createdAt: "2024-01-10T12:00:00Z"
    },
    {
      id: "11",
      groupId: "da05199e-d62c-4342-9b9b-9e497f860ad2",
      groupName: "GMUD",
      description: "em desenvolvimento",
      order: 11,
      createdAt: "2024-01-11T12:00:00Z"
    },
    {
      id: "12",
      groupId: "cf86d3cf-fdf3-4a00-a769-3e7d40000610",
      groupName: "GMUDT",
      description: "em desenvolvimento",
      order: 12,
      createdAt: "2024-01-12T12:00:00Z"
    },
    {
      id: "13",
      groupId: "aa826844-690a-4a34-b47c-0d6b110d9c52",
      groupName: "RUIET Resolvedor",
      description: "em desenvolvimento",
      order: 13,
      createdAt: "2024-01-13T12:00:00Z"
    }
  ];

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
    setGroups(groupList);
    fetchLicenseData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault()
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
  
  const handleAssignClick = async () => {
    console.log ("Selected Group: ", selectedGroup)
    console.log ("Email: ", email)
    
      try {
        if (!selectedGroup || !email) {
          showToast("warn", "Preencha todos os campos obrigatórios.");
          return;
        }
  
        let result;
  
        switch (selectedGroup) {
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
            result = await handleAssign(selectedGroup, email);
        }
  
        if (result === 201) {
          showToast("success", "Operação realizada com sucesso!");
          showConfetti();
          handleSearchClick();
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

  const handleSearchClick = async () => {
    try {
      if (!email) {
        showToast("warn", "Preencha todos os campos obrigatórios.");
        return;
      }
  
      const result = await searchUser(email);
  
      if (result === 404) {
        showToast("warn", "Usuário não encontrado.");
      } else if (result) {
        const { user, groups } = result;
        console.log("Resultado da busca:", result);
        setSearch(user);  // Atualiza o estado do usuário
        setUserGroups(groups); // Atualiza o estado dos grupos
        console.log("Grupos: ", groups);
        showToast("success", "Usuário localizado.");
      }
    } catch (error) {
      console.error("Error:", error);
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
      <div className="flex flex-col items-center py-8 mx-auto gap-4 md:h-screen lg:py-0">
      <nav className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
        <div className="flex flex-row items-center justify-between w-full sm:w-auto sm:gap-4 mb-4 sm:mb-0">
          <div className="flex w-96 min-w-52 items-center mx-auto p-4">
            <form className="w-full min-w-40" onSubmit={handleSearch}>
            <div className="flex w-full items-center relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              <input
                value={email}
                onChange={handleEmailChange}
                type="text"
                id="default-search"
                className="w-full p-4 pl-12 bg-transparent text-sm text-gray-900 border border-hidden border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"              placeholder="Informe o e-mail..."
                required
              />
              <button
                onClick={handleSearchClick}
                type="submit"
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <Icon icon="line-md:person-search" width="16" height="16" />
              </button>
            </div>
            </form>
          </div>
        </div>
      </nav>
      {/* Search Section */}
      {search && (
          <div className="flex w-full min-w-96 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:max-w-full dark:bg-gray-800 dark:border-gray-700">
            <div className="w-full p-6 space-y-4 md:space-y-6 sm:p-8">
              {/* Dados do Usuário Jira */}
              <div className="flex flex-row items-center mb-6">
                {/* Exibir Avatar do Usuário */}
                <Image
                  src={search.avatarUrls["48x48"] || search.avatarUrls["24x24"] || search.avatarUrls["16x16"]}
                  width={64}
                  height={64}
                  alt="Avatar"
                />
                <div className="ml-4">
                  <h1 className="text-xl font-bold">{search.displayName}</h1>
                  <p className="text-gray-700">{search.emailAddress}</p>
                  <p className="text-gray-700">Status: {search.active ? "Ativo" : "Inativo"}</p>
                </div>
                <div className="ml-auto">
                  <button
                    className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                    Desativar Usuário
                  </button>
                </div>
              </div>
              {/* Botão de Desativar */}
              {search.active && (
              <div className="flex flex-col justify-center mt-4">
                  
              <h3>Grupos do Usuário:</h3>
              <ul>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userGroups && (
                userGroups.map((group: any) => (
                  <li key={group.groupId}>{group.name}</li>
                )))}
                  </div>
              </ul>
              {/* Select e Botão para Adicionar Grupos */}
            <div className="flex m-8 w-80 mx-auto items-center relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              <select 
                id="sva"
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="p-4 pr-12 bg-transparent border-hidden text-gray-900 text-sm block min-w-52 md:w-auto rounded-lg border dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white">
                {groupList.map((group: any) => (
                  <option key={group.groupId} value={group.groupId}>{group.groupName}</option>
                ))}
              </select>
              <button
                type="submit"
                onClick={handleAssignClick}
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Adicionar
              </button>
            </div>
            </div>
              )}
              {message && <div className="text-red-600">{message}</div>}
            </div>
          </div>
      )}
      </div>
      <ToastContainer limit={4} />
      </>
    )
  }
}
