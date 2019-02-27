import { execute } from './graphql';

async function GraphQlHandler(event, context) {
  return await execute(event.query, event.variables, event.operationName);
}

export { GraphQlHandler };
