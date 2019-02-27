import { MySampleDB } from '../../models';

export class SamplePrivateService {
  static async getShopInfo(shopId: number) {
    const item = await MySampleDB.get(shopId);
    return item;
  }
}
