using Microsoft.EntityFrameworkCore;
using StockAPI.Services.Interfaces;

namespace StockAPI.Services.Implementations
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products
                .AsNoTracking()
                .Include(p => p.Stock)
                .OrderBy(p => p.Id)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int id)
        {
            return await _context.Products
                .AsNoTracking()
                .Include(p => p.Stock)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateAsync(Product product)
        {
            product.Stock ??= new Stock { Quantity = 0 };
            product.Stock.Quantity = Math.Max(0, product.Stock.Quantity);

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(product.Id))!;
        }

        public async Task<Product?> UpdateAsync(int id, Product updatedProduct)
        {
            var product = await _context.Products
                .Include(p => p.Stock)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return null;

            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;

            product.Stock ??= new Stock
            {
                ProductId = product.Id,
                Quantity = 0
            };
            product.Stock.Quantity = Math.Max(0, updatedProduct.Stock?.Quantity ?? 0);

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<Product?> AddStockAsync(int id, int amount)
        {
            var product = await _context.Products
                .Include(p => p.Stock)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return null;

            product.Stock ??= new Stock
            {
                ProductId = product.Id,
                Quantity = 0
            };

            var nextQuantity = product.Stock.Quantity + amount;
            if (nextQuantity < 0)
                return null;

            product.Stock.Quantity = nextQuantity;
            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Stock)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return false;

            var cartItems = await _context.CartItems
                .Where(i => i.ProductId == id)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
