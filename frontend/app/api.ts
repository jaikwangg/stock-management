import { Cart, Product } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5123/api";

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) return response.json();

  const message = await response.text();
  throw new Error(message || fallbackMessage);
}

//product
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

export async function updateProduct(id: number, product: Omit<Product, "id">): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  return parseResponse<Product>(response, "Failed to update product");
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to delete product");
  }
}

export async function addStock(id: number, amount: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}/add-stock?amount=${amount}`, {
    method: "POST",
  });
  return parseResponse<Product>(response, "Failed to add stock");
}

//cart
export async function getCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart`, { credentials: "include" });
  return parseResponse<Cart>(response, "Failed to fetch cart");
}

export async function addCartItem(productId: number, qty: number): Promise<Cart> {
  const response = await fetch(
    `${API_BASE_URL}/cart/add?productId=${productId}&qty=${qty}`,
    { method: "POST", credentials: "include" }
  );
  return parseResponse<Cart>(response, "Failed to add item to cart");
}

export async function reduceCartItem(productId: number, qty: number): Promise<Cart> {
  const response = await fetch(
    `${API_BASE_URL}/cart/reduce?productId=${productId}&qty=${qty}`,
    { method: "POST", credentials: "include" }
  );
  return parseResponse<Cart>(response, "Failed to reduce item quantity");
}

export async function removeCartItem(productId: number): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseResponse<Cart>(response, "Failed to remove item from cart");
}

export async function clearCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseResponse<Cart>(response, "Failed to clear cart");
}

export async function checkoutCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
    method: "POST",
    credentials: "include",
  });
  return parseResponse<Cart>(response, "Failed to checkout");
}
