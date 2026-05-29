import { Product } from "../types";

interface ProductCatalogProps {
  products: Product[];
  loading: boolean;
  editingProductId: number | null;
  editingProduct: Omit<Product, "id">;
  onEditingProductChange: (product: Omit<Product, "id">) => void;
  onAddToCart: (product: Product) => void;
  onStartEditing: (product: Product) => void;
  onCancelEditing: () => void;
  onUpdateProduct: (event: React.FormEvent) => void;
  onDeleteProduct: (id: number) => void;
}

export function ProductCatalog({
  products,
  editingProductId,
  editingProduct,
  onEditingProductChange,
  onAddToCart,
  onStartEditing,
  onCancelEditing,
  onUpdateProduct,
  onDeleteProduct,
}: ProductCatalogProps) {
  return (
    <section className="lg:col-span-1 space-y-4">
      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {editingProductId === product.id ? (
                <form onSubmit={onUpdateProduct} className="space-y-3">
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingProduct.name}
                    onChange={(e) => onEditingProductChange({ ...editingProduct, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingProduct.price}
                      onChange={(e) =>
                        onEditingProductChange({ ...editingProduct, price: parseFloat(e.target.value) })
                      }
                    />
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        onEditingProductChange({ ...editingProduct, stock: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEditing}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600">Price: {product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`px-4 py-2 rounded text-sm font-medium transition ${
                        product.stock > 0
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <button
                      onClick={() => onStartEditing(product)}
                      className="px-4 py-2 rounded text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="px-4 py-2 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
