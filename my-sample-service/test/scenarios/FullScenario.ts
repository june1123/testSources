import { expect } from 'chai';
import * as _ from 'lodash';
import * as sinon from 'sinon';

import { SampleService } from '../../app/services/SampleService';
import { DBUtils } from '../utils';

// tslint:disable-next-line: only-arrow-functions
const origin = global.setImmediate;
describe('FullScenario', function() {
  this.timeout(100 * 1000);
  let sandbox: sinon.SinonSandbox;

  beforeEach(async () => {
    console.log(origin === global.setImmediate);

    sandbox = sinon.createSandbox();
    await DBUtils.createTables();
    await DBUtils.clearTableDatas();
  });

  afterEach(async () => {
    await DBUtils.clearTableDatas();
    sandbox.restore();
  });

  it('기본적인 전체시나리오를 통과해야한다.', async () => {
    const clock = DBUtils.useFakeTimers(sandbox, new Date(2017, 7 - 1, 28));
    console.log(new Date());
    await SampleService.shop_info(undefined, { shop_id: 1 }, undefined, {} as any);
    clock.tick(24 * 60 * 60 * 1000);
    console.log(new Date());
    expect(true).to.eq(true);
  });

  it('기본적인 전체시나리오를 통과해야한다.2', async () => {
    console.log(new Date());
  });
});
