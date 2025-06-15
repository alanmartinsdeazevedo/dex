'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button, Badge, TextInput, Select, Label, Table, Textarea } from "flowbite-react";
import { useEffect, useState, FormEvent } from "react";
import { useUser } from '@/src/context/UserContext';
import { Icon } from "@iconify/react/dist/iconify.js";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/src/components/loading";

import {
  fetchAtlassianGroupsFromApi,
  createGroupInAtlassian,
  addAtlassianGroupToDatabase,
  AtlassianGroupFromApi,
  AtlassianGroupsResponse,
} from '@/src/actions/atlassian-groups';

// ==================== INTERFACES ====================

interface GroupFilters {
  search?: string;
  maxResults?: number;
  startAt?: number;
}

interface PaginationInfo {
  total: number;
  isLast: boolean;
  startAt: number;
  maxResults: number;
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
  const [groups, setGroups] = useState<AtlassianGroupFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [filters, setFilters] = useState<GroupFilters>({
    maxResults: 50,
    startAt: 0,
  });

  // Estados de paginação
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    isLast: false,
    startAt: 0,
    maxResults: 50,
  });

  // Estados para modal de criação de grupo na Atlassian
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Estados para modal de adição à base de dados
  const [showAddToDbModal, setShowAddToDbModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AtlassianGroupFromApi | null>(null);
  const [addToDbData, setAddToDbData] = useState({
    description: '',
    order: 1,
  });
  const [isAddingToDb, setIsAddingToDb] = useState(false);

  // Estados de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ==================== FUNÇÕES DE CACHE ====================
  
  const CACHE_KEY = 'atlassian-groups-cache';
  const CACHE_TIME_KEY = 'atlassian-groups-cache-time';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const clearCache = () => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIME_KEY);
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  };

  const getCachedData = () => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
      
      if (cachedData && cacheTime) {
        const isExpired = Date.now() - parseInt(cacheTime) > CACHE_DURATION;
        
        if (!isExpired) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.warn('Erro ao ler cache:', error);
    }
    return null;
  };

  const setCachedData = (data: any) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Erro ao salvar cache:', error);
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (user && !initialLoad) {
      // Verificar se há dados em cache válidos
      const cachedData = getCachedData();
      
      if (cachedData && cachedData.groups) {
        // Usar dados do cache
        setGroups(cachedData.groups || []);
        setPagination(cachedData.pagination || { total: 0, isLast: true, startAt: 0, maxResults: 50 });
        setLoading(false);
        setInitialLoad(true);
        console.log('✅ Dados carregados do cache:', cachedData.groups.length, 'grupos');
      } else {
        // Se não há cache válido, carregar dados
        loadAtlassianGroups();
        setInitialLoad(true);
      }
    }
  }, [user, initialLoad]);

  // Detectar quando a página fica visível novamente (opcional - para refresh automático)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && initialLoad && groups.length > 0) {
        // Opcional: recarregar dados quando volta para a aba
        // Descomente a linha abaixo se quiser refresh automático
        // loadAtlassianGroups();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialLoad, groups.length]);

  // ==================== FUNÇÕES DE CARREGAMENTO ====================

  const loadAtlassianGroups = async (customFilters?: GroupFilters) => {
    try {
      setLoading(true);
      const filtersToUse = customFilters || filters;
      console.log('📥 Carregando grupos da Atlassian com filtros:', filtersToUse);
      
      const response = await fetchAtlassianGroupsFromApi(
        filtersToUse.maxResults,
        filtersToUse.startAt,
        filtersToUse.search,
      );
      
      console.log('📤 Resposta recebida:', response);

      if (response.success && response.data) {
        const newGroups = response.data.groups || [];
        const newPagination = {
          total: response.data.total || 0,
          isLast: response.data.isLast || false,
          startAt: filtersToUse.startAt || 0,
          maxResults: filtersToUse.maxResults || 50,
        };

        setGroups(newGroups);
        setPagination(newPagination);

        // Salvar no cache apenas se for a primeira página sem filtros
        if (!filtersToUse.search && filtersToUse.startAt === 0) {
          const dataToCache = {
            groups: newGroups,
            pagination: newPagination
          };
          setCachedData(dataToCache);
        }

        console.log('✅ Grupos carregados:', newGroups.length);
      } else {
        console.warn('⚠️ Resposta sem sucesso:', response.message);
        showToast("error", response.message || "Erro ao carregar grupos da Atlassian");
        setGroups([]);
        setPagination({ total: 0, isLast: true, startAt: 0, maxResults: 50 });
      }
    } catch (error) {
      console.error("❌ Erro ao carregar grupos:", error);
      showToast("error", "Erro ao carregar grupos da Atlassian");
      setGroups([]);
      setPagination({ total: 0, isLast: true, startAt: 0, maxResults: 50 });
    } finally {
      setLoading(false);
    }
  };

  // ==================== FUNÇÕES DE BUSCA E FILTROS ====================

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, startAt: 0 };
    setFilters(newFilters);
    loadAtlassianGroups(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: GroupFilters = {
      maxResults: 50,
      startAt: 0,
    };
    setFilters(defaultFilters);
    loadAtlassianGroups(defaultFilters);
  };

  // ==================== FUNÇÕES DE PAGINAÇÃO ====================

  const handleNextPage = () => {
    if (!pagination.isLast) {
      const newStartAt = pagination.startAt + pagination.maxResults;
      const newFilters = { ...filters, startAt: newStartAt };
      setFilters(newFilters);
      loadAtlassianGroups(newFilters);
    }
  };

  const handlePrevPage = () => {
    if (pagination.startAt > 0) {
      const newStartAt = Math.max(0, pagination.startAt - pagination.maxResults);
      const newFilters = { ...filters, startAt: newStartAt };
      setFilters(newFilters);
      loadAtlassianGroups(newFilters);
    }
  };

  // ==================== FUNÇÕES CRUD ====================

  const handleCreateGroupInAtlassian = async () => {
    if (!newGroupName.trim()) {
      setValidationErrors({ groupName: 'Nome do grupo é obrigatório' });
      return;
    }

    try {
      setIsCreating(true);
      const response = await createGroupInAtlassian(newGroupName, user?.id || '');

      if (response.success) {
        showToast("success", "Grupo criado na Atlassian com sucesso!");
        setShowCreateModal(false);
        setNewGroupName('');
        setValidationErrors({});
        clearCache(); // Limpar cache
        loadAtlassianGroups(); // Recarregar lista
      } else {
        showToast("error", response.message || "Erro ao criar grupo na Atlassian");
      }
    } catch (error) {
      console.error("❌ Erro ao criar grupo:", error);
      showToast("error", "Erro inesperado ao criar grupo");
    } finally {
      setIsCreating(false);
    }
  };

  const openAddToDbModal = (group: AtlassianGroupFromApi) => {
    setSelectedGroup(group);
    setAddToDbData({
      description: `Grupo "${group.name}" importado da Atlassian`,
      order: 1,
    });
    setValidationErrors({});
    setShowAddToDbModal(true);
  };

  const handleAddGroupToDatabase = async () => {
    if (!selectedGroup) return;

    try {
      setIsAddingToDb(true);
      const response = await addAtlassianGroupToDatabase(
        selectedGroup.name,
        {
          groupId: selectedGroup.groupId,
          description: addToDbData.description,
          order: addToDbData.order,
        },
        user?.id || ''
      );

      if (response.success) {
        showToast("success", "Grupo adicionado à base de dados com sucesso!");
        setShowAddToDbModal(false);
        setSelectedGroup(null);
        setValidationErrors({});
        clearCache(); // Limpar cache
        loadAtlassianGroups(); // Recarregar para atualizar status inDatabase
      } else {
        showToast("error", response.message || "Erro ao adicionar grupo à base de dados");
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar grupo à BD:", error);
      showToast("error", "Erro inesperado ao adicionar grupo à base de dados");
    } finally {
      setIsAddingToDb(false);
    }
  };

  // ==================== FUNÇÕES DE MODAL ====================

  const openCreateModal = () => {
    setNewGroupName('');
    setValidationErrors({});
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewGroupName('');
    setValidationErrors({});
  };

  const closeAddToDbModal = () => {
    setShowAddToDbModal(false);
    setSelectedGroup(null);
    setValidationErrors({});
  };

  // Proteção de Rota e Loading Inicial
  if (!user) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col py-8 mx-auto gap-4 h-screen lg:py-0">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
          <div>
            <h1 className="text-2xl font-bold text-white dark:text-white">
              Grupos da Atlassian
            </h1>
            <p className="text-sm text-gray-300 dark:text-gray-400">
              Visualize e gerencie grupos criados na Atlassian
            </p>
          </div>
          
          {/* Estatísticas Rápidas */}
          <div className="flex gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl text-center font-bold text-green-600 dark:text-green-400">
                {groups.filter(g => g.inDatabase).length}
              </div>
              <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                Codex
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow border border-gray-200 dark:border-gray-700">
              <div className="text-2xl text-center font-bold text-blue-600 dark:text-blue-400">
                {groups.length}
              </div>
              <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                Total
              </div>
            </div>

            <Button 
              onClick={openCreateModal}
              color="blue"
              className="bg-green-600 hover:bg-green-700 items-center"
            >
              <Icon icon="material-symbols:add" className="mr-2 h-4 w-4"/>
              Novo Grupo
            </Button>
          </div>
        </div>

        {/* Filtros de Busca */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mx-4 p-4">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campo de Busca */}
              <div>
                <Label htmlFor="search" value="Buscar grupos" />
                <TextInput
                  id="search"
                  placeholder="Nome do grupo..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Itens por página */}
              <div>
                <Label htmlFor="maxResults" value="Itens por página" />
                <Select
                  id="maxResults"
                  value={filters.maxResults?.toString() || '50'}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 items-end">
                <Button 
                  type="button"
                  color="gray"
                  onClick={resetFilters}
                  className="flex-1"
                >
                  <Icon icon="material-symbols:refresh" className="mr-2 h-4 w-4"/>
                  Limpar
                </Button>

                <Button 
                  type="submit"
                  disabled={loading}
                  color="blue"
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  <Icon icon="line-md:search" className="mr-2 h-4 w-4"/>
                  Buscar
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Container da Tabela e Paginação - Flex Column com altura limitada */}
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mx-4 overflow-hidden flex-1 min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {/* Tabela com Scroll */}
              <div className="flex-1 overflow-auto min-h-0">
                <Table hoverable>
                  <Table.Head className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Nome do Grupo</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">ID do Grupo</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Status Codex</Table.HeadCell>
                    <Table.HeadCell className="text-gray-700 dark:text-gray-300">Ações</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <Table.Row 
                          key={group.groupId || group.name} 
                          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <Icon 
                                icon="material-symbols:groups" 
                                className="w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" 
                              />
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{group.name}</div>
                                {group.html && (
                                  <div className="text-xs text-gray-500">
                                    <a 
                                      href={group.html} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-blue-600"
                                    >
                                      Ver na Atlassian ↗
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-gray-700 dark:text-gray-300">
                            {group.groupId ? (
                              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                {group.groupId}
                              </code>
                            ) : (
                              <span className="text-gray-400 text-xs">Não disponível</span>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center">
                              <Badge 
                                color={group.inDatabase ? "green" : "gray"} 
                                size="sm"
                              >
                                <div className="flex items-center gap-1">
                                  <Icon 
                                    icon={group.inDatabase ? "material-symbols:check-circle" : "material-symbols:radio-button-unchecked"} 
                                    className="w-3 h-3 flex-shrink-0" 
                                  />
                                  <span className="whitespace-nowrap">
                                    {group.inDatabase ? "Adicionado" : "Não Adicionado"}
                                  </span>
                                </div>
                              </Badge>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2">
                              {!group.inDatabase ? (
                                <Button
                                  size="xs"
                                  color="green"
                                  onClick={() => openAddToDbModal(group)}
                                  title="Adicionar à base de dados"
                                >
                                  <Icon icon="material-symbols:add-circle" className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="xs"
                                  color="gray"
                                  disabled
                                  title="Já está na base de dados"
                                >
                                  <Icon icon="material-symbols:check-circle" className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="xs"
                                color="blue"
                                onClick={() => router.push(`/codex/atlassian/groups/${group.groupId || group.name}`)}
                                title="Ver detalhes"
                              >
                                <Icon icon="material-symbols:visibility" className="w-4 h-4" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell colSpan={4}>
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Icon icon="material-symbols:group-off" className="mx-auto text-4xl mb-2" />
                            <p>Nenhum grupo encontrado na Atlassian</p>
                            {filters.search && (
                              <p className="text-sm">Tente ajustar os filtros de busca</p>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>

              {/* Paginação Fixa na Parte Inferior */}
              {pagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 gap-3 sm:gap-0">
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                    <span className="hidden sm:inline">Mostrando </span>
                    {pagination.startAt + 1} - {Math.min(pagination.startAt + pagination.maxResults, pagination.total)} 
                    <span className="hidden sm:inline"> de</span>
                    <span className="sm:hidden">/</span> {pagination.total}
                    <span className="hidden sm:inline"> grupos</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="gray"
                      onClick={handlePrevPage}
                      disabled={pagination.startAt === 0 || loading}
                    >
                      <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Anterior</span>
                    </Button>
                    <Button
                      size="sm"
                      color="gray"
                      onClick={handleNextPage}
                      disabled={pagination.isLast || loading}
                    >
                      <span className="hidden sm:inline mr-1">Próximo</span>
                      <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Criação de Grupo na Atlassian */}
      <Modal show={showCreateModal} onClose={closeCreateModal} size="md">
        <Modal.Header>
          <div className="flex items-center gap-2">
            <Icon icon="material-symbols:add" className="w-5 h-5 text-green-500" />
            Novo Grupo
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_group_name" value="Nome do Grupo *" />
              <TextInput
                id="new_group_name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ex: desenvolvedores"
                color={validationErrors.groupName ? 'failure' : 'gray'}
                helperText={validationErrors.groupName}
              />
              <p className="text-xs text-gray-500 mt-1">
                O grupo será criado diretamente na Atlassian com este nome.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 w-full justify-end">
            <Button color="gray" onClick={closeCreateModal}>
              Cancelar
            </Button>
            <Button 
              color="green" 
              onClick={handleCreateGroupInAtlassian}
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? 'Criando...' : 'Criar na Atlassian'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Modal de Adição à Base de Dados */}
      <Modal show={showAddToDbModal} onClose={closeAddToDbModal} size="lg">
        <Modal.Header>
          <div className="flex items-center gap-2">
            <Icon icon="material-symbols:database" className="w-5 h-5 text-blue-500" />
            Adicionar Grupo à Base de Dados
          </div>
        </Modal.Header>
        <Modal.Body>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Grupo Selecionado:
                </h3>
                <div className="flex items-center gap-3">
                  <Icon icon="material-symbols:groups" className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="font-medium">{selectedGroup.name}</div>
                    {selectedGroup.groupId && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ID: {selectedGroup.groupId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="add_description" value="Descrição" />
                <Textarea
                  id="add_description"
                  value={addToDbData.description}
                  onChange={(e) => setAddToDbData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do grupo na base de dados"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="add_order" value="Ordem de Exibição" />
                <TextInput
                  id="add_order"
                  type="number"
                  value={addToDbData.order.toString()}
                  onChange={(e) => setAddToDbData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define a ordem de exibição do grupo na lista
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2 w-full justify-end">
            <Button color="gray" onClick={closeAddToDbModal}>
              Cancelar
            </Button>
            <Button 
              color="blue" 
              onClick={handleAddGroupToDatabase}
              disabled={isAddingToDb}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAddingToDb ? 'Adicionando...' : 'Adicionar à Base de Dados'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <ToastContainer limit={4} />
    </>
  );
}