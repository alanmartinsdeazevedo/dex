'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState, useTransition } from "react";
import 'react-toastify/dist/ReactToastify.css';
import Loading from "@/src/components/loading";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ConfirmModal } from "@/src/components/modal";
import { Button } from "flowbite-react";

// 🚀 Importar as server actions
import { 
  fetchUserLdap, 
  disableLdapUser, 
  resetUserPassword,
  resetAndTestPassword,
  testUserAuthentication
} from '@/src/actions/ad';

// 🔧 Importar utilitários client-side (agora síncronos)
import {
  getUserAccountStatus,
  formatGroupName,
  convertADFileTime
} from '@/src/utils/ad-helpers';

const showToast = (type: "success" | "warn" | "error", message: string) => {
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

interface LdapUserData {
  distinguishedName: string;
  sAMAccountName: string;
  description?: string;
  userPrincipalName: string;
  givenName?: string;
  sn?: string;
  displayName: string;
  telephoneNumber?: string;
  title?: string;
  department?: string;
  memberOf?: string[];
  userAccountControl: string;
  manager?: string;
  dn?: string;
  accountExpires?: string;
  pwdLastSet?: string;
}

// Componente da Página
export default function LdapSearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados específicos para a busca LDAP
  const [searchTerm, setSearchTerm] = useState('');
  const [ldapUser, setLdapUser] = useState<LdapUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Estados para ações de usuário
  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showTestPasswordModal, setShowTestPasswordModal] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Estados para reset de senha
  const [customPassword, setCustomPassword] = useState('');
  const [lastGeneratedPassword, setLastGeneratedPassword] = useState<string | null>(null);
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  // Função para lidar com a mudança no input de busca
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (ldapUser || notFound || searchError) {
        setLdapUser(null);
        setNotFound(false);
        setSearchError(null);
    }
  };

  // 🔍 Função para executar a busca LDAP usando server action
  const handleLdapSearch = async () => {
    if (!searchTerm.trim()) {
      showToast("warn", "Por favor, informe um termo para busca (ex: username ou email).");
      return;
    }

    setIsLoading(true);
    setLdapUser(null);
    setNotFound(false);
    setSearchError(null);

    startTransition(async () => {
      try {
        const result = await fetchUserLdap(searchTerm);

        if (result) {
          setLdapUser(result);
          showToast("success", "Usuário encontrado no Active Directory.");
        } else {
          setNotFound(true);
          showToast("warn", "Usuário não encontrado no Active Directory.");
        }
      } catch (error: any) {
        console.error("Erro na busca LDAP:", error);
        const errorMessage = error?.message || "Ocorreu um erro inesperado durante a busca.";
        setSearchError(errorMessage);
        showToast("error", `Erro na busca: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    });
  };

  // 🚫 Função para desativar usuário
  const handleConfirmDisableUser = async () => {
    if (!ldapUser) {
      showToast("error", "Usuário não selecionado para desativação.");
      setShowDisableConfirmModal(false);
      return;
    }

    setIsDisabling(true);
    setShowDisableConfirmModal(false);

    startTransition(async () => {
      try {
        const result = await disableLdapUser(ldapUser.sAMAccountName);

        if (result.success) {
          showToast("success", result.message || `Usuário ${ldapUser.sAMAccountName} desativado com sucesso.`);
          await handleLdapSearch(); // Atualizar dados
        } else {
          showToast("error", result.message || `Falha ao desativar o usuário ${ldapUser.sAMAccountName}.`);
        }
      } catch (error: any) {
        console.error("Erro ao desativar usuário LDAP:", error);
        const errorMessage = error?.message || "Ocorreu um erro inesperado durante a desativação.";
        showToast("error", `Erro: ${errorMessage}`);
      } finally {
        setIsDisabling(false);
      }
    });
  };

  // 🏴‍☠️ Função para resetar senha (One Piece)
  const handleResetPassword = async () => {
    if (!ldapUser) {
      showToast("error", "Usuário não selecionado para reset de senha.");
      return;
    }

    setIsResetting(true);
    setShowResetPasswordModal(false);

    startTransition(async () => {
      try {
        const result = await resetUserPassword(ldapUser.sAMAccountName, customPassword || undefined);

        if (result.success) {
          setLastGeneratedPassword(result.newPassword || null);
          showToast("success", `${result.message} ${result.newPassword ? `Nova senha: ${result.newPassword}` : ''}`);
        } else {
          showToast("error", result.message || "Falha ao resetar senha.");
        }
      } catch (error: any) {
        console.error("Erro ao resetar senha:", error);
        showToast("error", `Erro: ${error?.message || "Erro desconhecido"}`);
      } finally {
        setIsResetting(false);
        setCustomPassword('');
      }
    });
  };

  // 🧪 Função para testar senha
  const handleTestPassword = async () => {
    if (!ldapUser || !testPassword.trim()) {
      showToast("warn", "Informe uma senha para testar.");
      return;
    }

    setIsTesting(true);

    startTransition(async () => {
      try {
        const result = await testUserAuthentication(ldapUser.sAMAccountName, testPassword);
        setTestResult(result);

        if (result.success) {
          showToast("success", `✅ Autenticação bem-sucedida! Tempo: ${result.authTime}ms`);
        } else {
          showToast("error", `❌ Falha na autenticação: ${result.message}`);
        }
      } catch (error: any) {
        console.error("Erro ao testar senha:", error);
        showToast("error", `Erro: ${error?.message || "Erro desconhecido"}`);
      } finally {
        setIsTesting(false);
      }
    });
  };

  // 🚀 Função para reset + teste automático
  const handleResetAndTest = async () => {
    if (!ldapUser) {
      showToast("error", "Usuário não selecionado.");
      return;
    }

    setIsResetting(true);

    startTransition(async () => {
      try {
        const result = await resetAndTestPassword(ldapUser.sAMAccountName, customPassword || undefined);

        if (result.success) {
          setLastGeneratedPassword(result.newPassword || null);
          showToast("success", `🎉 ${result.message} Nova senha: ${result.newPassword}`);
        } else {
          const resetMsg = result.resetResult?.success ? "Reset OK" : "Reset falhou";
          const authMsg = result.authResult?.success ? "Teste OK" : `Teste falhou: ${result.authResult?.message}`;
          showToast("warn", `${resetMsg}, ${authMsg}`);
          
          if (result.newPassword) {
            setLastGeneratedPassword(result.newPassword);
          }
        }
      } catch (error: any) {
        console.error("Erro no reset e teste:", error);
        showToast("error", `Erro: ${error?.message || "Erro desconhecido"}`);
      } finally {
        setIsResetting(false);
        setCustomPassword('');
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLdapSearch();
  };

  // Obter status da conta usando utilitário (agora síncrono)
  const accountStatus = ldapUser ? getUserAccountStatus(ldapUser.userAccountControl) : null;

  // Proteção de Rota e Loading Inicial
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
        {/* Barra de Busca */}
        <nav className="block w-full px-4 py-2 mx-auto bg-white dark:bg-gray-700 shadow-md rounded-md lg:px-8 lg:py-3">
          <div className="flex flex-row items-center justify-center w-full">
            <div className="flex w-full max-w-lg items-center p-4">
              <form className="w-full" onSubmit={handleSearchSubmit}>
                <label htmlFor="ldap-search-input" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
                  Buscar Usuário AD
                </label>
                <div className="flex w-full items-center relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <input
                    type="search"
                    id="ldap-search-input"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    className="w-full p-4 pl-4 pr-20 bg-transparent text-sm text-gray-900 border-hidden rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Buscar por username, email, nome..."
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || isPending}
                    className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                  >
                    {(isLoading || isPending) ? 'Buscando...' : <Icon icon="line-md:search" width="16" height="16" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </nav>

        {/* Área de Resultados */}
        <div className="w-full mt-4 px-4">
          {/* Indicador de Loading */}
          {(isLoading || isPending) && <Loading />}

          {/* Mensagem de Erro */}
          {searchError && !isLoading && !isPending && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <span className="font-medium">Erro!</span> {searchError}
            </div>
          )}

          {/* Mensagem de Não Encontrado */}
          {notFound && !isLoading && !isPending && !searchError && (
            <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
              <span className="font-medium">Aviso!</span> Usuário não encontrado no Active Directory com o termo informado.
            </div>
          )}

          {/* Exibição dos Dados do Usuário LDAP */}
          {ldapUser && !isLoading && !isPending && !searchError && (
            <div className="bg-white rounded-lg shadow dark:border md:mt-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                {/* Header com ações */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                      {ldapUser.displayName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ldapUser.sAMAccountName} • {ldapUser.userPrincipalName}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap gap-2">
                    {/* Reset de Senha One Piece */}
                    <Button
                      color="warning"
                      size="sm"
                      onClick={() => setShowResetPasswordModal(true)}
                      disabled={accountStatus?.status === 'Desabilitado' || isResetting || isPending}
                    >
                      <Icon icon="mdi:key-variant" className="mr-2 h-4 w-4"/>
                      Reset Senha
                    </Button>

                    {/* Teste de Senha */}
                    {/* <Button
                      color="warning"
                      size="sm"
                      onClick={() => setShowTestPasswordModal(true)}
                      disabled={accountStatus?.status === 'Desabilitado' || isTesting || isPending}
                    >
                      <Icon icon="mdi:shield-check" className="mr-2 h-4 w-4"/>
                      🧪 Testar Senha
                    </Button> */}

                    {/* Reset + Teste Automático */}
                    {/* <Button
                      color="success"
                      size="sm"
                      onClick={handleResetAndTest}
                      disabled={accountStatus?.status === 'Desabilitado' || isResetting || isPending}
                    >
                      <Icon icon="mdi:autorenew" className="mr-2 h-4 w-4"/>
                      🚀 Reset + Teste
                    </Button> */}

                    {/* Desativar Usuário */}
                    <Button
                      color="failure"
                      size="sm"
                      onClick={() => setShowDisableConfirmModal(true)}
                      disabled={accountStatus?.status === 'Desabilitado' || isDisabling || isPending}
                    >
                      <Icon icon="mdi:account-cancel-outline" className="mr-2 h-4 w-4"/>
                      {accountStatus?.status === 'Desabilitado' ? 'Já Desativado' : 'Desativar'}
                    </Button>
                  </div>
                </div>

                {/* Status da Conta */}
                {accountStatus && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        accountStatus.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                        accountStatus.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                        accountStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                      }`}>
                        {accountStatus.status}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {accountStatus.description}
                      </span>
                    </div>
                  </div>
                )}

                {/* Senha Gerada */}
                {lastGeneratedPassword && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Senha Gerada:
                    </h3>
                    <code className="text-lg font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                      {lastGeneratedPassword}
                    </code>
                  </div>
                )}

                {/* Resultado do Teste */}
                {testResult && (
                  <div className={`p-4 border rounded-lg ${
                    testResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <h3 className={`font-medium mb-2 ${
                      testResult.success 
                        ? 'text-green-900 dark:text-green-100' 
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      🧪 Resultado do Teste de Autenticação:
                    </h3>
                    <p className="text-sm">
                      <strong>Status:</strong> {testResult.success ? '✅ Sucesso' : '❌ Falhou'}
                    </p>
                    <p className="text-sm">
                      <strong>Mensagem:</strong> {testResult.message}
                    </p>
                    {testResult.authTime && (
                      <p className="text-sm">
                        <strong>Tempo:</strong> {testResult.authTime}ms
                      </p>
                    )}
                    {testResult.error && (
                      <p className="text-sm">
                        <strong>Erro:</strong> {testResult.error}
                      </p>
                    )}
                  </div>
                )}

                {/* Informações Detalhadas do Usuário */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {/* E-mail */}
                  <div>
                    <dt className="font-semibold text-gray-900 dark:text-white">E-mail:</dt>
                    <dd>{ldapUser.userPrincipalName}</dd>
                  </div>

                  {/* Gestor */}
                  {ldapUser.manager && (
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Gestor:</dt>
                      <dd>{ldapUser.manager}</dd>
                    </div>
                  )}

                  {/* Descrição */}
                  {ldapUser.description && (
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Descrição:</dt>
                      <dd>{ldapUser.description}</dd>
                    </div>
                  )}

                  {/* Telefone */}
                  {ldapUser.telephoneNumber && (
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Telefone:</dt>
                      <dd>{ldapUser.telephoneNumber}</dd>
                    </div>
                  )}

                  {/* Departamento */}
                  {ldapUser.department && (
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Departamento:</dt>
                      <dd>{ldapUser.department}</dd>
                    </div>
                  )}

                  {/* Cargo */}
                  {ldapUser.title && (
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Cargo:</dt>
                      <dd>{ldapUser.title}</dd>
                    </div>
                  )}

                  {/* Diretório */}
                  {ldapUser.dn && (
                    <div>
                      <dt className="font-semibold text-gray-900 dark:text-white">Diretório:</dt>
                      <dd className="text-xs break-all">{ldapUser.dn}</dd>
                    </div>
                  )}

                  {/* Data Expiração da Conta */}
                  {ldapUser.accountExpires && (() => {
                    const expireDate = convertADFileTime(ldapUser.accountExpires);
                    return expireDate ? (
                      <div>
                        <dt className="font-semibold text-gray-900 dark:text-white">Conta Expira em:</dt>
                        <dd>{expireDate.toLocaleDateString('pt-BR')}</dd>
                      </div>
                    ) : null;
                  })()}

                  {/* Data Última Troca Senha */}
                  {ldapUser.pwdLastSet && (() => {
                    const pwdDate = convertADFileTime(ldapUser.pwdLastSet);
                    return pwdDate ? (
                      <div>
                        <dt className="font-semibold text-gray-900 dark:text-white">Senha Definida em:</dt>
                        <dd>{pwdDate.toLocaleString('pt-BR')}</dd>
                      </div>
                    ) : null;
                  })()}

                  {/* Grupos */}
                  {ldapUser.memberOf && ldapUser.memberOf.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-gray-900 dark:text-white">Membro dos Grupos:</dt>
                      <dd>
                        <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                          {(Array.isArray(ldapUser.memberOf) ? ldapUser.memberOf : [ldapUser.memberOf]).map((groupDN) => (
                            <li key={groupDN} className="text-xs">
                              {formatGroupName(groupDN)}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação para Desativar Usuário */}
      <ConfirmModal
        show={showDisableConfirmModal}
        title="Confirmar Desativação de Usuário"
        description={`Tem certeza que deseja desativar o usuário "${ldapUser?.displayName}" (${ldapUser?.sAMAccountName}) no Active Directory? Esta ação impede o login do usuário.`}
        confirmText="Sim, Desativar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDisableUser}
        onCancel={() => setShowDisableConfirmModal(false)}
        isProcessing={isDisabling}
        confirmButtonColor="red"
      />

      {/* Modal para Reset de Senha One Piece */}
      <ConfirmModal
        show={showResetPasswordModal}
        title="Reset de Senha"
        description={
          <div className="space-y-4">
            <p>Resetar senha para <strong>{ldapUser?.displayName}</strong> ({ldapUser?.sAMAccountName})?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha Personalizada (opcional):
              </label>
              <input
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Deixe vazio para gerar senha..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se vazio, será gerada uma senha aleatória.
              </p>
            </div>
          </div>
        }
        confirmText={customPassword ? "Definir Senha" : "Resetar Senha"}
        cancelText="Cancelar"
        onConfirm={handleResetPassword}
        onCancel={() => {
          setShowResetPasswordModal(false);
          setCustomPassword('');
        }}
        isProcessing={isResetting}
        confirmButtonColor="blue"
      />

      {/* Modal para Teste de Senha */}
      <ConfirmModal
        show={showTestPasswordModal}
        title="🧪 Teste de Autenticação"
        description={
          <div className="space-y-4">
            <p>Testar autenticação para <strong>{ldapUser?.displayName}</strong> ({ldapUser?.sAMAccountName})?</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha para Testar:
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Digite a senha para testar..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
              {lastGeneratedPassword && (
                <button
                  type="button"
                  onClick={() => setTestPassword(lastGeneratedPassword)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  Usar última senha gerada: {lastGeneratedPassword}
                </button>
              )}
            </div>
          </div>
        }
        confirmText="🧪 Testar Autenticação"
        cancelText="Cancelar"
        onConfirm={handleTestPassword}
        onCancel={() => {
          setShowTestPasswordModal(false);
          setTestPassword('');
          setTestResult(null);
        }}
        isProcessing={isTesting}
        confirmButtonColor="yellow"
      />

      <ToastContainer />
    </>
  );
}