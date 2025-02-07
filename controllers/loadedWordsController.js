const client = require('../config/dbConnMongo')
//let { ObjectID } = require('mongodb');
var ObjectId = require('mongodb').ObjectId; 




const getAllLoadedWords = async (req, res) => {
    //  const foundUser = await User.findOne({ username: user }).exec();
    //if too much data might have to use curors isntead of returning all
      
     // let allEBeliefs = await Belief.find({}).exec();

     // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
    //connectDB();
    // Get the database and collection on which to run the operation
    const database = client.db("BeliefApp");
    const loadedWords = database.collection("loadedWords");
   
    // Query for movies that have a runtime less than 15 minutes
    let filter = req?.headers?.filter;
    console.log(`we can pull header abi? right ${filter}`);
    // let cursor;
    
    // let query = {  };
   
    // cursor = loadedWords.find(query);


    let cursor;
    
    let query = {  };
    if (filter && filter !=='') 
    {
      console.log('in atlas search')

      //search using atlas search function
      //https://www.mongodb.com/docs/atlas/atlas-search/path-construction/ 
       cursor = await loadedWords.aggregate([
        {
          $search: {
            index: "loadedWordSearch",
            "text": {
              "query": filter,
              "path": "loadedWord"
            }
          }
        }
      ])
      //console.log(cursor)

    } else 
    {
       cursor = loadedWords.find({});
    }
    
    
    //https://www.mongodb.com/docs/drivers/node/v4.0/fundamentals/crud/read-operations/cursor/
      res.json(await cursor.toArray());

    }


    const getLoadedWordById = async (req, res) => {
      //  const foundUser = await User.findOne({ username: user }).exec();
      //if too much data might have to use curors isntead of returning all
        
       // let allEBeliefs = await Belief.find({}).exec();
  
       // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
      //connectDB();
      // Get the database and collection on which to run the operation
      const database = client.db("BeliefApp");
      const loadedWords = database.collection("loadedWords");
      // Query for movies that have a runtime less than 15 minutes
      
      let id = req?.params?.id
      console.log(id)
      
      
    //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
      //const query = { belief: "John" };
      console.log(query)

    // Execute query
      const loadedWord = await loadedWords.findOne(query);
      console.log(loadedWord)
        res.json(loadedWord);
  
      }
  

 
  // Execute query 
  
  
  //console.log(await cursor.toArray());

   
     // res.json(allEBeliefs);

 
const addLoadedWord = async (req, res) => {

  const database = client.db("BeliefApp");
  const loadedWords = database.collection("loadedWords");
  let loadedWord = req?.body?.loadedWord;
  if (!loadedWord) {
      return res.status(400).json({ 'message': 'loadedWord required.' });
  }
  let why = req?.body?.why
  let examples = req?.body?.examples

 // console.log(`${belief} and ${metaProblem}`);

  try {
      //OPTIONAL: CHECK IF this user already exists EXISTS
  
    
  // const result = await Belief.create({
  //     "belief": belief,
  //     "metaProblems": metaProblem,  
  //     "dismantlingOfBelief": dismantlingOfBelief
  // });
  const doc = {
        "loadedWord": loadedWord,
        "why": why,  
        "examples": examples

    };

  const result = await loadedWords.insertOne(doc);
  // Print the ID of the inserted document
  console.log(`A document was inserted with the _id: ${result.insertedId}`);
 
  

  console.log("new loadedWord attemped to be added");
     // await result.save();
      res.status(201).json(result);
      console.log(result);
  } catch (err) {
    
      console.log(err);
  }

 
}

const deleteLoadedWord = async (req, res, next) => {
  // let result =  await Employee.deleteOne({ id: req.body.id }).exec();
  const database = client.db("BeliefApp");
  const loadedWords = database.collection("loadedWords");
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

      const loadedWord = await loadedWords.findOne(query);

      
      if (!loadedWord) {
          return res.status(400).json({ "message": `ladedWords ID ${req.body.id} not found` });
      }

    let del= await loadedWords.deleteOne(query);
   
    res.json({...loadedWord, del});
  }
  catch (error) {
    next(error)
  }
    //let allBeliefs = await beliefs.find({});
    //res.json(allBeliefs);
}

async function updateLoadedWord(req, res, next)
{
  const database = client.db("BeliefApp");
  const loadedWords = database.collection("loadedWords");
  let id = req?.params?.id

  try 
  { 
   // console.log(req.body)
   // let id = req?.body?.id
    console.log(id)
    console.log(req?.body)

    if (!id || !req?.body ) 
    {
      return res.status(400).json({ 'message': 'loadedWord ID and body to update word is required.' });
    }

      //https://stackoverflow.com/questions/8233014/how-do-i-search-for-an-object-by-its-objectid-in-the-mongo-console
    const query = { "_id": new ObjectId(id) };
    //const query = { belief: "John" };
      console.log(query)

      //const belief = await beliefs.findOne(query);
      let update = await loadedWords.replaceOne(
        { _id: new ObjectId(id) },
        req?.body );
      
   
    res.json(update);
  }
  catch (error) {
    next(error)
  }

}

module.exports = {
  getAllLoadedWords,
  addLoadedWord,
  getLoadedWordById,
  deleteLoadedWord,
  updateLoadedWord
}
