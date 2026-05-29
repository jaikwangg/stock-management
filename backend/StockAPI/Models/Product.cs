public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public Stock? Stock { get; set; }
    public decimal Price { get; set; }
}