using Microsoft.EntityFrameworkCore;
using StockAPI.Services.Interfaces;

namespace StockAPI.Services.Implementations
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly IProductService _productService;

        public CartService(AppDbContext context, IProductService productService)
        {
            _context = context;
            _productService = productService;
        }

        public async Task<Cart> CreateCartAsync()
        {
            var cart = new Cart();
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return (await GetCartAsync(cart.Id))!;
        }

        public async Task<Cart> GetOrCreateCartBySessionIdAsync(string sessionId)
        {
            var cart = await GetCartBySessionIdAsync(sessionId);
            if (cart != null)
                return cart;

            var createdCart = new Cart { SessionId = sessionId };
            _context.Carts.Add(createdCart);
            await _context.SaveChangesAsync();

            return (await GetCartBySessionIdAsync(sessionId))!;
        }

        public async Task<Cart?> GetCartAsync(int cartId)
        {
            return await _context.Carts
                .AsNoTracking()
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == cartId);
        }

        public async Task<string> AddToCartBySessionIdAsync(string sessionId, int productId, int qty)
        {
            var cart = await GetWritableCartBySessionIdAsync(sessionId);
            if (cart == null)
                return "Cart not found";

            return await AddToCartAsync(cart, productId, qty);
        }

        public async Task<string> AddToCartAsync(int cartId, int productId, int qty)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null)
                return "Cart not found";

            return await AddToCartAsync(cart, productId, qty);
        }

        public async Task<string> ReduceFromCartBySessionIdAsync(string sessionId, int productId, int qty)
        {
            var cart = await GetWritableCartBySessionIdAsync(sessionId);
            if (cart == null)
                return "Cart not found";

            return await ReduceFromCartAsync(cart, productId, qty);
        }

        public async Task<string> ReduceFromCartAsync(int cartId, int productId, int qty)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null)
                return "Cart not found";

            return await ReduceFromCartAsync(cart, productId, qty);
        }

        public async Task<string> RemoveFromCartBySessionIdAsync(string sessionId, int productId)
        {
            var cart = await GetWritableCartBySessionIdAsync(sessionId);
            if (cart == null)
                return "Cart not found";

            return await RemoveFromCartAsync(cart, productId);
        }

        public async Task<string> RemoveFromCartAsync(int cartId, int productId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null)
                return "Cart not found";

            return await RemoveFromCartAsync(cart, productId);
        }

        public async Task<string> ClearCartBySessionIdAsync(string sessionId)
        {
            var cart = await GetWritableCartBySessionIdAsync(sessionId);
            if (cart == null)
                return "Cart not found";

            return await ClearCartAsync(cart);
        }

        public async Task<string> ClearCartAsync(int cartId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            if (cart == null)
                return "Cart not found";

            return await ClearCartAsync(cart);
        }

        private async Task<Cart?> GetCartBySessionIdAsync(string sessionId)
        {
            return await _context.Carts
                .AsNoTracking()
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.SessionId == sessionId);
        }

        private async Task<Cart?> GetWritableCartBySessionIdAsync(string sessionId)
        {
            return await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.SessionId == sessionId);
        }

        private async Task<string> AddToCartAsync(Cart cart, int productId, int qty)
        {
            if (qty <= 0)
                return "Quantity must be greater than zero";

            var product = await _productService.GetByIdAsync(productId);
            if (product == null)
                return "Product not found";

            if ((product.Stock?.Quantity ?? 0) < qty)
                return "Stock not enough";

            var updatedProduct = await _productService.AddStockAsync(productId, -qty);
            if (updatedProduct == null)
                return "Stock not enough";

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = productId,
                    Quantity = qty
                });
            }
            else
            {
                item.Quantity += qty;
            }

            await _context.SaveChangesAsync();
            return "OK";
        }

        private async Task<string> ReduceFromCartAsync(Cart cart, int productId, int qty)
        {
            if (qty <= 0)
                return "Quantity must be greater than zero";

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
                return "Cart item not found";

            if (item.Quantity < qty)
                return "Cart item quantity not enough";

            item.Quantity -= qty;
            if (item.Quantity == 0)
                cart.Items.Remove(item);

            await _productService.AddStockAsync(productId, qty);
            await _context.SaveChangesAsync();

            return "OK";
        }

        private async Task<string> RemoveFromCartAsync(Cart cart, int productId)
        {
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
                return "Cart item not found";

            var quantity = item.Quantity;
            cart.Items.Remove(item);

            await _productService.AddStockAsync(productId, quantity);
            await _context.SaveChangesAsync();

            return "OK";
        }

        private async Task<string> ClearCartAsync(Cart cart)
        {
            foreach (var item in cart.Items.ToList())
            {
                await _productService.AddStockAsync(item.ProductId, item.Quantity);
                cart.Items.Remove(item);
            }

            await _context.SaveChangesAsync();
            return "OK";
        }
    }
}
