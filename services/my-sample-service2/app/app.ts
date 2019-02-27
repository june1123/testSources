const newrelic = process.env.NODE_ENV === 'production' ? require('newrelic') : undefined;

import * as config from 'config';
import * as express from 'express';
import * as http from 'http';
import { handler as handleGraphQL } from './graphql';

const service_name = config.get<string>('project');

const app = express();
app.use('/graphql', handleGraphQL);
app.get('/', (req, res) => {
  res.send('In service');
});

const server = http.createServer(app);
server.keepAliveTimeout = 70000;

server.on('error', (error) => {
  console.log(error.toString());
});

server.listen(process.env.PORT || 9999, () => {
  const worker_num = process.env.WORKER_NUM || process.env.PM2_INSTANCE_ID || 0;
  console.log(`[${new Date().toISOString()}] [${service_name}.services #${worker_num}] Started`);
});

let shutdowning = false;
function shutdown() {
  const worker_num = process.env.WORKER_NUM || process.env.PM2_INSTANCE_ID || 0;
  if (shutdowning) {
    return;
  }
  console.log(`[${new Date().toISOString()}] [${service_name}.services #${worker_num}] Shutdown`);
  shutdowning = true;

  // 60초간 끝나지 않으면 강제 종료
  setTimeout(() => {
    console.log(`[${new Date().toISOString()}] [${service_name}.services #${worker_num}] Terminated by force`);
    process.exit(0);
  }, 60 * 1000);

  server.close(() => {
    console.log(`[${new Date().toISOString()}] [${service_name}.services #${worker_num}] Terminate`);
    process.exit(0);
  });
}

process.on('SIGHUP', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
