"use server"
const mysql = require('serverless-mysql')({
    config: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD
    }
  });
  
  export const authUserRole = async (userEmail: string, userName: string, userImage: string) => {
    try {
      const result = await mysql.query(
        'SELECT permission_id FROM svadex.users WHERE email = ?',
        [userEmail]
      );
      console.log("Result Role: ", result)
  
      if (result.length > 0) {
        await mysql.query(
            'UPDATE svadex.users SET name = ? WHERE email = ?',
            [userName, userEmail]
        );
        return result[0].permission_id <= 2;

    } else {
        await mysql.query(
            'INSERT INTO svadex.users (email, name, permission_id, profile_image) VALUES (?, ?, ?, ?)',
            [userEmail, userName, 4, userImage]
        );
        return false;
    }
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return "Erro ao verificar permissões.";
    } finally {
      await mysql.end();
    }
  }
  