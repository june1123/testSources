import * as _ from 'lodash';
import * as Dynogels from './Dynogels';
import Query from './Query';
import { ResultMapper } from './ResultMapper';

export class BaseModel {
  static dynogelsModel: any;

  static setSchema(name, schema) {
    this.dynogelsModel = Dynogels.define(name, schema);
  }

  private static checkHasModelInstance() {
    if (!this.dynogelsModel) {
      throw new Error('setSchema should be called');
    }
  }

  static query(hashKey: any): Query {
    this.checkHasModelInstance();
    return this.dynogelsModel.query(hashKey);
  }

  static scan(indexName?: string): Query {
    this.checkHasModelInstance();
    const scan = this.dynogelsModel.scan();
    if (indexName) {
      _.assign((scan as any).request, { IndexName: indexName });
    }
    return scan;
  }

  static getAsync(hashKey: string | number, options?: object): Promise<any>;
  static getAsync(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static getAsync(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    if (options) {
      return this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      return this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions);
    }
  }

  static createAsync(data: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    return this.dynogelsModel.createAsync(data, options);
  }

  static updateAsync(data: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    return this.dynogelsModel.updateAsync(data, options);
  }

  static destroyAsync(hashKey: string | number, options?: object): Promise<any>;
  static destroyAsync(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static destroyAsync(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    if (options) {
      return this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      return this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions);
    }
  }

  // V2, with mapItem
  static async create(data: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    const createResult = await this.dynogelsModel.createAsync(data, options);
    return ResultMapper.mapItem(createResult);
  }

  static async get(hashKey: string | number, options?: object): Promise<any>;
  static async get(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static async get(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    let getResult;
    if (options) {
      getResult = await this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      getResult = await this.dynogelsModel.getAsync(hashKey, rangeKeyOrOptions);
    }
    return ResultMapper.mapItem(getResult);
  }

  static async update(data: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    const updateResult = await this.dynogelsModel.updateAsync(data, options);
    return ResultMapper.mapItem(updateResult);
  }

  static async destroy(hashKey: string | number, options?: object): Promise<any>;
  static async destroy(hashKey: string | number, rangeKey: string | number, options?: object): Promise<any>;
  static async destroy(hashKey: string | number, rangeKeyOrOptions?: any, options?: object): Promise<any> {
    this.checkHasModelInstance();

    let destroyResult;
    if (options) {
      destroyResult = await this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions, options);
    } else {
      destroyResult = await this.dynogelsModel.destroyAsync(hashKey, rangeKeyOrOptions);
    }
    return ResultMapper.mapItem(destroyResult);
  }

  static async updateTable(params?: any): Promise<any> {
    return this.dynogelsModel.updateTableAsync(params);
  }

  static async describeTable(): Promise<any> {
    return this.dynogelsModel.describeTableAsync();
  }

  static async list(cursor?: string) {
    const scan = await this.scan();
    if (cursor) {
      scan.startKey(cursor);
    }
    return ResultMapper.mapQueryResult(await scan.execAsync());
  }

  static async getItems(keys: any[], options?): Promise<any[]> {
    const getResult = await this.dynogelsModel.getItemsAsync(keys, options);
    return _.map(getResult, (item) => ResultMapper.mapItem(item));
  }
}
