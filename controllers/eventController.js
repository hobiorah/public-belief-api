
const {Pool, Client} = require('pg');
const { getUser } = require('./auth/utility');
const { snsPublish } = require('./sendSNS');
const stripe = require('stripe')
('sk_test_51Q5CkLBm8yO68FsgxRd4Fty1g8vYAaRoVgjeEbsrTL4plHm39sMQ39rHit0t1UDpRvFlkoyYXxBcaJAqbaoTMAmG00KY2sFSw4');


let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST: process.env.POSTGRES_PROD_HOST;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: DBHost,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASS,
    port: process.env.POSTGRES_PORT,
})

async function addEvent(req, res, next){

    // let username = req?.params?.username;
    let {username, metadata,page,action }= req?.body; //going to likely be called by stripe. use that data to update pruchase info json for this obejct id

    //do a fetch to confirm the transaction is actually in pyament system - a utliity function calling pyament system 
    try {
        let foundUser = await getUser(username)
        console.log(foundUser)
        if(username && !foundUser)
            return res.status(204).json({ 'message': 'username not found' });

        
       

        // let purchaseInfo = foundUser['purchase_info']
        // objectIds.forEach((id) => purchaseInfo[id]=true);

        console.log('body for insert event',req.body)

        let insertEvent = `INSERT INTO user_events(username, metadata, page, action) VALUES ($1, $2, $3,$4);
;`

 const result = await pool.query(insertEvent,[username,metadata,page, action])
 console.log('insert status', result)


         //return res.status(200);
       res.json({'result':'success'});


        // return foundUser;


    } catch (e){
         next(e)
    }


}

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

    } catch (error)
    {
        next(error)
       // res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

module.exports = {
  addEvent, createNotification
  }
  