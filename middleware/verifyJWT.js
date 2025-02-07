const { formatRelativeWithOptions } = require('date-fns/fp');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//validate that request has a token and that that token is valid before executing route logic/aka controller
//user sends access token as a token bearer which api gives after they login
const verifyJWT = (req, res, next) => {
    //pull out auth header from request which should be in a predefined format
    const authHeader = req.headers.authorization ||  req.headers.Authorization
    //if not auth header then starts with will be undefined so results in true cause the !
    //oif theres an auth header without Bearer will be false and result in true and respond not authorized
    //if theres an auth header with bearer will be true and result in false and keep going
    if (!authHeader?.startsWith('Bearer')) return res.sendStatus(401); //we know its not auhtorized cause doesnt have required info
    console.log(authHeader); // Bearer token
    const token = authHeader.split(' ')[1]; //we can do this because the authheader value is in a certain format
    //i think jwt somehow tracks token to username maths
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => { //callback - decoded is the value we hashed/serialized/passed in, into the sign method. it got unecrypted so we can access it here
            if (err) {
                console.log(`error verifying access token. recerived ${token} \n` ) 
                return res.sendStatus(403);
             } //invalid token was sent - prob expired
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next();
        }
    );
}

module.exports = verifyJWT

//we can add this to a route we eant to protect


//formatRelativeWithOptions
// i send log in request and get access token and refresh token. //api recognizes this nd stores the reresh token for my user in DB
//all my future request must contain access token