"use client"
import Image from 'next/image';
import React, { useState } from 'react';
import Pesquisar from './avatar'
import { useSession } from 'next-auth/react'

export default function Nav(){
  const { data: session } = useSession()

  return (
    <>
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
    <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="#" className="flex items-center">
            <img src="/assets/img/logo.png" className="h-8 mr-3" alt="Logo Alares" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">SVAdex</span>
        </a>

        <Pesquisar/>

        <div className="flex items-center md:order-2">
        <button type="button" className="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
            <span className="sr-only">Open user menu</span>
            <Image alt='user' src="/assets/img/gatotelemarketing.jpg" className="w-8 h-8 rounded-full"/>
        </button>
        <span className='ml-1.5'>{session?.user?.name}</span>
        </div>
        
    </div>
    </nav>
    </>
  )
}