'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useUser } from '@/src/context/UserContext';
import { Icon } from "@iconify/react/dist/iconify.js";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/src/components/loading";

// ✅ Importar as novas funções do backend
import {
  fetchAtlassianGroups,
  createAtlassianGroup,
  updateAtlassianGroup,
  deleteAtlassianGroup,
  validateGroupName,
  validateAtlassianId,
} from '@/src/actions/atlassian-groups';

// ✅ Importar tipos
import { AtlassianGroup } from '@/src/utils/atlassian';

// ==================== INTERFACES ====================

interface GroupFilters {
  isActive?: boolean;
  search?: string;
  orderBy?: "order" | "name" | "created_at";
  orderDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// ==================== COMPONENTE PRINCIPAL ====================

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

export default function AtlassianGroupsPage() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const router = useRouter();

  // ==================== ESTADOS ====================
  
  // Estados principais
  const [groups, setGroups] = useState<AtlassianGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GroupFilters>({
    limit: 10,
    offset: 0,
    orderBy: "order",
    orderDirection: "asc",
  });

  // Estados de paginação
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
  });

  // Estados para criar grupo
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    group_id: '',
    group_name: '',
    description: '',
    order: 1,
  });

  // Estados para editar grupo
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editedGroup, setEditedGroup] = useState({
    group_name: '',
    description: '',
    order: 1,
    is_active: true,
  });

  // Estados de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  // ==================== EFEITOS ====================

  // Carregar grupos ao inicializar e quando filtros mudarem
  useEffect(() => {
    loadGroups();
  }, [filters]);

  // ==================== FUNÇÕES DE CARREGAMENTO ====================

  const loadGroups = async () => {
    try {
      setLoading(true);
      console.log('📥 Carregando grupos com filtros:', filters);
      
      const response = await fetchAtlassianGroups(filters);
      console.log('📤 Resposta recebida:', response);

      if (response.success && response.data) {
        setGroups(response.data.data || []);
        setPagination({
          total: response.data.pagination?.total || 0,
          hasMore: response.data.pagination?.hasMore || false,
        });
        console.log('✅ Grupos carregados:', response.data.data?.length || 0);
      } else {
        console.warn('⚠️ Resposta sem sucesso:', response.message);
        showToast("error", response.message || "Erro ao carregar grupos");
        setGroups([]);
        setPagination({ total: 0, hasMore: false });
      }
    } catch (error) {
      console.error("❌ Erro ao carregar grupos:", error);
      showToast("error", "Erro ao carregar grupos");
      setGroups([]);
      setPagination({ total: 0, hasMore: false });
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNÇÕES DE VALIDAÇÃO ====================

  const validateNewGroup = async () => {
    const errors: Record<string, string> = {};
    setIsValidating(true);

    // Validar campos obrigatórios
    if (!newGroup.group_id.trim()) {
      errors.group_id = 'ID do Atlassian é obrigatório';
    }
    if (!newGroup.group_name.trim()) {
      errors.group_name = 'Nome do grupo é obrigatório';
    }

    // Validar se ID do Atlassian já existe
    if (newGroup.group_id.trim()) {
      const idValidation = await validateAtlassianId(newGroup.group_id);
      if (idValidation.success && idValidation.data?.exists) {
        errors.group_id = 'Este ID do Atlassian já está em uso';
      }
    }

    // Validar se nome do grupo já existe
    if (newGroup.group_name.trim()) {
      const nameValidation = await validateGroupName(newGroup.group_name);
      if (nameValidation.success && nameValidation.data?.exists) {
        errors.group_name = 'Este nome de grupo já está em uso';
      }
    }

    setValidationErrors(errors);
    setIsValidating(false);
    return Object.keys(errors).length === 0;
  };

  const validateEditedGroup = async () => {
    const errors: Record<string, string> = {};
    setIsValidating(true);

    // Validar campos obrigatórios
    if (!editedGroup.group_name.trim()) {
      errors.group_name = 'Nome do grupo é obrigatório';
    }

    // Validar se nome do grupo já existe (excluindo o grupo atual)
    if (editedGroup.group_name.trim() && editingGroupId) {
      const nameValidation = await validateGroupName(editedGroup.group_name, editingGroupId);
      if (nameValidation.success && nameValidation.data?.exists) {
        errors.group_name = 'Este nome de grupo já está em uso';
      }
    }

    setValidationErrors(errors);
    setIsValidating(false);
    return Object.keys(errors).length === 0;
  };

  // ==================== FUNÇÕES DE CRUD ====================

  const handleCreateGroup = async () => {
    if (!user?.id) {
      showToast("error", "Usuário não autenticado");
      return;
    }

    const isValid = await validateNewGroup();
    if (!isValid) {
      showToast("warn", "Por favor, corrija os erros no formulário");
      return;
    }

    try {
      const response = await createAtlassianGroup(newGroup, user.id);

      if (response.success) {
        showToast("success", "Grupo criado com sucesso!");
        setNewGroup({ group_id: '', group_name: '', description: '', order: 1 });
        setShowCreateForm(false);
        setValidationErrors({});
        loadGroups(); // Recarregar lista
      } else {
        showToast("error", response.message || "Erro ao criar grupo");
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      showToast("error", "Erro ao criar grupo");
    }
  };

  const handleUpdateGroup = async () => {
    if (!user?.id || !editingGroupId) {
      showToast("error", "Usuário não autenticado ou grupo não selecionado");
      return;
    }

    const isValid = await validateEditedGroup();
    if (!isValid) {
      showToast("warn", "Por favor, corrija os erros no formulário");
      return;
    }

    try {
      const response = await updateAtlassianGroup(editingGroupId, editedGroup, user.id);

      if (response.success) {
        showToast("success", "Grupo atualizado com sucesso!");
        setEditingGroupId(null);
        setEditedGroup({ group_name: '', description: '', order: 1, is_active: true });
        setValidationErrors({});
        loadGroups(); // Recarregar lista
      } else {
        showToast("error", response.message || "Erro ao atualizar grupo");
      }
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      showToast("error", "Erro ao atualizar grupo");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user?.id) {
      showToast("error", "Usuário não autenticado");
      return;
    }

    if (!confirm("Tem certeza de que deseja remover este grupo?")) {
      return;
    }

    try {
      const response = await deleteAtlassianGroup(groupId, user.id);

      if (response.success) {
        showToast("success", "Grupo removido com sucesso!");
        loadGroups(); // Recarregar lista
      } else {
        showToast("error", response.message || "Erro ao remover grupo");
      }
    } catch (error) {
      console.error("Erro ao remover grupo:", error);
      showToast("error", "Erro ao remover grupo");
    }
  };

  // ==================== FUNÇÕES DE NAVEGAÇÃO ====================

  const handleGroupClick = (groupId: string) => {
    router.push(`/codex/atlassian/groups/${groupId}`);
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setFilters(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 10),
      }));
    }
  };

  const handlePreviousPage = () => {
    const currentOffset = filters.offset || 0;
    const limit = filters.limit || 10;
    
    if (currentOffset > 0) {
      setFilters(prev => ({
        ...prev,
        offset: Math.max(0, currentOffset - limit),
      }));
    }
  };

  // ==================== FUNÇÕES AUXILIARES ====================

  const startEditGroup = (group: AtlassianGroup) => {
    setEditingGroupId(group.id);
    setEditedGroup({
      group_name: group.group_name,
      description: group.description || '',
      order: group.order || 1,
      is_active: group.is_active,
    });
    setValidationErrors({});
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditedGroup({ group_name: '', description: '', order: 1, is_active: true });
    setValidationErrors({});
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setNewGroup({ group_id: '', group_name: '', description: '', order: 1 });
    setValidationErrors({});
  };

  // ==================== RENDERIZAÇÃO ====================

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <>
      <ToastContainer />
      <div className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
        <div className="container mx-auto p-4">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gerenciamento de Grupos Atlassian</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={showCreateForm}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              <Icon icon="material-symbols:add" className="inline mr-2" />
              Novo Grupo
            </button>
          </div>

          {/* Filtros e busca */}
          <div className="mb-4 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, offset: 0 }))}
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            <select
              value={filters.orderBy || 'order'}
              onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value as any, offset: 0 }))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="order">Ordenar por Ordem</option>
              <option value="name">Ordenar por Nome</option>
              <option value="created_at">Ordenar por Data</option>
            </select>
            <select
              value={filters.orderDirection || 'asc'}
              onChange={(e) => setFilters(prev => ({ ...prev, orderDirection: e.target.value as any, offset: 0 }))}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
            <select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setFilters(prev => ({ 
                  ...prev, 
                  isActive: value === 'all' ? undefined : value === 'true',
                  offset: 0 
                }));
              }}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          {/* Formulário de criação */}
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Grupo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID do Atlassian *</label>
                  <input
                    type="text"
                    value={newGroup.group_id}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, group_id: e.target.value }))}
                    className={`w-full border rounded px-3 py-2 ${validationErrors.group_id ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Ex: db32e550-152b-4ce2-abbf-b4bd98a6844a"
                  />
                  {validationErrors.group_id && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.group_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Grupo *</label>
                  <input
                    type="text"
                    value={newGroup.group_name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, group_name: e.target.value }))}
                    className={`w-full border rounded px-3 py-2 ${validationErrors.group_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Ex: Públicos"
                  />
                  {validationErrors.group_name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.group_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <input
                    type="text"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Descrição do grupo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ordem</label>
                  <input
                    type="number"
                    value={newGroup.order}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreateGroup}
                  disabled={isValidating}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                  {isValidating ? 'Validando...' : 'Criar Grupo'}
                </button>
                <button
                  onClick={cancelCreate}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de grupos */}
          {loading ? (
            <div className="text-center py-8">
              <Loading />
            </div>
          ) : (
            <div className="space-y-3">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                  >
                    {editingGroupId === group.id ? (
                      // Modo de edição
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            value={editedGroup.group_name}
                            onChange={(e) => setEditedGroup(prev => ({ ...prev, group_name: e.target.value }))}
                            className={`w-full border rounded px-3 py-2 ${validationErrors.group_name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nome do grupo"
                          />
                          {validationErrors.group_name && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.group_name}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={editedGroup.description}
                            onChange={(e) => setEditedGroup(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="Descrição"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editedGroup.order}
                            onChange={(e) => setEditedGroup(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                            className="w-20 border border-gray-300 rounded px-2 py-1"
                            min="1"
                          />
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={editedGroup.is_active}
                              onChange={(e) => setEditedGroup(prev => ({ ...prev, is_active: e.target.checked }))}
                            />
                            <span className="text-sm">Ativo</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      // Modo de visualização
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleGroupClick(group.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold hover:underline">{group.group_name}</h3>
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
                              <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                              ID: {group.group_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botões de ação */}
                    <div className="flex gap-2 ml-4">
                      {editingGroupId === group.id ? (
                        <>
                          <button
                            onClick={handleUpdateGroup}
                            disabled={isValidating}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                          >
                            {isValidating ? 'Validando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditGroup(group)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            <Icon icon="material-symbols:edit" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            <Icon icon="material-symbols:delete" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon icon="material-symbols:group-off" className="mx-auto text-4xl mb-2" />
                  <p>Nenhum grupo encontrado</p>
                  {filters.search && (
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Paginação */}
          {groups.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {groups.length} de {pagination.total} grupos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={(filters.offset || 0) === 0}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <Icon icon="material-symbols:chevron-left" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasMore}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  <Icon icon="material-symbols:chevron-right" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}