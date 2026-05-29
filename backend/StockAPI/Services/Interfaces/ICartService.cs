namespace StockAPI.Services.Interfaces
{
    public interface ICartService
    {
        Task<Cart> CreateCartAsync();
        Task<Cart?> GetCartAsync(int cartId);
        Task<string> AddToCartAsync(int cartId, int productId, int qty);
    }
}