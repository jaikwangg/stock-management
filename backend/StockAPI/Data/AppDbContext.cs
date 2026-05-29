using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    public DbSet<Stock> Stocks => Set<Stock>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
}