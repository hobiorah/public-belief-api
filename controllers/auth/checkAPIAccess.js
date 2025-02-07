const { checkLoggedIn } = require("./authController");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');
 const {isTokenSecure, getUser, pgConnection, DBHost} = require('./utility');
const { getCollection } = require("../util/mongoUtil");
var ObjectId = require('mongodb').ObjectId; 

// const {Pool, Client} = require('pg')
let PostgresBeliefAppPool = pgConnection

//if logged in the access token should be correct
async function validateCookie(req, res, next){
      
    const cookies = req.cookies;
    let user;
        console.log('cookies',cookies)
        if (!cookies?.beliefAccess) return res.sendStatus(401);
        //console.log(` jwt cookie ${cookies.beliefAccess}`);
        const accessToken = cookies.beliefAccess;
        //i think jwt somehow tracks token to username maths
        jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => { //callback - decoded is the value we hashed/serialized/passed in, into the sign method. it got unecrypted so we can access it here
                if (err) {
                    console.log('failed in validate cookie method')
                    next(err)
                    // console.log(`error verifying access token. received ${accessToken} from client \n` ) 
                   // return res.sendStatus(403);
                } //invalid token was sent - prob expired
                req.user = decoded.UserInfo.username;
                req.roles = decoded.UserInfo.roles;
                //console.log(decoded)
            // next();
            //  console.log(req.user==='admin'())
            //  return res.status(200).json({"isLoggedIn":true, "isAdmin": req.user==='admin', "user":req.user})        

            }

        
        );
        console.log('passed to next function')

        return next()
}
//have to send object id access is wanted for. 
async function checkAPIAccess (req, res, next) {


    let {id, objectId, insightId, objectType} = req.params

    //for when its a api call for the posts api
    console.log('request to analyze', req.baseUrl)
    if(objectType==='condition' || req.baseUrl==='/conditions')
    {
        let idToVerify; //i know when ill call this method so when i all it i'll ensure id is passed in
        if(id)
            idToVerify=id;
        if(objectId)
            idToVerify=objectId
        

        console.log('id to verify', idToVerify)

        //CHECK IF THIS IS A CONDITION NON USERS HAVE ACCESS TOO
        //get global acceses in case they have access through that
        let getAccess = `Select * from accesses where type=$1`
        const access = await PostgresBeliefAppPool.query(getAccess,['condition'])

        let nonUserGlobalConditionAccesses = access.rows[0].accesses.nonUser

        //NOW CHECK IF THIS CONDITION HAS PARENTS THAT ARE IN NON USER ACCESS GROUP
        //check if id is a child. if so, set id to parent
        let collection = await getCollection('BeliefApp','conditions')
        //console.log('the mongo cursor',collection)
        let condition

        try {
            
        const query = { "_id": new ObjectId(idToVerify) };
        //const query = { belief: "John" };
        console.log(query)

            condition = await collection.findOne(query);
            console.log('fetched conditino is', condition)


        } catch(e) {
            next(e)
        }
        let parentConditions =  condition?.parentConditions

        //hve to check if any parent condition is in the global non user list
        if(nonUserGlobalConditionAccesses.includes(idToVerify) || parentConditions?.some((parent) => nonUserGlobalConditionAccesses.includes(parent) ))
            return next();
        
    // console.log(req)

        //verify theyre logged in then get their user details from token
    // use the username from token to get access info

    
    const cookies = req.cookies;
    let user;
        //console.log(cookies)
        if (!cookies?.beliefAccess) return res.sendStatus(401);
        //console.log(` jwt cookie ${cookies.beliefAccess}`);
        const accessToken = cookies.beliefAccess;
        //i think jwt somehow tracks token to username maths
        jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => { //callback - decoded is the value we hashed/serialized/passed in, into the sign method. it got unecrypted so we can access it here
                if (err) {
                    console.log(`error verifying access token. received ${accessToken} from client \n` ) 
                    return res.sendStatus(403);
                } //invalid token was sent - prob expired
                req.user = decoded.UserInfo.username;
                req.roles = decoded.UserInfo.roles;
                //console.log(decoded)
            // next();
            //  console.log(req.user==='admin'())
            //  return res.status(200).json({"isLoggedIn":true, "isAdmin": req.user==='admin', "user":req.user})        

            }

        
        );
        user = await getUser(req.user)

        
    
        let globalUserAccessForConditions = access.rows[0].accesses.user
        console.log('global condition access', globalUserAccessForConditions)
    
        



        //console.log(user)

        let accessInfo = user['access_info']
        
        //console.log(user)
        console.log('access infro form db', accessInfo)
    // console.log('mapping id to access info from user to veery', accessInfo[idToVerify])

        if(accessInfo.subscribed===true || globalUserAccessForConditions.includes(idToVerify) || accessInfo[idToVerify]) //global list contanis id were checking on then they have access
            return  next()
        else if(parentConditions && parentConditions.length >0)
        {
            parentConditions = [...parentConditions,...globalUserAccessForConditions,...nonUserGlobalConditionAccesses]
            console.log('after append',parentConditions)
            
            //have to go trhough every element in parent conditoins  and see if we have access to any . add global access conditions cause if child is a parent to one we should have access
            //if is, has access because user has access to parent condition

            let hasAccess=false;
            //if 
            // parentConditions.forEach(parentCondition => {
            for (let i = 0; i < parentConditions.length ; i++) {

                console.log('parentCondition',accessInfo[parentConditions[i]])
            if(accessInfo[parentConditions[i]])
                    return next()

            }
            return res.sendStatus(401)//.send({"error":`this user doesn't have access. You'll have to get a subscription or buy the solution to view it`});

        }
        else if(!accessInfo[idToVerify])
            return res.sendStatus(401)//.send({"error":`this user doesn't have access. You'll have to get a subscription or buy the solution to view it`});

        console.log('got to end to return true. should go to next function')
} else 

     next()// res.status(200).json({accessInfo})
    
    //console.log(user)

 // console.log( checkLoggedIn(req,res,next))
}


module.exports = { checkAPIAccess, validateCookie};


//http://localhost:3000/posts/condition/66e303c4a96aaf6c3fba5411/blah%20Insecurity