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
        private const string GuestSessionCookieName = "guest_session_id";
        private readonly ICartService _cartService;
        private readonly IProductService _productService;

        public CartController(ICartService cartService, IProductService productService)
        {
            _cartService = cartService;
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCurrentCart()
        {
            var sessionId = GetOrCreateGuestSessionId();
            var cart = await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);
            return Ok(await ToDto(cart));
        }

        [HttpPost]
        public async Task<IActionResult> CreateCart()
        {
            var sessionId = GetOrCreateGuestSessionId();
            var cart = await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);
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

        [HttpPost("add")]
        public async Task<IActionResult> AddToCurrentCart(int productId, int qty)
        {
            var sessionId = GetOrCreateGuestSessionId();
            await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);

            var result = await _cartService.AddToCartBySessionIdAsync(sessionId, productId, qty);
            if (result == "Product not found" || result == "Cart not found")
                return NotFound(result);

            if (result != "OK")
                return BadRequest(result);

            var cart = await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);
            return Ok(await ToDto(cart));
        }

        [HttpPost("{cartId}/reduce")]
        public async Task<IActionResult> ReduceFromCart(int cartId, int productId, int qty)
        {
            var result = await _cartService.ReduceFromCartAsync(cartId, productId, qty);
            if (result == "Cart not found" || result == "Cart item not found")
                return NotFound(result);

            if (result != "OK")
                return BadRequest(result);

            var cart = await _cartService.GetCartAsync(cartId);
            return Ok(await ToDto(cart!));
        }

        [HttpPost("reduce")]
        public async Task<IActionResult> ReduceFromCurrentCart(int productId, int qty)
        {
            var sessionId = GetOrCreateGuestSessionId();
            await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);

            var result = await _cartService.ReduceFromCartBySessionIdAsync(sessionId, productId, qty);
            if (result == "Cart not found" || result == "Cart item not found")
                return NotFound(result);

            if (result != "OK")
                return BadRequest(result);

            var cart = await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);
            return Ok(await ToDto(cart));
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

        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveFromCurrentCart(int productId)
        {
            var sessionId = GetOrCreateGuestSessionId();
            await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);

            var result = await _cartService.RemoveFromCartBySessionIdAsync(sessionId, productId);
            if (result == "Cart not found" || result == "Cart item not found")
                return NotFound(result);

            var cart = await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);
            return Ok(await ToDto(cart));
        }

        [HttpDelete("{cartId}/items")]
        public async Task<IActionResult> ClearCart(int cartId)
        {
            var result = await _cartService.ClearCartAsync(cartId);
            if (result == "Cart not found")
                return NotFound(result);

            var cart = await _cartService.GetCartAsync(cartId);
            return Ok(await ToDto(cart!));
        }

        [HttpDelete("items")]
        public async Task<IActionResult> ClearCurrentCart()
        {
            var sessionId = GetOrCreateGuestSessionId();
            await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);

            var result = await _cartService.ClearCartBySessionIdAsync(sessionId);
            if (result == "Cart not found")
                return NotFound(result);

            var cart = await _cartService.GetOrCreateCartBySessionIdAsync(sessionId);
            return Ok(await ToDto(cart));
        }

        private string GetOrCreateGuestSessionId()
        {
            if (Request.Cookies.TryGetValue(GuestSessionCookieName, out var sessionId) &&
                !string.IsNullOrWhiteSpace(sessionId))
            {
                return sessionId;
            }

            sessionId = Guid.NewGuid().ToString("N");
            Response.Cookies.Append(GuestSessionCookieName, sessionId, new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(30),
                HttpOnly = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Secure = false
            });

            return sessionId;
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
