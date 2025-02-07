const Belief = require('../model/Belief');
const client = require('../config/dbConnMongo');
const { createStripeProduct } = require('./paymentUtils');
//let { ObjectID } = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
//https://www.npmjs.com/package/html-to-text 
const { convert } = require('html-to-text');




//parents
const getAllConditions = async (req, res, next) => {


    //  const foundUser = await User.findOne({ username: user }).exec();
    //if too much data might have to use curors isntead of returning all
      

     // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
    //connectDB();
    // Get the database and collection on which to run the operation
    const database = client.db("BeliefApp");
    const conditions = database.collection("conditions");
    // change this to read from query param flter  let page = req. query.page;
    let filter = req?.headers?.filter;
    let list = req?.query?.list;
    console.log(list)
    //console.log(`we can pull headers right ${filter}`);
    //console.log(filter)

    let cursor;
    
    //THIS IS THE QUERY BEING EXECUTED
    let query = { parentConditions: null };
    //parentConditions: null
   // db.spices.find( { parentId: { $exists: false } } )


     //the atleast seach part isnt necessary yet cause thers no condition search function 
    if (filter && filter !=='') 
    {
      console.log('in atlas search')

      //search using atlas search function
      //https://www.mongodb.com/docs/atlas/atlas-search/path-construction/ 
       cursor = await beliefs.aggregate([
        {
          $search: {
            index: "conditions",
            "text": {
              "query": filter,
              "path": "condition"
            }
          }
        }
      ])

    } else if (list)
    {
      console.log('bro what list')

     try 
     {
      if (!Array.isArray(list))
      {
        return res.status(400).json({ 'message': 'use condition/:id. This endpoint with list query params is for a list of ids.' });
      }
      // let objectids = 
      // list.length ===1 ? 
      // [new ObjectId(condition)] : 
      // list.map((condition,i) => new ObjectId(condition) )

      let objectids = list.map((condition,i) => new ObjectId(condition) )
      console.log('in get conditions objectids')
     // console.log(objectids);
       query  =
      {
       _id: 
       { 
        $in:  objectids 
       } 
      };    

     } catch(e) 
     {
      return next(e)
     }
      
      
    }
    console.log('bro what executing')
    console.log(query)


    cursor = conditions.find(query);
  

  const options = {
    wordwrap: 130,
    // ...
  };

    let conditionsToReturn = await cursor.toArray();
  for(let i =0; i < conditionsToReturn.length; i++)
  {
    let reducedText = conditionsToReturn
    const plainText = convert(conditionsToReturn[i].ourDefinition, options);
    conditionsToReturn[i].ourDefinition = plainText.substring(0,500)

  }

 

    //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
      res.json(conditionsToReturn);

    }

    const getAllConditionsByType = async (req, res, next) =>  {
  
      // Get the database and collection on which to run the operation
      const database = client.db("BeliefApp");
      const conditions = database.collection("conditions");
      // Query for movies that have a runtime less than 15 minutes
      
      let type = req?.params?.type
      console.log(type)
      
      
    //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "type": type};
      //const query = { belief: "John" };
      console.log(query)

    // Execute query
      const foundConditions = await conditions.find(query);
      console.log(foundConditions)
        res.json(foundConditions);
  
      }

      const getChildConditionsByType = async (req, res, next) =>  {

        
  
        // Get the database and collection on which to run the operation
        const database = client.db("BeliefApp");
        const conditions = database.collection("conditions");
        // Query for movies that have a runtime less than 15 minutes
        
        let type = req?.params?.type
        let parentId = req?.params?.id
        console.log(type)
        console.log(parentId)
        
        
        try 
        {
          //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
      const query = { "type": type,   "parentConditions": { $in: [ parentId ] }};
      //const query = { belief: "John" };
     // console.log(query)

    // Execute query
      const foundConditions = await conditions.find(query);
    //  console.log(foundConditions)
    // cursor = conditions.find(query);
    
    //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
      res.json(await foundConditions.toArray());
       // res.json(foundConditions);
  
        } catch(e)
        {
          next(e)
        }
      
        }


    const getConditionById = async (req, res, next) => {
      //  const foundUser = await User.findOne({ username: user }).exec();
      //if too much data might have to use curors isntead of returning all
        
       // let allEBeliefs = await Belief.find({}).exec();
  
       // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
      //connectDB();
      // Get the database and collection on which to run the operation
      const database = client.db("BeliefApp");
      const conditions = database.collection("conditions");
      // Query for movies that have a runtime less than 15 minutes
      
      let id = req?.params?.id
      console.log(id)
      
      
      
    //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
      //const query = { belief: "John" };
      console.log(query)

      try {

        const condition = await conditions.findOne(query);
        console.log(condition)
        res.json(condition);
      } catch(e) {
        next(e)
      }
    // Execute query
     
      
  
      }

      const getLimitedConditionById = async (req, res, next) => {
        //  const foundUser = await User.findOne({ username: user }).exec();
        //if too much data might have to use curors isntead of returning all
          
         // let allEBeliefs = await Belief.find({}).exec();
    
         // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
        //connectDB();
        // Get the database and collection on which to run the operation
        const database = client.db("BeliefApp");
        const conditions = database.collection("conditions");
        // Query for movies that have a runtime less than 15 minutes
        
        let id = req?.params?.id
        console.log('in limite?')
        console.log(id)
        
        
        
      
  
        try {
          //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
      const query = { "_id": new ObjectId(id) };
      //const query = { belief: "John" };
      console.log(query)
  
          const condition = await conditions.findOne(query);
          console.log(condition)
          // res.json(condition);
          res.json({'condition':condition.condition, 'preview': condition.preview, 'type':condition.type});
          
        } catch(e) {
          next(e)
        }
      // Execute query
       
        
    
        }
  

 
  // Execute query 
  
  
  //console.log(await cursor.toArray());

   
     // res.json(allEBeliefs);

 
const addCondition = async (req, res) => {

  const database = client.db("BeliefApp");
  const conditions = database.collection("conditions");
  let condition = req?.body?.condition;
  let {preview} = req.body;
  if (!condition) {
      return res.status(400).json({ 'message': 'Condition required.' });
  }
  let ourDefinition = req?.body?.ourDefinition
  console.log(ourDefinition);

  let beliefs = req?.body?.beliefs


 // console.log(`${belief} and ${metaProblem}`);

  try {
      //OPTIONAL: CHECK IF this user already exists EXISTS
  
      // const doc = {
      //   "name": subCondition,
      //    "parentConditions": parentConditions,
      //    "type": req?.body?.type, //trigger/fear/
      //   "content": ourDefinition,
      
      //   "beliefs": beliefs
      // };

  const doc = {
       "condition": condition,
      "ourDefinition": ourDefinition,
      "type": req?.body?.type,
      "preview": preview,
      "parentConditions":  req?.body?.parentConditions,
      "thirdPartyDefinition": 
      {
          "definition": req?.body?.thirdPartyDefinition.definition,
          "sourceName": req?.body?.thirdPartyDefinition.sourceName,
          "sourceLink": req?.body?.thirdPartyDefinition.sourceLink
       },
    
      "beliefs": beliefs
    };


    
    

  const result = await conditions.insertOne(doc);
  // Print the ID of the inserted document
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
 
  console.log('creating stripe product for new condition')
  createStripeProduct(result.insertedId, condition)

     // await result.save();
      res.status(201).json(result);
      console.log(result);
  } catch (err) {
    
    next(err)
  }

 
}

const deleteCondition = async (req, res, next) => {
  // let result =  await Employee.deleteOne({ id: req.body.id }).exec();
  const database = client.db("BeliefApp");
  const conditions = database.collection("conditions");
  // Query for movies that have a runtime less than 15 minutes
  try 
  { 
    console.log(req.body.id)
    let id = req?.params?.id

    console.log(id)

    if (!id) {
      return res.status(400).json({ 'message': 'ID are required.' });
      }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      const condition = await conditions.findOne(query);

      
      if (!condition) {
          return res.status(400).json({ "message": `condition ID ${req.body.id} not found` });
      }

    let del= await conditions.deleteOne(query);
   
    res.json({...condition, del});
  }
  catch (error) {
    next(error)
  }
    //let allBeliefs = await beliefs.find({});
    //res.json(allBeliefs);
}

async function updateCondition(req, res, next)
{
  const database = client.db("BeliefApp");
  const conditions = database.collection("conditions");
  let id = req?.params?.id

  try 
  { 
   // console.log(req.body)
   // let id = req?.body?.id
    console.log(id)
    console.log(req?.body)

    if (!id || !req?.body ) 
    {
      return res.status(400).json({ 'message': 'Condition ID and body to update belief is required.' });
    }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      //const belief = await beliefs.findOne(query);
      let update = await conditions.replaceOne(
        { _id: new ObjectId(id) },
        req?.body );
      
   
    res.json(update);
  }
  catch (error) {
    next(error)
  }

}

module.exports = {
  getAllConditions,
  addCondition,
  getConditionById,
  deleteCondition,
  updateCondition,
  getAllConditionsByType,
  getChildConditionsByType,
  getLimitedConditionById
}
