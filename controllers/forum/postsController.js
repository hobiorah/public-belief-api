const bcrypt = require('bcrypt');
const {Pool, Client} = require('pg');
const { snsPublish } = require('../sendSNS');
// const {isTokenSecure, getUser} = require('./utility');

let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST:  process.env.POSTGRES_PROD_HOST;

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: DBHost,
    database: process.env.NODE_ENV==='dev' ? process.env.POSTGRES_DATABASE: process.env.POSTGRES_PROD_DATABASE,
    password: process.env.POSTGRES_PASS,
    port: process.env.NODE_ENV==='dev' ? process.env.POSTGRES_PORT: process.env.POSTGRES_PROD_PORT,
})


const getPostsforThisObject = async (req, res, next) => {
    const { objectId, objectType } = req?.params;

    if (!objectId) return res.status(400).json({ 'message': 'object id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

        let getPostsforThisObject =  `select * from posts where referencing_post_type=$1 and referencing_post_parent_id=$2 order by created_at desc`;

        console.log(getPostsforThisObject);
        const result = await pool.query(getPostsforThisObject,[objectType,objectId])


        console.log(result?.rows)
         res.status(200).json(result?.rows);

    } catch (error)
    {
        next(error)
        res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

const getPost = async (req, res, next) => {
    const { objectId, objectType,postId } = req?.params;

    if (!postId) return res.status(400).json({ 'message': 'post id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

        let getPost =  `select * from posts where post_id=$1`;

        console.log(getPost);
        const result = await pool.query(getPost,[postId])


        console.log(result?.rows)
        //should only be one row returned
         res.status(200).json(result?.rows[0]);

    } catch (error)
    {
        next(error)
        res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

const createPost = async (req, res, next) => {
    const { objectId, objectType,postId,  } = req?.params;
    console.log('body of create post', req?.body)
    let {objectName, username, title, content, displayName} = req.body;

    /*
     const postToAdd = {
        "username": loggedInUser,
        "title": postTitle,
        "content": postContent,
        "referencing_post_type": postType,
        "referencing_post_parent_id": referencingObjectId,
        "parentObjectName": parentObjectName
     };
     */

    if (!objectId || !objectType) return res.status(400).json({ 'message': 'object type and object id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

        let createPost =  `INSERT INTO posts(username, title, content, referencing_post_type, referencing_post_parent_id, user_display_name)
    VALUES ($1, $2, $3,$4,$5, $6);`;

        console.log(createPost);
        const result = await pool.query(createPost,[req?.body?.username,req?.body?.title,req?.body?.content,req?.body?.referencing_post_type,req?.body?.referencing_post_parent_id, displayName])


        //FUTURE; if(adminNotification); pull from tabl;e that has admin cofig json
        //if(notifyUser); pull form user with a notify field set to true or false; details field wiill have a checkbox field that updates this field; update user api endpoint; will use ses email instead of sns

        //only execute if env is prod
        let timeToDisplay = new Date(Date.now()).toLocaleString()
        console.log(timeToDisplay.toLocaleString())
        let notificationMessage = `New post from ${username} created. Inserted post in DB at ${timeToDisplay}. Title of post: ${title} in ${objectName} object. content in post ${content}`
        await snsPublish(notificationMessage)

        console.log(result?.rows)
        //should only be one row returned
         res.status(200).json(result);

    } catch (error)
    {
        next(error)
        //res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}


// const getCommentsForThisPost = async (req, res, next) => {
//     const { objectId, objectType,postId } = req?.params;

//     if (!objectId) return res.status(400).json({ 'message': 'object id is required.' });

//     // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

//     try {

//         // console.log(`SELECT * FROM users WHERE username='${user}'`)
//         // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

//         let getPostsforThisObject =  `select * from comments where post=$1 and parent_comment=comment_id`;

//         console.log(getPostsforThisObject);
//         const result = await pool.query(getPostsforThisObject,[postId])


//         console.log(result?.rows)
//          res.status(200).json(result?.rows);

//     } catch (error)
//     {
//         next(error)
//         res.status(500).json({ 'message': error.message });
//         //throw new error 
//     } 

// }
module.exports = { getPostsforThisObject, getPost, createPost};