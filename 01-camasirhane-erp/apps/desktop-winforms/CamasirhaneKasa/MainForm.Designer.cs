namespace CamasirhaneKasa
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Tasarımcısı tarafından oluşturulan kod

        private void InitializeComponent()
        {
            this.menuStrip = new System.Windows.Forms.MenuStrip();
            this.mnuSiparis = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuYeniSiparis = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuAyrac = new System.Windows.Forms.ToolStripSeparator();
            this.mnuCikis = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuIslemler = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuBarkod = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuRaporlar = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuGunSonu = new System.Windows.Forms.ToolStripMenuItem();
            this.btnYeniSiparis = new System.Windows.Forms.Button();
            this.btnBarkod = new System.Windows.Forms.Button();
            this.btnRapor = new System.Windows.Forms.Button();
            this.btnYenile = new System.Windows.Forms.Button();
            this.lblListeBaslik = new System.Windows.Forms.Label();
            this.dgvBugun = new System.Windows.Forms.DataGridView();
            this.colSiparisNo = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colMusteri = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colTutar = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colOdenen = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colDurum = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.statusStrip = new System.Windows.Forms.StatusStrip();
            this.lblDurum = new System.Windows.Forms.ToolStripStatusLabel();
            ((System.ComponentModel.ISupportInitialize)(this.dgvBugun)).BeginInit();
            this.menuStrip.SuspendLayout();
            this.statusStrip.SuspendLayout();
            this.SuspendLayout();
            // 
            // menuStrip
            // 
            this.menuStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuSiparis,
            this.mnuIslemler,
            this.mnuRaporlar});
            this.menuStrip.Location = new System.Drawing.Point(0, 0);
            this.menuStrip.Name = "menuStrip";
            this.menuStrip.Size = new System.Drawing.Size(984, 24);
            this.menuStrip.TabIndex = 0;
            // 
            // mnuSiparis
            // 
            this.mnuSiparis.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuYeniSiparis,
            this.mnuAyrac,
            this.mnuCikis});
            this.mnuSiparis.Name = "mnuSiparis";
            this.mnuSiparis.Size = new System.Drawing.Size(60, 20);
            this.mnuSiparis.Text = "Sipariş";
            // 
            // mnuYeniSiparis
            // 
            this.mnuYeniSiparis.Name = "mnuYeniSiparis";
            this.mnuYeniSiparis.Size = new System.Drawing.Size(150, 22);
            this.mnuYeniSiparis.Text = "Yeni Sipariş";
            this.mnuYeniSiparis.Click += new System.EventHandler(this.mnuYeniSiparis_Click);
            // 
            // mnuAyrac
            // 
            this.mnuAyrac.Name = "mnuAyrac";
            this.mnuAyrac.Size = new System.Drawing.Size(147, 6);
            // 
            // mnuCikis
            // 
            this.mnuCikis.Name = "mnuCikis";
            this.mnuCikis.Size = new System.Drawing.Size(150, 22);
            this.mnuCikis.Text = "Çıkış";
            this.mnuCikis.Click += new System.EventHandler(this.mnuCikis_Click);
            // 
            // mnuIslemler
            // 
            this.mnuIslemler.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuBarkod});
            this.mnuIslemler.Name = "mnuIslemler";
            this.mnuIslemler.Size = new System.Drawing.Size(65, 20);
            this.mnuIslemler.Text = "İşlemler";
            // 
            // mnuBarkod
            // 
            this.mnuBarkod.Name = "mnuBarkod";
            this.mnuBarkod.Size = new System.Drawing.Size(230, 22);
            this.mnuBarkod.Text = "Barkod ile Aşama Güncelle";
            this.mnuBarkod.Click += new System.EventHandler(this.mnuBarkod_Click);
            // 
            // mnuRaporlar
            // 
            this.mnuRaporlar.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuGunSonu});
            this.mnuRaporlar.Name = "mnuRaporlar";
            this.mnuRaporlar.Size = new System.Drawing.Size(66, 20);
            this.mnuRaporlar.Text = "Raporlar";
            // 
            // mnuGunSonu
            // 
            this.mnuGunSonu.Name = "mnuGunSonu";
            this.mnuGunSonu.Size = new System.Drawing.Size(180, 22);
            this.mnuGunSonu.Text = "Gün Sonu Raporu";
            this.mnuGunSonu.Click += new System.EventHandler(this.mnuGunSonu_Click);
            // 
            // btnYeniSiparis
            // 
            this.btnYeniSiparis.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnYeniSiparis.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYeniSiparis.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnYeniSiparis.ForeColor = System.Drawing.Color.White;
            this.btnYeniSiparis.Location = new System.Drawing.Point(20, 40);
            this.btnYeniSiparis.Name = "btnYeniSiparis";
            this.btnYeniSiparis.Size = new System.Drawing.Size(210, 60);
            this.btnYeniSiparis.TabIndex = 1;
            this.btnYeniSiparis.Text = "Yeni Sipariş";
            this.btnYeniSiparis.UseVisualStyleBackColor = false;
            this.btnYeniSiparis.Click += new System.EventHandler(this.mnuYeniSiparis_Click);
            // 
            // btnBarkod
            // 
            this.btnBarkod.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnBarkod.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnBarkod.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnBarkod.ForeColor = System.Drawing.Color.White;
            this.btnBarkod.Location = new System.Drawing.Point(250, 40);
            this.btnBarkod.Name = "btnBarkod";
            this.btnBarkod.Size = new System.Drawing.Size(210, 60);
            this.btnBarkod.TabIndex = 2;
            this.btnBarkod.Text = "Barkod Okut";
            this.btnBarkod.UseVisualStyleBackColor = false;
            this.btnBarkod.Click += new System.EventHandler(this.mnuBarkod_Click);
            // 
            // btnRapor
            // 
            this.btnRapor.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnRapor.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnRapor.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnRapor.ForeColor = System.Drawing.Color.White;
            this.btnRapor.Location = new System.Drawing.Point(480, 40);
            this.btnRapor.Name = "btnRapor";
            this.btnRapor.Size = new System.Drawing.Size(210, 60);
            this.btnRapor.TabIndex = 3;
            this.btnRapor.Text = "Gün Sonu Raporu";
            this.btnRapor.UseVisualStyleBackColor = false;
            this.btnRapor.Click += new System.EventHandler(this.mnuGunSonu_Click);
            // 
            // btnYenile
            // 
            this.btnYenile.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnYenile.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYenile.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnYenile.ForeColor = System.Drawing.Color.White;
            this.btnYenile.Location = new System.Drawing.Point(710, 40);
            this.btnYenile.Name = "btnYenile";
            this.btnYenile.Size = new System.Drawing.Size(210, 60);
            this.btnYenile.TabIndex = 4;
            this.btnYenile.Text = "Listeyi Yenile";
            this.btnYenile.UseVisualStyleBackColor = false;
            this.btnYenile.Click += new System.EventHandler(this.btnYenile_Click);
            // 
            // lblListeBaslik
            // 
            this.lblListeBaslik.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblListeBaslik.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblListeBaslik.Location = new System.Drawing.Point(20, 115);
            this.lblListeBaslik.Name = "lblListeBaslik";
            this.lblListeBaslik.Size = new System.Drawing.Size(300, 24);
            this.lblListeBaslik.TabIndex = 5;
            this.lblListeBaslik.Text = "Bugünkü Siparişler";
            // 
            // dgvBugun
            // 
            this.dgvBugun.AllowUserToAddRows = false;
            this.dgvBugun.AllowUserToDeleteRows = false;
            this.dgvBugun.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left)
            | System.Windows.Forms.AnchorStyles.Right)));
            this.dgvBugun.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvBugun.BackgroundColor = System.Drawing.Color.White;
            this.dgvBugun.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvBugun.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colSiparisNo,
            this.colMusteri,
            this.colTutar,
            this.colOdenen,
            this.colDurum});
            this.dgvBugun.Location = new System.Drawing.Point(20, 145);
            this.dgvBugun.Name = "dgvBugun";
            this.dgvBugun.ReadOnly = true;
            this.dgvBugun.RowHeadersVisible = false;
            this.dgvBugun.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvBugun.Size = new System.Drawing.Size(940, 400);
            this.dgvBugun.TabIndex = 6;
            // 
            // colSiparisNo
            // 
            this.colSiparisNo.HeaderText = "Sipariş No";
            this.colSiparisNo.Name = "colSiparisNo";
            this.colSiparisNo.ReadOnly = true;
            // 
            // colMusteri
            // 
            this.colMusteri.HeaderText = "Müşteri";
            this.colMusteri.Name = "colMusteri";
            this.colMusteri.ReadOnly = true;
            // 
            // colTutar
            // 
            this.colTutar.HeaderText = "Tutar";
            this.colTutar.Name = "colTutar";
            this.colTutar.ReadOnly = true;
            // 
            // colOdenen
            // 
            this.colOdenen.HeaderText = "Ödenen";
            this.colOdenen.Name = "colOdenen";
            this.colOdenen.ReadOnly = true;
            // 
            // colDurum
            // 
            this.colDurum.HeaderText = "Durum";
            this.colDurum.Name = "colDurum";
            this.colDurum.ReadOnly = true;
            // 
            // statusStrip
            // 
            this.statusStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.lblDurum});
            this.statusStrip.Location = new System.Drawing.Point(0, 589);
            this.statusStrip.Name = "statusStrip";
            this.statusStrip.Size = new System.Drawing.Size(984, 22);
            this.statusStrip.TabIndex = 7;
            // 
            // lblDurum
            // 
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Size = new System.Drawing.Size(0, 17);
            // 
            // MainForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(244, 246, 248);
            this.ClientSize = new System.Drawing.Size(984, 611);
            this.Controls.Add(this.statusStrip);
            this.Controls.Add(this.dgvBugun);
            this.Controls.Add(this.lblListeBaslik);
            this.Controls.Add(this.btnYenile);
            this.Controls.Add(this.btnRapor);
            this.Controls.Add(this.btnBarkod);
            this.Controls.Add(this.btnYeniSiparis);
            this.Controls.Add(this.menuStrip);
            this.MainMenuStrip = this.menuStrip;
            this.Name = "MainForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Çamaşırhane Kasa";
            this.Load += new System.EventHandler(this.MainForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dgvBugun)).EndInit();
            this.menuStrip.ResumeLayout(false);
            this.menuStrip.PerformLayout();
            this.statusStrip.ResumeLayout(false);
            this.statusStrip.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.MenuStrip menuStrip;
        private System.Windows.Forms.ToolStripMenuItem mnuSiparis;
        private System.Windows.Forms.ToolStripMenuItem mnuYeniSiparis;
        private System.Windows.Forms.ToolStripSeparator mnuAyrac;
        private System.Windows.Forms.ToolStripMenuItem mnuCikis;
        private System.Windows.Forms.ToolStripMenuItem mnuIslemler;
        private System.Windows.Forms.ToolStripMenuItem mnuBarkod;
        private System.Windows.Forms.ToolStripMenuItem mnuRaporlar;
        private System.Windows.Forms.ToolStripMenuItem mnuGunSonu;
        private System.Windows.Forms.Button btnYeniSiparis;
        private System.Windows.Forms.Button btnBarkod;
        private System.Windows.Forms.Button btnRapor;
        private System.Windows.Forms.Button btnYenile;
        private System.Windows.Forms.Label lblListeBaslik;
        private System.Windows.Forms.DataGridView dgvBugun;
        private System.Windows.Forms.DataGridViewTextBoxColumn colSiparisNo;
        private System.Windows.Forms.DataGridViewTextBoxColumn colMusteri;
        private System.Windows.Forms.DataGridViewTextBoxColumn colTutar;
        private System.Windows.Forms.DataGridViewTextBoxColumn colOdenen;
        private System.Windows.Forms.DataGridViewTextBoxColumn colDurum;
        private System.Windows.Forms.StatusStrip statusStrip;
        private System.Windows.Forms.ToolStripStatusLabel lblDurum;
    }
}
