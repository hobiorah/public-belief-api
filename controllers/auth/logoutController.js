const {isTokenSecure, getUser,pgConnection} = require('./utility');



const fsPromises = require('fs').promises;
const path = require('path');
const {Pool, Client} = require('pg')

// const pool = new Pool({
//     user: process.env.POSTGRES_USER,
//     host: process.env.POSTGRES_HOST,
//     database: process.env.POSTGRES_DATABASE,
//     password: process.env.POSTGRES_PASS,
//     port: process.env.POSTGRES_PORT,
// })
//essentially clears cookie, then rewrites user with cookies to have blank refresh token in DB
const handleLogout = async (req, res, next) => {
    // On client, also delete the accessToken
   // isTokenSecure = isTokenSecure();
    const cookies = req.cookies;
    console.log(cookies)
    if (!cookies?.beliefRefresh || !cookies?.beliefAccess ){
        console.log( 'belief refresh and belief access cookies must be present. ensure cookie parse is enabled and check secure atrribute of cooking signing function')
        return res.sendStatus(204)
    }//No content cause theres no cookie
    const refreshToken = cookies.jwt;

    try{
          // Is there a person in DB with the refreshToken in cookie?
    let findUserSQL = 'SELECT * FROM users where refreshToken= $1'
    let foundUser = await pgConnection.query(findUserSQL,[refreshToken])
    foundUser = foundUser?.rows[0]
    console.log(foundUser)

    //if not, clear the cookies we have access too
    if (!foundUser) {
        console.log
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: `${isTokenSecure()}` });
        res.clearCookie('beliefRefresh', { httpOnly: true, sameSite: 'None', secure: `${isTokenSecure()}` });
        res.clearCookie('beliefAccess', { httpOnly: true, sameSite: 'None', secure: `${isTokenSecure()}` });
        console.log('no user with this refresh token exists. cookies cleared')
        return res.sendStatus(204)
        //.json({'message':'no user with this refresh token exists. cookie cleared'})
    }

    // // Delete refreshToken in db
    // foundUser.refreshToken = '';
    // await foundUser.save();

    let deleteRefreshTokenSQL =  `UPDATE users SET refreshToken= $1 WHERE username=$2`
    const result = await pgConnection.query(deleteRefreshTokenSQL,['',foundUser.username])
    console.log(result)
    } catch (error)
    {
        next(error)
    }
  

   
    //when secure is true cookie passing back and forth only works for https requests
     res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: `${isTokenSecure()}` });
     res.clearCookie('beliefRefresh', { httpOnly: true, sameSite: 'None', secure: `${isTokenSecure()}` });
     res.clearCookie('beliefAccess', { httpOnly: true, sameSite: 'None', secure: `${isTokenSecure()}` });
     console.log('Refresh token of this user has been cleared in database and client')
     res.sendStatus(204);
}

module.exports = { handleLogout }