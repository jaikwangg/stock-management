using Microsoft.AspNetCore.Mvc;
using StockAPI.Services.Interfaces;

namespace StockAPI.Controllers
{
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
            return Ok(products);
        }

        // [HttpPost]
        // public async Task<IActionResult> Create(
        //     string name,
        //     decimal price,
        //     int qty)
        // {
        //     var product = await _productService.CreateAsync(name, price, qty);
        //     return Ok(product);
        // }

        [HttpPost("{id}/add-stock")]
        public async Task<IActionResult> AddStock(int id, int amount)
        {
            var result = await _productService.AddStockAsync(id, amount);

            if (result == null)
                return NotFound();

            return Ok("Stock updated");
        }
    }
}