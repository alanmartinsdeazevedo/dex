'use client';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchGroupUsers } from "@/src/lib/atlassian";

export default function GroupDetailsPage() {
  const pathname = usePathname();
  const groupId = pathname.split("/").pop();
  const [groupUsers, setGroupUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    startAt: 0,
    maxResults: 7,
    total: 0,
    isLast: false,
  });

  useEffect(() => {
    console.log("Teste: ",pathname)
    console.log("entrei no useEffect", groupId);
    if (!groupId) return;

    console.log("groupId:", groupId);
    console.log("pagination:", pagination);

    const loadGroupUsers = async () => {
      try {
        const data = await fetchGroupUsers(groupId as string, pagination.startAt, pagination.maxResults);
        setGroupUsers(data.values);
        setPagination({
          startAt: data.startAt,
          maxResults: data.maxResults,
          total: data.total,
          isLast: data.isLast,
        });
      } catch (error) {
        console.error("Erro ao buscar usu rios do grupo:", error);
      }
    };

    loadGroupUsers();
  }, [groupId, pagination.startAt, pagination.maxResults]);

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
        startAt: prev.startAt - prev.maxResults,
      }));
    }
  };

  return (
    <div className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Usuários do Grupo</h1>

        {/* Lista de usuários */}
        <div className="space-y-2">
          {groupUsers.length > 0 ? (
            groupUsers.map((user) => (
              <div key={user.accountId} className="p-2 border rounded flex justify-between">
                <div>
                  <strong>{user.displayName}</strong>
                  <p>{user.emailAddress}</p>
                </div>
                <span>{user.active ? "Ativo" : "Inativo"}</span>
              </div>
            ))
          ) : (
            <p>Nenhum usuário encontrado neste grupo.</p>
          )}
        </div>

        {/* Botões de paginação */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={pagination.startAt === 0}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={pagination.isLast}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}