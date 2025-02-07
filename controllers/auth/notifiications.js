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





const createNotification = async (req, res, next) => {
    const { message} = req.body;

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        

        console.log(message)
        
        let timeToDisplay = new Date(Date.now()).toLocaleString()
        console.log(timeToDisplay.toLocaleString())
        // let notificationMessage = `New user, ${user} created. Inserted in DB at ${timeToDisplay}`
        await snsPublish(message)
         res.status(201).json({ 'success': `New user ${user} created!` });

    } catch (error)
    {
        next(error)
       // res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}


   


 
module.exports = {  createNewUser, getUserDetails };