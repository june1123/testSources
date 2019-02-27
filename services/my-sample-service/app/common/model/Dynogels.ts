import * as AWS from 'aws-sdk';
import * as Promise from 'bluebird';
import * as dynogels from 'dynogels-promisified';
import * as Joi from 'joi';
import * as _ from 'lodash';

/**
 *  enabled WARN log level on all tables
 */
// import * as logger from 'winston';
// dynogels.log = logger;

const useRealDatabase = process.env.NODE_ENV === 'real' || process.env.NODE_ENV === 'production';

function getEndPoint() {
  return (process.env.NODE_ENV !== 'test') ? 'http://localhost:8000' : 'http://localhost:8001';
}

if (!useRealDatabase) {
  const dynamodb = new AWS.DynamoDB({
    endpoint: getEndPoint(),
    region: 'localhost',
  });
  dynogels.dynamoDriver(dynamodb);
} else if (process.env.NODE_ENV === 'real') {
  const dynamodb = new AWS.DynamoDB({
    region: 'ap-northeast-2',
  });
  dynogels.dynamoDriver(dynamodb);
}

function define(name, schema) {
  const modifiedSchema = schema;
  if (process.env.NODE_ENV === 'test') {
    schema.tableName = 'test-' + name;
  } else {
    schema.tableName = name;
  }
  const output = dynogels.define(name, schema);
  return output;
}

const types = _.assign({}, dynogels.types, Joi);
export { types, define, getEndPoint };
