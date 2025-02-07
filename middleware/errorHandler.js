const { snsPublish } = require('../controllers/sendSNS');
const { logEvents } = require('./logEvents');

 const errorHandler = async (error, req, res, next) => {
    //write error to file
   // logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
    console.error(error.stack)


    if(process.env.NODE_ENV==='prod')
    {
        let timeToDisplay = new Date(Date.now()).toLocaleString()
        let notificationMessage = `Error at ${timeToDisplay} in backend api. Message is ${error.message} and the stack is ${error.stack}`
        await snsPublish(notificationMessage)
    }
    
    //return 500 status with message from error
    res.status(500);
}

module.exports = errorHandler;