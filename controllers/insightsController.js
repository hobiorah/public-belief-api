const client = require('../config/dbConnMongo')
//let { ObjectID } = require('mongodb');
var ObjectId = require('mongodb').ObjectId; 



const getAllUniqueTags = async (req, res) => {
  //  const foundUser = await User.findOne({ username: user }).exec();
  //if too much data might have to use curors isntead of returning all
    
   // let allEBeliefs = await Belief.find({}).exec();

   // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
  //connectDB();
  // Get the database and collection on which to run the operation
  const database = client.db("BeliefApp");
  const insights = database.collection("insights");
  // Query for movies that have a runtime less than 15 minutes
  let filter = req?.params?.filter

  console.log(`we can pull headers right ${filter}`);
  console.log(filter)

  let uniqueTags;
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
    console.log('runnign distinc command')
    uniqueTags = await insights.distinct( 'tags')
    console.log(uniqueTags)
    uniqueTags = uniqueTags.filter((tag) => tag && tag!=='')
    console.log('after filter',uniqueTags)
    


    // cursor = database.runCommand ( { distinct: "insights", key: "tags" } )

     //cursor = insights.find({});
  }
  
  //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
  if(uniqueTags.length==0 || !uniqueTags)
    return res.json(null);
  
  res.json(uniqueTags);

  }

const getAllInsights = async (req, res, next) => {
    //  const foundUser = await User.findOne({ username: user }).exec();
    //if too much data might have to use curors isntead of returning all
      
     // let allEBeliefs = await Belief.find({}).exec();

     // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
    //connectDB();
    // Get the database and collection on which to run the operation
    const database = client.db("BeliefApp");
    const insights = database.collection("insights");
    // Query for movies that have a runtime less than 15 minutes
    let filter = req?.params?.filter;
    console.log(`we can pull headers right ${filter}`);
    console.log(filter)

    let cursor;
    
    let query = {  };
    if (filter && filter !=='') 
    {
      console.log('in atlas search')

      //search using atlas search function
      //https://www.mongodb.com/docs/atlas/atlas-search/path-construction/ 
       cursor = await insights.aggregate([
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
       cursor = insights.find({});
    }
    
    //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
      res.json(await cursor.toArray());

    }


    const getInsightById = async (req, res, next) => {
      //  const foundUser = await User.findOne({ username: user }).exec();
      //if too much data might have to use curors isntead of returning all
        
       // let allEBeliefs = await Belief.find({}).exec();
  
       // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
      //connectDB();
      // Get the database and collection on which to run the operation
      const database = client.db("BeliefApp");
      const insights = database.collection("insights");
      // Query for movies that have a runtime less than 15 minutes
      console.log('is thi sbroken')
      let id = req?.params?.insightId
      console.log(id)
      
      
    //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    try {
    const query = { "_id": new ObjectId(id) };
      //const query = { belief: "John" };
      console.log(query)

    // Execute query
    const insight = await insights.findOne(query);
      console.log(insight)
        res.json(insight);
      }
      catch(e) {
         next(e)
      }

      
  
      }

      const getBeliefByCondition = async (req, res, next) => {
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
     
      cursor =  beliefs.find(query);
      res.json(await cursor.toArray());

    }
  

 
  // Execute query 
  
  
  //console.log(await cursor.toArray());

   
     // res.json(allEBeliefs);

 
const addInsight = async (req, res, next) => {

  const database = client.db("BeliefApp");
  const insights = database.collection("insights");
  let insightTitle = req?.body?.insightTitle;
  if (!insightTitle) {
      return res.status(400).json({ 'message': 'Insight required.' });
  }


 // console.log(`${belief} and ${metaProblem}`);

  try {
      //OPTIONAL: CHECK IF this user already exists EXISTS
  

  //tool that pulls up conditions so you can select which ones to include 
  const doc = {
        "insightTitle": req?.body?.insightTitle,
        "insight": req?.body?.insight,//will be html string 
        "tags": req?.body?.tags,  
        "conditions": req?.body?.conditions,  
        "author": req?.body?.author,
        "dateAdded": new Date()
    };

  const result = await insights.insertOne(doc);
  // Print the ID of the inserted document
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
 
  

  console.log("new insight attemped to be added");
     // await result.save();
      res.status(201).json(result);
      console.log(result);
  } catch (err) {
    
      next(err)
  }

}

const deleteInsight = async (req, res, next) => {
  // let result =  await Employee.deleteOne({ id: req.body.id }).exec();
  const database = client.db("BeliefApp");
  const insights = database.collection("insights");
  // Query for movies that have a runtime less than 15 minutes
  try 
  { 
    console.log(req.body.id)
    let id = req?.params?.insightId
    console.log(id)

   

    if (!id) {
      return res.status(400).json({ 'message': 'ID are required.' });
      }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      const insight = await insights.findOne(query);

      
      if (!insight) {
          return res.status(400).json({ "message": `insight ID ${req.body.id} not found` });
      }

    let del= await insights.deleteOne(query);
   
    res.json({...insight, del});
  }
  catch (error) {
    next(error)
  }
    //let allBeliefs = await beliefs.find({});
    //res.json(allBeliefs);
}

async function updateInsight(req, res, next)
{
  const database = client.db("BeliefApp");
  const insights = database.collection("insights");
  let id = req?.params?.insightId

  try 
  { 
   // console.log(req.body)
   // let id = req?.body?.id
    console.log(id)
    console.log(req?.body)

    if (!id || !req?.body ) 
    {
      return res.status(400).json({ 'message': 'Insight ID and body to update insight is required.' });
    }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      //const belief = await beliefs.findOne(query);
      let update = await insights.replaceOne(
        { _id: new ObjectId(id) },
        req?.body );
      
   
    res.json(update);
  }
  catch (error) {
    next(error)
  }

}




module.exports = {
  getAllUniqueTags,
  addInsight,
  getAllInsights,
  getInsightById,
  deleteInsight, 
  updateInsight
}
