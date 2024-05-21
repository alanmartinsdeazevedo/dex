import { NextResponse, NextRequest } from "next/server";
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
};

export const GET = async (req: NextRequest, { params }: { params: { slug: string } }) => {

    const key = params.slug;
    console.info('Issue Key:', key);
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM AtlassianHub.onboarding WHERE issue_key = ?',
            [key]
        );
        return NextResponse.json({ status: 200, data: rows });
    } catch (err) {
        console.error('Error querying the database:', err);
        return NextResponse.json({ status: 500, error: 'Internal Server Error' });
    } finally {
        await connection.end();
    }
};
