import * as AWS from 'aws-sdk';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as path from 'path';
import * as uuid from 'uuid-v4';

import { DBUtils } from '../test/utils/DBUtils';

class DataHelper {

  static async describeTablesToYaml() {
    const json = await DBUtils.describeTables();
    const description = _.map(json, (table: any) => {
      const ignoreAttrs = ['TableStatus', 'CreationDateTime', 'TableSizeBytes', 'ItemCount', 'TableArn', 'IndexSizeBytes',
        'IndexArn', 'IndexStatus', 'LastIncreaseDateTime', 'LastDecreaseDateTime', 'NumberOfDecreasesToday'];
      for (const attrs of ignoreAttrs) {
        delete table.Table[attrs];

        if (table.Table.LocalSecondaryIndexes) {
          for (const index of table.Table.LocalSecondaryIndexes) {
            delete index[attrs];
          }
        }

        if (table.Table.GlobalSecondaryIndexes) {
          for (const index of table.Table.GlobalSecondaryIndexes) {
            delete index[attrs];
          }
        }
      }

      return table;
    });
    fs.writeFileSync('table.yml', yaml.dump(description));
  }

  static async callGraphQl() {
    const query = `
      query ($shop_id:ID) {
        shop_info(shop_id: $shop_id){
          shop_id
        }
      }
    `;
    const vars = { shop_id: 1 };
    const lambda = new AWS.Lambda({ region: 'ap-northeast-2' });
    const result = await lambda.invoke({
      FunctionName: 'MySampleServiceGraphQl',
      Payload: JSON.stringify({ query, operationName: '', variables: vars }),
    }).promise();
    console.log(result);
  }
}

export { DataHelper };
