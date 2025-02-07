require('dotenv').config();
// console.log(process.env)
// /Anise Health
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const errorHandler = require('./middleware/errorHandler');
const {logEvents,logger} = require('./middleware/logEvents');
//const verifyJWT = require('./middleware/verifyJWT');
const cookierParser = require('cookie-parser');
//const credentials = require('./middleware/credentials');
//CONNECTING TO DB
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const { Pool } = require('pg');
const cors = require('cors');
const https = require("https");
const stripe = require('stripe')('sk_test_51Q5CkLBm8yO68FsgxRd4Fty1g8vYAaRoVgjeEbsrTL4plHm39sMQ39rHit0t1UDpRvFlkoyYXxBcaJAqbaoTMAmG00KY2sFSw4');

//  const corsOptions = require('./config/corsOptions');




app.use(logger);

const whitelist =['https://clarityforall.net', 'https://clarityapp.org','https://www.clarityapp.org', 'http://18.209.69.77:3000', 'https://18.209.69.77:3000', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:8080','https://localhost:443', 'https://localhost', 'http://localhost:3500'] ; //you'll likely add the apps you know will hit your api, like if you have an app running at a particular website

const corsOptions = {
    //origin variable contains where the request came from
    origin:  (origin, callback) => {
        // console.log(origin)
        // console.log(whitelist)
        if (whitelist.indexOf(origin) !== -1 || !origin) { //indexOf returns index of the value in parameter. if the value doesnt exist you'll get -1. !origin catches undefined which means it prob came from your computer
            //first param in callback is error but theres no error so we send null
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ["Origin", "X-Requested-With", "Content-Type", "Accept", "mycustomheader2","filter"],
    // res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

    //Request header field mycustomheader2 is not allowed by Access-Control-Allow-Headers in preflight response
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
// console.log(cors)

// app.use(cors({
//     origin: "*",
//     // methods: ['GET', 'POST']
//     // credentials: true
// }))
// const client = require('./config/dbConnMongo')




// // Connect to MongoDB - async bt we aren't waiting, thats why we have a listener at end
// //connectDB();
//  // Get the database and collection on which to run the operation
//  const database = client.db("test");
//  const employees = database.collection("employees");
//  // Query for movies that have a runtime less than 15 minutes
//  const query = {  };
 
//  // Execute query 
//  const cursor = employees.find(query);

// console.log(cursor.toArray());

//you can limit methods by provididng a methods variable (array) and specify which methods can be used by the ips/website you provided
//can also set credentials: true
//const cors = require('cors'); //https://blog.webdevsimplified.com/2021-05/cors/

// initialize object 
//const myEmitter = new Emitter();


const PORT = process.env.PORT || 4500;

//custom middleware = something that every route will execute or have the properties for. we typically have to include next. in built and thrid parties provide next
//logger writes to a file 
//app.use(logger);



//use this to set the allow credentials header for all reqeusts
/*
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('reading new middleware???')
    res.header('Access-Control-Allow-Credentials', true);
        // res.header('Access-Control-Allow-Origin',"*");

   // res.header('Access-Control-Allow-Origin', ['http://localhost:3000','https://localhost:3000']);
    //Access to XMLHttpRequest at 'http://localhost:4500/beliefs/66c37de085df47d56c3334af' from origin 'http://localhost:3000' has been blocked by CORS policy: Method DELETE is not allowed by Access-Control-Allow-Methods in preflight response.
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

    //Request header field mycustomheader2 is not allowed by Access-Control-Allow-Headers in preflight response
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, mycustomheader2,filter');
    next();
})
    */

//app.use(cors(corsOptions));

//BUILT-IN MIDDLEWARE
//app.use to apply middleware to all routes. 
//this particular middleware is for getting data out of a form. cn access the form as a variable
//urlencoded data = form data: content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({extended: false})) //use to handle form data

//middlware for cookies 
app.use(cookierParser());
const bodyParser = require('body-parser');

// app.post('/webhook', bodyParser.raw({type: 'application/json'}), async (request, response,  next) => {
//     const payload = request.body;
//     const sig = request.headers['stripe-signature'];
//     let endpointSecret = 'whsec_c3054b0649ff93c387bf03e0a3056e06c22aa190ca85a547bcaddf13e7f77a02'
  
//     console.log('confirmpayment executes')
//     console.log(sig)
//     let event;
  
//     try {
//       console.log('create event')

//       event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
//       console.log(event)
//     } catch (err) {
//       next(err)
//       //return response.status(400).send(`Webhook Error: ${err.message}`);
//     }
  
//     if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') 
//     {
//       //fulfillCheckout(event.data.object.id);
//       console.log('checout condition')
//       console.log(event.data.object.id)
//     } else if (event.type ==='checkout.session.async_payment_failed')
//     {
//       //delete purchasedObject from user 
//     }
  
//     response.status(200).end();
  
//   });
//getting data from requests that send json


//app.use(verifyJWT);//we only want it applied to the employees routes

//anything with /subdir/[whatever] will use whats specified in here to process the request

app.use('/payment', require('./routes/api/payment'));

app.use(express.json());

app.use('/register', require('./routes/auth/register'));
app.use('/auth', require('./routes/auth/auth'));
 app.use('/refresh', require('./routes/auth/refresh'));
 app.use('/logout', require('./routes/auth/logout'));

// app.use(verifyJWT);//we only want it applied to the employees routes
app.use('/beliefs', require('./routes/api/beliefs'));
app.use('/loadedWords', require('./routes/api/loadedWords'));
app.use('/conditions', require('./routes/api/conditions'));
app.use('/insights', require('./routes/api/insights'));

app.use('/user', require('./routes/api/user'));


app.use('/posts', require('./routes/api/forum/posts'));
app.use('/comments', require('./routes/api/forum/comments'));
app.use('/events', require('./routes/api/events'));


// express.raw({ type: '*/*' }))







 //will catch all routes that werent cause by our explicit routes
 //this method reads the accepts header and provdes a response based on that
 app.all('*', (req, res) => {
    res.status(404);
   if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

//DEFAULT ERROR-HANDLER - https://www.youtube.com/watch?v=mGPj-pCGS2c
//You define error-handling middleware last, after other app.use() and routes calls; for example:
//Define error-handling middleware functions in the same way as other middleware functions, except error-handling functions have four arguments instead of three: (err, req, res, next). For example:
app.use(errorHandler);

 
//always goes at end - ONLY WANT TO LISTEN IF WE'RE CONNECTED TO DB

if(process.env.NODE_ENV==='prod')
{
const options = {
    // path.join(__dirname, "claritykey.pem")
    key: fs.readFileSync('./claritykey.pem'),
    cert: fs.readFileSync(path.join(__dirname, "claritycert.pem")),
  };

  https.createServer(options, app).listen(PORT,() => 
    {console.log(`Server running on port https ${PORT}`)
    })
} else
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

let host = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST : "postgres";
// console.log(host)
// const pool = new Pool({
//     user: process.env.POSTGRES_USER,
//     host: (process.env.NODE_ENV==='devs' ? process.env.POSTGRES_HOST: postgres),
//     database: process.env.POSTGRES_DATABASE,
//     password: process.env.POSTGRES_PASS,
//     port: process.env.POSTGRES_PORT,
// })

//console.log(pool)
// mongoose.connection.once('open', () => {
//     console.log("connected to mongoDB")
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// })
