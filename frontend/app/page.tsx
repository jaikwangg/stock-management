"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addCartItem,
  checkoutCart,
  clearCart,
  createProduct,
  deleteProduct,
  getCart,
  getProducts,
  reduceCartItem,
  removeCartItem,
  updateProduct,
} from "./api";
import { ProductCatalog } from "./components/ProductCatalog";
import { ProductForm } from "./components/ProductForm";
import { ShoppingCart } from "./components/ShoppingCart";
import { CartItem, Product } from "./types";

const emptyProduct = { name: "", price: 0, stock: 0 };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((error: unknown, fallbackMessage: string) => {
    console.error(error);
    setError(error instanceof Error ? error.message : fallbackMessage);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      showError(error, "Failed to connect to API");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts();
      getCart()
        .then((createdCart) => {
          setCart(createdCart.items);
        })
        .catch((error) => showError(error, "Failed to fetch cart"));
    }, 0);

    return () => clearTimeout(t);
  }, [fetchProducts, showError]);

  //product
  const refreshProductsAfterCartChange = async (updatedCart: { items: CartItem[] }) => {
    setCart(updatedCart.items);
    await fetchProducts();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      await createProduct(newProduct);
      setNewProduct(emptyProduct);
      await fetchProducts();
    } catch (error) {
      showError(error, "Failed to create product");
    }
  };

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditingProduct({
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
  };

  const cancelEditingProduct = () => {
    setEditingProductId(null);
    setEditingProduct(emptyProduct);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId === null) return;

    try {
      setError(null);
      await updateProduct(editingProductId, editingProduct);
      cancelEditingProduct();
      await fetchProducts();
    } catch (error) {
      showError(error, "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      setError(null);
      await deleteProduct(id);
      setCart((items) => items.filter((item) => item.productId !== id));
      if (editingProductId === id) cancelEditingProduct();
      await fetchProducts();
    } catch (error) {
      showError(error, "Failed to delete product");
    }
  };

  //cart
  const handleIncreaseCartItem = async (productId: number) => {
    try {
      setError(null);
      const updatedCart = await addCartItem(productId, 1);
      await refreshProductsAfterCartChange(updatedCart);
    } catch (error) {
      showError(error, "Failed to increase item quantity");
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) return;
    await handleIncreaseCartItem(product.id);
  };

  const handleDecreaseCartItem = async (productId: number) => {
    try {
      setError(null);
      const updatedCart = await reduceCartItem(productId, 1);
      await refreshProductsAfterCartChange(updatedCart);
    } catch (error) {
      showError(error, "Failed to decrease item quantity");
    }
  };

  const handleRemoveCartItem = async (productId: number) => {
    try {
      setError(null);
      const updatedCart = await removeCartItem(productId);
      await refreshProductsAfterCartChange(updatedCart);
    } catch (error) {
      showError(error, "Failed to remove item from cart");
    }
  };

  const handleClearCart = async () => {
    try {
      setError(null);
      const updatedCart = await clearCart();
      await refreshProductsAfterCartChange(updatedCart);
    } catch (error) {
      showError(error, "Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    try {
      setError(null);
      const updatedCart = await checkoutCart();
      await refreshProductsAfterCartChange(updatedCart);
    } catch (error) {
      showError(error, "Failed to checkout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-blue-600">Stock Management System</h1>
        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* <ProductForm product={newProduct} onProductChange={setNewProduct} onSubmit={handleCreateProduct} /> */}

        <ProductCatalog
          products={products}
          loading={loading}
          editingProductId={editingProductId}
          editingProduct={editingProduct}
          onEditingProductChange={setEditingProduct}
          onAddToCart={handleAddToCart}
          onStartEditing={startEditingProduct}
          onCancelEditing={cancelEditingProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        <ShoppingCart
          cart={cart}
          onIncreaseItem={handleIncreaseCartItem}
          onDecreaseItem={handleDecreaseCartItem}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </main>
    </div>
  );
}
