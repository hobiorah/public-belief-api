const {Pool, Client} = require('pg');
const { getUser } = require('./auth/utility');
const { snsPublish } = require('./sendSNS');
const stripe = require('stripe')
(process.env.NODE_ENV==='dev' ? process.env.STRIPE_DEV_SECRET : process.env.STRIPE_PROD_SECRET);


let DBHost = process.env.NODE_ENV==='dev' ? process.env.POSTGRES_HOST: process.env.POSTGRES_PROD_HOST;

const subscription = process.env.NODE_ENV==='dev' ? process.env.STRIPE_DEV_SUBSCRIPTION: process.env.STRIPE_PROD_SUBSCRIPTION;
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: DBHost,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASS,
    port: process.env.POSTGRES_PORT,
})

let updateAccess = `UPDATE users
SET purchase_info=$1, access_info=$2
WHERE username=$3 ;`
let addTransaction = `INSERT INTO transactions(details, username) VALUES ($1, $2)`





async function createStripeProduct(req,res,next){
  let description = `
  *What you get when you purchase*
  2$ Lifetime access to this solution plus access to future enhancments driven by community recommendation and new research findings. Lifetime access to the community group for this solution which lets you submit questions and help requests to our experts. 
  Subcription 15$ access to all existing and future solutions and forums. Access to the solutions is lost when your subscriptin is no longer active. If you purchased a solution and have a subscription, you’ll have access to all your purchased solution even when your subcription ends. 

  *What is this community group?*
  A forum(think reddit) for the problem-solution you purchased. You can ask and answer questisons, share lessons learned, etc with others workign on the same the psychological problem as you. <Em>If there isn't a lot of activity in the forum and you post questions you will likely get priority support from our experts.</Em>
  

  *Access to experts*
  If you think the solution needs more clarification or improvements you can create a post or comment and share what you’d like us and the community to know. We regularly review communities. You can also submit a dedicated ‘solution feedback’ request that is only available to those that have purchased a solution or have a subscription.  

  Note: You have the ability to pay more than 2$ if you'd like to support our mission of bringing low-cost mental health to the world. Running this site, producing, and improving our content does take money but we have faith that the value it adds will
  allow us to find a way to sustain ourselves and this platform. Best,
  `

  const createProduct = await stripe.products.create({
    name: `${conditions[i].condition}`,
    description: description,
    default_price_data: {
      currency: 'usd',
      custom_unit_amount: {
            "enabled": true,
            "minimum": 200,
            "preset": 200
      
          },
        },
    statement_descriptor: `Psyc Solution`,
    metadata: {
      'conditionId': `${conditions[i]._id}`,
      'conditionName': `${conditions[i].condition}`
    },

  });
}

//this is what creats the payment page
  async function createCheckoutSession(req,res,next) {

    console.log('in create session')
    console.log(req.body)
   let  {id, successURL, username, cancelURL} = req?.body;
   //console.log( `lookup_key:"${id}"`)

//get price for condition user pressed pruchase for
try 
{
  const products = await stripe.products.search({
    query: `active:'true' AND metadata['conditionId']:'${id}'`,
  });
 console.log('products object',(products.metadata))
let price = products.data[0].default_price
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        //price: 'price_1Q5ClKBm8yO68Fsg8IaaxuQw',
        price,
        quantity: 1,
       
      },
    ],
    allow_promotion_codes: true,
    custom_fields: [
      {
        key: 'referral',
        label: {
          type: 'custom',
          custom: `Enter none or the promo code you used/applied`,
        },
        type: 'text'
      }],
    customer_email: username,
    // custom_fields: [ //https://docs.stripe.com/payments/checkout/custom-fields
    //   {
    //     key: 'username',
    //     label: {
    //       type: 'custom',
    //       custom: 'Your username email',
    //     },
    //     optional: false,
    //     type: 'dropdown',
    //     dropdown: {
    //       options: [
    //         {
    //           label: `${username}`,
    //           value: `${username}` ,
    //         }
    //       ],
    //       default_value: `${username}`
    //     },
    //   },
    // ],
    mode: 'payment',
    // success_url: `${successURL}`,
    // cancel_url: `${cancelURL}`,
     success_url: `${process.env.REACT_APP_SERVER}/conditionPurchase/${id}?success=true`,
     cancel_url: `${process.env.REACT_APP_SERVER}/conditionPurchase/${id}?canceled=true`,
    // success_url: `${process.env.REACT_APP_SERVER}/condition/${id}?success=true`,
    // cancel_url: `${process.env.REACT_APP_SERVER}/condition/${id}?canceled=true`,
    
  });

  //http://localhost:3000/condition/66e303c4a96aaf6c3fba5411
  console.log(session.url)
  return res.json( {"redirect": session.url})

} catch(e){
    next(e)
}
  }

async function createSubscriptionCheckout (req, res, next) {
  // const prices = await stripe.prices.list({
  //   lookup_keys: [req.body.lookup_key],
  //   expand: ['data.product'],
  // });
  let  {id, successURL, username, cancelURL} = req?.body;

  let session
  try {

  
   session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: subscription,
        // For metered billing, do not pass quantity
        quantity: 1,

      },
    ],
    allow_promotion_codes: true,
    custom_fields: [
      {
        key: 'referral',
        label: {
          type: 'custom',
          custom: `Enter none or the promo code you entered above`,
        },
        type: 'text'
      }],
    customer_email: username,
    mode: 'subscription',
    success_url: `${process.env.REACT_APP_SERVER}/conditionPurchase/${id}?success=true`,
     cancel_url: `${process.env.REACT_APP_SERVER}/conditionPurchase/${id}?canceled=true`,
  });
  console.log('session is', session)
  return res.json( {"redirect": session.url})
} catch(e)
  {
    next(e)
  }

 
}
 

 // res.redirect(303, session.url);


//app.post('/create-portal-session',
   async function createSubscriptionPortal(req, res, next) {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
  // Typically this is stored alongside the authenticated user in your database.
  const { session_id, returnUrl, } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  //const returnUrl = `${process.env.REACT_APP_SERVER}/accountdetails`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });

  //res.redirect(303, portalSession.url);
  return res.json( {"redirect": portalSession.url})
};


//app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
async function webhook(request,response,next) 
{
    const event = request.body;
    console.log(event)
  
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(paymentIntent)
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a response to acknowledge receipt of the event
    response.json({received: true});
  }


//create event after hitting submit
//  //this gets fired by stripe and what will fire functionality to update access objects o remove access
async function confirmPaymentWebhook(request,response,next) {  
  console.log('payload:')
    const payload = request.body;
    console.log(payload)


    //payload.receipt_url
    const sig = request.headers['stripe-signature'];
    //dev from local stripe secret: whsec_c3054b0649ff93c387bf03e0a3056e06c22aa190ca85a547bcaddf13e7f77a02
    //prod: git restore --staged
    let endpointSecret = (process.env.NODE_ENV==='dev' ? process.env.STRIPE_DEV_WEBHOOK_SECRET : process.env.STRIPE_PROD_WEBHOOK_SECRET);
  
    // console.log(sig)
    let event;
  
    try {
      console.log('create event log')

      //confirms request actually came from stipe
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
      if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') 
        {console.log('confirmpayment executes: ' + event.type)
          console.log(event)
        }

       
       let eventId = event.data.object.id
       const {rows} = await pool.query(`SELECT * FROM stripe_events WHERE eventId='${eventId}'`)
      
       //console.log(rows)

       let eventSeen =  rows[0];

       //if we havent seen this event before, insert into DB and process event
       if(!eventSeen)
       {
          let addStripeEvent = `INSERT INTO stripe_events(eventId) VALUES ($1)`
          const addStripeEventResult = await pool.query(addStripeEvent,[eventId])
          console.log(addStripeEventResult)

          if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') 
            {
              console.log('event type was checkout.session.completed')
              console.log(event.data.object.id)
              console.log('calling fulfill checkout with')
              console.log(event)
              //sending sessionid so we can get details of transaction
              
               
             //update customer meta data to contain email
            //  const customer = await stripe.customers.retrieve('cus_NffrFeUfNV2Hib');
            
                 fulfillCheckout(event.data.object.id, payload);
              
              
            } 
            
            else if (event.type ==='checkout.session.async_payment_failed' )
            {
              //delete purchasedObject from user 
              let add = false
              //TO DO, IF PERSON REFUNDS WE HAVE TO GET CHEKOUT OF REFUND?
              

                if(checkoutSession.mode!=='subscription')
                  {
                    purchasedObjectHelper(checkoutSession, false)

                  } else
                  {
                    //update metadata of customer so we can update its object for future webhook events
                    addSubcription(checkoutSession,false)
                  }
            }
            else if(event.type ==='charge.refunded' )
            {
                //going to manually issue refund and update DB accordingly . they already paid so can have access until we dispute         
              
            }
            let customerId=  event.data.object.customer
            let customer = await stripe.customers.retrieve(customerId);
            let username = customer.email

            switch (event.type) {         
              case 'invoice.paid':
                toggleSubscription(username, true, event )
                //customer should have email metadat from when checksoun session completed
                //set subscription to and add transaction details
                // Continue to provision the subscription as payments continue to be made.
                // Store the status in your database and check when a user accesses your service.
                // This approach helps you avoid hitting rate limits.
                break;
              case 'invoice.payment_failed':
                //  customerId =  event.data.object.customer
                //  customer = await stripe.customers.retrieve(customerId);
                //  username = customer.email
                toggleSubscription(username, false, event)
                // The payment failed or the customer does not have a valid payment method.
                // The subscription becomes past_due. Notify your customer and send them to the
                // customer portal to update their payment information.
                break;
                case 'customer.subscription.deleted':
                  //should use username from payment failed case
                //   customerId =  event.data.object.customer
                //  customer = await stripe.customers.retrieve(customerId);
                 //username = customer.medatada.username
                toggleSubscription(username, false, event)

                  break;
              default:
                // Unhandled event type
            }
          }
       }
       //if weve seen it before do nothing
  
   
    catch (err) {
      console.log(err)
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    response.status(200).end();
  };

  //fullfilmment method we call to get details of transaction
  //logic for updateing access objects
  async function fulfillCheckout(sessionId, payloadFromStripe)
  {
    // async function fulfillCheckout(sessionId) {
      // Set your secret key. Remember to switch to your live secret key in production.
      // See your keys here: https://dashboard.stripe.com/apikeys
    
      console.log('Fulfilling Checkout Session ' + sessionId);
    
      // TODO: Make this function safe to run multiple times,
      // even concurrently, with the same session ID
    
      // TODO: Make sure fulfillment hasn't already been
      // peformed for this Checkout Session
    
      // Retrieve the Checkout Session from the API with line_items expanded. will hopefully have the item paid for which has condition id needed to grant access plus username field
      try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items','payment_intent'],
        });
        console.log('checkout session in fulfillment:', checkoutSession)
        // console.log(checkoutSession.payment_intent)
  
        // console.log(product)
        let customerId = checkoutSession.customer
        // = checkoutSession.custom_fields[0].dropdown['default_value']
       let username = checkoutSession.customer_email
      } catch(e)
      {
        return e;
      }
      

     


      //console.log(checkoutSession)
    
      // Check the Checkout Session's payment_status property
      // to determine if fulfillment should be peformed. if its not paid im assuming its paid.in full
      if (checkoutSession.payment_status !== 'unpaid') {
        console.log('in the paid section area')
        // TODO: Perform fulfillment of the line items
    
        //call add purchased object which will update access json and update puchased json based on data we get
        //can hopefully get username, and objectid from stripe
        //receipt, session id
        if(checkoutSession.mode!=='subscription')
        {
          let add = true     
          purchasedObjectHelper(checkoutSession, add)
        } else
        {
          //update metadata of customer so we can update its object for future webhook events
          console.log('should get username for subscription from react', username)

          addSubcription(checkoutSession,true)
        }

        // const customer = await stripe.customers.update(
        //   customerId,
        //   {
        //     metadata: {
        //       username,
        //     },
        //   }
        // );
       
        // TODO: Record/save fulfillment status for this
        // Checkout Session
      }
    }


    async function purchasedObjectHelper(checkoutSession, addBoolean){

      // let username = )
  
      //do a fetch to confirm the transaction is actually in pyament system - a utliity function calling pyament system 
      //transaction gets confirmed in confirmpayment hook
      try {
        
          let username = checkoutSession.customer_email//custom_fields[0].dropdown['default_value']
          
          // console.log('not putting out checkout session details?')
          // console.log(checkoutSession.custom_fields[0].dropdown)
          // console.log(checkoutSession.line_items.data)
        
          let foundUser = await getUser(username)
          console.log(foundUser)
          if(!foundUser)
              throw new Error('username not found' );
        
  
          let purchaseInfo = foundUser['purchase_info']
          let accessInfo = foundUser['access_info']
          console.log(purchaseInfo)
          console.log(accessInfo)
  
  
          const product = await stripe.products.retrieve(checkoutSession.line_items.data[0].price['product']);
          //prob will lawys just be one
    let objectId = product.metadata.conditionId

    
    const charge = await stripe.charges.retrieve(checkoutSession.payment_intent.latest_charge)
    console.log('printing charge')
    console.log( charge)
    


  if(addBoolean)
    accessInfo[objectId]=true
  else
  accessInfo[objectId]=false

    let purchaseEntry = {
      receipt: charge.receipt_url,
      sessionId: checkoutSession.id,
      chargeId: charge.id,
      conditionId: product.metadata.conditionId,
      conditionName: product.metadata.conditionName,
      transactionTime: new Date(Date.now())
  }
    //make purchase info an arrary of entries cause it can change over time
    if(!purchaseInfo || !purchaseInfo[objectId] )
        purchaseInfo =
       {
        ...purchaseInfo, [objectId]: []
      };

      let purchaseList = purchaseInfo[objectId]
      purchaseList.push(purchaseEntry)
      purchaseInfo= 
      {
        ...purchaseInfo, 
        [objectId]: purchaseList
      }

    console.log(purchaseInfo)

    
      const client = await pool.connect()

     try {
      await client.query('BEGIN')
       let updateAccess = `UPDATE users SET purchase_info=$1, access_info=$2 WHERE username=$3 ;`
      const accessResult = await pool.query(updateAccess,[purchaseInfo,accessInfo,username])
      let addTransaction = `INSERT INTO transactions(details, username) VALUES ($1, $2)`
       const transactionResult = await pool.query(addTransaction,[charge,username])
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
      let timeToDisplay = new Date(Date.now()).toLocaleString()
      console.log(timeToDisplay.toLocaleString())
      let notificationMessage = `Customer ${username} with add boolean: ${addBoolean} for ${product.metadata.conditionName} at ${timeToDisplay}. Purchase Details from charge stripe object: ${JSON.stringify(charge)}`
      await snsPublish(notificationMessage)
    }
    
  
      } catch (e){
        console.log(e)
        return e;
      }
  
  
  }
  
  async function toggleSubscription(username,active, event)
  {
    let foundUser = await getUser(username)
    console.log(foundUser)
    if(!foundUser)
       throw new Error('username not found');

    let accessInfo = foundUser['access_info']

    

    let updateAccess = `UPDATE users
    SET  access_info=$1
    WHERE username=$2 ;`
   // let result; result = await pool.query(updateAccess,[accessInfo,username])

    if(active)
        accessInfo['subscribed']=true
    else 
       accessInfo['subscribed']=false


    result = await pool.query(updateAccess,[accessInfo,username])
    let timeToDisplay = new Date(Date.now()).toLocaleString()
    console.log(timeToDisplay.toLocaleString())
    let notificationMessage = `Toggled subscription for ${username} with active boolean set to: ${active} at ${timeToDisplay}. event: ${event.type}`
    await snsPublish(notificationMessage)
  }

 async function addSubcription(checkoutSession,add)
  {
    //iff ad is false then remove
    try {
        
      // console.log('not putting out checkout session details?')
      // console.log(checkoutSession.custom_fields[0].dropdown)
      // console.log(checkoutSession.line_items.data)
     let username =  checkoutSession.customer_email
      let foundUser = await getUser(username)
      console.log(foundUser)
      if(!foundUser)
         throw new Error('username not found');
    

      let purchaseInfo = foundUser['purchase_info']
      let accessInfo = foundUser['access_info']
      console.log(purchaseInfo)
      console.log(accessInfo)





if(add)
accessInfo['subscribed']=true
else
accessInfo['subscribed']=false

let purchaseEntry = {
  checkoutSession: checkoutSession,
  transactionTime: new Date(Date.now())
}
//make purchase info an arrary of entries cause it can change over time
if(!purchaseInfo || !purchaseInfo['subscription'] )
    purchaseInfo =
   {
    ...purchaseInfo, ['subscription']: []
  };

  let purchaseList = purchaseInfo['subscription']
  //append subcription entry (using checkout session)
  purchaseList.push(purchaseEntry)
  purchaseInfo= 
  {
    ...purchaseInfo, 
    ['subscription']: purchaseList
  }

console.log(purchaseInfo)


  const client = await pool.connect()

 try {
  await client.query('BEGIN')
  let updateAccess = `UPDATE users
  SET purchase_info=$1, access_info=$2
  WHERE username=$3 ;`
  const accessResult = await pool.query(updateAccess,[purchaseInfo,accessInfo,username])
  let addTransaction = `INSERT INTO transactions(details, username) VALUES ($1, $2)`
  const transactionResult = await pool.query(addTransaction,[checkoutSession,username])
  await client.query('COMMIT')
} catch (e) {
  await client.query('ROLLBACK')
  throw e
} finally {
  client.release()
  let timeToDisplay = new Date(Date.now()).toLocaleString()
  console.log(timeToDisplay.toLocaleString())
  let notificationMessage = `Customer ${username} boughtsubscription at ${timeToDisplay}. Purchase Details from checkout stripe object: ${JSON.stringify(checkoutSession)}`
  await snsPublish(notificationMessage)
}


  } catch (e){
    console.log(e)
    return e;
  }


  }
  

module.exports = {  createSubscriptionPortal, webhook, createCheckoutSession, confirmPaymentWebhook, createSubscriptionCheckout };
