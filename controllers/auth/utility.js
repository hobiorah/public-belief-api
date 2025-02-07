const {Pool, Client} = require('pg')
let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST:  process.env.POSTGRES_PROD_HOST;


const pgConnection = new Pool({
    user: process.env.POSTGRES_USER,
    host: DBHost,
    database:  process.env.NODE_ENV==='dev' ? process.env.POSTGRES_DATABASE: process.env.POSTGRES_PROD_DATABASE,
    password: process.env.POSTGRES_PASS,
    port: process.env.NODE_ENV==='dev' ? process.env.POSTGRES_PORT: process.env.POSTGRES_PROD_PORT
})



async function getUser(username)
{
    try {

        //console.log(`SELECT * FROM users WHERE username='${username}'`)
        //reurns an array of objects(representes each row in DB)
        const {rows} = await pgConnection.query(`SELECT * FROM users WHERE username='${username}'`)
        //console.log(rows)

      return rows[0];

    } catch (error)
    {
        return error
     
    } 

}
function isTokenSecure() 
{
    if(process.env.NODE_ENV === "production")
        return true;
    else 
    {
        return false
    }
}


module.exports = { isTokenSecure, getUser, pgConnection, DBHost };