import { Product } from "./types";

const API_BASE_URL = "http://localhost:5123/api";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error("Failed to create product");
  return response.json();
}

export async function addStock(id: number, amount: number): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}/add-stock?amount=${amount}`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to add stock");
  return response.json();
}
