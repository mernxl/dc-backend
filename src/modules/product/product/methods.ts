import { Product } from '../types';
import { IProduct } from './types';

const ProductMethods = {
  view(this: IProduct): Product {
    return {
      id: this._id,
      name: this.name,
      price: this.price,
    };
  },
};

export type ProductMethodsType = typeof ProductMethods;

export { ProductMethods };
