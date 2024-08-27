"use server";
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
};

export const getNotifications = async (
    userId: string
) => {

    const connection = await mysql.createConnection(dbConfig);

    try {
        const [rows] = await connection.query(
            'SELECT * FROM dex.notifications WHERE user_id = ?',
            [userId]
        );
        console.log('Notificações:', rows);
        return rows;

    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return [];
    } finally {
        await connection.end();
    }
}