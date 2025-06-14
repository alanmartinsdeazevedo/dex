'use client'
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState, useTransition, FormEvent } from "react";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/src/components/loading";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ConfirmModal } from "@/src/components/modal";
import { Button, Badge, Table, Dropdown, Modal, TextInput, Select, Label } from "flowbite-react";

// 🚀 Importar as server actions
import { 
  fetchSystemUsers,
  fetchSystemUserById,
  updateSystemUser,
  toggleUserStatus,
  changeUserRole,
  deleteSystemUser,
  fetchUserLogs,
  fetchSystemStats,
  fetchUsersByRole
} from '@/src/actions/users';

// 🔧 Importar utilitários client-side
import {
  formatRelativeTime,
  getUserStatusColor
} from '@/src/utils/users-helpers';

// 📋 Importar tipos
import type {
  SystemUser,
  UsersFilters,
  ComponentUsersFilters,
  ToastType
} from '@/src/types';

// 📋 Importar constantes
import { getAvailableRoles } from '@/src/constants/roles';

// 🔐 Importar contexto de usuário
import { useUser } from '@/src/context/UserContext';

const showToast = (type: ToastType, message: string) => {
  toast[type](message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
};

// Componente da Página
export default function SystemUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados para usuários e filtros
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 25,
    offset: 0,
    hasMore: false,
  });

  // Estados de filtros
  const [filters, setFilters] = useState<ComponentUsersFilters>({
    search: '',
    isActive: undefined,
    roleId: undefined,
    orderBy: 'created_at',
    orderDirection: 'desc',
    limit: 25,
    offset: 0,
  });

  // Estados para modais e ações
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Estados para formulários
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role_id: ''
  });
  const [newRoleId, setNewRoleId] = useState('');

  // Estados para ações
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [userLogs, setUserLogs] = useState<any[]>([]);

  // Dados auxiliares
  const availableRoles = getAvailableRoles();

  // ✅ NOVO: Função para lidar com submissão do formulário de filtros
  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleApplyFilters();
  };

  // ✅ NOVO: Função para detectar Enter nos campos de filtro
  const handleFilterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyFilters();
    }
  };

  // 📄 Função para carregar usuários
  const loadUsers = (newFilters?: Partial<ComponentUsersFilters>) => {
    setIsLoading(true);
    const currentFilters = newFilters ? { ...filters, ...newFilters } : filters;

    console.log('Filtros enviados para API:', currentFilters);

    startTransition(async () => {
      try {
        const apiFilters: UsersFilters = {
          search: currentFilters.search || undefined,
          isActive: currentFilters.isActive,
          roleId: currentFilters.roleId,
          orderBy: currentFilters.orderBy,
          orderDirection: currentFilters.orderDirection,
          limit: currentFilters.limit,
          offset: currentFilters.offset,
        };

        const result = await fetchSystemUsers(apiFilters);

        console.log('Resposta da API:', result);

        if (result.success && result.data) {
          setUsers(result.data);
          if (result.pagination) {
            setPagination(result.pagination);
          }
        } else {
          console.error('Erro na resposta da API:', result);
          showToast("error", result.message || "Erro ao carregar usuários");
          setUsers([]);
        }
      } catch (error: any) {
        console.error("Erro ao carregar usuários:", error);
        showToast("error", "Erro inesperado ao carregar usuários");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Carregar usuários na inicialização
  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  // 🔍 Função para aplicar filtros
  const handleApplyFilters = () => {
    const cleanFilters: ComponentUsersFilters = {
      search: filters.search?.trim() || '',
      isActive: filters.isActive,
      roleId: filters.roleId,
      orderBy: filters.orderBy,
      orderDirection: filters.orderDirection,
      limit: Math.max(1, Math.min(100, filters.limit)),
      offset: 0,
    };

    console.log('Filtros validados:', cleanFilters);
    setFilters(cleanFilters);
    loadUsers(cleanFilters);
  };

  // 🔄 Função para alternar status do usuário
  const handleToggleStatus = async (user: SystemUser) => {
    setIsTogglingStatus(user.id);

    startTransition(async () => {
      try {
        const result = await toggleUserStatus(user.id, user?.id);

        if (result.success) {
          showToast("success", result.message || `Usuário ${result.data?.is_active ? 'ativado' : 'desativado'} com sucesso`);
          loadUsers();
        } else {
          showToast("error", result.message || "Erro ao alterar status do usuário");
        }
      } catch (error: any) {
        console.error("Erro ao alterar status:", error);
        showToast("error", "Erro inesperado ao alterar status");
      } finally {
        setIsTogglingStatus(null);
      }
    });
  };

  // ✏️ Função para editar usuário
  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role_id: user.role_id
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const result = await updateSystemUser(selectedUser.id, editForm);
      
      if (result.success) {
        showToast("success", "Usuário atualizado com sucesso");
        setShowEditModal(false);
        loadUsers();
      } else {
        showToast("error", result.message || "Erro ao atualizar usuário");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      showToast("error", "Erro inesperado ao atualizar usuário");
    } finally {
      setIsUpdating(false);
    }
  };

  // 🔄 Função para alterar role
  const handleChangeRoleOpen = (user: SystemUser) => {
    setSelectedUser(user);
    setNewRoleId(user.role_id);
    setShowChangeRoleModal(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRoleId) return;

    setIsChangingRole(true);
    try {
      const result = await changeUserRole(selectedUser.id, newRoleId);
      
      if (result.success) {
        showToast("success", "Perfil alterado com sucesso");
        setShowChangeRoleModal(false);
        loadUsers();
      } else {
        showToast("error", result.message || "Erro ao alterar perfil");
      }
    } catch (error: any) {
      console.error("Erro ao alterar perfil:", error);
      showToast("error", "Erro inesperado ao alterar perfil");
    } finally {
      setIsChangingRole(false);
    }
  };

  // 🗑️ Função para deletar usuário
  const handleDeleteUser = (user: SystemUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const result = await deleteSystemUser(selectedUser.id);
      
      if (result.success) {
        showToast("success", "Usuário removido com sucesso");
        setShowDeleteModal(false);
        loadUsers();
      } else {
        showToast("error", result.message || "Erro ao remover usuário");
      }
    } catch (error: any) {
      console.error("Erro ao remover usuário:", error);
      showToast("error", "Erro inesperado ao remover usuário");
    } finally {
      setIsDeleting(false);
    }
  };

  // 📋 Função para visualizar logs
  const handleViewLogs = async (user: SystemUser) => {
    setSelectedUser(user);
    setShowLogsModal(true);
    setIsLoadingLogs(true);

    startTransition(async () => {
      try {
        const result = await fetchUserLogs(user.id, { limit: 50 });

        if (result.success && result.data) {
          setUserLogs(result.data.logs || []);
        } else {
          showToast("error", result.message || "Erro ao carregar logs");
          setUserLogs([]);
        }
      } catch (error: any) {
        console.error("Erro ao carregar logs:", error);
        showToast("error", "Erro inesperado ao carregar logs");
        setUserLogs([]);
      } finally {
        setIsLoadingLogs(false);
      }
    });
  };

  // 📄 Paginação
  const handleNextPage = () => {
    const newOffset = filters.offset + filters.limit;
    const newFilters = { 
      ...filters, 
      offset: newOffset,
    };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(0, filters.offset - filters.limit);
    const newFilters = { 
      ...filters, 
      offset: newOffset,
    };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  // Proteção de Rota e Loading Inicial
  if (!user) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col py-8 mx-auto gap-4 md:h-screen lg:py-0">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Usuários do Sistema
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie os usuários internos do sistema Dex
            </p>
          </div>
          
          {/* Estatísticas Rápidas */}
          <div className="flex gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl text-center font-bold text-green-600 dark:text-green-400">
                {users.filter(u => u.is_active).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Mostrando
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl text-center font-bold text-blue-600 dark:text-blue-400">
                {pagination.total}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total de Usuários
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FILTROS CORRIGIDOS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mx-4">
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <Label htmlFor="search" value="Buscar" className="text-gray-700 dark:text-gray-300" />
                <TextInput
                  id="search"
                  type="text"
                  placeholder="Nome, email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={handleFilterKeyDown}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" value="Status" className="text-gray-700 dark:text-gray-300" />
                <Select
                  id="status"
                  value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({
                      ...filters,
                      isActive: value === 'all' ? undefined : value === 'true'
                    });
                  }}
                  onKeyDown={handleFilterKeyDown}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </Select>
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role" value="Perfil" className="text-gray-700 dark:text-gray-300" />
                <Select
                  id="role"
                  value={filters.roleId || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    roleId: e.target.value || undefined 
                  })}
                  onKeyDown={handleFilterKeyDown}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os perfis</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Ordenação */}
              <div>
                <Label htmlFor="orderBy" value="Ordenar por" className="text-gray-700 dark:text-gray-300" />
                <Select
                  id="orderBy"
                  value={`${filters.orderBy}-${filters.orderDirection}`}
                  onChange={(e) => {
                    const [orderBy, orderDirection] = e.target.value.split('-');
                    setFilters({
                      ...filters,
                      orderBy: orderBy as any,
                      orderDirection: orderDirection as any
                    });
                  }}
                  onKeyDown={handleFilterKeyDown}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="created_at-desc">Mais recentes</option>
                  <option value="created_at-asc">Mais antigos</option>
                  <option value="name-asc">Nome A-Z</option>
                  <option value="name-desc">Nome Z-A</option>
                  <option value="last_login-desc">Último login</option>
                </Select>
              </div>
            </div>

            {/* ✅ BOTÃO CORRIGIDO COM MELHOR VISIBILIDADE */}
            <div className="flex justify-end mt-4">
              <Button 
                type="submit"
                disabled={isLoading}
                color="blue"
                className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <Icon icon="line-md:search" className="mr-2 h-4 w-4"/>
                Aplicar Filtros
              </Button>
            </div>
          </form>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mx-4 overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head className="bg-gray-50 dark:bg-gray-700">
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Nome</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">E-mail</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Perfil</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Status</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Último Login</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Logs</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Ações</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.length > 0 ? users.map((user) => (
                      <Table.Row key={user.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Nome */}
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </Table.Cell>

                        {/* E-mail */}
                        <Table.Cell className="text-gray-500 dark:text-gray-400">
                          {user.email}
                        </Table.Cell>

                        {/* Perfil */}
                        <Table.Cell>
                          <Badge color="purple" size="sm">
                            {user.role?.role || 'N/A'}
                          </Badge>
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell>
                          <Badge 
                            color={getUserStatusColor(user.is_active).color} 
                            size="sm"
                          >
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </Table.Cell>

                        {/* Último Login */}
                        <Table.Cell className="text-gray-500 dark:text-gray-400">
                          <div className="text-sm">
                            {user.last_login 
                              ? formatRelativeTime(user.last_login)
                              : 'Nunca'
                            }
                          </div>
                        </Table.Cell>

                        {/* Logs */}
                        <Table.Cell>
                          <div className="flex gap-2">
                            <Badge color="gray" size="sm">
                              {(user._count?.Log || 0) + (user._count?.AtlassianLog || 0)}
                            </Badge>
                            <Button
                              size="xs"
                              color="gray"
                              onClick={() => handleViewLogs(user)}
                            >
                              <Icon icon="mdi:eye" className="w-3 h-3" />
                            </Button>
                          </div>
                        </Table.Cell>

                        {/* Ações */}
                        <Table.Cell>
                          <div className="flex gap-2">
                            <Dropdown
                              label=""
                              dismissOnClick={false}
                              renderTrigger={() => (
                                <Button size="xs" color="gray">
                                  <Icon icon="mdi:dots-vertical" className="w-4 h-4" />
                                </Button>
                              )}
                            >
                              {/* Editar */}
                              <Dropdown.Item onClick={() => handleEditUser(user)}>
                                <Icon icon="mdi:pencil" className="mr-2 w-4 h-4" />
                                Editar
                              </Dropdown.Item>

                              {/* Alterar Status */}
                              <Dropdown.Item 
                                onClick={() => handleToggleStatus(user)}
                                disabled={isTogglingStatus === user.id}
                              >
                                <Icon 
                                  icon={user.is_active ? "mdi:account-off" : "mdi:account-check"} 
                                  className="mr-2 w-4 h-4" 
                                />
                                {isTogglingStatus === user.id 
                                  ? 'Processando...'
                                  : user.is_active ? 'Desativar' : 'Ativar'
                                }
                              </Dropdown.Item>

                              {/* Alterar Perfil */}
                              <Dropdown.Item onClick={() => handleChangeRoleOpen(user)}>
                                <Icon icon="mdi:account-cog" className="mr-2 w-4 h-4" />
                                Alterar Perfil
                              </Dropdown.Item>

                              {/* Deletar */}
                              <Dropdown.Item onClick={() => handleDeleteUser(user)}>
                                <Icon icon="mdi:delete" className="mr-2 w-4 h-4" />
                                Remover
                              </Dropdown.Item>
                            </Dropdown>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )) : (
                      <Table.Row>
                        <Table.Cell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Icon icon="mdi:account-search" className="w-12 h-12 text-gray-400" />
                            <p className="text-gray-500 dark:text-gray-400">
                              Nenhum usuário encontrado
                            </p>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>

              {/* Paginação */}
              {pagination.total > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} usuários
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="gray"
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0 || isLoading}
                    >
                      <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      color="gray"
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore || isLoading}
                    >
                      Próximo
                      <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} size="md">
        <Modal.Header>Editar Usuário</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" value="Nome" />
              <TextInput
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" value="E-mail" />
              <TextInput
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-role" value="Perfil" />
              <Select
                id="edit-role"
                value={editForm.role_id}
                onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
              >
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSaveEdit} disabled={isUpdating}>
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Alteração de Role */}
      <Modal show={showChangeRoleModal} onClose={() => setShowChangeRoleModal(false)} size="md">
        <Modal.Header>Alterar Perfil do Usuário</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>
              Alterar perfil de <strong>{selectedUser?.name}</strong>?
            </p>
            <div>
              <Label htmlFor="new-role" value="Novo Perfil" />
              <Select
                id="new-role"
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
              >
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role} - {role.description}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleChangeRole} disabled={isChangingRole || !newRoleId}>
            {isChangingRole ? 'Alterando...' : 'Alterar Perfil'}
          </Button>
          <Button color="gray" onClick={() => setShowChangeRoleModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Logs */}
      <Modal show={showLogsModal} onClose={() => setShowLogsModal(false)} size="4xl">
        <Modal.Header>Logs do Usuário: {selectedUser?.name}</Modal.Header>
        <Modal.Body>
          {isLoadingLogs ? (
            <Loading />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userLogs.length > 0 ? (
                userLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.type === 'system' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action}
                        </p>
                        <Badge color={log.type === 'system' ? 'blue' : 'purple'} size="xs">
                          {log.type === 'system' ? 'Sistema' : 'Atlassian'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.response}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatRelativeTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Icon icon="mdi:file-document-outline" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum log encontrado para este usuário
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowLogsModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        show={showDeleteModal}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja remover o usuário "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, Remover"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isProcessing={isDeleting}
        confirmButtonColor="red"
      />

      <ToastContainer limit={4} />
    </>
  );
}