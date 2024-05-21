"use client"
import { useSession } from 'next-auth/react'
import Loading from '@/src/components/loading'
import Index from '@/src/components/index'
import React, { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <>
    <Loading/>
    </>
  }
  
  if (!session) {
    return <>
    <div className="h-screen w-screen bg-gray-100 flex items-center">
	  <div className="container flex flex-col md:flex-row items-center justify-center px-5 text-gray-700">
   		<div className="max-w-md">
      		<div className="text-5xl font-dark font-bold">Sua sessão expirou!</div>
          <p className="mb-8">Está página apenas está disponivel para usuários autenticados.</p>
          </div>
          <img src="/assets/img/a4a10ede-f31b-4c9e-bf43-89cc630ccc95.png" alt="você não está logado" />
      <div className="max-w-lg">
      
    </div>
  </div>
  </div>
    </>
  }

  return (
    <>
      <Index/>
    </>
  )
}
