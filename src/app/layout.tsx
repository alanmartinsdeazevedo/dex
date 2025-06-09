"use client";
import './globals.css';
import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/src/context/UserContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="Favicon" href="images/favicon.ico" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.1/flowbite.min.css"
          rel="stylesheet"
        />
        <title>Dex</title>
      </head>
      <body className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800">
        <noscript>Habilite o JavaScript do seu navegador para poder visualizar este site.</noscript>
        <SessionProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}