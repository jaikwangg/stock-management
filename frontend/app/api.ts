import { Cart, Product } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5123/api";

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) return response.json();

  const message = await response.text();
  throw new Error(message || fallbackMessage);
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  return parseResponse<Product[]>(response, "Failed to fetch products");
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return parseResponse<Product>(response, "Failed to create product");
}

export async function addStock(id: number, amount: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}/add-stock?amount=${amount}`, {
    method: "POST",
  });
  return parseResponse<Product>(response, "Failed to add stock");
}

export async function createCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: "POST",
  });
  return parseResponse<Cart>(response, "Failed to create cart");
}

export async function addCartItem(cartId: number, productId: number, qty: number): Promise<Cart> {
  const response = await fetch(
    `${API_BASE_URL}/cart/${cartId}/add?productId=${productId}&qty=${qty}`,
    { method: "POST" }
  );
  return parseResponse<Cart>(response, "Failed to add item to cart");
}

export async function removeCartItem(cartId: number, productId: number): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}/items/${productId}`, {
    method: "DELETE",
  });
  return parseResponse<Cart>(response, "Failed to remove item from cart");
}
