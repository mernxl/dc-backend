export interface ProductCreateInput {
  name: string;
  price: number;
}

export interface ProductUpdateInput {
  name?: string;
  price?: number;
}

export interface ProductReceiptInput {
  productIds: number[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
}
