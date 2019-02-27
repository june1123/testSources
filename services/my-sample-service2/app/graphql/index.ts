import { processRequest } from 'apollo-upload-server';
import * as graphqlHTTP from 'express-graphql';
import { graphql, printSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import { SampleService } from '../services';

const dirname = process.env.LAMBDA_TASK_ROOT ? `${process.env.LAMBDA_TASK_ROOT}/app/graphql` : __dirname;

export const schema = makeExecutableSchema({
  typeDefs: importSchema(`${dirname}/index.graphql`),
  resolvers: [
    SampleService.resolvers,
  ],
});

const middleware = graphqlHTTP((request, response?, graphQLParams?) => {
  if (graphQLParams) {
    request.body = {
      query: graphQLParams.query && graphQLParams.query.replace(/\s+/g, ' '),
      variables: graphQLParams.variables,
      operationName: graphQLParams.operationName,
    };
  }
  return {
    schema,
    graphiql: process.env.NODE_ENV !== 'production',
    extensions: ({ result }) => {
      (response as any).errors = result.errors;
      return {};
    },
  };
});

export async function handler(request, response) {
  const start = new Date();
  response.on('finish', () => {
    const end = new Date();
    let message = 'OK';
    if (response.statusCode >= 300) {
      message = 'Error: ' + (response.errors && response.errors.length > 0 ? response.errors[0].message : '');
    }
    const current_time = end.toISOString().replace('T', ' ').replace('Z', '');
    const request_time = end.getTime() - start.getTime();
    const query = request.body && request.body.query && request.body.query.replace(/\s+/g, ' ').trim() || '';
    console.log(`[${current_time}] [${request_time}ms] "${query}" ${message}`);
  });
  if (/^multipart\/form-data/.test(request.headers['content-type'])) {
    try {
      request.body = await processRequest(request, {});
    } catch (error) {
      response.statusCode = 400;
      response.end();
      return;
    }
  }
  middleware(request, response);
}

export function getSchemaString() {
  return printSchema(schema).replace(/.*_placeholder: Boolean\n/g, '');
}

export async function execute(request: string, variables?: { [key: string]: any }, operationName?: string) {
  return graphql(schema, request, null, {}, variables, operationName);
}
