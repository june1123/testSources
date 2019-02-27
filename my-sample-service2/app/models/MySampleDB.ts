import * as model from '../common/model';

@model.Model
export class MySampleDB extends model.BaseModel {
  @model.HashKey
  @model.Field(model.types.number())
  shop_id: number;

  @model.Field(model.types.string())
  mall_id: string;
}
