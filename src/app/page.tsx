"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "../components/loading";
import Login from "@/src/components/LoginPage";

export default function Home() {
  const {data: session, status} = useSession()
  const router = useRouter()

  console.log(session)

  if (status === 'loading') {
    return <Loading/>
  }

  if (!session){
    return (
    <main>
     
     <Login/>

    </main>
   );
  } else if (session?.user.role !== 'Colaborador'){
    router.push('/codex')
    return <Loading/>
  } else {
    router.push('/dashboard')
    return <Loading/>
  }
}
