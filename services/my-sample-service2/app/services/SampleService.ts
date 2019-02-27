import { GraphQLResolveInfo } from 'graphql';
import { SamplePrivateService } from './private';

export class SampleService {
  static resolvers = {
    Query: {
      shop_info: SampleService.shop_info,
    },
  };

  static async shop_info(source, args: { [argName: string]: any }, context, info: GraphQLResolveInfo) {
    const r = await SamplePrivateService.getShopInfo(Number(args.shop_id));
    return r;
  }
}
