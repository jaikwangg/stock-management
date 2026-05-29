namespace StockAPI.Services.Interfaces
{
    public interface ICartService
    {
        Task<Cart> CreateCartAsync();
        Task<Cart?> GetCartAsync(int cartId);
        Task<string> AddToCartAsync(int cartId, int productId, int qty);
        Task<string> ReduceFromCartAsync(int cartId, int productId, int qty);
        Task<string> RemoveFromCartAsync(int cartId, int productId);
    }
}