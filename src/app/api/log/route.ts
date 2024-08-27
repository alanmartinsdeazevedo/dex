"use server";
import { NextResponse, NextRequest } from 'next/server'
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

interface Log extends mysql.RowDataPacket {
  user: string;
  customer: string;
  sva: string;
  action: string;
  ip: string;
}

export const POST = async (req: NextRequest) =>{
  const connection = await mysql.createConnection(dbConfig);
  const body: Log = await req.json();
  const { user, customer, sva, action, ip } = body;
  
  const result = await connection.query<Log[]>(
    'INSERT INTO log (user, client, sva, request, ip) VALUES (?, ?, ?, ?, ?)',
    [user, customer, sva, action, ip]
  );
  await connection.end(); //limpa conexões zoobies

  return NextResponse.json({Log: "Log registrado", status: 200});
}

