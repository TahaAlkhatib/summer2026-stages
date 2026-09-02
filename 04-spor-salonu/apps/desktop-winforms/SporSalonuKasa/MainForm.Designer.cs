namespace SporSalonuKasa
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
            this.menuStrip = new System.Windows.Forms.MenuStrip();
            this.mnuIslemler = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuTurnike = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuUyeler = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuBufe = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuAyrac = new System.Windows.Forms.ToolStripSeparator();
            this.mnuCikis = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuRaporlar = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuGunSonu = new System.Windows.Forms.ToolStripMenuItem();
            this.btnTurnike = new System.Windows.Forms.Button();
            this.btnUyeler = new System.Windows.Forms.Button();
            this.btnBufe = new System.Windows.Forms.Button();
            this.btnRapor = new System.Windows.Forms.Button();
            this.grpOzet = new System.Windows.Forms.GroupBox();
            this.lblEtUye = new System.Windows.Forms.Label();
            this.lblUyeSayisi = new System.Windows.Forms.Label();
            this.lblEtGiris = new System.Windows.Forms.Label();
            this.lblBugunGiris = new System.Windows.Forms.Label();
            this.lblEtRed = new System.Windows.Forms.Label();
            this.lblBugunRed = new System.Windows.Forms.Label();
            this.lblEtBorc = new System.Windows.Forms.Label();
            this.lblBorc = new System.Windows.Forms.Label();
            this.lblBitecekEtiket = new System.Windows.Forms.Label();
            this.dgvBitecek = new System.Windows.Forms.DataGridView();
            this.colUye = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colTelefon = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colPaket = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colBitis = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.statusStrip = new System.Windows.Forms.StatusStrip();
            this.lblDurum = new System.Windows.Forms.ToolStripStatusLabel();
            this.menuStrip.SuspendLayout();
            this.grpOzet.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvBitecek)).BeginInit();
            this.statusStrip.SuspendLayout();
            this.SuspendLayout();
            // 
            // menuStrip
            // 
            this.menuStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuIslemler, this.mnuRaporlar});
            this.menuStrip.Location = new System.Drawing.Point(0, 0);
            this.menuStrip.Name = "menuStrip";
            this.menuStrip.Size = new System.Drawing.Size(984, 24);
            this.menuStrip.TabIndex = 0;
            // 
            // mnuIslemler
            // 
            this.mnuIslemler.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuTurnike, this.mnuUyeler, this.mnuBufe, this.mnuAyrac, this.mnuCikis});
            this.mnuIslemler.Name = "mnuIslemler";
            this.mnuIslemler.Size = new System.Drawing.Size(65, 20);
            this.mnuIslemler.Text = "İşlemler";
            // 
            // mnuTurnike
            // 
            this.mnuTurnike.Name = "mnuTurnike";
            this.mnuTurnike.Size = new System.Drawing.Size(180, 22);
            this.mnuTurnike.Text = "Turnike Kontrol";
            this.mnuTurnike.Click += new System.EventHandler(this.mnuTurnike_Click);
            // 
            // mnuUyeler
            // 
            this.mnuUyeler.Name = "mnuUyeler";
            this.mnuUyeler.Size = new System.Drawing.Size(180, 22);
            this.mnuUyeler.Text = "Üyeler";
            this.mnuUyeler.Click += new System.EventHandler(this.mnuUyeler_Click);
            // 
            // mnuBufe
            // 
            this.mnuBufe.Name = "mnuBufe";
            this.mnuBufe.Size = new System.Drawing.Size(180, 22);
            this.mnuBufe.Text = "Büfe / Kasa";
            this.mnuBufe.Click += new System.EventHandler(this.mnuBufe_Click);
            // 
            // mnuAyrac
            // 
            this.mnuAyrac.Name = "mnuAyrac";
            this.mnuAyrac.Size = new System.Drawing.Size(177, 6);
            // 
            // mnuCikis
            // 
            this.mnuCikis.Name = "mnuCikis";
            this.mnuCikis.Size = new System.Drawing.Size(180, 22);
            this.mnuCikis.Text = "Çıkış";
            this.mnuCikis.Click += new System.EventHandler(this.mnuCikis_Click);
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
            // btnTurnike
            // 
            this.btnTurnike.BackColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnTurnike.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnTurnike.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.btnTurnike.ForeColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.btnTurnike.Location = new System.Drawing.Point(20, 40);
            this.btnTurnike.Name = "btnTurnike";
            this.btnTurnike.Size = new System.Drawing.Size(220, 70);
            this.btnTurnike.TabIndex = 1;
            this.btnTurnike.Text = "TURNİKE KONTROL";
            this.btnTurnike.UseVisualStyleBackColor = false;
            this.btnTurnike.Click += new System.EventHandler(this.mnuTurnike_Click);
            // 
            // btnUyeler
            // 
            this.btnUyeler.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnUyeler.Font = new System.Drawing.Font("Segoe UI", 11F);
            this.btnUyeler.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.btnUyeler.Location = new System.Drawing.Point(255, 40);
            this.btnUyeler.Name = "btnUyeler";
            this.btnUyeler.Size = new System.Drawing.Size(220, 70);
            this.btnUyeler.TabIndex = 2;
            this.btnUyeler.Text = "Üyeler ve Paket Satışı";
            this.btnUyeler.UseVisualStyleBackColor = true;
            this.btnUyeler.Click += new System.EventHandler(this.mnuUyeler_Click);
            // 
            // btnBufe
            // 
            this.btnBufe.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnBufe.Font = new System.Drawing.Font("Segoe UI", 11F);
            this.btnBufe.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.btnBufe.Location = new System.Drawing.Point(490, 40);
            this.btnBufe.Name = "btnBufe";
            this.btnBufe.Size = new System.Drawing.Size(220, 70);
            this.btnBufe.TabIndex = 3;
            this.btnBufe.Text = "Büfe / Kasa Satışı";
            this.btnBufe.UseVisualStyleBackColor = true;
            this.btnBufe.Click += new System.EventHandler(this.mnuBufe_Click);
            // 
            // btnRapor
            // 
            this.btnRapor.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnRapor.Font = new System.Drawing.Font("Segoe UI", 11F);
            this.btnRapor.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.btnRapor.Location = new System.Drawing.Point(725, 40);
            this.btnRapor.Name = "btnRapor";
            this.btnRapor.Size = new System.Drawing.Size(220, 70);
            this.btnRapor.TabIndex = 4;
            this.btnRapor.Text = "Gün Sonu Raporu";
            this.btnRapor.UseVisualStyleBackColor = true;
            this.btnRapor.Click += new System.EventHandler(this.mnuGunSonu_Click);
            // 
            // grpOzet
            // 
            this.grpOzet.Controls.Add(this.lblBorc);
            this.grpOzet.Controls.Add(this.lblEtBorc);
            this.grpOzet.Controls.Add(this.lblBugunRed);
            this.grpOzet.Controls.Add(this.lblEtRed);
            this.grpOzet.Controls.Add(this.lblBugunGiris);
            this.grpOzet.Controls.Add(this.lblEtGiris);
            this.grpOzet.Controls.Add(this.lblUyeSayisi);
            this.grpOzet.Controls.Add(this.lblEtUye);
            this.grpOzet.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.grpOzet.Location = new System.Drawing.Point(20, 125);
            this.grpOzet.Name = "grpOzet";
            this.grpOzet.Size = new System.Drawing.Size(925, 100);
            this.grpOzet.TabIndex = 5;
            this.grpOzet.TabStop = false;
            this.grpOzet.Text = "Bugün";
            // 
            // lblEtUye
            // 
            this.lblEtUye.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblEtUye.Location = new System.Drawing.Point(20, 28);
            this.lblEtUye.Name = "lblEtUye";
            this.lblEtUye.Size = new System.Drawing.Size(200, 20);
            this.lblEtUye.TabIndex = 0;
            this.lblEtUye.Text = "Aktif Üye";
            // 
            // lblUyeSayisi
            // 
            this.lblUyeSayisi.Font = new System.Drawing.Font("Segoe UI", 18F, System.Drawing.FontStyle.Bold);
            this.lblUyeSayisi.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblUyeSayisi.Location = new System.Drawing.Point(20, 50);
            this.lblUyeSayisi.Name = "lblUyeSayisi";
            this.lblUyeSayisi.Size = new System.Drawing.Size(200, 36);
            this.lblUyeSayisi.TabIndex = 1;
            this.lblUyeSayisi.Text = "-";
            // 
            // lblEtGiris
            // 
            this.lblEtGiris.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblEtGiris.Location = new System.Drawing.Point(250, 28);
            this.lblEtGiris.Name = "lblEtGiris";
            this.lblEtGiris.Size = new System.Drawing.Size(200, 20);
            this.lblEtGiris.TabIndex = 2;
            this.lblEtGiris.Text = "Bugünkü Giriş";
            // 
            // lblBugunGiris
            // 
            this.lblBugunGiris.Font = new System.Drawing.Font("Segoe UI", 18F, System.Drawing.FontStyle.Bold);
            this.lblBugunGiris.ForeColor = System.Drawing.Color.FromArgb(74, 222, 128);
            this.lblBugunGiris.Location = new System.Drawing.Point(250, 50);
            this.lblBugunGiris.Name = "lblBugunGiris";
            this.lblBugunGiris.Size = new System.Drawing.Size(200, 36);
            this.lblBugunGiris.TabIndex = 3;
            this.lblBugunGiris.Text = "-";
            // 
            // lblEtRed
            // 
            this.lblEtRed.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblEtRed.Location = new System.Drawing.Point(480, 28);
            this.lblEtRed.Name = "lblEtRed";
            this.lblEtRed.Size = new System.Drawing.Size(200, 20);
            this.lblEtRed.TabIndex = 4;
            this.lblEtRed.Text = "Reddedilen Giriş";
            // 
            // lblBugunRed
            // 
            this.lblBugunRed.Font = new System.Drawing.Font("Segoe UI", 18F, System.Drawing.FontStyle.Bold);
            this.lblBugunRed.ForeColor = System.Drawing.Color.FromArgb(248, 113, 113);
            this.lblBugunRed.Location = new System.Drawing.Point(480, 50);
            this.lblBugunRed.Name = "lblBugunRed";
            this.lblBugunRed.Size = new System.Drawing.Size(200, 36);
            this.lblBugunRed.TabIndex = 5;
            this.lblBugunRed.Text = "-";
            // 
            // lblEtBorc
            // 
            this.lblEtBorc.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblEtBorc.Location = new System.Drawing.Point(710, 28);
            this.lblEtBorc.Name = "lblEtBorc";
            this.lblEtBorc.Size = new System.Drawing.Size(200, 20);
            this.lblEtBorc.TabIndex = 6;
            this.lblEtBorc.Text = "Tahsil Edilmemiş";
            // 
            // lblBorc
            // 
            this.lblBorc.Font = new System.Drawing.Font("Segoe UI", 15F, System.Drawing.FontStyle.Bold);
            this.lblBorc.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblBorc.Location = new System.Drawing.Point(710, 52);
            this.lblBorc.Name = "lblBorc";
            this.lblBorc.Size = new System.Drawing.Size(200, 32);
            this.lblBorc.TabIndex = 7;
            this.lblBorc.Text = "-";
            // 
            // lblBitecekEtiket
            // 
            this.lblBitecekEtiket.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblBitecekEtiket.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblBitecekEtiket.Location = new System.Drawing.Point(20, 240);
            this.lblBitecekEtiket.Name = "lblBitecekEtiket";
            this.lblBitecekEtiket.Size = new System.Drawing.Size(400, 24);
            this.lblBitecekEtiket.TabIndex = 6;
            this.lblBitecekEtiket.Text = "Yakında Bitecek Üyelikler (7 gün)";
            // 
            // dgvBitecek
            // 
            this.dgvBitecek.AllowUserToAddRows = false;
            this.dgvBitecek.AllowUserToDeleteRows = false;
            this.dgvBitecek.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left) | System.Windows.Forms.AnchorStyles.Right)));
            this.dgvBitecek.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvBitecek.BackgroundColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.dgvBitecek.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvBitecek.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colUye, this.colTelefon, this.colPaket, this.colBitis});
            this.dgvBitecek.Location = new System.Drawing.Point(20, 268);
            this.dgvBitecek.Name = "dgvBitecek";
            this.dgvBitecek.ReadOnly = true;
            this.dgvBitecek.RowHeadersVisible = false;
            this.dgvBitecek.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvBitecek.Size = new System.Drawing.Size(925, 280);
            this.dgvBitecek.TabIndex = 7;
            // 
            // colUye
            // 
            this.colUye.HeaderText = "Üye";
            this.colUye.Name = "colUye";
            this.colUye.ReadOnly = true;
            // 
            // colTelefon
            // 
            this.colTelefon.HeaderText = "Telefon";
            this.colTelefon.Name = "colTelefon";
            this.colTelefon.ReadOnly = true;
            // 
            // colPaket
            // 
            this.colPaket.HeaderText = "Paket";
            this.colPaket.Name = "colPaket";
            this.colPaket.ReadOnly = true;
            // 
            // colBitis
            // 
            this.colBitis.HeaderText = "Bitiş Tarihi";
            this.colBitis.Name = "colBitis";
            this.colBitis.ReadOnly = true;
            // 
            // statusStrip
            // 
            this.statusStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.lblDurum});
            this.statusStrip.Location = new System.Drawing.Point(0, 589);
            this.statusStrip.Name = "statusStrip";
            this.statusStrip.Size = new System.Drawing.Size(984, 22);
            this.statusStrip.TabIndex = 8;
            // 
            // lblDurum
            // 
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Size = new System.Drawing.Size(0, 17);
            // 
            // MainForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.ClientSize = new System.Drawing.Size(984, 611);
            this.Controls.Add(this.statusStrip);
            this.Controls.Add(this.dgvBitecek);
            this.Controls.Add(this.lblBitecekEtiket);
            this.Controls.Add(this.grpOzet);
            this.Controls.Add(this.btnRapor);
            this.Controls.Add(this.btnBufe);
            this.Controls.Add(this.btnUyeler);
            this.Controls.Add(this.btnTurnike);
            this.Controls.Add(this.menuStrip);
            this.MainMenuStrip = this.menuStrip;
            this.Name = "MainForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Spor Salonu Kasa";
            this.Load += new System.EventHandler(this.MainForm_Load);
            this.menuStrip.ResumeLayout(false);
            this.menuStrip.PerformLayout();
            this.grpOzet.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.dgvBitecek)).EndInit();
            this.statusStrip.ResumeLayout(false);
            this.statusStrip.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.MenuStrip menuStrip;
        private System.Windows.Forms.ToolStripMenuItem mnuIslemler;
        private System.Windows.Forms.ToolStripMenuItem mnuTurnike;
        private System.Windows.Forms.ToolStripMenuItem mnuUyeler;
        private System.Windows.Forms.ToolStripMenuItem mnuBufe;
        private System.Windows.Forms.ToolStripSeparator mnuAyrac;
        private System.Windows.Forms.ToolStripMenuItem mnuCikis;
        private System.Windows.Forms.ToolStripMenuItem mnuRaporlar;
        private System.Windows.Forms.ToolStripMenuItem mnuGunSonu;
        private System.Windows.Forms.Button btnTurnike;
        private System.Windows.Forms.Button btnUyeler;
        private System.Windows.Forms.Button btnBufe;
        private System.Windows.Forms.Button btnRapor;
        private System.Windows.Forms.GroupBox grpOzet;
        private System.Windows.Forms.Label lblEtUye;
        private System.Windows.Forms.Label lblUyeSayisi;
        private System.Windows.Forms.Label lblEtGiris;
        private System.Windows.Forms.Label lblBugunGiris;
        private System.Windows.Forms.Label lblEtRed;
        private System.Windows.Forms.Label lblBugunRed;
        private System.Windows.Forms.Label lblEtBorc;
        private System.Windows.Forms.Label lblBorc;
        private System.Windows.Forms.Label lblBitecekEtiket;
        private System.Windows.Forms.DataGridView dgvBitecek;
        private System.Windows.Forms.DataGridViewTextBoxColumn colUye;
        private System.Windows.Forms.DataGridViewTextBoxColumn colTelefon;
        private System.Windows.Forms.DataGridViewTextBoxColumn colPaket;
        private System.Windows.Forms.DataGridViewTextBoxColumn colBitis;
        private System.Windows.Forms.StatusStrip statusStrip;
        private System.Windows.Forms.ToolStripStatusLabel lblDurum;
    }
}
