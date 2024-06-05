const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const JOBS_TABLE = process.env.JOBS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

module.exports.createJob = async (event) => {
  const { jobId, description } = JSON.parse(event.body);

  const params = {
    TableName: JOBS_TABLE,
    Item: { jobId, description },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ jobId, description }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create job" }),
    };
  }
};

module.exports.getJobs = async () => {
  const params = {
    TableName: JOBS_TABLE,
  };

  try {
    const command = new ScanCommand(params);
    const data = await docClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve jobs" }),
    };
  }
};

module.exports.getJob = async (event) => {
  const params = {
    TableName: JOBS_TABLE,
    Key: {
      jobId: event.pathParameters.id,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Could not find job with provided "jobId"' }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve job" }),
    };
  }
};

module.exports.updateJob = async (event) => {
  const { description } = JSON.parse(event.body);
  const jobId = event.pathParameters.id;

  const params = {
    TableName: JOBS_TABLE,
    Key: { jobId },
    UpdateExpression: 'set description = :d',
    ExpressionAttributeValues: {
      ':d': description,
    },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    const command = new UpdateCommand(params);
    await docClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ jobId, description }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update job" }),
    };
  }
};

module.exports.deleteJob = async (event) => {
  const jobId = event.pathParameters.id;
  const params = {
    TableName: JOBS_TABLE,
    Key: { jobId },
  };

  try {
    const command = new DeleteCommand(params);
    await docClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete job" }),
    };
  }
};
