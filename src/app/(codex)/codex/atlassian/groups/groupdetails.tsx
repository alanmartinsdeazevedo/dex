'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import { Icon } from "@iconify/react/dist/iconify.js";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/src/components/loading";

import {
  fetchAtlassianGroupById,
} from '@/src/actions/atlassian-groups';

import {
  searchAtlassianUser,
} from '@/src/actions/atlassian';

import { AtlassianGroup, AtlassianUser } from '@/src/utils/atlassian';

// ==================== INTERFACES ====================

interface GroupUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  active: boolean;
  avatarUrls?: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
  };
}

// ==================== COMPONENTE PRINCIPAL ====================

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

export default function GroupDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  
  // Estados principais
  const [group, setGroup] = useState<AtlassianGroup | null>(null);
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  // Estados de busca de usuários
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AtlassianUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // Estados de paginação
  const [pagination, setPagination] = useState({
    startAt: 0,
    maxResults: 10,
    total: 0,
    isLast: false,
  });

  const groupId = params?.id as string;

  // ==================== EFEITOS ====================

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
      loadGroupUsers();
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupUsers();
  }, [pagination.startAt, pagination.maxResults]);

  // ==================== FUNÇÕES DE CARREGAMENTO ====================

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchAtlassianGroupById(groupId);

      if (response.success && response.data) {
        setGroup(response.data);
      } else {
        showToast("error", response.message || "Erro ao carregar detalhes do grupo");
        router.push('/codex/atlassian/groups');
      }
    } catch (error) {
      console.error("Erro ao carregar grupo:", error);
      showToast("error", "Erro ao carregar grupo");
      router.push('/codex/atlassian/groups');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupUsers = async () => {
    if (!group?.group_id) return;

    try {
      setUsersLoading(true);
      
      // NOTA: Você precisará implementar uma função para buscar usuários do grupo
      // no seu backend. Por enquanto, vou simular a estrutura:
      
      // const response = await fetchGroupUsers(group.group_id, pagination.startAt, pagination.maxResults);
      
      // Simulando dados por enquanto - substitua pela chamada real da API
      const mockUsers: GroupUser[] = [
        {
          accountId: "user1",
          displayName: "Usuário Exemplo 1",
          emailAddress: "usuario1@exemplo.com",
          active: true,
        },
        {
          accountId: "user2", 
          displayName: "Usuário Exemplo 2",
          emailAddress: "usuario2@exemplo.com",
          active: true,
        }
      ];

      setGroupUsers(mockUsers);
      setPagination(prev => ({
        ...prev,
        total: mockUsers.length,
        isLast: mockUsers.length < prev.maxResults,
      }));

    } catch (error) {
      console.error("Erro ao carregar usuários do grupo:", error);
      showToast("error", "Erro ao carregar usuários do grupo");
      setGroupUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // ==================== FUNÇÕES DE BUSCA ====================

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      showToast("warn", "Digite um termo para buscar");
      return;
    }

    try {
      setIsSearching(true);
      const response = await searchAtlassianUser(searchQuery);

      if (response.success && response.data) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          showToast("info", "Nenhum usuário encontrado");
        }
      } else {
        showToast("error", response.message || "Erro ao buscar usuários");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      showToast("error", "Erro ao buscar usuários");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ==================== FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ====================

  const handleAddUserToGroup = async (user: AtlassianUser) => {
    try {
      // NOTA: Você precisará implementar uma função para adicionar usuário ao grupo
      // no seu backend
      
      showToast("info", "Funcionalidade em desenvolvimento");
      
      // Exemplo de como seria:
      // const response = await addUserToGroup(group!.group_id, user.accountId);
      // if (response.success) {
      //   showToast("success", "Usuário adicionado ao grupo com sucesso!");
      //   loadGroupUsers(); // Recarregar lista
      //   setSearchResults([]);
      //   setSearchQuery('');
      // } else {
      //   showToast("error", response.message || "Erro ao adicionar usuário ao grupo");
      // }
    } catch (error) {
      console.error("Erro ao adicionar usuário ao grupo:", error);
      showToast("error", "Erro ao adicionar usuário ao grupo");
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!confirm("Tem certeza de que deseja remover este usuário do grupo?")) {
      return;
    }

    try {
      // NOTA: Você precisará implementar uma função para remover usuário do grupo
      // no seu backend
      
      showToast("info", "Funcionalidade em desenvolvimento");
      
      // Exemplo de como seria:
      // const response = await removeUserFromGroup(group!.group_id, userId);
      // if (response.success) {
      //   showToast("success", "Usuário removido do grupo com sucesso!");
      //   loadGroupUsers(); // Recarregar lista
      // } else {
      //   showToast("error", response.message || "Erro ao remover usuário do grupo");
      // }
    } catch (error) {
      console.error("Erro ao remover usuário do grupo:", error);
      showToast("error", "Erro ao remover usuário do grupo");
    }
  };

  // ==================== FUNÇÕES DE NAVEGAÇÃO ====================

  const handleNextPage = () => {
    if (!pagination.isLast) {
      setPagination(prev => ({
        ...prev,
        startAt: prev.startAt + prev.maxResults,
      }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.startAt > 0) {
      setPagination(prev => ({
        ...prev,
        startAt: Math.max(0, prev.startAt - prev.maxResults),
      }));
    }
  };

  // ==================== RENDERIZAÇÃO ====================

  if (status === "loading" || loading) {
    return <Loading />;
  }

  if (!session) {
    router.push("/");
    return null;
  }

  if (!group) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <Icon icon="material-symbols:error" className="mx-auto text-4xl text-red-500 mb-2" />
          <p className="text-lg">Grupo não encontrado</p>
          <button
            onClick={() => router.push('/codex/atlassian/groups')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Voltar para Grupos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
        <div className="container mx-auto p-4">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/codex/atlassian/groups')}
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
              >
                <Icon icon="material-symbols:arrow-back" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{group.group_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    group.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {group.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Ordem: {group.order}
                  </span>
                </div>
                {group.description && (
                  <p className="text-gray-600 mt-1">{group.description}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  ID: {group.group_id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              <Icon icon="material-symbols:person-add" className="inline mr-2" />
              Adicionar Usuário
            </button>
          </div>

          {/* Formulário de busca e adição de usuários */}
          {showAddUserForm && (
            <div className="mb-6 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Buscar e Adicionar Usuários</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite nome, email ou ID do usuário..."
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                />
                <button
                  onClick={handleSearchUsers}
                  disabled={isSearching}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isSearching ? (
                    <Icon icon="eos-icons:loading" className="animate-spin" />
                  ) : (
                    <Icon icon="material-symbols:search" />
                  )}
                </button>
              </div>

              {/* Resultados da busca */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Resultados da busca:</h4>
                  {searchResults.map((user) => (
                    <div
                      key={user.accountId}
                      className="flex items-center justify-between p-3 border rounded bg-white"
                    >
                      <div className="flex items-center gap-3">
                        {user.avatarUrls && (
                          <img
                            src={user.avatarUrls["48x48"]}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{user.displayName}</div>
                          <div className="text-gray-600 text-sm">{user.emailAddress}</div>
                          <div className="text-xs text-gray-500">ID: {user.accountId}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddUserToGroup(user)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lista de usuários do grupo */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Usuários do Grupo ({pagination.total})
              </h2>
              <div className="text-sm text-gray-600">
                {pagination.startAt + 1} - {Math.min(pagination.startAt + pagination.maxResults, pagination.total)} de {pagination.total}
              </div>
            </div>

            {usersLoading ? (
              <div className="text-center py-8">
                <Loading />
              </div>
            ) : (
              <div className="space-y-3">
                {groupUsers.length > 0 ? (
                  groupUsers.map((user) => (
                    <div
                      key={user.accountId}
                      className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {user.avatarUrls && (
                          <img
                            src={user.avatarUrls["48x48"]}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{user.displayName}</div>
                          <div className="text-gray-600">{user.emailAddress}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="text-xs text-gray-500">ID: {user.accountId}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUserFromGroup(user.accountId)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <Icon icon="material-symbols:person-remove" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Icon icon="material-symbols:group-off" className="mx-auto text-4xl mb-2" />
                    <p>Nenhum usuário encontrado neste grupo</p>
                  </div>
                )}
              </div>
            )}

            {/* Paginação */}
            {groupUsers.length > 0 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={handlePreviousPage}
                  disabled={pagination.startAt === 0}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <Icon icon="material-symbols:chevron-left" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.isLast}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <Icon icon="material-symbols:chevron-right" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}