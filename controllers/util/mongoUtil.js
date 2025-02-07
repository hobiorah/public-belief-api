const Belief = require('../../model/Belief');
const client = require('../../config/dbConnMongo');
//let { ObjectID } = require('mongodb');
var ObjectId = require('mongodb').ObjectId; 


async function getCollection(db,collection){
    const database = client.db(db);
const theCollection = database.collection(collection);
      // Query for movies that have a runtime less than 15 minutes
      
    //   console.log(theCollection)
      return theCollection;

    //   return {"db":database, 'collection': theCollection}
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
module.exports = { getCollection};