using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace StockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult CreateCart()
        {
            var cart = new Cart();
            _context.Carts.Add(cart);
            _context.SaveChanges();

            return Ok(cart);
        }

        [HttpPost("{cartId}/add")]
        public async Task<IActionResult> AddToCart(int cartId, int productId, int qty)
        {
            var product = _context.Products.Find(productId);
            if (product == null) return NotFound("Product not found");

            if (product.Stock == null || product.Stock.Quantity < qty)
                return BadRequest("Stock not enough");

            var cart = _context.Carts
                .Include(c => c.Items)
                .FirstOrDefault(c => c.Id == cartId);

            if (cart == null) return NotFound("Cart not found");

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

            var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.ProductId == productId);

            if (stock == null || stock.Quantity < qty)
                return BadRequest("Stock not enough");

            stock.Quantity -= qty;

            _context.SaveChanges();

            return Ok(cart);
        }
    }
}