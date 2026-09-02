namespace DepoYonetim
{
    partial class GunSonuForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null)) { components.Dispose(); }
            base.Dispose(disposing);
        }

        #region Windows Form Tasarımcısı tarafından oluşturulan kod

        private void InitializeComponent()
        {
            this.pnlUst = new System.Windows.Forms.Panel();
            this.lblTarih = new System.Windows.Forms.Label();
            this.dtpTarih = new System.Windows.Forms.DateTimePicker();
            this.btnGetir = new System.Windows.Forms.Button();
            this.grpOzet = new System.Windows.Forms.GroupBox();
            this.lblFaturaSayisi = new System.Windows.Forms.Label();
            this.lblNakit = new System.Windows.Forms.Label();
            this.lblVadeli = new System.Windows.Forms.Label();
            this.lblToplam = new System.Windows.Forms.Label();
            this.lblTahsilat = new System.Windows.Forms.Label();
            this.dgvFaturalar = new System.Windows.Forms.DataGridView();
            this.pnlUst.SuspendLayout();
            this.grpOzet.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.White;
            this.pnlUst.Controls.Add(this.btnGetir);
            this.pnlUst.Controls.Add(this.dtpTarih);
            this.pnlUst.Controls.Add(this.lblTarih);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(880, 50);
            this.pnlUst.TabIndex = 0;
            // 
            // lblTarih
            // 
            this.lblTarih.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.lblTarih.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.lblTarih.Location = new System.Drawing.Point(14, 16);
            this.lblTarih.Name = "lblTarih";
            this.lblTarih.Size = new System.Drawing.Size(50, 20);
            this.lblTarih.TabIndex = 0;
            this.lblTarih.Text = "Tarih";
            // 
            // dtpTarih
            // 
            this.dtpTarih.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpTarih.Location = new System.Drawing.Point(66, 13);
            this.dtpTarih.Name = "dtpTarih";
            this.dtpTarih.Size = new System.Drawing.Size(140, 23);
            this.dtpTarih.TabIndex = 1;
            // 
            // btnGetir
            // 
            this.btnGetir.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnGetir.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnGetir.ForeColor = System.Drawing.Color.White;
            this.btnGetir.Location = new System.Drawing.Point(216, 12);
            this.btnGetir.Name = "btnGetir";
            this.btnGetir.Size = new System.Drawing.Size(120, 26);
            this.btnGetir.TabIndex = 2;
            this.btnGetir.Text = "Raporu Getir";
            this.btnGetir.UseVisualStyleBackColor = false;
            this.btnGetir.Click += new System.EventHandler(this.btnGetir_Click);
            // 
            // grpOzet
            // 
            this.grpOzet.Controls.Add(this.lblTahsilat);
            this.grpOzet.Controls.Add(this.lblToplam);
            this.grpOzet.Controls.Add(this.lblVadeli);
            this.grpOzet.Controls.Add(this.lblNakit);
            this.grpOzet.Controls.Add(this.lblFaturaSayisi);
            this.grpOzet.Dock = System.Windows.Forms.DockStyle.Top;
            this.grpOzet.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpOzet.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.grpOzet.Location = new System.Drawing.Point(0, 50);
            this.grpOzet.Name = "grpOzet";
            this.grpOzet.Padding = new System.Windows.Forms.Padding(10);
            this.grpOzet.Size = new System.Drawing.Size(880, 92);
            this.grpOzet.TabIndex = 1;
            this.grpOzet.TabStop = false;
            this.grpOzet.Text = "Gün Sonu Özeti";
            // 
            // lblFaturaSayisi
            // 
            this.lblFaturaSayisi.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblFaturaSayisi.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblFaturaSayisi.Location = new System.Drawing.Point(14, 32);
            this.lblFaturaSayisi.Name = "lblFaturaSayisi";
            this.lblFaturaSayisi.Size = new System.Drawing.Size(160, 44);
            this.lblFaturaSayisi.TabIndex = 0;
            this.lblFaturaSayisi.Text = "Fatura adedi\r\n-";
            // 
            // lblNakit
            // 
            this.lblNakit.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblNakit.ForeColor = System.Drawing.Color.FromArgb(21, 128, 61);
            this.lblNakit.Location = new System.Drawing.Point(184, 32);
            this.lblNakit.Name = "lblNakit";
            this.lblNakit.Size = new System.Drawing.Size(170, 44);
            this.lblNakit.TabIndex = 1;
            this.lblNakit.Text = "Nakit satış\r\n-";
            // 
            // lblVadeli
            // 
            this.lblVadeli.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblVadeli.ForeColor = System.Drawing.Color.FromArgb(180, 83, 9);
            this.lblVadeli.Location = new System.Drawing.Point(364, 32);
            this.lblVadeli.Name = "lblVadeli";
            this.lblVadeli.Size = new System.Drawing.Size(170, 44);
            this.lblVadeli.TabIndex = 2;
            this.lblVadeli.Text = "Vadeli satış\r\n-";
            // 
            // lblToplam
            // 
            this.lblToplam.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblToplam.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.lblToplam.Location = new System.Drawing.Point(544, 32);
            this.lblToplam.Name = "lblToplam";
            this.lblToplam.Size = new System.Drawing.Size(170, 44);
            this.lblToplam.TabIndex = 3;
            this.lblToplam.Text = "Günün cirosu\r\n-";
            // 
            // lblTahsilat
            // 
            this.lblTahsilat.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblTahsilat.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblTahsilat.Location = new System.Drawing.Point(724, 32);
            this.lblTahsilat.Name = "lblTahsilat";
            this.lblTahsilat.Size = new System.Drawing.Size(146, 44);
            this.lblTahsilat.TabIndex = 4;
            this.lblTahsilat.Text = "Sahadan tahsilat\r\n-";
            // 
            // dgvFaturalar
            // 
            this.dgvFaturalar.AllowUserToAddRows = false;
            this.dgvFaturalar.AllowUserToDeleteRows = false;
            this.dgvFaturalar.BackgroundColor = System.Drawing.Color.White;
            this.dgvFaturalar.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvFaturalar.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvFaturalar.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvFaturalar.Location = new System.Drawing.Point(0, 142);
            this.dgvFaturalar.MultiSelect = false;
            this.dgvFaturalar.Name = "dgvFaturalar";
            this.dgvFaturalar.ReadOnly = true;
            this.dgvFaturalar.RowHeadersVisible = false;
            this.dgvFaturalar.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvFaturalar.Size = new System.Drawing.Size(880, 358);
            this.dgvFaturalar.TabIndex = 2;
            // 
            // GunSonuForm
            // 
            this.AcceptButton = this.btnGetir;
            this.BackColor = System.Drawing.Color.FromArgb(242, 245, 248);
            this.ClientSize = new System.Drawing.Size(880, 500);
            this.Controls.Add(this.dgvFaturalar);
            this.Controls.Add(this.grpOzet);
            this.Controls.Add(this.pnlUst);
            this.MinimizeBox = false;
            this.Name = "GunSonuForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Gün Sonu Raporu";
            this.Load += new System.EventHandler(this.GunSonuForm_Load);
            this.pnlUst.ResumeLayout(false);
            this.grpOzet.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblTarih;
        private System.Windows.Forms.DateTimePicker dtpTarih;
        private System.Windows.Forms.Button btnGetir;
        private System.Windows.Forms.GroupBox grpOzet;
        private System.Windows.Forms.Label lblFaturaSayisi;
        private System.Windows.Forms.Label lblNakit;
        private System.Windows.Forms.Label lblVadeli;
        private System.Windows.Forms.Label lblToplam;
        private System.Windows.Forms.Label lblTahsilat;
        private System.Windows.Forms.DataGridView dgvFaturalar;
    }
}
