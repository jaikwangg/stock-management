import { useState } from "react";
import { CartItem } from "../types";

interface ShoppingCartProps {
  cart: CartItem[];
  onIncreaseItem: (productId: number) => void;
  onDecreaseItem: (productId: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCheckout: () => Promise<void>;
}

export function ShoppingCart({
  cart,
  onIncreaseItem,
  onDecreaseItem,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: ShoppingCartProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmCheckout = async () => {
    setCheckingOut(true);

    try {
      await onCheckout();
      setCheckoutOpen(false);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Shopping Cart</h2>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs font-medium font-bold text-red-500 hover:underline"
              >
                Clear cart
              </button>
            )}
          </div>
        </div>
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="border-b pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDecreaseItem(item.productId)}
                        className="h-8 w-8 rounded border border-gray-300 text-lg leading-none hover:bg-gray-100 transition"
                        aria-label={`Decrease ${item.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onIncreaseItem(item.productId)}
                        className="h-8 w-8 rounded border border-gray-300 text-lg leading-none hover:bg-gray-100 transition"
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Remove all
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full bg-zinc-900 text-white py-3 rounded-lg font-bold hover:bg-black transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </section>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Checkout Summary</h2>
                <p className="text-sm text-gray-500">{itemCount} items</p>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">
                      {item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleConfirmCheckout}
                disabled={checkingOut}
                className="mt-5 w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {checkingOut ? "Processing..." : "Confirm checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
