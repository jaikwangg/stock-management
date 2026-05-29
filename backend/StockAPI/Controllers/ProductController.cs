using Microsoft.AspNetCore.Mvc;

namespace StockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_context.Products.ToList());
        }

        [HttpPost]
        public IActionResult Create(Product product)
        {
            _context.Products.Add(product);
            _context.SaveChanges();
            return Ok(product);
        }

        [HttpPost("{id}/add-stock")]
        public IActionResult AddStock(int id, int amount)
        {
            var product = _context.Products.Find(id);
            if (product == null) return NotFound();

            product.Stock += amount;
            _context.SaveChanges();

            return Ok(product);
        }
    }
}