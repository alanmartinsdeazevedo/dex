import Logo from './icons';
import { useRouter } from 'next/navigation';
import { DarkThemeToggle, Alert } from 'flowbite-react';
import { Icon } from "@iconify/react";
import { useUser } from '@/src/context/UserContext';
import { PermissionGate } from './RouteGuard';
  
export default function Sidebar() {
    const router = useRouter();
    const { user, canAccessAdmin } = useUser();
    
    return (
        <>
        <div
        className="relative flex h-full w-full max-w-[20rem] flex-col rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 bg-clip-border p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
        <div className="flex items-center gap-4 p-4 mb-2">
            <Logo className="h-8 mr-3 dark:text-white" />
            <span className="text-2xl font-semibold whitespace-nowrap dark:text-white">Codex</span>
        </div>
        <nav className="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
            {/* Dashboard */}
            <div className="relative block w-full">
            <div onClick={() => router.push('/dashboard')} 
                role="button"
                className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                <button type="button"
                className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900">
                <div className="grid mr-4 place-items-center">
                <Icon icon="mage:dashboard-2-fill" width="24" height="24" />
                </div>
                <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed text-blue-gray-900">
                    Dashboard
                </p>
                </button>
            </div>
            </div>

            {/* Estatísticas */}
            <PermissionGate requireAnyRole={['Administrador', 'Service Desk']}>
            <div className="relative block w-full">
            <div onClick={() => router.push('/codex')} 
                role="button"
                className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                <button type="button"
                className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900">
                <div className="grid mr-4 place-items-center">
                <Icon icon="mdi:chart-line" width="24" height="24" />
                </div>
                <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed text-blue-gray-900">
                    Estatísticas
                </p>
                </button>
            </div>
            </div>
            </PermissionGate>

            {/* Active Directory */}
            <PermissionGate requireAnyRole={['Administrador', 'Service Desk']}>
            <div className="relative block w-full">
            <div role="button"
                className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                <button type="button" className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mdi:microsoft-azure" width="24" height="24" />
                    </div>
                    <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed text-blue-gray-900">
                        Active Directory
                    </p>
                </button>
            </div>
            <div className="overflow-hidden">
                <div className="block w-full py-1 font-sans text-sm antialiased font-light leading-normal text-gray-700 dark:text-gray-100">
                <nav className="flex min-w-[240px] flex-col gap-1 p-0 font-sans text-base font-normal text-blue-gray-700">
                    <div role="button"
                    onClick={() => router.push('/codex/ad/users')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Usuários
                    </div>
                </nav>
                </div>
            </div>
            </div>
            </PermissionGate>

            {/* Atlassian */}
            <PermissionGate requireAnyRole={['Administrador', 'Service Desk']}>
            <div className="relative block w-full">
            <div role="button"
                className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                <button type="button"
                className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900">
                <div className="grid mr-4 place-items-center">
                    <Icon icon="mdi:atlassian" width="24" height="24" />
                </div>
                <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed text-blue-gray-900">
                    Atlassian
                </p>
                </button>
            </div>
            <div className="overflow-hidden">
                <div className="block w-full py-1 font-sans text-sm antialiased font-light leading-normal text-gray-700 dark:text-gray-100">
                <nav className="flex min-w-[240px] flex-col gap-1 p-0 font-sans text-base font-normal text-blue-gray-700">
                    <div role="button"
                    onClick={() => router.push('/codex/atlassian/groups')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Grupos
                    </div>
                    <div role="button"
                    onClick={() => router.push('/codex/atlassian/users')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Usuários
                    </div>
                </nav>
                </div>
            </div>
            </div>
            </PermissionGate>

            <PermissionGate requireAnyRole={['Administrador', 'Service Desk']}>
                <hr className="my-2 border-blue-gray-50" />
            </PermissionGate>

            {/* Apenas para Administradores */}
            <PermissionGate requireRole="Administrador">
            <div className="relative block w-full">
            <div role="button"
                className="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                <button type="button"
                className="flex items-center justify-between w-full p-3 font-sans text-xl antialiased font-semibold leading-snug text-left transition-colors border-b-0 select-none border-b-blue-gray-100 text-blue-gray-700 hover:text-blue-gray-900">
                <div className="grid mr-4 place-items-center">
                    <Icon icon="material-symbols:admin-panel-settings" width="24" height="24" />
                </div>
                <p className="block mr-auto font-sans text-base antialiased font-normal leading-relaxed text-blue-gray-900">
                    Administração
                </p>
                </button>
            </div>
            <div className="overflow-hidden">
                <div className="block w-full py-1 font-sans text-sm antialiased font-light leading-normal text-gray-700 dark:text-gray-100">
                <nav className="flex min-w-[240px] flex-col gap-1 p-0 font-sans text-base font-normal text-blue-gray-700">
                    <div role="button"
                    onClick={() => router.push('/codex/users')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Usuários do Sistema
                    </div>
                    {/* <div role="button"
                    onClick={() => router.push('/codex/roles')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Perfis & Permissões
                    </div>
                    <div role="button"
                    onClick={() => router.push('/codex/logs')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Logs do Sistema
                    </div>
                    <div role="button"
                    onClick={() => router.push('/codex/system')}
                    className="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                    <div className="grid mr-4 place-items-center">
                    <Icon icon="mingcute:right-small-line" width="24" height="24" />
                    </div>
                    Configurações
                    </div> */}
                </nav>
                </div>
            </div>
            </div>
            </PermissionGate>

            <PermissionGate requireRole="Administrador">
                <hr className="my-2 border-blue-gray-50" />
            </PermissionGate>

            {/* Toggle do Dark Mode */}
            <DarkThemeToggle />
        </nav>
        </div>
        </>
    )
}