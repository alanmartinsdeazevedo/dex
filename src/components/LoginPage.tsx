"use client"
import React from 'react'
import { signIn } from "next-auth/react";
import { useSession } from 'next-auth/react';
import Loading from './loading';
import Footer from "@/src/components/footer";


function Login() {
  
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <>
    <Loading/>
    </>
  }

  return (
    <>
    <section>
    <div className="flex items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <button
              onClick={() => signIn("azure-ad",{ callbackUrl: '/dashboard' })}
              type="button"
              className="w-full text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2">
              Entrar com AD
            </button> 
        </div>
      </div>       
    </div>
    </section>
    
    <Footer/>
    </>
  );
}

export default Login