using System.ComponentModel.DataAnnotations;

namespace VanSalesApi.Models
{
    // Personel: admin (yönetici), depo (depo sorumlusu), saha (satış temsilcisi)
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)] public string FullName { get; set; }
        [Required, MaxLength(50)] public string Username { get; set; }
        [Required, MaxLength(200)] public string PasswordHash { get; set; }
        [Required, MaxLength(20)] public string Role { get; set; }
        [MaxLength(25)] public string Phone { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    // Satış aracı (van)
    public class Van
    {
        public int Id { get; set; }
        [Required, MaxLength(15)] public string Plate { get; set; }
        [MaxLength(50)] public string Brand { get; set; }
        [MaxLength(50)] public string Model { get; set; }
        public int? DriverId { get; set; }
        public User Driver { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // Merkez depo ürünü
    public class Product
    {
        public int Id { get; set; }
        [Required, MaxLength(30)] public string Code { get; set; }
        [Required, MaxLength(150)] public string Name { get; set; }
        [MaxLength(10)] public string Unit { get; set; } = "adet";
        public decimal Price { get; set; }
        public decimal VatRate { get; set; } = 20;
        public int WarehouseStock { get; set; }
        public int MinStock { get; set; } = 20;
        public bool IsActive { get; set; } = true;
    }

    // Araca yüklenen stok (araç üstü envanter)
    public class VanStock
    {
        public int Id { get; set; }
        public int VanId { get; set; }
        public Van Van { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }

    // Depodan araca yükleme fişi
    public class LoadOrder
    {
        public int Id { get; set; }
        [Required, MaxLength(20)] public string LoadNo { get; set; }
        public int VanId { get; set; }
        public Van Van { get; set; }
        public DateTime LoadDate { get; set; } = DateTime.Now;
        public int CreatedById { get; set; }
        [MaxLength(500)] public string Notes { get; set; }
        public List<LoadOrderItem> Items { get; set; }
    }

    public class LoadOrderItem
    {
        public int Id { get; set; }
        public int LoadOrderId { get; set; }
        public LoadOrder LoadOrder { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        public int Quantity { get; set; }
    }

    public class Customer
    {
        public int Id { get; set; }
        [Required, MaxLength(150)] public string Name { get; set; }
        [MaxLength(100)] public string ContactName { get; set; }
        [Required, MaxLength(25)] public string Phone { get; set; }
        [MaxLength(300)] public string Address { get; set; }
        [MaxLength(50)] public string District { get; set; }
        [MaxLength(20)] public string TaxNumber { get; set; }
        // Vadeli satış limiti
        public decimal CreditLimit { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // Sahada kesilen fatura.
    // OfflineId: mobil uygulamada çevrimdışı üretilen benzersiz kimlik.
    // Aynı fatura tekrar gönderilirse çift kayıt oluşmasın diye kullanılır.
    public class Invoice
    {
        public int Id { get; set; }
        [Required, MaxLength(20)] public string InvoiceNo { get; set; }

        // Mobil uygulamanın ürettiği kimlik (idempotent senkronizasyon için)
        [Required, MaxLength(60)] public string OfflineId { get; set; }

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }
        public int VanId { get; set; }
        public Van Van { get; set; }
        public int SalesRepId { get; set; }

        // nakit / vadeli
        [Required, MaxLength(10)] public string PaymentType { get; set; }

        public decimal SubTotal { get; set; }
        public decimal VatTotal { get; set; }
        public decimal GrandTotal { get; set; }
        public decimal PaidAmount { get; set; }

        // Fatura sahada kesildiği an (cihaz saati)
        public DateTime IssuedAt { get; set; }
        // Sunucuya ulaştığı an
        public DateTime SyncedAt { get; set; } = DateTime.Now;

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        [MaxLength(500)] public string Notes { get; set; }

        public List<InvoiceItem> Items { get; set; }
    }

    public class InvoiceItem
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }
        [MaxLength(150)] public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal VatRate { get; set; }
        public decimal LineTotal { get; set; }
    }

    // Vadeli faturaların tahsilatı
    public class Collection
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; }
        [Required, MaxLength(60)] public string OfflineId { get; set; }
        public decimal Amount { get; set; }
        [MaxLength(10)] public string Method { get; set; } = "nakit";
        public int CollectedById { get; set; }
        public DateTime CollectedAt { get; set; }
        public DateTime SyncedAt { get; set; } = DateTime.Now;
    }

    // Aracın GPS konum kayıtları
    public class VanLocation
    {
        public int Id { get; set; }
        public int VanId { get; set; }
        public Van Van { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double? SpeedKmh { get; set; }
        public DateTime RecordedAt { get; set; }
        public DateTime SyncedAt { get; set; } = DateTime.Now;
    }
}
