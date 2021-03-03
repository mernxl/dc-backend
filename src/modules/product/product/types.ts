import { Document, Model } from 'mongoose';

import { ModelWithPaginatePlugin } from '../../../utils';
import { ProductMethodsType } from './methods';

export interface IProduct extends Document, ProductMethodsType {
  _id: number;
  name: string;
  price: number;
}

export interface IProductModel extends Model<IProduct>, ModelWithPaginatePlugin {}
