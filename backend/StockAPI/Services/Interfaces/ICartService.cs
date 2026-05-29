namespace StockAPI.Services.Interfaces
{
    public interface ICartService
    {
        Task<Cart> CreateCartAsync();
        Task<Cart> GetOrCreateCartBySessionIdAsync(string sessionId);
        Task<Cart?> GetCartAsync(int cartId);
        Task<string> AddToCartAsync(int cartId, int productId, int qty);
        Task<string> AddToCartBySessionIdAsync(string sessionId, int productId, int qty);
        Task<string> ReduceFromCartAsync(int cartId, int productId, int qty);
        Task<string> ReduceFromCartBySessionIdAsync(string sessionId, int productId, int qty);
        Task<string> RemoveFromCartAsync(int cartId, int productId);
        Task<string> RemoveFromCartBySessionIdAsync(string sessionId, int productId);
        Task<string> ClearCartAsync(int cartId);
        Task<string> ClearCartBySessionIdAsync(string sessionId);
    }
}