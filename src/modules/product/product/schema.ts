import { Schema } from 'mongoose';

import { ProductMethods } from './methods';

const ProductSchema = new Schema({
  _id: {
    type: Number,
    description: 'Auto incremented unique ids',
  },

  name: {
    type: String,
    description: "Will store product's names",
  },

  price: {
    default: 0,
    type: Number,
    set(v: number) {
      // avoid extra digits in case of divisions
      return Number(v.toFixed(2));
    },
  },
});

ProductSchema.methods = ProductMethods;

export { ProductSchema };
