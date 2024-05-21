//Implemntação do modulo Request-ip pendente para pegar o IP do usuario.
//Implementação de autenticação JWT pendente para a API de registro do log.
import { NextResponse, NextRequest } from 'next/server'

const mysql = require('serverless-mysql')({
  config: {
    host     : process.env.MYSQL_HOST,
    port     : process.env.MYSQL_PORT,
    database : process.env.MYSQL_DATABASE,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD
  }
})

interface Log {
  user: string;
  customer: string;
  sva: string;
  action: string;
  ip: string;
}


export const POST = async (req: NextRequest) =>{
  const body: Log = await req.json();

  const { user, customer, sva, action, ip } = body;
  
  const result = await mysql.query(
    'INSERT INTO log (user, client, sva, request, ip) VALUES (?, ?, ?, ?, ?)',
    [user, customer, sva, action, ip]
  );
  await mysql.end(); //limpa conexões zoobies

  return NextResponse.json({Log: "Log registrado", status: 200});
}

