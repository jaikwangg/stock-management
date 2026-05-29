export interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}
