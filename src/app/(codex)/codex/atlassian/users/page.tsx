'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { ConfirmModal } from "@/src/components/modal";
import { Modal, Button, Badge, TextInput, Select, Label } from "flowbite-react";
import { useEffect, useState, FormEvent } from "react";
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import Loading from "@/src/components/loading";
import dynamic from "next/dynamic";
import Image from 'next/image';
import { Icon } from "@iconify/react/dist/iconify.js";

// ✅ Importar as novas funções do backend
import { 
  searchAtlassianUser, 
  inviteUserToAtlassian, 
  fetchAtlassianGroups,
  fetchLicenseUsage
} from '@/src/actions/atlassian';

// ✅ Importar tipos e utilitários
import {
  AtlassianUser,
  AtlassianGroup,
  calculateLicenseStats,
  formatLicenseDisplay,
  getStatusColor,
  DEFAULT_TOTAL_LICENSES
} from '@/src/utils/atlassian';

// ✅ Importar contexto do usuário
import { useUser } from '@/src/context/UserContext';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const showToast = (type: "success" | "warn" | "error" | "info", message: string) => {
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

interface LicenseData {
  available: number;
  used: number;
}

export default function AtlassianUsersPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();

  // Estados principais
  const [email, setEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState<AtlassianUser | null>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<AtlassianGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  
  // Estados de interface
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [outOfDirectory, setOutOfDirectory] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Estados de modais
  const [openInviteUserModal, setOpenInviteUserModal] = useState(false);
  const [openAddToGroupModal, setOpenAddToGroupModal] = useState(false);
  const [openDeactivateUserModal, setOpenDeactivateUserModal] = useState(false);
  
  // Estados de ações
  const [isInviting, setIsInviting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Estados de licenças
  const [licenseData, setLicenseData] = useState<LicenseData>({ used: 0, available: 0 });
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);

  // ✅ Carregar grupos disponíveis
  const loadAvailableGroups = async () => {
    try {
      const result = await fetchAtlassianGroups({
        isActive: true,
        orderBy: 'order',
        orderDirection: 'asc',
        limit: 100
      });

      if (result.success && result.data) {
        setAvailableGroups(result.data);
      } else {
        console.error('Erro ao carregar grupos:', result.message);
        setAvailableGroups([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setAvailableGroups([]);
    }
  };

  // ✅ Carregar dados de licenças
  const loadLicenseData = async () => {
    try {
      setIsLoadingLicenses(true);
      const result = await fetchLicenseUsage();
      
      if (result.success && result.data) {
        const stats = calculateLicenseStats(result.data, DEFAULT_TOTAL_LICENSES);
        setLicenseData({ 
          used: stats.used, 
          available: stats.available 
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados de licença:", error);
      showToast("error", "Erro ao carregar dados de licença.");
    } finally {
      setIsLoadingLicenses(false);
    }
  };

  // ✅ Buscar usuário no Atlassian
  const handleSearchUser = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showToast("warn", "Digite um email para buscar.");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setNotFound(false);
      setOutOfDirectory(false);
      setSearchedUser(null);
      setUserGroups([]);

      const result = await searchAtlassianUser(email.trim());

      if (result.success && result.data && result.data.length > 0) {
        const user = result.data[0]; // Pegar o primeiro usuário encontrado
        setSearchedUser(user);
        
        if (user.accountType !== "atlassian") {
          setOutOfDirectory(true);
          showToast("warn", "Usuário encontrado, mas não está no diretório Atlassian.");
        } else {
          showToast("success", "Usuário encontrado com sucesso!");
        }

        // TODO: Implementar busca de grupos do usuário quando backend suportar
        setUserGroups([]);
        
      } else {
        setNotFound(true);
        showToast("warn", "Usuário não encontrado. Você pode convidá-lo para o diretório.");
      }
    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error);
      setSearchError(error.message || 'Erro desconhecido');
      showToast("error", "Erro ao buscar usuário. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ Convidar usuário
  const handleInviteUser = async () => {
    if (!user?.id) {
      showToast("error", "Usuário não autenticado.");
      return;
    }

    try {
      setIsInviting(true);
      const result = await inviteUserToAtlassian(email, user.id);

      if (result.success) {
        showToast("success", "Convite enviado com sucesso!");
        showConfetti();
        setOpenInviteUserModal(false);
        
        // Buscar novamente para ver se o usuário foi adicionado
        setTimeout(() => {
          handleSearchUser(new Event('submit') as any);
        }, 2000);
      } else {
        showToast("error", result.message || "Erro ao enviar convite.");
      }
    } catch (error: any) {
      console.error("Erro ao convidar usuário:", error);
      showToast("error", "Erro inesperado ao enviar convite.");
    } finally {
      setIsInviting(false);
    }
  };

  // ✅ Atribuir usuário a grupo (placeholder - será implementado quando backend suportar)
  const handleAssignToGroup = async () => {
    if (!selectedGroup || !searchedUser) {
      showToast("warn", "Selecione um grupo.");
      return;
    }

    try {
      setIsAssigning(true);
      
      // TODO: Implementar quando backend tiver endpoint para atribuir usuário a grupo
      showToast("info", "Funcionalidade de atribuição será implementada em breve.");
      setOpenAddToGroupModal(false);
      
    } catch (error: any) {
      console.error("Erro ao atribuir usuário ao grupo:", error);
      showToast("error", "Erro ao atribuir usuário ao grupo.");
    } finally {
      setIsAssigning(false);
    }
  };

  // ✅ Suspender usuário (placeholder - será implementado quando backend suportar)
  const handleSuspendUser = async () => {
    if (!searchedUser) return;

    try {
      // TODO: Implementar quando backend tiver endpoint para suspender usuário
      showToast("info", "Funcionalidade de suspensão será implementada em breve.");
      setOpenDeactivateUserModal(false);
      
    } catch (error: any) {
      console.error("Erro ao suspender usuário:", error);
      showToast("error", "Erro ao suspender usuário.");
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadAvailableGroups();
    loadLicenseData();
  }, []);

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
        
        {/* ✅ Barra de busca no local original */}
        <nav className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
          <div className="flex flex-row items-center justify-center w-full">
            <div className="flex w-full max-w-lg items-center p-4">
              <form className="w-full" onSubmit={handleSearchUser}>
                <label htmlFor="email-search-input" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
                  Buscar Usuário no Atlassian
                </label>
                <div className="flex w-full items-center relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    type="email"
                    id="email-search-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 pl-4 pr-20 bg-transparent text-sm text-gray-900 border-hidden rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Buscar por email do usuário..."
                    disabled={isSearching}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !email.trim()}
                    className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                  >
                    {isSearching ? (
                      <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon icon="mdi:magnify" className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </nav>

        {/* ✅ Cards de licenças movidos para baixo */}
        <div className="w-full px-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Utilizadas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {isLoadingLicenses ? '...' : licenseData.used}
                  </p>
                </div>
                <Icon icon="mdi:account-multiple" className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Disponíveis</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {isLoadingLicenses ? '...' : licenseData.available}
                  </p>
                </div>
                <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Resultados da busca */}
        <div className="w-full px-4">
          
          {/* Loading da busca */}
          {isSearching && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <Icon icon="mdi:loading" className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                <span className="text-gray-600 dark:text-gray-400">Buscando usuário...</span>
              </div>
            </div>
          )}

          {/* Erro na busca */}
          {searchError && !isSearching && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <h3 className="text-red-700 dark:text-red-400 font-medium">Erro na busca</h3>
                  <p className="text-sm text-red-600 dark:text-red-500">{searchError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Usuário encontrado */}
          {searchedUser && !isSearching && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Avatar e informações */}
                  <div className="flex items-center space-x-4">
                    <Image
                      src={searchedUser.avatarUrls["48x48"] || "/default-avatar.png"}
                      width={64}
                      height={64}
                      alt="Avatar do usuário"
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {searchedUser.displayName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{searchedUser.emailAddress}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge color={searchedUser.active ? 'green' : 'red'} size="sm">
                          {searchedUser.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge color="blue" size="sm">
                          {searchedUser.accountType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2 ml-auto">
                    {outOfDirectory ? (
                      <Button
                        color="blue"
                        size="sm"
                        onClick={() => setOpenInviteUserModal(true)}
                      >
                        <Icon icon="mdi:email-plus" className="w-4 h-4 mr-2" />
                        Adicionar ao Diretório
                      </Button>
                    ) : (
                      <>
                        {searchedUser.active && (
                          <>
                            <Button
                              color="green"
                              size="sm"
                              onClick={() => setOpenAddToGroupModal(true)}
                              disabled={availableGroups.length === 0}
                            >
                              <Icon icon="mdi:account-plus" className="w-4 h-4 mr-2" />
                              Adicionar a Grupo
                            </Button>
                            <Button
                              color="red"
                              size="sm"
                              onClick={() => setOpenDeactivateUserModal(true)}
                            >
                              <Icon icon="mdi:account-off" className="w-4 h-4 mr-2" />
                              Suspender
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Grupos do usuário */}
                {userGroups.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Grupos do Usuário
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {userGroups.map((group: any, index: number) => (
                        <Badge key={index} color="purple" size="sm">
                          {group.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usuário não encontrado */}
          {notFound && !isSearching && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="text-center">
                <Icon icon="mdi:account-search" className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                  Usuário não encontrado
                </h3>
                <p className="text-yellow-700 dark:text-yellow-500 mb-4">
                  Não foi possível encontrar um usuário com o email &quot;{email}&quot; no Atlassian.
                </p>
                <Button
                  color="yellow"
                  onClick={() => setOpenInviteUserModal(true)}
                >
                  <Icon icon="mdi:email-plus" className="w-4 h-4 mr-2" />
                  Convidar Usuário
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal de convite */}
      <Modal show={openInviteUserModal} onClose={() => setOpenInviteUserModal(false)} size="md">
        <Modal.Header>Convidar Usuário</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Deseja enviar um convite para <strong>{email}</strong> acessar o Atlassian?
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                O usuário receberá um email com instruções para acessar o sistema.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleInviteUser} disabled={isInviting}>
            {isInviting ? 'Enviando...' : 'Sim, Convidar'}
          </Button>
          <Button color="gray" onClick={() => setOpenInviteUserModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Modal de adicionar a grupo */}
      <Modal show={openAddToGroupModal} onClose={() => setOpenAddToGroupModal(false)} size="md">
        <Modal.Header>Adicionar a Grupo</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Selecione o grupo para adicionar <strong>{searchedUser?.displayName}</strong>:
            </p>
            <div>
              <Label htmlFor="group-select" value="Grupo" />
              <Select
                id="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
              >
                <option value="">Selecione um grupo...</option>
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.group_id}>
                    {group.group_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            onClick={handleAssignToGroup} 
            disabled={isAssigning || !selectedGroup}
          >
            {isAssigning ? 'Adicionando...' : 'Adicionar ao Grupo'}
          </Button>
          <Button color="gray" onClick={() => setOpenAddToGroupModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Modal de suspensão */}
      <ConfirmModal
        show={openDeactivateUserModal}
        title="Suspender Usuário"
        description={`Tem certeza que deseja suspender o usuário "${searchedUser?.displayName}"? Esta ação impedirá o acesso ao sistema.`}
        confirmText="Sim, Suspender"
        cancelText="Cancelar"
        onConfirm={handleSuspendUser}
        onCancel={() => setOpenDeactivateUserModal(false)}
        confirmButtonColor="red"
      />

      <ToastContainer limit={4} />
    </>
  );
}