'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/src/components/loading";
import Sidebar from "@/src/components/sidebar";

export default function DexLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        <div className="flex"></div>
            <div className="fixed p-6 h-screen">
                <Sidebar />
            </div>
            <main className="flex-1 ml-80 p-6">
                <section>{children}</section>
            </main>
        </>
    )
}