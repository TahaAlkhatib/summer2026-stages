using Microsoft.EntityFrameworkCore;
using OtoServisApi.Models;

namespace OtoServisApi.Data
{
    public class OtoServisContext : DbContext
    {
        public OtoServisContext(DbContextOptions<OtoServisContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<JobCard> JobCards { get; set; }
        public DbSet<InspectionItem> InspectionItems { get; set; }
        public DbSet<Part> Parts { get; set; }
        public DbSet<JobPart> JobParts { get; set; }
        public DbSet<LaborItem> LaborItems { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

        protected override void OnModelCreating(ModelBuilder model)
        {
            // Plaka ve kullanıcı adı benzersiz olmalı
            model.Entity<Vehicle>().HasIndex(v => v.Plate).IsUnique();
            model.Entity<User>().HasIndex(u => u.Username).IsUnique();
            model.Entity<JobCard>().HasIndex(j => j.JobNo).IsUnique();
            model.Entity<Part>().HasIndex(p => p.Code).IsUnique();
            model.Entity<Invoice>().HasIndex(i => i.InvoiceNo).IsUnique();

            // Para alanlarının hassasiyeti
            model.Entity<Part>().Property(p => p.Price).HasPrecision(10, 2);
            model.Entity<JobPart>().Property(p => p.UnitPrice).HasPrecision(10, 2);
            model.Entity<JobPart>().Property(p => p.LineTotal).HasPrecision(10, 2);
            model.Entity<LaborItem>().Property(p => p.Hours).HasPrecision(6, 2);
            model.Entity<LaborItem>().Property(p => p.HourlyRate).HasPrecision(10, 2);
            model.Entity<LaborItem>().Property(p => p.LineTotal).HasPrecision(10, 2);
            model.Entity<JobCard>().Property(p => p.LaborTotal).HasPrecision(10, 2);
            model.Entity<JobCard>().Property(p => p.PartsTotal).HasPrecision(10, 2);
            model.Entity<JobCard>().Property(p => p.GrandTotal).HasPrecision(10, 2);
            model.Entity<Invoice>().Property(p => p.LaborTotal).HasPrecision(10, 2);
            model.Entity<Invoice>().Property(p => p.PartsTotal).HasPrecision(10, 2);
            model.Entity<Invoice>().Property(p => p.TaxRate).HasPrecision(5, 2);
            model.Entity<Invoice>().Property(p => p.TaxAmount).HasPrecision(10, 2);
            model.Entity<Invoice>().Property(p => p.GrandTotal).HasPrecision(10, 2);

            // İş emri silinirse alt kayıtları da silinsin
            model.Entity<InspectionItem>()
                 .HasOne(i => i.JobCard).WithMany(j => j.InspectionItems)
                 .OnDelete(DeleteBehavior.Cascade);
            model.Entity<JobPart>()
                 .HasOne(i => i.JobCard).WithMany(j => j.JobParts)
                 .OnDelete(DeleteBehavior.Cascade);
            model.Entity<LaborItem>()
                 .HasOne(i => i.JobCard).WithMany(j => j.LaborItems)
                 .OnDelete(DeleteBehavior.Cascade);

            // Araç silinince iş emirleri silinmesin (kayıt kalsın)
            model.Entity<JobCard>()
                 .HasOne(j => j.Vehicle).WithMany()
                 .OnDelete(DeleteBehavior.Restrict);
            model.Entity<JobCard>()
                 .HasOne(j => j.Customer).WithMany()
                 .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
