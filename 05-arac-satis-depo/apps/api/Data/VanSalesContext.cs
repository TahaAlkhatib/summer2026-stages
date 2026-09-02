using Microsoft.EntityFrameworkCore;
using VanSalesApi.Models;

namespace VanSalesApi.Data
{
    public class VanSalesContext : DbContext
    {
        public VanSalesContext(DbContextOptions<VanSalesContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Van> Vans { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<VanStock> VanStocks { get; set; }
        public DbSet<LoadOrder> LoadOrders { get; set; }
        public DbSet<LoadOrderItem> LoadOrderItems { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<Collection> Collections { get; set; }
        public DbSet<VanLocation> VanLocations { get; set; }

        protected override void OnModelCreating(ModelBuilder model)
        {
            model.Entity<User>().HasIndex(u => u.Username).IsUnique();
            model.Entity<Van>().HasIndex(v => v.Plate).IsUnique();
            model.Entity<Product>().HasIndex(p => p.Code).IsUnique();
            model.Entity<LoadOrder>().HasIndex(l => l.LoadNo).IsUnique();

            // Çevrimdışı kimlikler benzersiz olmalı — aynı fatura iki kez
            // gönderilirse ikinci kayıt oluşmaz (idempotent senkronizasyon)
            model.Entity<Invoice>().HasIndex(i => i.OfflineId).IsUnique();
            model.Entity<Invoice>().HasIndex(i => i.InvoiceNo).IsUnique();
            model.Entity<Collection>().HasIndex(c => c.OfflineId).IsUnique();

            // Bir araçta bir ürün tek satırda tutulur
            model.Entity<VanStock>().HasIndex(s => new { s.VanId, s.ProductId }).IsUnique();

            // Para alanlarının hassasiyeti
            model.Entity<Product>().Property(p => p.Price).HasPrecision(10, 2);
            model.Entity<Product>().Property(p => p.VatRate).HasPrecision(5, 2);
            model.Entity<Customer>().Property(p => p.CreditLimit).HasPrecision(12, 2);
            model.Entity<Invoice>().Property(p => p.SubTotal).HasPrecision(12, 2);
            model.Entity<Invoice>().Property(p => p.VatTotal).HasPrecision(12, 2);
            model.Entity<Invoice>().Property(p => p.GrandTotal).HasPrecision(12, 2);
            model.Entity<Invoice>().Property(p => p.PaidAmount).HasPrecision(12, 2);
            model.Entity<InvoiceItem>().Property(p => p.UnitPrice).HasPrecision(10, 2);
            model.Entity<InvoiceItem>().Property(p => p.VatRate).HasPrecision(5, 2);
            model.Entity<InvoiceItem>().Property(p => p.LineTotal).HasPrecision(12, 2);
            model.Entity<Collection>().Property(p => p.Amount).HasPrecision(12, 2);

            model.Entity<InvoiceItem>()
                 .HasOne(i => i.Invoice).WithMany(f => f.Items)
                 .OnDelete(DeleteBehavior.Cascade);
            model.Entity<LoadOrderItem>()
                 .HasOne(i => i.LoadOrder).WithMany(l => l.Items)
                 .OnDelete(DeleteBehavior.Cascade);

            // Ürün/müşteri silinse bile fatura kayıtları korunur
            model.Entity<Invoice>().HasOne(i => i.Customer).WithMany().OnDelete(DeleteBehavior.Restrict);
            model.Entity<Invoice>().HasOne(i => i.Van).WithMany().OnDelete(DeleteBehavior.Restrict);
            model.Entity<InvoiceItem>().HasOne(i => i.Product).WithMany().OnDelete(DeleteBehavior.Restrict);
            model.Entity<VanStock>().HasOne(s => s.Product).WithMany().OnDelete(DeleteBehavior.Restrict);
            model.Entity<LoadOrderItem>().HasOne(i => i.Product).WithMany().OnDelete(DeleteBehavior.Restrict);
        }
    }
}
