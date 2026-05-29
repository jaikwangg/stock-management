"use client";

import { useState, useEffect } from "react";
import { Product, CartItem } from "./types";
import { getProducts, createProduct, addStock } from "./api";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      setNewProduct({ name: "", price: 0, stock: 0 });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddStock = async (id: number) => {
    try {
      await addStock(id, 10);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });

    // Optimistically update stock in UI (optional, but good for UX)
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
    );
  };

  const removeFromCart = (productId: number) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;

    setCart((prev) => prev.filter((i) => i.productId !== productId));
    
    // Restore stock in UI
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + item.quantity } : p))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-blue-600">Stock Management System</h1>
        <p className="text-gray-600 mt-2">Manage your products and shopping cart with ease</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Form Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Initial Stock</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              Add Product
            </button>
          </form>
        </section>

        {/* Product List Section */}
        <section className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No products available.</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600">Price: ${product.price.toFixed(2)}</p>
                    <p className={`text-sm ${product.stock <= 5 ? "text-red-500 font-medium" : "text-gray-500"}`}>
                      Stock: {product.stock}
                    </p>
                    <button
                      onClick={() => handleAddStock(product.id)}
                      className="text-xs text-blue-500 hover:underline mt-1 block"
                    >
                      + Add 10 Stock
                    </button>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`px-4 py-2 rounded text-sm font-medium transition ${
                      product.stock > 0
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cart Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-8">
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            Shopping Cart
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
          </h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8 border-2 border-dashed rounded-lg">
              Your cart is empty.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start border-b pb-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full mt-6 bg-zinc-900 text-white py-3 rounded-lg font-bold hover:bg-black transition">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
