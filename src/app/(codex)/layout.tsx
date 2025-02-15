'use client'
import Loading from "@/src/components/loading";
import Sidebar from "@/src/components/sidebar";
import { useEffect, useState } from "react";

export default function DexLayout({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        } else {
            // Detecta a preferência do sistema
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDarkMode(prefersDark);
            document.documentElement.classList.toggle("dark", prefersDark);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = isDarkMode ? "light" : "dark";
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle("dark", !isDarkMode);
        localStorage.setItem("theme", newTheme);
    };
    
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