import { FieldConfigTypes, MongooseIdAssigner } from 'mongoose-id-assigner';

import { config } from '../../../config';
import dbConnection from '../../../config/mongoose';
import { WithPaginatePlugin } from '../../../utils';
import { ProductSchema } from './schema';
import { IProduct, IProductModel } from './types';

WithPaginatePlugin(ProductSchema, { basePath: config.APP_SERVING_URL });
MongooseIdAssigner.plugin(ProductSchema, {
  modelName: 'Product',
  fields: {
    _id: {
      type: FieldConfigTypes.Number,
      nextId: 1,
    },
  },
});

export const ProductModel = dbConnection.model<IProduct, IProductModel>('Product', ProductSchema);
