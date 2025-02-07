 let { PublishCommand, SNSClient } = require("@aws-sdk/client-sns");
//  let { snsClient } = require( "./snsClient.js");
//  let { SNSClient } require("@aws-sdk/client-sns");

// The AWS Region can be provided here using the `region` property. If you leave it blank
// the SDK will default to the region set in your AWS config.
 const snsClient = new SNSClient({});

/**
 * @param {string | Record<string, any>} message - The message to send. Can be a plain string or an object
 *                                                 if you are using the `json` `MessageStructure`.
 * @param {string} topicArn - The ARN of the topic to which you would like to snsPublish.
 */
 const snsPublish = async (
  message = "Hello from SNS! cmon",
  topicArn = ""
) => {

    try {
        const response = await snsClient.send(
            new PublishCommand({
              Message: message,
              TopicArn: topicArn,
            }),
          );
          console.log(response);
    } catch(e)
    {
        return e
    }
  
  // {
  //   '$metadata': {
  //     httpStatusCode: 200,
  //     requestId: 'e7f77526-e295-5325-9ee4-281a43ad1f05',
  //     extendedRequestId: undefined,
  //     cfId: undefined,
  //     attempts: 1,
  //     totalRetryDelay: 0
  //   },
  //   MessageId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
  // }
  return response;
};

// snsPublish()

module.exports = { snsPublish };






/*
// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set region
 // AWS.config.loadFromPath("./awsConfig.json");

AWS.config.update({region: 'us-east-1'});

// Create snsPublish parameters
var params = {
  Message: "testing email from node sns" //required ,
  TopicArn: "arn:aws:sns:us-east-1:051108948051:theclarityapp",
};


// Create promise and SNS service object
var snsPublishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
  .snsPublish(params)
  .promise();

// Handle promise's fulfilled/rejected states
snsPublishTextPromise
  .then(function (data) {
    console.log(
      `Message ${params.Message} sent to the topic ${params.TopicArn}`
    );
    console.log("MessageID is " + data.MessageId);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
  */



//   $Env:AWS_ACCESS_KEY_ID=
//    $Env:AWS_SECRET_ACCESS_KEY=""
//   $Env:AWS_SESSION_TOKEN=""