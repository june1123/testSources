import * as Bluebird from 'bluebird';
import * as dynogels from 'dynogels-promisified';
import * as _ from 'lodash';

export class DBUtils {
  static async createTables() {
    try {
      const dynamodb = dynogels.dynamoDriver();
      const listTableResult = await dynamodb.listTables().promise();
      if (listTableResult.TableNames.length === 0) {
        const r = await dynogels.createTablesAsync({ $dynogels: { pollingInterval: 50 } });
        return r;
      }
    } catch (e) {
      console.log('createTables error', e);
    }
  }

  static async clearTableDatas() {
    const dynamodb = dynogels.dynamoDriver();
    const listTableResult = await dynamodb.listTables().promise();
    if (listTableResult.TableNames.length > 0) {
      await Bluebird.map(_.keys(dynogels.models), async (modelName) => {
        console.log('modelName');
        const m = dynogels.models[modelName];
        const describeTable = await m.describeTableAsync();
        const hashKeyAttr = _.find<any>(describeTable.Table.KeySchema, (key) => {
          return key.KeyType === 'HASH';
        });

        const rangeKeyAttr = _.find<any>(describeTable.Table.KeySchema, (key) => {
          return key.KeyType === 'RANGE';
        });
        const hashKeyName = hashKeyAttr.AttributeName;
        const rangeKeyName = (rangeKeyAttr) ? rangeKeyAttr.AttributeName : null;

        const scanResult = await m.scan().loadAll().execAsync();
        await Bluebird.map(scanResult.Items, (item: any) => {
          item = item.toJSON();
          const hashKey = item[hashKeyName];
          const rangeKey = rangeKeyName ? item[rangeKeyName] : null;
          return m.destroyAsync(hashKey, rangeKey);
        });
      });
      console.log('end');
    }
  }

  static async describeTables() {
    const dynamodb = dynogels.dynamoDriver();
    const listTableResult = await dynamodb.listTables().promise();

    if (listTableResult.TableNames.length > 0) {
      return Bluebird.map(_.keys(dynogels.models), async (modelName) => {
        const m = dynogels.models[modelName];
        const describeTable = await m.describeTableAsync();
        return describeTable;
      });
    }
  }

  // dynogels는 내부적으로 setImmediate, setTimeout를 사용하기 때문에,
  // useFakeTimers에서 사용하지 않도록 해야 한다.
  static useFakeTimers(sandbox: sinon.SinonSandbox, date: number | Date | undefined) {
    const globalSetImmediate = global.setImmediate;
    const globalSetTimeout = global.setTimeout;
    const clock = sandbox.useFakeTimers(date);
    const fakeSetImmediate = global.setImmediate;
    const fakeSetTimeout = global.setTimeout;
    global.setImmediate = globalSetImmediate;
    global.setTimeout = globalSetTimeout;
    const restoreInternal = clock.restore;
    clock.restore = () => {
      global.setImmediate = fakeSetImmediate;
      global.setTimeout = fakeSetTimeout;
      restoreInternal();
    };
    return clock;
  }
}
