import React, {useEffect, useState} from "react"
import { Avatar, Dropdown, Tooltip, DarkThemeToggle } from 'flowbite-react';
import { useSession, signOut } from 'next-auth/react'

interface Session {
  user: {
    name: string;
    accessToken: string;
    picture: string;
}
}
export default function UserAvatar(){
  const { data: session } = useSession()
  const [Admin, setAdmin] = useState<Boolean | null>(false)
  //const isAdmin = await userRole(session?.user?.email ?? "")
  //setAdmin(isAdmin ? true : false)
  console.log ("session avatar: ", session)
  let imgAvatar = '/assets/img/gatotelemarketing.jpg'

  if (session?.user?.image) {
    imgAvatar = session?.user?.image
  } else {
    imgAvatar = '/assets/img/gatotelemarketing.jpg'
  }

  return (
    <>
      <Tooltip 
        content="Perfil"
        placement="right">
      <Dropdown
      arrowIcon={false}
      inline
      label={<Avatar alt="User settings" img={imgAvatar} rounded/>}
      >
      
      <Dropdown.Header>
        <span className="block text-sm">
        {session?.user?.name}
        </span>
        <span className="block truncate text-sm font-medium">
        {session?.user?.email}
        </span>
      </Dropdown.Header>
      <Dropdown.Divider />
      {Admin && (
      <Dropdown.Item href="/codex">
          Codex
      </Dropdown.Item>
        )}
      <Dropdown.Item onClick={()=> signOut({callbackUrl: '/'})}>
          Sair
      </Dropdown.Item>
      </Dropdown></Tooltip>
    </>
  )
}
