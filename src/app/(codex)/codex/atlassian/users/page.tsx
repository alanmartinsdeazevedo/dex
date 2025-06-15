// src/app/(codex)/codex/atlassian/users/page.tsx
'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { ConfirmModal } from "@/src/components/modal";
import { Modal, Button, Badge, TextInput, Select, Label, Tooltip } from "flowbite-react";
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
  fetchLicenseUsage,
  addUserToAtlassianGroup,
  removeUserFromAtlassianGroup,
  getGroupDescription
} from '@/src/actions/atlassian';

// ✅ Importar tipos e utilitários
import {
  AtlassianUser,
  AtlassianGroup,
  AtlassianUserGroup,
  LicenseUsageData,
  ApiResponse
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

// ==================== COMPONENTE PARA EXIBIR GRUPOS ====================

interface UserGroupProps {
  group: {
    name: string;
    groupId: string;
    self: string;
  };
  onRemove?: (groupName: string) => void;
  isRemoving?: boolean;
  showRemoveButton?: boolean;
}

const UserGroupCard = ({ group, onRemove, isRemoving, showRemoveButton }: UserGroupProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [loadingDescription, setLoadingDescription] = useState(false);

  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase();
    if (name.includes('admin')) return 'material-symbols:admin-panel-settings';
    if (name.includes('jira')) return 'devicon:jira';
    if (name.includes('noc')) return 'material-symbols:network-intelligence';
    if (name.includes('rh') || name.includes('hr')) return 'material-symbols:group';
    if (name.includes('suporte') || name.includes('support')) return 'material-symbols:support-agent';
    if (name.includes('cliente')) return 'material-symbols:person';
    if (name.includes('facilities')) return 'material-symbols:business';
    if (name.includes('aprovador')) return 'material-symbols:approval';
    if (name.includes('comite')) return 'material-symbols:groups';
    if (name.includes('governança')) return 'material-symbols:gavel';
    if (name.includes('prospect')) return 'material-symbols:trending-up';
    return 'material-symbols:group';
  };

  const getGroupColor = (groupName: string) => {
    const name = groupName.toLowerCase();
    if (name.includes('admin')) return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
    if (name.includes('jira')) return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
    if (name.includes('noc')) return 'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
    if (name.includes('rh') || name.includes('hr')) return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
    if (name.includes('suporte') || name.includes('support')) return 'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
    if (name.includes('cliente')) return 'bg-cyan-100 border-cyan-200 text-cyan-800 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-300';
    return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
  };

  const handleShowDescription = async () => {
    if (!showDescription && !description) {
      setLoadingDescription(true);
      try {
        const result = await getGroupDescription(group.groupId || group.name);
        if (result.success && result.data) {
          setDescription(result.data.description || 'Sem descrição disponível');
        } else {
          setDescription('Descrição não encontrada');
        }
      } catch (error) {
        setDescription('Erro ao carregar descrição');
      } finally {
        setLoadingDescription(false);
      }
    }
    setShowDescription(!showDescription);
  };

  return (
    <div className={`rounded-lg border p-3 transition-all hover:shadow-md ${getGroupColor(group.name)}`}>
      <div className="flex items-start gap-3">
        <Icon 
          icon={getGroupIcon(group.name)} 
          className="text-xl flex-shrink-0 mt-0.5" 
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight mb-1 break-words">
                {group.name}
              </h4>
              <p className="text-xs opacity-75 font-mono break-all">
                {group.groupId}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Botão de informação */}
              <Tooltip content="Ver descrição do grupo">
                <Button
                  size="xs"
                  color="gray"
                  onClick={handleShowDescription}
                  disabled={loadingDescription}
                  className="p-1"
                >
                  {loadingDescription ? (
                    <Icon icon="mdi:loading" className="w-3 h-3 animate-spin" />
                  ) : (
                    <Icon icon="material-symbols:info" className="w-3 h-3" />
                  )}
                </Button>
              </Tooltip>
              
              {/* Botão de remover (se permitido) */}
              {showRemoveButton && onRemove && (
                <Tooltip content="Remover do grupo">
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => onRemove(group.name)}
                    disabled={isRemoving}
                    className="p-1"
                  >
                    {isRemoving ? (
                      <Icon icon="mdi:loading" className="w-3 h-3 animate-spin" />
                    ) : (
                      <Icon icon="material-symbols:remove" className="w-3 h-3" />
                    )}
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
          
          {/* Descrição expandida */}
          {showDescription && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <p className="text-xs opacity-80 italic">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserGroupsDisplay = ({ 
  groups, 
  onRemoveFromGroup, 
  isRemoving, 
  removingGroupName,
  allowRemove = false 
}: { 
  groups: any[];
  onRemoveFromGroup?: (groupName: string) => void;
  isRemoving?: boolean;
  removingGroupName?: string;
  allowRemove?: boolean;
}) => {
  if (!groups || groups.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
        <Icon icon="material-symbols:group-off" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nenhum grupo encontrado
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este usuário não está atribuído a nenhum grupo no Atlassian
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon icon="material-symbols:groups" className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Grupos do Atlassian
          </h3>
        </div>
        <Badge color="blue" size="sm">
          {groups.length} grupo{groups.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((group, index) => (
          <UserGroupCard 
            key={group.groupId || index} 
            group={group}
            onRemove={allowRemove ? onRemoveFromGroup : undefined}
            isRemoving={isRemoving && removingGroupName === group.name}
            showRemoveButton={allowRemove}
          />
        ))}
      </div>
    </div>
  );
};

// ==================== FUNÇÃO PARA VALIDAR EMAIL ====================

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
  const [openRemoveFromGroupModal, setOpenRemoveFromGroupModal] = useState(false);
  
  // Estados de ações
  const [isInviting, setIsInviting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removingGroupName, setRemovingGroupName] = useState<string>('');
  
  // Estados de licenças
  const [licenseData, setLicenseData] = useState<LicenseData>({ available: 0, used: 0 });
  const [isLoadingLicenses, setIsLoadingLicenses] = useState(true);

  // ✅ Carregar dados de licenças
  const loadLicenseData = async () => {
    try {
      setIsLoadingLicenses(true);
      const result = await fetchLicenseUsage();
      
      if (result.success && result.data) {
        setLicenseData({
          available: result.data.available || 0,
          used: result.data.used || 0
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados de licenças:", error);
    } finally {
      setIsLoadingLicenses(false);
    }
  };

  // ✅ Carregar grupos disponíveis (somente grupos do Codex)
  const loadAvailableGroups = async () => {
    try {
      const result = await fetchAtlassianGroups({
        isActive: true,
        limit: 100
      });

      if (result.success && result.data) {
        let groupsArray: AtlassianGroup[] = [];
        
        if (Array.isArray(result.data)) {
          groupsArray = result.data;
        } else if (result.data && typeof result.data === 'object' && 'data' in result.data) {
          groupsArray = (result.data as any).data || [];
        }
        
        setAvailableGroups(groupsArray);
        console.log('Grupos do Codex carregados:', groupsArray.length);
      } else {
        setAvailableGroups([]);
        console.warn('Nenhum grupo encontrado');
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      setAvailableGroups([]);
    }
  };

  // ✅ Buscar usuário no Atlassian com grupos
  const handleSearchUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("warn", "Digite um email para buscar.");
      return;
    }

    if (!isValidEmail(email)) {
      showToast("error", "Digite um email válido.");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setNotFound(false);
      setSearchedUser(null);
      setUserGroups([]);

      const result = await searchAtlassianUser(email);

      if (result.success && result.data && result.data.length > 0) {
        const userData = result.data[0];
        setSearchedUser(userData);
        
        const groups = userData.groups || [];
        setUserGroups(groups);

        if (userData.suspended) {
          showToast("warn", "Usuário encontrado, mas está suspenso no Atlassian.");
        } else {
          showToast("success", `Usuário encontrado com sucesso! ${groups.length} grupos atribuídos.`);
        }
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

  // ✅ Atribuir usuário a grupo (agora funcional)
  const handleAssignToGroup = async () => {
    if (!selectedGroup || !searchedUser) {
      showToast("warn", "Selecione um grupo.");
      return;
    }

    try {
      setIsAssigning(true);
      
      // Encontrar o grupo selecionado para obter o group_id
      const selectedGroupData = availableGroups.find(g => g.id === selectedGroup);
      
      if (!selectedGroupData) {
        showToast("error", "Grupo selecionado não encontrado.");
        return;
      }

      const result = await addUserToAtlassianGroup(
        searchedUser.accountId, 
        selectedGroupData.group_id,
        user?.id || ''
      );
      
      if (result.success) {
        showToast("success", `Usuário adicionado ao grupo "${selectedGroupData.group_name}" com sucesso!`);
        setOpenAddToGroupModal(false);
        setSelectedGroup('');
        
        // Atualizar a lista de grupos do usuário
        setTimeout(() => {
          handleSearchUser(new Event('submit') as any);
        }, 1000);
      } else {
        showToast("error", result.message || "Erro ao adicionar usuário ao grupo.");
      }
    } catch (error: any) {
      console.error("Erro ao atribuir usuário ao grupo:", error);
      showToast("error", "Erro ao atribuir usuário ao grupo.");
    } finally {
      setIsAssigning(false);
    }
  };

  // ✅ Remover usuário do grupo
  const handleRemoveFromGroup = async (groupName: string) => {
    if (!searchedUser) return;

    setRemovingGroupName(groupName);
    setOpenRemoveFromGroupModal(true);
  };

  const confirmRemoveFromGroup = async () => {
    if (!searchedUser || !removingGroupName) return;

    try {
      setIsRemoving(true);
      
      const result = await removeUserFromAtlassianGroup(
        searchedUser.accountId,
        removingGroupName,
        user?.id || ''
      );

      if (result.success) {
        showToast("success", `Usuário removido do grupo "${removingGroupName}" com sucesso!`);
        setOpenRemoveFromGroupModal(false);
        setRemovingGroupName('');
        
        // Atualizar a lista de grupos do usuário
        setTimeout(() => {
          handleSearchUser(new Event('submit') as any);
        }, 1000);
      } else {
        showToast("error", result.message || "Erro ao remover usuário do grupo.");
      }
    } catch (error: any) {
      console.error("Erro ao remover usuário do grupo:", error);
      showToast("error", "Erro ao remover usuário do grupo.");
    } finally {
      setIsRemoving(false);
    }
  };

  // ✅ Suspender usuário (placeholder - será implementado quando backend suportar)
  const handleSuspendUser = async () => {
    if (!searchedUser) return;

    try {
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
      <div className="flex flex-col mx-auto gap-4 max-h-screen overflow-hidden">
        
        {/* ✅ Barra de busca responsiva */}
        <nav className="block w-full px-2 sm:px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3 flex-shrink-0">
          <div className="flex flex-row items-center justify-center w-full">
            <div className="flex w-full max-w-lg items-center p-2 sm:p-4">
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
                    className="w-full p-3 sm:p-4 pl-3 sm:pl-4 pr-16 sm:pr-20 bg-transparent text-sm text-gray-900 border-hidden rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Buscar por email do usuário..."
                    disabled={isSearching}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !email.trim()}
                    className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 sm:px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
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

        <div className="flex-1 overflow-auto min-h-0 px-2 sm:px-4">
          {/* Estado de carregamento */}
          {isSearching && (
            <div className="text-center py-8">
              <Loading />
              <p className="mt-4 text-gray-600 dark:text-gray-300">Buscando usuário...</p>
            </div>
          )}

          {/* Erro na busca */}
          {searchError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Icon icon="material-symbols:error" className="text-red-500" />
                <span className="font-medium text-red-900 dark:text-red-100">Erro na busca</span>
              </div>
              <p className="text-red-800 dark:text-red-200 mt-2">{searchError}</p>
            </div>
          )}

          {/* Usuário encontrado */}
          {searchedUser && !notFound && (
            <div className="space-y-6">
              {/* Card do usuário */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  {/* Avatar e informações */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {searchedUser.avatarUrls && (
                      <Image
                        src={searchedUser.avatarUrls["48x48"]}
                        alt={searchedUser.displayName}
                        width={64}
                        height={64}
                        className="rounded-full border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                        {searchedUser.displayName}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 truncate">
                        {searchedUser.emailAddress}
                      </p>
                      <div className="flex flex-wrap gap-2">
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
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    {outOfDirectory ? (
                      <Button
                        color="green"
                        size="sm"
                        onClick={() => setOpenInviteUserModal(true)}
                        className="flex-1 lg:flex-none"
                      >
                        <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                        Convidar
                      </Button>
                    ) : (
                      <>
                        <Button
                          color="blue"
                          size="sm"
                          onClick={() => setOpenAddToGroupModal(true)}
                          className="flex-1 lg:flex-none"
                        >
                          <Icon icon="mdi:account-group" className="w-4 h-4 mr-2" />
                          Adicionar
                        </Button>
                        {searchedUser.active && (
                          <Button
                            color="red"
                            size="sm"
                            onClick={() => setOpenDeactivateUserModal(true)}
                            className="flex-1 lg:flex-none"
                          >
                            <Icon icon="mdi:account-cancel" className="w-4 h-4 mr-2" />
                            Suspender
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Grupos do usuário com funcionalidade de remoção */}
              <UserGroupsDisplay 
                groups={userGroups}
                onRemoveFromGroup={handleRemoveFromGroup}
                isRemoving={isRemoving}
                removingGroupName={removingGroupName}
                allowRemove={searchedUser.active}
              />
            </div>
          )}

          {/* Usuário não encontrado */}
          {notFound && (
            <div className="text-center py-12">
              <Icon icon="mdi:account-search" className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Usuário não encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                O email <strong>{email}</strong> não foi encontrado no diretório do Atlassian.
              </p>
              <Button
                color="green"
                onClick={() => setOpenInviteUserModal(true)}
              >
                <Icon icon="mdi:email-send" className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal de convite */}
      <Modal show={openInviteUserModal} onClose={() => setOpenInviteUserModal(false)}>
        <Modal.Header>Convidar Usuário</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Deseja enviar um convite para <strong>{email}</strong> acessar o Atlassian?
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                O usuário receberá um email com instruções para criar sua conta.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="green" onClick={handleInviteUser} disabled={isInviting}>
            {isInviting ? 'Enviando...' : 'Enviar Convite'}
          </Button>
          <Button color="gray" onClick={() => setOpenInviteUserModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Modal de adicionar ao grupo */}
      <Modal show={openAddToGroupModal} onClose={() => setOpenAddToGroupModal(false)}>
        <Modal.Header>Adicionar ao Grupo</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <Icon icon="material-symbols:info" className="w-4 h-4 inline mr-2" />
                O usuário será adicionado ao grupo na Atlassian automaticamente.
              </p>
            </div>
            
            <div>
              <Label htmlFor="group-select">Selecione o grupo do Codex:</Label>
              <Select
                id="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Selecione um grupo...</option>
                {availableGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.group_name}
                  </option>
                ))}
              </Select>
              {availableGroups.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Nenhum grupo do Codex disponível. Configure grupos primeiro.
                </p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            color="blue" 
            onClick={handleAssignToGroup} 
            disabled={isAssigning || !selectedGroup || availableGroups.length === 0}
          >
            {isAssigning ? 'Adicionando...' : 'Adicionar ao Grupo'}
          </Button>
          <Button color="gray" onClick={() => setOpenAddToGroupModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Modal de confirmação de remoção */}
      <ConfirmModal
        show={openRemoveFromGroupModal}
        title="Remover do Grupo"
        description={`Tem certeza que deseja remover "${searchedUser?.displayName}" do grupo "${removingGroupName}"? Esta ação será realizada na Atlassian.`}
        confirmText="Sim, Remover"
        cancelText="Cancelar"
        onConfirm={confirmRemoveFromGroup}
        onCancel={() => {
          setOpenRemoveFromGroupModal(false);
          setRemovingGroupName('');
        }}
        confirmButtonColor="red"
        isProcessing={isRemoving}
      />

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