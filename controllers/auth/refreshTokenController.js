
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {Pool, Client} = require('pg')
const {isTokenSecure, getUser, pgConnection} = require('./utility');
let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST:  process.env.POSTGRES_PROD_HOST;



const pool =pgConnection
//  new Pool({
//     user: process.env.POSTGRES_USER,
//     host: DBHost,
//     database: process.env.POSTGRES_DATABASE,
//     password: process.env.POSTGRES_PASS,
//     port: process.env.POSTGRES_PORT,
// })

//for providing a new access token with the cookie refresh token
const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    console.log(`non jwt cookie ${cookies}`);
    if (!cookies?.jwt) return res.append("error",`no cookie ${cookies}`).sendStatus(401);
    console.log(` jwt cookie ${cookies.jwt}`);
    const refreshToken = cookies.jwt;
    //try to find a user in DB that has a refresh token that we received. i think we should also vrify that the user-refresh match in DB matches user-refresh request
    // const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
    // Is there a person in DB with the refreshToken in cookie?
    let findUserSQL = 'SELECT * FROM users where refreshToken= $1'
    let foundUser = await pool.query(findUserSQL,[refreshToken])
    foundUser = foundUser?.rows[0]
    console.log(foundUser)

    console.log(foundUser);
    if (!foundUser) return res.append("error",`no user found`).sendStatus(403); //Forbidden 
    // verify that that the provided refresh token(from cookie) gets decrypted to whats in DB
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => { //decode is the derypted input that we signed
            console.log(`whtats in ${decoded.username}`);
            
            const roles = Object.values(foundUser.roles); //get the roles (values not keys) stored in the object

            if (err || foundUser.username !== decoded.username) return res.sendStatus(403); //forbiddent
            //create new access token - sign
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '2d' }
            );
            res.cookie('beliefAccess', accessToken, { httpOnly: true, sameSite: 'None', secure: isTokenSecure(), maxAge: 24 * 60 * 60 * 1000 });

            //send accesstoken
            res.json({ accessToken })
        }
    );
}

module.exports = { handleRefreshToken }