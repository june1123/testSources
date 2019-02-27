import * as Bluebird from 'bluebird';
import * as _ from 'lodash';
import * as errors from '../errors';

export class RetryHelper {

  workerFunc: () => Promise<any>;
  errorChecker?: (error) => boolean;
  maxRetry: number;
  delayTimeout: number;

  constructor(workerFunc: () => Promise<any>, errorChecker?: (error) => boolean, delayTimeout = 500, maxRetry = 5) {
    this.workerFunc = workerFunc;
    this.errorChecker = errorChecker;
    this.maxRetry = maxRetry;
    this.delayTimeout = delayTimeout;
  }

  async run(tryNum = 0): Promise<any> {
    try {
      return await this.workerFunc();
    } catch (e) {
      if (tryNum < this.maxRetry && (_.isNil(this.errorChecker) || this.errorChecker(e))) {
        await Bluebird.delay(this.delayTimeout);
        return await this.run(++tryNum);
      } else {
        console.log(e);
        if (tryNum >= this.maxRetry) {
          throw new errors.MaxRetryExceedError(e);
        } else {
          throw e;
        }
      }
    }
  }
}
