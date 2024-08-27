"use server"
const mysql = require('serverless-mysql')({
    config: {
      host     : process.env.MYSQL_HOST,
      port     : process.env.MYSQL_PORT,
      database : process.env.MYSQL_DATABASE,
      user     : process.env.MYSQL_USER,
      password : process.env.MYSQL_PASSWORD
    }
})

export const handleLog = async ( user: string, customer: string, sva: string, action: string, ip: string) => {
  
    try {
        const result = await mysql.query(
        'INSERT INTO log (user, client, sva, request, ip) VALUES (?, ?, ?, ?, ?)',
        [user, customer, sva, action, ip]
        )

        await mysql.end(); //limpa conexões zoobies
        console.log('Log resgistrado: ', result)

        return{statusCode: 201}

    }   catch (error) {
        console.log('Erro ao registrar Log' ,error);
        return {statusCode: 500}
        }
}




