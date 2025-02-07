// const stripe = require('stripe')('sk_test_51Q5CkLBm8yO68FsgxRd4Fty1g8vYAaRoVgjeEbsrTL4plHm39sMQ39rHit0t1UDpRvFlkoyYXxBcaJAqbaoTMAmG00KY2sFSw4');

const stripe = require('stripe')
(process.env.NODE_ENV==='dev' ? process.env.STRIPE_DEV_SECRET : process.env.STRIPE_PROD_SECRET);


async function createStripeProduct(id,conditionName){
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
    console.log('are we not in here??')
  console.log(id)
    const createProduct = await stripe.products.create({
      name: `${conditionName}`,
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
        'conditionId': `${id}`,
        'conditionName': `${conditionName}`
      },
  
    });

    console.log(createProduct)
  }


  module.exports = { createStripeProduct };