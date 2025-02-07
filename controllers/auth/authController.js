
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');
const {isTokenSecure, getUser, pgConnection, DBHost} = require('./utility');
const {Pool, Client} = require('pg')


//    function isTokenSecure() 
//     {
//         if(process.env.NODE_ENV === "production")
//             return true;
//         else 
//         {
//             return false
//         }
//     }


//throw new error 

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    //find document/entry in mongodb
    let foundUser = await getUser(user);
    console.log(foundUser)


    if (!foundUser) return res.append('error', "didnt find user").sendStatus(401); //Unauthorized since user not in DB
    // evaluate password = compare with whats passed in and passwrod user has thats stored in the DB
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match && foundUser?.roles) { //if person trying to login has a password-user match in the DB
        const roles = Object.values(foundUser.roles); //get the roles (values-numbers not keys) stored in the object
        console.log(roles);
        // create JWTs
        //pass in a payload without something private like passwrod or SSN because this token can be accessed by hackers - whats signs is essentially being encrypted and will be uncrypted later
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '2d' }
        );

        //referesh token doesnt need role information or additional sensitive info besides user. stored in browser
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET, //how we access variables in .env file
            { expiresIn: '3d' }
        );

        
        // Saving refreshToken in DB which will let us invalidate the token - with current user we're workign on thats trying to login
        console.log(refreshToken)
      
        let addRefreshToUserSQL =  `UPDATE users SET refreshToken= $1 WHERE username=$2`

        const result = pgConnection.query(addRefreshToUserSQL,[refreshToken,user])
        console.log(result)

        // await new Pool({
        //     user: process.env.POSTGRES_USER,
        //     host: DBHost,
        //     database: process.env.POSTGRES_DATABASE,
        //     password: process.env.POSTGRES_PASS,
        //     port: process.env.POSTGRES_PORT,
        // })


       // foundUser.refreshToken = refreshToken;
       // await foundUser.save();
        //write refresh token to DB - updating the login user object with refresh token
    
        console.log("successfully written to Db the refresh token,")
        //setting http only prevents token from being accesed in javascript
        secureValue = isTokenSecure();
        //samesite dctate whether a request can come from a server/ip thats not the same as the host server of the api
        //cookie map of browser/client will now contain this. user wont have to supply this manually when calling refresh endpoint. endpoint will pull from client cookie DB. cookies is an object that contains key pair with the value being our refresh token
        // res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: secureValue, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: secureValue, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('beliefRefresh', refreshToken, { httpOnly: true, sameSite: 'Lax', secure: secureValue, maxAge: 24 * 60 * 60 * 1000 });
        res.cookie('beliefAccess', accessToken, { httpOnly: true, sameSite: 'Lax', secure: secureValue, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken, refreshToken, "displayName":foundUser.display_name }); //person calling api will grab this so they can use it for future request
       // res.json({ 'success': `User ${user} is logged in!` });
       
    } else {
        res.sendStatus(401);
    }
}


//validate that request has a token and that that token is valid before executing route logic/aka controller
//user sends access token as a token bearer which api gives after they login
const checkLoggedIn = async (req, res, next) => {
    //pull out auth header from request which should be in a predefined format
    const authHeader = req?.headers?.authorization ||  req?.headers?.Authorization
    //if not auth header then starts with will be undefined so results in true cause the !
    //oif theres an auth header without Bearer will be false and result in true and respond not authorized
    //if theres an auth header with bearer will be true and result in false and keep going

 /*   
if (!authHeader?.startsWith('Bearer')) return res.sendStatus(401); //we know its not auhtorized cause doesnt have required info
    console.log(authHeader); // Bearer token
    const token = authHeader.split(' ')[1]; //we can do this because the authheader value is in a certain format
    */

    const cookies = req.cookies;
    console.log(cookies)
    if (!cookies?.beliefAccess) return res.status(401).send({"error":`no cookie`});
    console.log(` jwt cookie ${cookies.beliefAccess}`);
    const accessToken = cookies.beliefAccess;
    //i think jwt somehow tracks token to username maths
    jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => { //callback - decoded is the value we hashed/serialized/passed in, into the sign method. it got unecrypted so we can access it here
            if (err) {
                console.log(`error verifying access token. recerived ${token} \n` ) 
                return res.sendStatus(403);
             } //invalid token was sent - prob expired
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            console.log(decoded)
           // next();
         //  console.log(req.user==='admin'())
        
        }
    );

    let foundUser = await getUser(req.user);
    console.log(foundUser)

    return res.status(200).json({"isLoggedIn":true, "isAdmin": req.user==='admin', "user":req.user, "displayName": foundUser.display_name })

}


module.exports = { handleLogin,checkLoggedIn };