using Microsoft.AspNetCore.Mvc;
using StockAPI.Services.Interfaces;

namespace StockAPI.Controllers
{
    public record ProductDto(int Id, string Name, decimal Price, int Stock);
    public record CreateProductRequest(string Name, decimal Price, int Stock);

    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products.Select(ToDto));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateProductRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Product name is required");

            if (request.Price < 0 || request.Stock < 0)
                return BadRequest("Price and stock must be zero or greater");

            var product = await _productService.CreateAsync(new Product
            {
                Name = request.Name.Trim(),
                Price = request.Price,
                Stock = new Stock { Quantity = request.Stock }
            });

            return CreatedAtAction(nameof(GetAll), new { id = product.Id }, ToDto(product));
        }

        [HttpPost("{id}/add-stock")]
        public async Task<IActionResult> AddStock(int id, int amount)
        {
            var result = await _productService.AddStockAsync(id, amount);

            if (result == null)
                return NotFound();

            return Ok(ToDto(result));
        }

        private static ProductDto ToDto(Product product)
        {
            return new ProductDto(
                product.Id,
                product.Name,
                product.Price,
                product.Stock?.Quantity ?? 0);
        }
    }
}
