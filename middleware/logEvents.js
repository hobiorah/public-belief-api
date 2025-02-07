const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    //whats going to be written to the file. caller passes in text and file to write to 
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        //if file doenst exist make it. we go up 1 directory and write into logs folder
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..','logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem);
    } catch (err) {
        console.log(err);
    }
}

//method that call the write to file method. uses information from the request to build the log message
const logger =  (req,res,next) => {
    logEvents(`${req.method}\t Origin is: ${req.headers.origin}\t${req.url} \t req path: ${req.path}`, 'reqLog.txt')
    console.log(`${req.method} ${req.path} ${req.url}`)
    next();
}

module.exports = { logEvents, logger};
