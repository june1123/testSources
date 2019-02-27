import { BaseError } from './BaseError';
// tslint:disable: max-classes-per-file

export class RecordNotFoundError extends BaseError {

  modelName: string;
  id: string;

  constructor(model: any, id: string, rangeKey?: string) {
    const modelName = model.prototype.constructor.name;
    let msg = `${modelName} record does not exist, ID is ${id}`;
    if (rangeKey) {
      msg += ', rangeKey is ' + rangeKey;
    }
    super(msg);
    this.id = id;
    this.modelName = modelName;
  }
}

export class InvalidParameterErrors extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class MaxRetryExceedError extends BaseError {

  originError: Error;

  constructor(originError) {
    super(`Max retry exceed`);
    this.originError = originError;
  }
}
