using System.ComponentModel.DataAnnotations;

namespace OtoServisApi.Models
{
    // Personel: admin (yönetici), danisman (servis danışmanı), teknisyen
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string FullName { get; set; }
        [Required, MaxLength(50)]
        public string Username { get; set; }
        [Required, MaxLength(200)]
        public string PasswordHash { get; set; }
        [Required, MaxLength(20)]
        public string Role { get; set; }
        [MaxLength(25)]
        public string Phone { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class Customer
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string FullName { get; set; }
        [Required, MaxLength(25)]
        public string Phone { get; set; }
        [MaxLength(100)]
        public string Email { get; set; }
        [MaxLength(300)]
        public string Address { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public List<Vehicle> Vehicles { get; set; }
    }

    public class Vehicle
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public Customer Customer { get; set; }

        [Required, MaxLength(15)]
        public string Plate { get; set; }
        [MaxLength(50)]
        public string Brand { get; set; }
        [MaxLength(50)]
        public string Model { get; set; }
        public int Year { get; set; }
        public int Mileage { get; set; }
        [MaxLength(30)]
        public string Color { get; set; }
        [MaxLength(30)]
        public string ChassisNo { get; set; }
    }

    // İş emri (Job Card)
    // Durumlar: acildi -> incelemede -> onay_bekliyor -> tamirde -> tamamlandi -> teslim_edildi
    public class JobCard
    {
        public int Id { get; set; }
        [Required, MaxLength(20)]
        public string JobNo { get; set; }

        public int VehicleId { get; set; }
        public Vehicle Vehicle { get; set; }

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "acildi";

        [MaxLength(1000)]
        public string ComplaintText { get; set; }

        public int OpenedById { get; set; }
        public int? TechnicianId { get; set; }

        public int Mileage { get; set; }
        [MaxLength(1000)]
        public string Notes { get; set; }

        public decimal LaborTotal { get; set; }
        public decimal PartsTotal { get; set; }
        public decimal GrandTotal { get; set; }

        public DateTime OpenedAt { get; set; } = DateTime.Now;
        public DateTime? CompletedAt { get; set; }

        public List<InspectionItem> InspectionItems { get; set; }
        public List<JobPart> JobParts { get; set; }
        public List<LaborItem> LaborItems { get; set; }
    }

    // Tablet üzerinden girilen arıza tespit kalemi
    public class InspectionItem
    {
        public int Id { get; set; }
        public int JobCardId { get; set; }
        public JobCard JobCard { get; set; }

        [Required, MaxLength(150)]
        public string Title { get; set; }
        [MaxLength(1000)]
        public string Description { get; set; }
        // dusuk / orta / yuksek
        [MaxLength(10)]
        public string Severity { get; set; } = "orta";
        [MaxLength(300)]
        public string PhotoPath { get; set; }

        public int CreatedById { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    // Yedek parça stoğu
    public class Part
    {
        public int Id { get; set; }
        [Required, MaxLength(30)]
        public string Code { get; set; }
        [Required, MaxLength(150)]
        public string Name { get; set; }
        [MaxLength(50)]
        public string Brand { get; set; }
        [MaxLength(10)]
        public string Unit { get; set; } = "adet";
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public int MinStock { get; set; } = 5;
    }

    // İş emrine depodan çekilen parça
    public class JobPart
    {
        public int Id { get; set; }
        public int JobCardId { get; set; }
        public JobCard JobCard { get; set; }

        public int PartId { get; set; }
        public Part Part { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
        public DateTime WithdrawnAt { get; set; } = DateTime.Now;
        public int WithdrawnById { get; set; }
    }

    // İşçilik kalemi
    public class LaborItem
    {
        public int Id { get; set; }
        public int JobCardId { get; set; }
        public JobCard JobCard { get; set; }

        [Required, MaxLength(200)]
        public string Description { get; set; }
        public decimal Hours { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class Invoice
    {
        public int Id { get; set; }
        [Required, MaxLength(20)]
        public string InvoiceNo { get; set; }

        public int JobCardId { get; set; }
        public JobCard JobCard { get; set; }

        public DateTime IssueDate { get; set; } = DateTime.Now;
        public decimal LaborTotal { get; set; }
        public decimal PartsTotal { get; set; }
        public decimal TaxRate { get; set; } = 20;
        public decimal TaxAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public bool IsPaid { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
