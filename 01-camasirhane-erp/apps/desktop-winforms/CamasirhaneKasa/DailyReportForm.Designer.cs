namespace CamasirhaneKasa
{
    partial class DailyReportForm
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
            this.lblEtTarih = new System.Windows.Forms.Label();
            this.dtpTarih = new System.Windows.Forms.DateTimePicker();
            this.btnGetir = new System.Windows.Forms.Button();
            this.btnYazdir = new System.Windows.Forms.Button();
            this.pnlSiparisAdedi = new System.Windows.Forms.Panel();
            this.lblSiparisAdedi = new System.Windows.Forms.Label();
            this.lblEtSiparisAdedi = new System.Windows.Forms.Label();
            this.pnlCiro = new System.Windows.Forms.Panel();
            this.lblCiro = new System.Windows.Forms.Label();
            this.lblEtCiro = new System.Windows.Forms.Label();
            this.pnlTeslim = new System.Windows.Forms.Panel();
            this.lblTeslim = new System.Windows.Forms.Label();
            this.lblEtTeslim = new System.Windows.Forms.Label();
            this.pnlKasa = new System.Windows.Forms.Panel();
            this.lblKasa = new System.Windows.Forms.Label();
            this.lblEtKasa = new System.Windows.Forms.Label();
            this.grpTahsilat = new System.Windows.Forms.GroupBox();
            this.lblEtNakit = new System.Windows.Forms.Label();
            this.lblNakit = new System.Windows.Forms.Label();
            this.lblEtKart = new System.Windows.Forms.Label();
            this.lblKart = new System.Windows.Forms.Label();
            this.lblEtHavale = new System.Windows.Forms.Label();
            this.lblHavale = new System.Windows.Forms.Label();
            this.lblListeBaslik = new System.Windows.Forms.Label();
            this.dgvSiparisler = new System.Windows.Forms.DataGridView();
            this.colSiparisNo = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colMusteri = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colTutar = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colOdenen = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colDurum = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.belge = new System.Drawing.Printing.PrintDocument();
            this.pnlSiparisAdedi.SuspendLayout();
            this.pnlCiro.SuspendLayout();
            this.pnlTeslim.SuspendLayout();
            this.pnlKasa.SuspendLayout();
            this.grpTahsilat.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvSiparisler)).BeginInit();
            this.SuspendLayout();
            // 
            // lblEtTarih
            // 
            this.lblEtTarih.Location = new System.Drawing.Point(20, 15);
            this.lblEtTarih.Name = "lblEtTarih";
            this.lblEtTarih.Size = new System.Drawing.Size(60, 20);
            this.lblEtTarih.TabIndex = 0;
            this.lblEtTarih.Text = "Tarih";
            // 
            // dtpTarih
            // 
            this.dtpTarih.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpTarih.Location = new System.Drawing.Point(20, 37);
            this.dtpTarih.Name = "dtpTarih";
            this.dtpTarih.Size = new System.Drawing.Size(180, 23);
            this.dtpTarih.TabIndex = 1;
            // 
            // btnGetir
            // 
            this.btnGetir.Location = new System.Drawing.Point(210, 36);
            this.btnGetir.Name = "btnGetir";
            this.btnGetir.Size = new System.Drawing.Size(100, 28);
            this.btnGetir.TabIndex = 2;
            this.btnGetir.Text = "Getir";
            this.btnGetir.UseVisualStyleBackColor = true;
            this.btnGetir.Click += new System.EventHandler(this.btnGetir_Click);
            // 
            // btnYazdir
            // 
            this.btnYazdir.Location = new System.Drawing.Point(320, 36);
            this.btnYazdir.Name = "btnYazdir";
            this.btnYazdir.Size = new System.Drawing.Size(100, 28);
            this.btnYazdir.TabIndex = 3;
            this.btnYazdir.Text = "Yazdır";
            this.btnYazdir.UseVisualStyleBackColor = true;
            this.btnYazdir.Click += new System.EventHandler(this.btnYazdir_Click);
            // 
            // pnlSiparisAdedi
            // 
            this.pnlSiparisAdedi.BackColor = System.Drawing.Color.White;
            this.pnlSiparisAdedi.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pnlSiparisAdedi.Controls.Add(this.lblSiparisAdedi);
            this.pnlSiparisAdedi.Controls.Add(this.lblEtSiparisAdedi);
            this.pnlSiparisAdedi.Location = new System.Drawing.Point(20, 85);
            this.pnlSiparisAdedi.Name = "pnlSiparisAdedi";
            this.pnlSiparisAdedi.Size = new System.Drawing.Size(200, 80);
            this.pnlSiparisAdedi.TabIndex = 4;
            // 
            // lblEtSiparisAdedi
            // 
            this.lblEtSiparisAdedi.ForeColor = System.Drawing.Color.Gray;
            this.lblEtSiparisAdedi.Location = new System.Drawing.Point(12, 10);
            this.lblEtSiparisAdedi.Name = "lblEtSiparisAdedi";
            this.lblEtSiparisAdedi.Size = new System.Drawing.Size(180, 20);
            this.lblEtSiparisAdedi.TabIndex = 0;
            this.lblEtSiparisAdedi.Text = "Sipariş Adedi";
            // 
            // lblSiparisAdedi
            // 
            this.lblSiparisAdedi.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblSiparisAdedi.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblSiparisAdedi.Location = new System.Drawing.Point(12, 35);
            this.lblSiparisAdedi.Name = "lblSiparisAdedi";
            this.lblSiparisAdedi.Size = new System.Drawing.Size(180, 32);
            this.lblSiparisAdedi.TabIndex = 1;
            this.lblSiparisAdedi.Text = "-";
            // 
            // pnlCiro
            // 
            this.pnlCiro.BackColor = System.Drawing.Color.White;
            this.pnlCiro.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pnlCiro.Controls.Add(this.lblCiro);
            this.pnlCiro.Controls.Add(this.lblEtCiro);
            this.pnlCiro.Location = new System.Drawing.Point(230, 85);
            this.pnlCiro.Name = "pnlCiro";
            this.pnlCiro.Size = new System.Drawing.Size(200, 80);
            this.pnlCiro.TabIndex = 5;
            // 
            // lblEtCiro
            // 
            this.lblEtCiro.ForeColor = System.Drawing.Color.Gray;
            this.lblEtCiro.Location = new System.Drawing.Point(12, 10);
            this.lblEtCiro.Name = "lblEtCiro";
            this.lblEtCiro.Size = new System.Drawing.Size(180, 20);
            this.lblEtCiro.TabIndex = 0;
            this.lblEtCiro.Text = "Toplam Ciro";
            // 
            // lblCiro
            // 
            this.lblCiro.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblCiro.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblCiro.Location = new System.Drawing.Point(12, 35);
            this.lblCiro.Name = "lblCiro";
            this.lblCiro.Size = new System.Drawing.Size(180, 32);
            this.lblCiro.TabIndex = 1;
            this.lblCiro.Text = "-";
            // 
            // pnlTeslim
            // 
            this.pnlTeslim.BackColor = System.Drawing.Color.White;
            this.pnlTeslim.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pnlTeslim.Controls.Add(this.lblTeslim);
            this.pnlTeslim.Controls.Add(this.lblEtTeslim);
            this.pnlTeslim.Location = new System.Drawing.Point(440, 85);
            this.pnlTeslim.Name = "pnlTeslim";
            this.pnlTeslim.Size = new System.Drawing.Size(200, 80);
            this.pnlTeslim.TabIndex = 6;
            // 
            // lblEtTeslim
            // 
            this.lblEtTeslim.ForeColor = System.Drawing.Color.Gray;
            this.lblEtTeslim.Location = new System.Drawing.Point(12, 10);
            this.lblEtTeslim.Name = "lblEtTeslim";
            this.lblEtTeslim.Size = new System.Drawing.Size(180, 20);
            this.lblEtTeslim.TabIndex = 0;
            this.lblEtTeslim.Text = "Teslim Edilen";
            // 
            // lblTeslim
            // 
            this.lblTeslim.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblTeslim.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblTeslim.Location = new System.Drawing.Point(12, 35);
            this.lblTeslim.Name = "lblTeslim";
            this.lblTeslim.Size = new System.Drawing.Size(180, 32);
            this.lblTeslim.TabIndex = 1;
            this.lblTeslim.Text = "-";
            // 
            // pnlKasa
            // 
            this.pnlKasa.BackColor = System.Drawing.Color.White;
            this.pnlKasa.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pnlKasa.Controls.Add(this.lblKasa);
            this.pnlKasa.Controls.Add(this.lblEtKasa);
            this.pnlKasa.Location = new System.Drawing.Point(650, 85);
            this.pnlKasa.Name = "pnlKasa";
            this.pnlKasa.Size = new System.Drawing.Size(200, 80);
            this.pnlKasa.TabIndex = 7;
            // 
            // lblEtKasa
            // 
            this.lblEtKasa.ForeColor = System.Drawing.Color.Gray;
            this.lblEtKasa.Location = new System.Drawing.Point(12, 10);
            this.lblEtKasa.Name = "lblEtKasa";
            this.lblEtKasa.Size = new System.Drawing.Size(180, 20);
            this.lblEtKasa.TabIndex = 0;
            this.lblEtKasa.Text = "Kasa Toplamı";
            // 
            // lblKasa
            // 
            this.lblKasa.Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold);
            this.lblKasa.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblKasa.Location = new System.Drawing.Point(12, 35);
            this.lblKasa.Name = "lblKasa";
            this.lblKasa.Size = new System.Drawing.Size(180, 32);
            this.lblKasa.TabIndex = 1;
            this.lblKasa.Text = "-";
            // 
            // grpTahsilat
            // 
            this.grpTahsilat.BackColor = System.Drawing.Color.White;
            this.grpTahsilat.Controls.Add(this.lblHavale);
            this.grpTahsilat.Controls.Add(this.lblEtHavale);
            this.grpTahsilat.Controls.Add(this.lblKart);
            this.grpTahsilat.Controls.Add(this.lblEtKart);
            this.grpTahsilat.Controls.Add(this.lblNakit);
            this.grpTahsilat.Controls.Add(this.lblEtNakit);
            this.grpTahsilat.Location = new System.Drawing.Point(20, 185);
            this.grpTahsilat.Name = "grpTahsilat";
            this.grpTahsilat.Size = new System.Drawing.Size(830, 90);
            this.grpTahsilat.TabIndex = 8;
            this.grpTahsilat.TabStop = false;
            this.grpTahsilat.Text = "Tahsilat Dağılımı";
            // 
            // lblEtNakit
            // 
            this.lblEtNakit.ForeColor = System.Drawing.Color.Gray;
            this.lblEtNakit.Location = new System.Drawing.Point(20, 30);
            this.lblEtNakit.Name = "lblEtNakit";
            this.lblEtNakit.Size = new System.Drawing.Size(100, 20);
            this.lblEtNakit.TabIndex = 0;
            this.lblEtNakit.Text = "Nakit";
            // 
            // lblNakit
            // 
            this.lblNakit.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblNakit.Location = new System.Drawing.Point(20, 52);
            this.lblNakit.Name = "lblNakit";
            this.lblNakit.Size = new System.Drawing.Size(200, 24);
            this.lblNakit.TabIndex = 1;
            this.lblNakit.Text = "-";
            // 
            // lblEtKart
            // 
            this.lblEtKart.ForeColor = System.Drawing.Color.Gray;
            this.lblEtKart.Location = new System.Drawing.Point(290, 30);
            this.lblEtKart.Name = "lblEtKart";
            this.lblEtKart.Size = new System.Drawing.Size(100, 20);
            this.lblEtKart.TabIndex = 2;
            this.lblEtKart.Text = "Kart";
            // 
            // lblKart
            // 
            this.lblKart.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblKart.Location = new System.Drawing.Point(290, 52);
            this.lblKart.Name = "lblKart";
            this.lblKart.Size = new System.Drawing.Size(200, 24);
            this.lblKart.TabIndex = 3;
            this.lblKart.Text = "-";
            // 
            // lblEtHavale
            // 
            this.lblEtHavale.ForeColor = System.Drawing.Color.Gray;
            this.lblEtHavale.Location = new System.Drawing.Point(560, 30);
            this.lblEtHavale.Name = "lblEtHavale";
            this.lblEtHavale.Size = new System.Drawing.Size(100, 20);
            this.lblEtHavale.TabIndex = 4;
            this.lblEtHavale.Text = "Havale";
            // 
            // lblHavale
            // 
            this.lblHavale.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblHavale.Location = new System.Drawing.Point(560, 52);
            this.lblHavale.Name = "lblHavale";
            this.lblHavale.Size = new System.Drawing.Size(200, 24);
            this.lblHavale.TabIndex = 5;
            this.lblHavale.Text = "-";
            // 
            // lblListeBaslik
            // 
            this.lblListeBaslik.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblListeBaslik.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblListeBaslik.Location = new System.Drawing.Point(20, 290);
            this.lblListeBaslik.Name = "lblListeBaslik";
            this.lblListeBaslik.Size = new System.Drawing.Size(300, 24);
            this.lblListeBaslik.TabIndex = 9;
            this.lblListeBaslik.Text = "Günün Siparişleri";
            // 
            // dgvSiparisler
            // 
            this.dgvSiparisler.AllowUserToAddRows = false;
            this.dgvSiparisler.AllowUserToDeleteRows = false;
            this.dgvSiparisler.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left)
            | System.Windows.Forms.AnchorStyles.Right)));
            this.dgvSiparisler.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvSiparisler.BackgroundColor = System.Drawing.Color.White;
            this.dgvSiparisler.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvSiparisler.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colSiparisNo,
            this.colMusteri,
            this.colTutar,
            this.colOdenen,
            this.colDurum});
            this.dgvSiparisler.Location = new System.Drawing.Point(20, 318);
            this.dgvSiparisler.Name = "dgvSiparisler";
            this.dgvSiparisler.ReadOnly = true;
            this.dgvSiparisler.RowHeadersVisible = false;
            this.dgvSiparisler.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvSiparisler.Size = new System.Drawing.Size(830, 330);
            this.dgvSiparisler.TabIndex = 10;
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
            // belge
            // 
            this.belge.PrintPage += new System.Drawing.Printing.PrintPageEventHandler(this.belge_PrintPage);
            // 
            // DailyReportForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(244, 246, 248);
            this.ClientSize = new System.Drawing.Size(884, 671);
            this.Controls.Add(this.dgvSiparisler);
            this.Controls.Add(this.lblListeBaslik);
            this.Controls.Add(this.grpTahsilat);
            this.Controls.Add(this.pnlKasa);
            this.Controls.Add(this.pnlTeslim);
            this.Controls.Add(this.pnlCiro);
            this.Controls.Add(this.pnlSiparisAdedi);
            this.Controls.Add(this.btnYazdir);
            this.Controls.Add(this.btnGetir);
            this.Controls.Add(this.dtpTarih);
            this.Controls.Add(this.lblEtTarih);
            this.Name = "DailyReportForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Gün Sonu Kasa Raporu";
            this.Load += new System.EventHandler(this.DailyReportForm_Load);
            this.pnlSiparisAdedi.ResumeLayout(false);
            this.pnlCiro.ResumeLayout(false);
            this.pnlTeslim.ResumeLayout(false);
            this.pnlKasa.ResumeLayout(false);
            this.grpTahsilat.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.dgvSiparisler)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblEtTarih;
        private System.Windows.Forms.DateTimePicker dtpTarih;
        private System.Windows.Forms.Button btnGetir;
        private System.Windows.Forms.Button btnYazdir;
        private System.Windows.Forms.Panel pnlSiparisAdedi;
        private System.Windows.Forms.Label lblEtSiparisAdedi;
        private System.Windows.Forms.Label lblSiparisAdedi;
        private System.Windows.Forms.Panel pnlCiro;
        private System.Windows.Forms.Label lblEtCiro;
        private System.Windows.Forms.Label lblCiro;
        private System.Windows.Forms.Panel pnlTeslim;
        private System.Windows.Forms.Label lblEtTeslim;
        private System.Windows.Forms.Label lblTeslim;
        private System.Windows.Forms.Panel pnlKasa;
        private System.Windows.Forms.Label lblEtKasa;
        private System.Windows.Forms.Label lblKasa;
        private System.Windows.Forms.GroupBox grpTahsilat;
        private System.Windows.Forms.Label lblEtNakit;
        private System.Windows.Forms.Label lblNakit;
        private System.Windows.Forms.Label lblEtKart;
        private System.Windows.Forms.Label lblKart;
        private System.Windows.Forms.Label lblEtHavale;
        private System.Windows.Forms.Label lblHavale;
        private System.Windows.Forms.Label lblListeBaslik;
        private System.Windows.Forms.DataGridView dgvSiparisler;
        private System.Windows.Forms.DataGridViewTextBoxColumn colSiparisNo;
        private System.Windows.Forms.DataGridViewTextBoxColumn colMusteri;
        private System.Windows.Forms.DataGridViewTextBoxColumn colTutar;
        private System.Windows.Forms.DataGridViewTextBoxColumn colOdenen;
        private System.Windows.Forms.DataGridViewTextBoxColumn colDurum;
        private System.Drawing.Printing.PrintDocument belge;
    }
}
