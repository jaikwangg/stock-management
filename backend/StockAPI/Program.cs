using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=stock.db"));
builder.Services.AddScoped<StockAPI.Services.Interfaces.IProductService, StockAPI.Services.Implementations.ProductService>();
builder.Services.AddScoped<StockAPI.Services.Interfaces.ICartService, StockAPI.Services.Implementations.CartService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();

    if (!context.Products.Any())
    {
        context.Products.AddRange(
            new Product { Name = "Keyboard", Price = 49.99m, Stock = new Stock { Quantity = 12 } },
            new Product { Name = "Mouse", Price = 24.99m, Stock = new Stock { Quantity = 18 } },
            new Product { Name = "Monitor", Price = 199.99m, Stock = new Stock { Quantity = 6 } });

        context.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
