using Microsoft.AspNetCore.Mvc;
using StockAPI.Services.Interfaces;

namespace StockAPI.Controllers
{
    public record CartDto(int Id, List<CartItemDto> Items);
    public record CartItemDto(int ProductId, string Name, decimal Price, int Quantity);

    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly IProductService _productService;

        public CartController(ICartService cartService, IProductService productService)
        {
            _cartService = cartService;
            _productService = productService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCart()
        {
            var cart = await _cartService.CreateCartAsync();
            return Ok(await ToDto(cart));
        }

        [HttpGet("{cartId}")]
        public async Task<IActionResult> GetCart(int cartId)
        {
            var cart = await _cartService.GetCartAsync(cartId);
            if (cart == null)
                return NotFound("Cart not found");

            return Ok(await ToDto(cart));
        }

        [HttpPost("{cartId}/add")]
        public async Task<IActionResult> AddToCart(int cartId, int productId, int qty)
        {
            var result = await _cartService.AddToCartAsync(cartId, productId, qty);
            if (result == "Product not found" || result == "Cart not found")
                return NotFound(result);

            if (result != "OK")
                return BadRequest(result);

            var cart = await _cartService.GetCartAsync(cartId);
            return Ok(await ToDto(cart!));
        }

        [HttpDelete("{cartId}/items/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int cartId, int productId)
        {
            var result = await _cartService.RemoveFromCartAsync(cartId, productId);
            if (result == "Cart not found" || result == "Cart item not found")
                return NotFound(result);

            var cart = await _cartService.GetCartAsync(cartId);
            return Ok(await ToDto(cart!));
        }

        private async Task<CartDto> ToDto(Cart cart)
        {
            var items = new List<CartItemDto>();

            foreach (var item in cart.Items)
            {
                var product = await _productService.GetByIdAsync(item.ProductId);
                if (product == null)
                    continue;

                items.Add(new CartItemDto(
                    item.ProductId,
                    product.Name,
                    product.Price,
                    item.Quantity));
            }

            return new CartDto(cart.Id, items);
        }
    }
}
