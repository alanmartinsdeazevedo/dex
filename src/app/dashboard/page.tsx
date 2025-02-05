"use client"
import { useSession } from 'next-auth/react'
import Loading from '@/src/components/loading'
import Index from '@/src/components/index'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Importa o componente de otimização de imagem

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!session) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            router.push('/');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer); // Cleanup
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <div className="h-screen w-screen bg-gray-100 flex items-center">
          <div className="container flex flex-col md:flex-row items-center justify-center px-5 text-gray-700">
            <div className="max-w-md">
              <div className="text-5xl font-dark font-bold">Sua sessão expirou!</div>
              <p className="mb-8">
                Esta página apenas está disponível para usuários autenticados.
                <br />
                Você será redirecionado em {countdown} segundos.
              </p>
            </div>
            <Image
              src="/assets/img/a4a10ede-f31b-4c9e-bf43-89cc630ccc95.png"
              alt="você não está logado"
              width={358}
              height={358}
              priority // Carrega essa imagem com prioridade
            />
            <div className="max-w-lg"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Index />
    </>
  );
}
