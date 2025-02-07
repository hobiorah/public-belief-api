const bcrypt = require('bcrypt');
const {Pool, Client} = require('pg')
const { snsPublish } = require('../sendSNS');

// const {isTokenSecure, getUser} = require('./utility');
let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST:  process.env.POSTGRES_PROD_HOST;


const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: DBHost,
    database:  process.env.NODE_ENV==='dev' ? process.env.POSTGRES_DATABASE: process.env.POSTGRES_PROD_DATABASE,
    password: process.env.POSTGRES_PASS,
    port: process.env.NODE_ENV==='dev' ? process.env.POSTGRES_PORT: process.env.POSTGRES_PROD_PORT
})


const getPostsforThisObject = async (req, res, next) => {
    const { objectId, objectType } = req?.params;

    if (!objectId) return res.status(400).json({ 'message': 'object id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

        let getPostsforThisObject =  `select * from posts where referencing_post_type=$1 and referencing_post_parent_id=$2`;

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

const getPostComments = async (req, res, next) => {
    const { objectId, objectType,postId,commentId } = req?.params;

    if (!postId) return res.status(400).json({ 'message': 'object id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created
    let result;
    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

        if(!commentId)
        {
            let getTopLevelComments =  `select * from comments where post=$1 and parent_comment is null`;
            console.log(getTopLevelComments);
             result = await pool.query(getTopLevelComments,[postId])
        } else
        {
            let getChildComments =  `select * from comments where post=$1 and parent_comment=$2`;
            console.log(getChildComments);
             result = await pool.query(getChildComments,[postId,commentId])
        }
           


        console.log(result?.rows)
         res.status(200).json(result?.rows);

    } catch (error)
    {
        next(error)
        //res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}


//create post comments and comment reply; controlled by a parentcommentid param
const createComment = async (req, res, next) => {
    const { objectId, objectType,postId,parentCommnentId } = req?.params;
    console.log(req?.body)
    let {parentObjectName, content, parentObjectType, linkToContent, displayName } = req?.body
    if (!postId) return res.status(400).json({ 'message': 'Post id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    let result;
    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)
  
        // if parent commend passed in that column will get filled. means this is a reply comment
        let createComment=  `INSERT INTO comments(username, content, post, parent_comment, user_display_name)
            VALUES ($1, $2, $3, $4, $5);`;

        console.log(createComment);
        result = await pool.query(createComment,[req?.body?.username,req?.body?.content,postId,parentCommnentId, displayName])

        let timeToDisplay = new Date(Date.now()).toLocaleString()
        console.log(timeToDisplay.toLocaleString())
        let notificationMessage = `New comment, from  ${req?.body?.username} created in ${parentObjectName} ${parentObjectType}.Inserted in DB at ${timeToDisplay}. Link to content: ${linkToContent}. Content of reply: ${content}`
        await snsPublish(notificationMessage)
     


        console.log(result?.rows)
        //should only be one row returned
         res.status(200).json(result);

    } catch (error)
    {
        next(error)
       // res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

//array of commnets for an object. comments are connected to the object id.
const createNonPostComment = async (req, res, next) => {
    const { objectId,referencingObjectId,parentCommnentId } = req?.params;
    console.log(req?.body)
    let {parentObjectName, content, parentObjectType, linkToContent, displayName } = req?.body

    if (!objectId) return res.status(400).json({ 'message': 'Object id  and type this post belongs to is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created

    let result;
    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)
  
        // if parent commend passed in that column will get filled. means this is a reply comment
        let createComment=  `INSERT INTO non_post_comments(username, content, referencing_object_type, referencing_object_parent_id, parent_comment, user_display_name)
            VALUES ($1, $2, $3, $4, $5,$6);`;

        console.log(createComment);
        result = await pool.query(createComment,[req?.body?.username, req?.body?.content, parentObjectType, objectId ,parentCommnentId, displayName])

        let timeToDisplay = new Date(Date.now()).toLocaleString()
        let notificationMessage = `New comment reply, from  ${req?.body?.username} created in ${parentObjectName} ${parentObjectType}. In reply to Inserted in DB at ${timeToDisplay}. Link to content: ${linkToContent}. Content of reply: ${content}`
        await snsPublish(notificationMessage)
     


        console.log(result?.rows)
        //should only be one row returned
         res.status(200).json(result);

    } catch (error)
    {
        next(error)
       // res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}

//if no commnet supplied we know we get all top level comments

const getNonPostComments = async (req, res, next) => {
    const { objectId, objectType,referencingObjectId,commentId } = req?.params;

    if (!objectId ) return res.status(400).json({ 'message': 'object id is required.' });

    // check for duplicate usernames in the db - if we find just one then thats issue because this should be a new user trying to be created
    let result;
    try {

        // console.log(`SELECT * FROM users WHERE username='${user}'`)
        // const {rows} = await pool.query(`SELECT * FROM users WHERE username='${user}'`)

        if(!commentId)
        {
            let getTopLevelComments =  `select * from non_post_comments where referencing_object_parent_id=$1 and parent_comment is null`;
            console.log('uhhh in the actual call?',getTopLevelComments);
             result = await pool.query(getTopLevelComments,[objectId])
             console.log('uhhh in the actual call?',getTopLevelComments);
             console.log('result from call?',result?.rows);
        } else
        {
            let getChildComments =  `select * from non_post_comments where referencing_object_parent_id=$1 and parent_comment=$2`;
            console.log(getChildComments);
             result = await pool.query(getChildComments,[objectId,commentId])
        }
           


        console.log(result?.rows)
         res.status(200).json(result?.rows);

    } catch (error)
    {
        next(error)
        //res.status(500).json({ 'message': error.message });
        //throw new error 
    } 

}
module.exports = { getPostComments, createComment, getNonPostComments, createNonPostComment };