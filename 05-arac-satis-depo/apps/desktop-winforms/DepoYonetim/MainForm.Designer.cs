namespace DepoYonetim
{
    partial class MainForm
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
            this.lblBaslik = new System.Windows.Forms.Label();
            this.lblKullanici = new System.Windows.Forms.Label();
            this.btnYenile = new System.Windows.Forms.Button();
            this.pnlMenu = new System.Windows.Forms.Panel();
            this.btnStok = new System.Windows.Forms.Button();
            this.btnYukleme = new System.Windows.Forms.Button();
            this.btnAraclar = new System.Windows.Forms.Button();
            this.btnFaturalar = new System.Windows.Forms.Button();
            this.btnGunSonu = new System.Windows.Forms.Button();
            this.grpOzet = new System.Windows.Forms.GroupBox();
            this.lblBugunFatura = new System.Windows.Forms.Label();
            this.lblBugunCiro = new System.Windows.Forms.Label();
            this.lblAyCiro = new System.Windows.Forms.Label();
            this.lblAcikBakiye = new System.Windows.Forms.Label();
            this.lblKritikStok = new System.Windows.Forms.Label();
            this.grpAraclar = new System.Windows.Forms.GroupBox();
            this.dgvAraclar = new System.Windows.Forms.DataGridView();
            this.grpUrunler = new System.Windows.Forms.GroupBox();
            this.dgvUrunler = new System.Windows.Forms.DataGridView();
            this.lblDurum = new System.Windows.Forms.Label();
            this.pnlUst.SuspendLayout();
            this.pnlMenu.SuspendLayout();
            this.grpOzet.SuspendLayout();
            this.grpAraclar.SuspendLayout();
            this.grpUrunler.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.pnlUst.Controls.Add(this.btnYenile);
            this.pnlUst.Controls.Add(this.lblKullanici);
            this.pnlUst.Controls.Add(this.lblBaslik);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(1100, 56);
            this.pnlUst.TabIndex = 0;
            // 
            // lblBaslik
            // 
            this.lblBaslik.Font = new System.Drawing.Font("Segoe UI", 13F, System.Drawing.FontStyle.Bold);
            this.lblBaslik.ForeColor = System.Drawing.Color.White;
            this.lblBaslik.Location = new System.Drawing.Point(16, 14);
            this.lblBaslik.Name = "lblBaslik";
            this.lblBaslik.Size = new System.Drawing.Size(420, 28);
            this.lblBaslik.TabIndex = 0;
            this.lblBaslik.Text = "DEPO YÖNETİMİ — Genel Durum";
            // 
            // lblKullanici
            // 
            this.lblKullanici.ForeColor = System.Drawing.Color.FromArgb(200, 216, 232);
            this.lblKullanici.Location = new System.Drawing.Point(700, 19);
            this.lblKullanici.Name = "lblKullanici";
            this.lblKullanici.Size = new System.Drawing.Size(280, 20);
            this.lblKullanici.TabIndex = 1;
            this.lblKullanici.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // btnYenile
            // 
            this.btnYenile.BackColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.btnYenile.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYenile.ForeColor = System.Drawing.Color.White;
            this.btnYenile.Location = new System.Drawing.Point(990, 14);
            this.btnYenile.Name = "btnYenile";
            this.btnYenile.Size = new System.Drawing.Size(90, 30);
            this.btnYenile.TabIndex = 2;
            this.btnYenile.Text = "Yenile";
            this.btnYenile.UseVisualStyleBackColor = false;
            this.btnYenile.Click += new System.EventHandler(this.btnYenile_Click);
            // 
            // pnlMenu
            // 
            this.pnlMenu.BackColor = System.Drawing.Color.White;
            this.pnlMenu.Controls.Add(this.btnGunSonu);
            this.pnlMenu.Controls.Add(this.btnFaturalar);
            this.pnlMenu.Controls.Add(this.btnAraclar);
            this.pnlMenu.Controls.Add(this.btnYukleme);
            this.pnlMenu.Controls.Add(this.btnStok);
            this.pnlMenu.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlMenu.Location = new System.Drawing.Point(0, 56);
            this.pnlMenu.Name = "pnlMenu";
            this.pnlMenu.Size = new System.Drawing.Size(1100, 56);
            this.pnlMenu.TabIndex = 1;
            // 
            // btnStok
            // 
            this.btnStok.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnStok.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnStok.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnStok.Location = new System.Drawing.Point(16, 11);
            this.btnStok.Name = "btnStok";
            this.btnStok.Size = new System.Drawing.Size(150, 34);
            this.btnStok.TabIndex = 0;
            this.btnStok.Text = "Depo Stoğu";
            this.btnStok.UseVisualStyleBackColor = true;
            this.btnStok.Click += new System.EventHandler(this.btnStok_Click);
            // 
            // btnYukleme
            // 
            this.btnYukleme.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYukleme.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnYukleme.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnYukleme.Location = new System.Drawing.Point(174, 11);
            this.btnYukleme.Name = "btnYukleme";
            this.btnYukleme.Size = new System.Drawing.Size(150, 34);
            this.btnYukleme.TabIndex = 1;
            this.btnYukleme.Text = "Araca Yükleme";
            this.btnYukleme.UseVisualStyleBackColor = true;
            this.btnYukleme.Click += new System.EventHandler(this.btnYukleme_Click);
            // 
            // btnAraclar
            // 
            this.btnAraclar.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnAraclar.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnAraclar.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnAraclar.Location = new System.Drawing.Point(332, 11);
            this.btnAraclar.Name = "btnAraclar";
            this.btnAraclar.Size = new System.Drawing.Size(150, 34);
            this.btnAraclar.TabIndex = 2;
            this.btnAraclar.Text = "Araçlar / Rota";
            this.btnAraclar.UseVisualStyleBackColor = true;
            this.btnAraclar.Click += new System.EventHandler(this.btnAraclar_Click);
            // 
            // btnFaturalar
            // 
            this.btnFaturalar.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnFaturalar.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnFaturalar.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnFaturalar.Location = new System.Drawing.Point(490, 11);
            this.btnFaturalar.Name = "btnFaturalar";
            this.btnFaturalar.Size = new System.Drawing.Size(150, 34);
            this.btnFaturalar.TabIndex = 3;
            this.btnFaturalar.Text = "Faturalar";
            this.btnFaturalar.UseVisualStyleBackColor = true;
            this.btnFaturalar.Click += new System.EventHandler(this.btnFaturalar_Click);
            // 
            // btnGunSonu
            // 
            this.btnGunSonu.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnGunSonu.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnGunSonu.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnGunSonu.Location = new System.Drawing.Point(648, 11);
            this.btnGunSonu.Name = "btnGunSonu";
            this.btnGunSonu.Size = new System.Drawing.Size(150, 34);
            this.btnGunSonu.TabIndex = 4;
            this.btnGunSonu.Text = "Gün Sonu Raporu";
            this.btnGunSonu.UseVisualStyleBackColor = true;
            this.btnGunSonu.Click += new System.EventHandler(this.btnGunSonu_Click);
            // 
            // grpOzet
            // 
            this.grpOzet.Controls.Add(this.lblKritikStok);
            this.grpOzet.Controls.Add(this.lblAcikBakiye);
            this.grpOzet.Controls.Add(this.lblAyCiro);
            this.grpOzet.Controls.Add(this.lblBugunCiro);
            this.grpOzet.Controls.Add(this.lblBugunFatura);
            this.grpOzet.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpOzet.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.grpOzet.Location = new System.Drawing.Point(16, 126);
            this.grpOzet.Name = "grpOzet";
            this.grpOzet.Size = new System.Drawing.Size(1068, 90);
            this.grpOzet.TabIndex = 2;
            this.grpOzet.TabStop = false;
            this.grpOzet.Text = "Özet";
            // 
            // lblBugunFatura
            // 
            this.lblBugunFatura.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblBugunFatura.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblBugunFatura.Location = new System.Drawing.Point(16, 32);
            this.lblBugunFatura.Name = "lblBugunFatura";
            this.lblBugunFatura.Size = new System.Drawing.Size(200, 44);
            this.lblBugunFatura.TabIndex = 0;
            this.lblBugunFatura.Text = "Bugün kesilen fatura\r\n-";
            // 
            // lblBugunCiro
            // 
            this.lblBugunCiro.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblBugunCiro.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblBugunCiro.Location = new System.Drawing.Point(226, 32);
            this.lblBugunCiro.Name = "lblBugunCiro";
            this.lblBugunCiro.Size = new System.Drawing.Size(200, 44);
            this.lblBugunCiro.TabIndex = 1;
            this.lblBugunCiro.Text = "Bugünkü ciro\r\n-";
            // 
            // lblAyCiro
            // 
            this.lblAyCiro.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblAyCiro.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblAyCiro.Location = new System.Drawing.Point(436, 32);
            this.lblAyCiro.Name = "lblAyCiro";
            this.lblAyCiro.Size = new System.Drawing.Size(200, 44);
            this.lblAyCiro.TabIndex = 2;
            this.lblAyCiro.Text = "Bu ayın cirosu\r\n-";
            // 
            // lblAcikBakiye
            // 
            this.lblAcikBakiye.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblAcikBakiye.ForeColor = System.Drawing.Color.FromArgb(180, 83, 9);
            this.lblAcikBakiye.Location = new System.Drawing.Point(646, 32);
            this.lblAcikBakiye.Name = "lblAcikBakiye";
            this.lblAcikBakiye.Size = new System.Drawing.Size(200, 44);
            this.lblAcikBakiye.TabIndex = 3;
            this.lblAcikBakiye.Text = "Açık bakiye (alacak)\r\n-";
            // 
            // lblKritikStok
            // 
            this.lblKritikStok.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.lblKritikStok.ForeColor = System.Drawing.Color.FromArgb(185, 28, 28);
            this.lblKritikStok.Location = new System.Drawing.Point(856, 32);
            this.lblKritikStok.Name = "lblKritikStok";
            this.lblKritikStok.Size = new System.Drawing.Size(200, 44);
            this.lblKritikStok.TabIndex = 4;
            this.lblKritikStok.Text = "Kritik stok ürünü\r\n-";
            // 
            // grpAraclar
            // 
            this.grpAraclar.Controls.Add(this.dgvAraclar);
            this.grpAraclar.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpAraclar.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.grpAraclar.Location = new System.Drawing.Point(16, 226);
            this.grpAraclar.Name = "grpAraclar";
            this.grpAraclar.Size = new System.Drawing.Size(640, 330);
            this.grpAraclar.TabIndex = 3;
            this.grpAraclar.TabStop = false;
            this.grpAraclar.Text = "Bugün Araç Performansı";
            // 
            // dgvAraclar
            // 
            this.dgvAraclar.AllowUserToAddRows = false;
            this.dgvAraclar.AllowUserToDeleteRows = false;
            this.dgvAraclar.BackgroundColor = System.Drawing.Color.White;
            this.dgvAraclar.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvAraclar.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvAraclar.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvAraclar.Location = new System.Drawing.Point(3, 21);
            this.dgvAraclar.MultiSelect = false;
            this.dgvAraclar.Name = "dgvAraclar";
            this.dgvAraclar.ReadOnly = true;
            this.dgvAraclar.RowHeadersVisible = false;
            this.dgvAraclar.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvAraclar.Size = new System.Drawing.Size(634, 306);
            this.dgvAraclar.TabIndex = 0;
            // 
            // grpUrunler
            // 
            this.grpUrunler.Controls.Add(this.dgvUrunler);
            this.grpUrunler.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpUrunler.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.grpUrunler.Location = new System.Drawing.Point(668, 226);
            this.grpUrunler.Name = "grpUrunler";
            this.grpUrunler.Size = new System.Drawing.Size(416, 330);
            this.grpUrunler.TabIndex = 4;
            this.grpUrunler.TabStop = false;
            this.grpUrunler.Text = "En Çok Satan Ürünler";
            // 
            // dgvUrunler
            // 
            this.dgvUrunler.AllowUserToAddRows = false;
            this.dgvUrunler.AllowUserToDeleteRows = false;
            this.dgvUrunler.BackgroundColor = System.Drawing.Color.White;
            this.dgvUrunler.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvUrunler.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvUrunler.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvUrunler.Location = new System.Drawing.Point(3, 21);
            this.dgvUrunler.MultiSelect = false;
            this.dgvUrunler.Name = "dgvUrunler";
            this.dgvUrunler.ReadOnly = true;
            this.dgvUrunler.RowHeadersVisible = false;
            this.dgvUrunler.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvUrunler.Size = new System.Drawing.Size(410, 306);
            this.dgvUrunler.TabIndex = 0;
            // 
            // lblDurum
            // 
            this.lblDurum.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.lblDurum.ForeColor = System.Drawing.Color.FromArgb(107, 122, 140);
            this.lblDurum.Location = new System.Drawing.Point(0, 549);
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Padding = new System.Windows.Forms.Padding(16, 0, 0, 0);
            this.lblDurum.Size = new System.Drawing.Size(1100, 22);
            this.lblDurum.TabIndex = 5;
            // 
            // MainForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(242, 245, 248);
            this.ClientSize = new System.Drawing.Size(1100, 571);
            this.Controls.Add(this.grpUrunler);
            this.Controls.Add(this.grpAraclar);
            this.Controls.Add(this.grpOzet);
            this.Controls.Add(this.pnlMenu);
            this.Controls.Add(this.pnlUst);
            this.Controls.Add(this.lblDurum);
            this.MinimumSize = new System.Drawing.Size(1000, 560);
            this.Name = "MainForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Depo Yönetimi";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.Load += new System.EventHandler(this.MainForm_Load);
            this.pnlUst.ResumeLayout(false);
            this.pnlMenu.ResumeLayout(false);
            this.grpOzet.ResumeLayout(false);
            this.grpAraclar.ResumeLayout(false);
            this.grpUrunler.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblBaslik;
        private System.Windows.Forms.Label lblKullanici;
        private System.Windows.Forms.Button btnYenile;
        private System.Windows.Forms.Panel pnlMenu;
        private System.Windows.Forms.Button btnStok;
        private System.Windows.Forms.Button btnYukleme;
        private System.Windows.Forms.Button btnAraclar;
        private System.Windows.Forms.Button btnFaturalar;
        private System.Windows.Forms.Button btnGunSonu;
        private System.Windows.Forms.GroupBox grpOzet;
        private System.Windows.Forms.Label lblBugunFatura;
        private System.Windows.Forms.Label lblBugunCiro;
        private System.Windows.Forms.Label lblAyCiro;
        private System.Windows.Forms.Label lblAcikBakiye;
        private System.Windows.Forms.Label lblKritikStok;
        private System.Windows.Forms.GroupBox grpAraclar;
        private System.Windows.Forms.DataGridView dgvAraclar;
        private System.Windows.Forms.GroupBox grpUrunler;
        private System.Windows.Forms.DataGridView dgvUrunler;
        private System.Windows.Forms.Label lblDurum;
    }
}
