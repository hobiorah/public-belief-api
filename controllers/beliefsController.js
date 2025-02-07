const Belief = require('../model/Belief');
const client = require('../config/dbConnMongo')
//let { ObjectID } = require('mongodb');
var ObjectId = require('mongodb').ObjectId; 




const getAllBeliefs = async (req, res) => {
    //  const foundUser = await User.findOne({ username: user }).exec();
    //if too much data might have to use curors isntead of returning all
      
     // let allEBeliefs = await Belief.find({}).exec();

     // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
    //connectDB();
    // Get the database and collection on which to run the operation
    const database = client.db("BeliefApp");
    const beliefs = database.collection("beliefs");
    // Query for movies that have a runtime less than 15 minutes
    let filter = req?.headers?.filter;
    console.log(`we can pull headers right ${filter}`);
    console.log(filter)

    let cursor;
    
    let query = {  };
    if (filter && filter !=='') 
    {
      console.log('in atlas search')

      //search using atlas search function
      //https://www.mongodb.com/docs/atlas/atlas-search/path-construction/ 
       cursor = await beliefs.aggregate([
        {
          $search: {
            index: "beliefSearch",
            "text": {
              "query": filter,
              "path": "belief"
            }
          }
        }
      ])
      //console.log(cursor)

    } else 
    {
       cursor = beliefs.find({});
    }
    
    //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
      res.json(await cursor.toArray());

    }


    const getBeliefById = async (req, res, next) => {
      //  const foundUser = await User.findOne({ username: user }).exec();
      //if too much data might have to use curors isntead of returning all
        
       // let allEBeliefs = await Belief.find({}).exec();
  
       // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
      //connectDB();
      // Get the database and collection on which to run the operation
      const database = client.db("BeliefApp");
      const beliefs = database.collection("beliefs");
      // Query for movies that have a runtime less than 15 minutes
      
      let id = req?.params?.id
      console.log(id)
      
  try {
        //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
    console.log(query)

  // Execute query
    const belief = await beliefs.findOne(query);
    console.log(belief)
      res.json(belief);

      }
      catch (error)
      {
        next(error)
      }
      
    
      }

      const getBeliefByCondition = async (req, res) => {
        //  const foundUser = await User.findOne({ username: user }).exec();
        //if too much data might have to use curors isntead of returning all
          
        
        //IF ID BLANK
    
         // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
        //connectDB();
        // Get the database and collection on which to run the operation
        const database = client.db("BeliefApp");
        const beliefs = database.collection("beliefs");
        // Query for movies that have a runtime less than 15 minutes
        
        let conditionId = req?.params?.conditionId
        console.log(conditionId)
        
        
     //look into condition field. if conid in condition arraylist
     //This query selects all documents in the beliefs collection where the value of the rootcause field is either condition id or...

     const query  =
      {
       rootCauseFor: 
       { 
        $in: [ conditionId ] 
       } 
      };    
    
    //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
    // https://www.mongodb.com/docs/drivers/node/current/usage-examples/findOne/
      cursor =  beliefs.find(query);
      res.json(await cursor.toArray());

    }
  

 
  // Execute query 
  
  
  //console.log(await cursor.toArray());

   
     // res.json(allEBeliefs);

 
const addBelief = async (req, res) => {

  const database = client.db("BeliefApp");
  const beliefs = database.collection("beliefs");
  let belief = req?.body?.belief;
  if (!belief) {
      return res.status(400).json({ 'message': 'Belief required.' });
  }
  let metaProblems = req?.body?.metaProblems
  let dismantlingOfBelief = req?.body?.dismantlingOfBelief

 // console.log(`${belief} and ${metaProblem}`);

  try {
      //OPTIONAL: CHECK IF this user already exists EXISTS
  
    
  // const result = await Belief.create({
  //     "belief": belief,
  //     "metaProblems": metaProblem,  
  //     "dismantlingOfBelief": dismantlingOfBelief
  // });
  //tool that pulls up conditions so you can select which ones to include 
  const doc = {
        "belief": belief,
        "metaProblems": metaProblems,  
        "dismantlingOfBelief": dismantlingOfBelief,
        "loadedWords": req?.body?.loadedWords,
        "rootCauseFor": req?.body?.rootCauseFor,
        "rootCauseOf": req?.body?.rootCauseOf

    };
    
//https://www.mongodb.com/docs/drivers/node/current/usage-examples/insertOne/
  const result = await beliefs.insertOne(doc);
  // Print the ID of the inserted document
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
 
  

  console.log("new belief attemped to be added");
     // await result.save();
      res.status(201).json(result);
      console.log(result);
  } catch (err) {
    
      console.log(err);
  }

 
}

const deleteBelief = async (req, res, next) => {
  // let result =  await Employee.deleteOne({ id: req.body.id }).exec();
  const database = client.db("BeliefApp");
  const beliefs = database.collection("beliefs");
  let id = req?.params?.id
  // Query for movies that have a runtime less than 15 minutes
  try 
  { 
   // console.log(req.body)
   // let id = req?.body?.id
    console.log(id)

    if (!id) {
      return res.status(400).json({ 'message': 'ID are required.' });
      }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      const belief = await beliefs.findOne(query);

      
      if (!belief) {
          return res.status(400).json({ "message": `Belief ID ${req.body.id} not found` });
      }

    let del= await beliefs.deleteOne(query);
   
    res.json({...belief, del});
  }
  catch (error) {
    next(error)
  }
    //let allBeliefs = await beliefs.find({});
    //res.json(allBeliefs);
}

async function updateBelief(req, res, next)
{
  const database = client.db("BeliefApp");
  const beliefs = database.collection("beliefs");
  let id = req?.params?.id

  try 
  { 
   // console.log(req.body)
   // let id = req?.body?.id
    console.log(id)
    console.log(req?.body)

    if (!id || !req?.body ) 
    {
      return res.status(400).json({ 'message': 'Belief ID and body to update belief is required.' });
    }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      //const belief = await beliefs.findOne(query);
      let update = await beliefs.replaceOne(
        { _id: new ObjectId(id) },
        req?.body );
      

      
      // if (!belief) {
      //     return res.status(400).json({ "message": `Belief ID ${req.body.id} not found` });
      // }

    
   
    res.json(update);
  }
  catch (error) {
    next(error)
  }

}


module.exports = {
  getAllBeliefs,
  addBelief,
  getBeliefById,
  getBeliefByCondition,
  deleteBelief,
  updateBelief
}
