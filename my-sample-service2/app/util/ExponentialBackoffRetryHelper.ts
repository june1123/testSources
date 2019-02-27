import * as _ from 'lodash';

// refer: https://www.awsarchitectureblog.com/2015/03/backoff.html
export class ExponentialBackoffRetryHelper {
  max_backoff_time_ms = 60 * 1000;
  base_backoff_time = 2000;

  getNextBackOffMillis(attempt: number) {
    if (attempt === 0) {
      return 0;
    } else {
      const temp = Math.min(this.max_backoff_time_ms, this.base_backoff_time * Math.pow(2, attempt));
      return _.random(temp);
    }
  }
}
