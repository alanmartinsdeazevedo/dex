"use client"
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
      <Dropdown.Item onClick={signOut}>
            Sair
      </Dropdown.Item>
      </Dropdown></Tooltip>
    </>
  )
}
