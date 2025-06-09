'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Group, GroupList, GroupValues } from "@/src/types/group";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/src/components/loading";
import { fetchAllGroups, fetchGroupUsers as fetchGroupUsersFromAPI, createGroup, deleteGroup, updateGroup } from '@/src/lib/atlassian';
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

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupValues[]>([]);
  const [groupsValues, setGroupsValues] = useState<GroupValues[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editedGroupName, setEditedGroupName] = useState('');
  const [pagination, setPagination] = useState({
    startAt: 0,
    maxResults: 7,
    total: 0,
    isLast: false,
  });

  // Carregar todos os grupos ao iniciar a página
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const fetchedGroups = await fetchAllGroups(pagination.startAt, pagination.maxResults);
        setGroups(fetchedGroups.values);
        console.log("Grupos: ", groups);
        setPagination({
          startAt: fetchedGroups.startAt,
          maxResults: fetchedGroups.maxResults,
          total: fetchedGroups.total,
          isLast: fetchedGroups.isLast,
        });
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
        showToast("error", "Erro ao carregar grupos.");
      }
    };
    loadGroups();
  }, [pagination.maxResults, pagination.startAt]);

  // Função para criar um novo grupo
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      showToast("warn", "O nome do grupo é obrigatório.");
      return;
    }
    try {
      const createdGroup = await createGroup(newGroupName);
      setNewGroupName('');
      showToast("success", "Grupo criado com sucesso!");
      const fetchedGroups = await fetchAllGroups(pagination.startAt, pagination.maxResults);
      setGroups(fetchedGroups.values);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      showToast("error", "Erro ao criar grupo.");
    }
  };

  // Função para deletar um grupo
  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      setGroups(groups.filter(group => group.groupId !== groupId));
      showToast("success", "Grupo removido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar grupo:", error);
      showToast("error", "Erro ao remover grupo.");
    }
  };

  // Função para iniciar a edição de um grupo
  const startEditGroup = (group: any) => {
    setEditingGroupId(group.id);
    setEditedGroupName(group.name);
  };

  // Função para salvar as alterações de um grupo
  const handleUpdateGroup = async () => {
    if (!editedGroupName.trim()) {
      showToast("warn", "O nome do grupo é obrigatório.");
      return;
    }
    try {
      const updatedGroup = await updateGroup(editingGroupId!, editedGroupName);
      setGroups(groups.map(group => (group.groupId === editingGroupId ? updatedGroup : group)));
      setEditingGroupId(null);
      setEditedGroupName('');
      showToast("success", "Grupo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      showToast("error", "Erro ao atualizar grupo.");
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    router.push("/");
    return null;
  }

  const handleNextPage = () => {
    if (!pagination.isLast) {
      setPagination((prev) => ({
        ...prev,
        startAt: prev.startAt + prev.maxResults,
      }));
    }
  };
  
  const handlePreviousPage = () => {
    if (pagination.startAt > 0) {
      setPagination((prev) => ({
        ...prev,
        startAt: Math.max(0, prev.startAt - prev.maxResults),
      }));
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Gerenciamento de Grupos</h1>
  
          {/* Formulário para criar um novo grupo */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nome do novo grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 mr-2"
            />
            <button
              onClick={handleCreateGroup}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Criar Grupo
            </button>
          </div>
  
          {/* Lista de grupos */}
          <div className="space-y-2">
            {groups.length > 0 ? (
              groups.map((group) => (
                
                <div key={group.groupId} className="flex items-center justify-between p-3 border rounded">
                  <span
                    onClick={() => router.push(`/codex/groups/${group.groupId}`)} // Carrega os usuários ao clicar no grupo
                    className="cursor-pointer hover:underline"
                  >
                    {group.name}
                  </span>
                  <div className="flex space-x-2">
                    {editingGroupId !== group.groupId && (
                      <button
                        onClick={() => startEditGroup(group)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGroup(group.groupId)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum grupo encontrado.</p>
            )}
          </div>
          {/* Botões de paginação */}
          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.startAt === 0}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              <Icon icon="ooui:next-rtl" width="20" height="20" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.isLast}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              <Icon icon="ooui:next-ltr" width="20" height="20" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}