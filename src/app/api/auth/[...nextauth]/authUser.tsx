"use server";
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

interface UserResult extends mysql.RowDataPacket {
  permission_id: number;
}

export const authUserRole = async (
  userEmail: string,
  userName: string,
  userImage: string
  ) => {
  return
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Consulta se o usuário existe
    const [rows] = await connection.query<UserResult[]>(
      "SELECT permission_id FROM dex.users WHERE email = ?",
      [userEmail]
    );

    console.log("Result Role:", rows[0].permission_id);

    if (rows.length > 0) {
      // Atualiza o usuário
      await connection.query(
        "UPDATE dex.users SET name = ? WHERE email = ?",
        [userName, userEmail]
      );
      return rows[0].permission_id <= 3 ? true : false;
    } else {
      // Registra o usuário
      await connection.query(
        "INSERT INTO dex.users (email, name, permission_id, profile_image) VALUES (?, ?, ?, ?)",
        [userEmail, userName, 4, userImage]
      );
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar permissões:", error);
    return "Erro ao verificar permissões.";
  } finally {
    await connection.end();
  }
};