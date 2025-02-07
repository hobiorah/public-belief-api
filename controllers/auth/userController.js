const bcrypt = require('bcrypt');
const {Pool, Client} = require('pg')
const {isTokenSecure, getUser, pgConnection} = require('./utility');

let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST:  process.env.POSTGRES_PROD_HOST;


const pool = pgConnection;
// new Pool({
//     user: process.env.POSTGRES_USER,
//     host: DBHost,
//     database: process.env.POSTGRES_DATABASE,
//     password: process.env.POSTGRES_PASS,
//     port: process.env.POSTGRES_PORT,
// })

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created
    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        //create and store the new user
        //could also create new entry by creting new object and passing details into the constrctor or create a new object and set fields like User.username = and call save() when done
        /*
        new user = new User({data to set})
        user.save()
        */
        const result = await User.create({
            "username": user,
            "password": hashedPwd
        });

        console.log(result);

        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

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
    const { user, pwd, email } = req.body;
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
VALUES ('${user}', '${hashedPwd}', '{"ADMIN": 0}', current_timestamp);`)

        const result = await pool.query(`INSERT INTO users(username, password, roles, access_info, email, last_login)
    VALUES ('${user}', '${hashedPwd}', '{"ADMIN": 0}', '{"subscribed":false}','${email}', current_timestamp)`)


        console.log(result)
         res.status(201).json({ 'success': `New user ${user} created!` });

    } catch (error)
    {
        next(error)
        res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

async function getUserDetails(req, res, next){

    let username = req?.params?.username;

    try {
        let foundUser = await getUser(username)
        //console.log(foundUser)
        if(!foundUser)
            return res.status(204).json({ 'message': 'username not found' });

        res.status(200).json({
            'accessInfo': foundUser['access_info'],
            'purchaseInfo': foundUser['purchase_info']
        });

        // return foundUser;


    } catch (e){
        next(e)
    }


}

async function getAccessData(req, res, next){

    let {type} = req?.params;

    try {

        let getAccess = `Select * from accesses where type=$1`
        const access = await pool.query(getAccess,[type])
        
        if(!access)
            return res.status(204).json({ 'message': 'access not found' });

        console.log(access)

        res.status(200).json(access.rows[0]
        );

        // return foundUser;


    } catch (e){
        next(e)
    }


}

//only admins can call this
async function addPurchaedObject(req, res, next){

    // let username = req?.params?.username;
    let {username, objectIds,paymentId }= req?.body; //going to likely be called by stripe. use that data to update pruchase info json for this obejct id

    //do a fetch to confirm the transaction is actually in pyament system - a utliity function calling pyament system 
    try {
        let foundUser = await getUser(username)
        console.log(foundUser)
        if(!foundUser)
            return res.status(204).json({ 'message': 'username not found' });
        if(!objectIds || objectIds.length <1)
            return res.status(400).json({ 'message': 'object Id must be present and a list >= 1' });

        let purchaseInfo = foundUser['purchase_info']
        objectIds.forEach((id) => purchaseInfo[id]=true);

        console.log(purchaseInfo)

        let addQuery = `UPDATE users
SET purchase_info=$1
WHERE username=$2 ;`

const result = await pool.query(addQuery,[purchaseInfo,username])
console.log(result)




// let getPostsforThisObject =  `select * from posts where referencing_post_type=$1 and referencing_post_parent_id=$2`;

//         console.log(getPostsforThisObject);
       // const result = await pool.query(getPostsforThisObject,[objectType,objectId])



// const result = await pool.query(`INSERT INTO users(username, password, roles, purchase_info, email, last_login)
//     VALUES ('${user}', '${hashedPwd}', '{"ADMIN": 0}', '{"subscribed":false}','${email}', current_timestamp)`)
   
   


        // purchaseInfo['add'] = 'hey'
        // purchaseInfo['leave'] = 'untouched'
        // console.log(purchaseInfo)

        // let test = {'add': "updated", 'leave':"touched" }
        // purchaseInfo = {...purchaseInfo, ...test}

        // // console.log(purchaseInfo['subscribed'])
        // console.log(purchaseInfo)


        //try adding one

        //try adding multiple and see if it updates existing plus 

        res.status(200).json(result);

        // return foundUser;


    } catch (e){
        next(e)
    }


}
module.exports = { addPurchaedObject, getUserDetails, getAccessData };