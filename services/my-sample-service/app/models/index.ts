export * from './MySampleDB';
export * from '../common/model/index';

import * as dynogels from 'dynogels-promisified';
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'real' && process.env.NODE_ENV !== 'production') {
  console.log('=========== Start create tables');
  dynogels.createTablesAsync({ $dynogels: { pollingInterval: 50 } }).then(() => {
    console.log('End ===========');
  });
}
