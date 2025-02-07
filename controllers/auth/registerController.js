const bcrypt = require('bcrypt');
const {Pool, Client} = require('pg')
const {isTokenSecure, getUser, pgConnection} = require('./utility');
const {snsPublish} = require('../sendSNS')

let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST:  process.env.POSTGRES_PROD_HOST;


const pool = pgConnection 
// new Pool({
//     user: process.env.POSTGRES_USER,
//     host: DBHost,
//     database: process.env.POSTGRES_DATABASE,
//     password: process.env.POSTGRES_PASS,
//     port: process.env.POSTGRES_PORT,
// })



const handleNewAdmin = async (req, res, next) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)
        let foundUser = await getUser(user)
        console.log(foundUser)

        if (foundUser) return res.sendStatus(409); //Conflict 

        const hashedPwd = await bcrypt.hash(pwd, 10)

        console.log(`INSERT INTO users(username, password, roles, purchase_info last_login)
VALUES ('${user}', '${hashedPwd}', '{"ADMIN": 5150}', current_timestamp);`)

        const result = await pool.query(`INSERT INTO users(username, password, roles, purchase_info, last_login)
 VALUES ('${user}', '${hashedPwd}', '{"ADMIN": 5150}', '{"subscribed":true}' current_timestamp)`)


        console.log(result)
         res.status(201).json({ 'success': `New user ${user} created!` });

    } catch (error)
    {
        next(error)
        res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

const createNewUser = async (req, res, next) => {
    const { user, pwd, email, displayName } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)
        let foundUser = await getUser(user)
        console.log(foundUser)

        if (foundUser) return res.sendStatus(409); //Conflict 

        const hashedPwd = await bcrypt.hash(pwd, 10)


const result = await pool.query(`INSERT INTO users(username, display_name, password, roles, access_info, purchase_info, last_login)
    VALUES ('${user}','${displayName}', '${hashedPwd}', '{"ADMIN": 0}', '{"subscribed":false}', '{}', current_timestamp)`)


       

        console.log(result)
        
        let timeToDisplay = new Date(Date.now()).toLocaleString()
        console.log(timeToDisplay.toLocaleString())
        let notificationMessage = `New user, ${user} created. Inserted in DB at ${timeToDisplay}`
        await snsPublish(notificationMessage)
         res.status(201).json({ 'success': `New user ${user} created!` });

    } catch (error)
    {
        next(error)
       // res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

async function getUserDetails(req, res, next){

    let username = req?.params?.username;

    try {
        let foundUser = await getUser(username)
        console.log(foundUser)
        if(!foundUser)
            return res.status(204).json({ 'message': 'username not found' });

        res.status(200).json(foundUser);

        // return foundUser;


    } catch (e){
        next(e)
    }

   



}
module.exports = { handleNewAdmin, createNewUser, getUserDetails };