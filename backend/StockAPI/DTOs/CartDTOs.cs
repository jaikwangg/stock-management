namespace StockAPI.DTOs
{
    public class CartItemDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; }
        public int Quantity { get; set; }
    }

    public class CartDTO
    {
        public int Id { get; set; }
        public List<CartItemDTO> Items { get; set; } = new();
    }
}