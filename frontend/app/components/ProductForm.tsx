import { Product } from "../types";

interface ProductFormProps {
  product: Omit<Product, "id">;
  onProductChange: (product: Omit<Product, "id">) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function ProductForm({ product, onProductChange, onSubmit }: ProductFormProps) {
  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={product.name}
            onChange={(e) => onProductChange({ ...product, name: e.target.value })}
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
              value={product.price}
              onChange={(e) => onProductChange({ ...product, price: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Initial Stock</label>
            <input
              type="number"
              required
              min="0"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={product.stock}
              onChange={(e) => onProductChange({ ...product, stock: parseInt(e.target.value) })}
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
  );
}
