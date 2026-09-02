namespace SporSalonuKasa
{
    partial class DailyReportForm
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
            this.lblTarih = new System.Windows.Forms.Label();
            this.dtpTarih = new System.Windows.Forms.DateTimePicker();
            this.btnGetir = new System.Windows.Forms.Button();
            this.btnYazdir = new System.Windows.Forms.Button();
            this.grpUyelik = new System.Windows.Forms.GroupBox();
            this.lblUyelikNakit = new System.Windows.Forms.Label();
            this.lblUyelikKart = new System.Windows.Forms.Label();
            this.lblUyelikHavale = new System.Windows.Forms.Label();
            this.lblUyelikToplam = new System.Windows.Forms.Label();
            this.grpBufe = new System.Windows.Forms.GroupBox();
            this.lblBufeNakit = new System.Windows.Forms.Label();
            this.lblBufeKart = new System.Windows.Forms.Label();
            this.lblBufeToplam = new System.Windows.Forms.Label();
            this.grpGenel = new System.Windows.Forms.GroupBox();
            this.lblGenelToplam = new System.Windows.Forms.Label();
            this.lblGirisler = new System.Windows.Forms.Label();
            this.lblUyelikListeEtiket = new System.Windows.Forms.Label();
            this.dgvUyelikler = new System.Windows.Forms.DataGridView();
            this.colUye = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colPaket = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colBaslangic = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colBitis = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colUcret = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colOdenen = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.belge = new System.Drawing.Printing.PrintDocument();
            this.grpUyelik.SuspendLayout();
            this.grpBufe.SuspendLayout();
            this.grpGenel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvUyelikler)).BeginInit();
            this.SuspendLayout();
            // 
            // lblTarih
            // 
            this.lblTarih.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblTarih.Location = new System.Drawing.Point(20, 16);
            this.lblTarih.Name = "lblTarih";
            this.lblTarih.Size = new System.Drawing.Size(60, 20);
            this.lblTarih.TabIndex = 0;
            this.lblTarih.Text = "Tarih";
            // 
            // dtpTarih
            // 
            this.dtpTarih.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpTarih.Location = new System.Drawing.Point(20, 38);
            this.dtpTarih.Name = "dtpTarih";
            this.dtpTarih.Size = new System.Drawing.Size(160, 23);
            this.dtpTarih.TabIndex = 1;
            // 
            // btnGetir
            // 
            this.btnGetir.BackColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnGetir.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnGetir.ForeColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.btnGetir.Location = new System.Drawing.Point(190, 37);
            this.btnGetir.Name = "btnGetir";
            this.btnGetir.Size = new System.Drawing.Size(100, 26);
            this.btnGetir.TabIndex = 2;
            this.btnGetir.Text = "Getir";
            this.btnGetir.UseVisualStyleBackColor = false;
            this.btnGetir.Click += new System.EventHandler(this.btnGetir_Click);
            // 
            // btnYazdir
            // 
            this.btnYazdir.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYazdir.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnYazdir.Location = new System.Drawing.Point(300, 37);
            this.btnYazdir.Name = "btnYazdir";
            this.btnYazdir.Size = new System.Drawing.Size(100, 26);
            this.btnYazdir.TabIndex = 3;
            this.btnYazdir.Text = "Yazdır";
            this.btnYazdir.UseVisualStyleBackColor = true;
            this.btnYazdir.Click += new System.EventHandler(this.btnYazdir_Click);
            // 
            // grpUyelik
            // 
            this.grpUyelik.Controls.Add(this.lblUyelikToplam);
            this.grpUyelik.Controls.Add(this.lblUyelikHavale);
            this.grpUyelik.Controls.Add(this.lblUyelikKart);
            this.grpUyelik.Controls.Add(this.lblUyelikNakit);
            this.grpUyelik.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.grpUyelik.Location = new System.Drawing.Point(20, 80);
            this.grpUyelik.Name = "grpUyelik";
            this.grpUyelik.Size = new System.Drawing.Size(280, 130);
            this.grpUyelik.TabIndex = 4;
            this.grpUyelik.TabStop = false;
            this.grpUyelik.Text = "Üyelik Tahsilatı";
            // 
            // lblUyelikNakit
            // 
            this.lblUyelikNakit.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblUyelikNakit.Location = new System.Drawing.Point(16, 28);
            this.lblUyelikNakit.Name = "lblUyelikNakit";
            this.lblUyelikNakit.Size = new System.Drawing.Size(250, 20);
            this.lblUyelikNakit.TabIndex = 0;
            this.lblUyelikNakit.Text = "Nakit: -";
            // 
            // lblUyelikKart
            // 
            this.lblUyelikKart.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblUyelikKart.Location = new System.Drawing.Point(16, 52);
            this.lblUyelikKart.Name = "lblUyelikKart";
            this.lblUyelikKart.Size = new System.Drawing.Size(250, 20);
            this.lblUyelikKart.TabIndex = 1;
            this.lblUyelikKart.Text = "Kart: -";
            // 
            // lblUyelikHavale
            // 
            this.lblUyelikHavale.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblUyelikHavale.Location = new System.Drawing.Point(16, 76);
            this.lblUyelikHavale.Name = "lblUyelikHavale";
            this.lblUyelikHavale.Size = new System.Drawing.Size(250, 20);
            this.lblUyelikHavale.TabIndex = 2;
            this.lblUyelikHavale.Text = "Havale: -";
            // 
            // lblUyelikToplam
            // 
            this.lblUyelikToplam.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblUyelikToplam.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblUyelikToplam.Location = new System.Drawing.Point(16, 100);
            this.lblUyelikToplam.Name = "lblUyelikToplam";
            this.lblUyelikToplam.Size = new System.Drawing.Size(250, 24);
            this.lblUyelikToplam.TabIndex = 3;
            this.lblUyelikToplam.Text = "Toplam: -";
            // 
            // grpBufe
            // 
            this.grpBufe.Controls.Add(this.lblBufeToplam);
            this.grpBufe.Controls.Add(this.lblBufeKart);
            this.grpBufe.Controls.Add(this.lblBufeNakit);
            this.grpBufe.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.grpBufe.Location = new System.Drawing.Point(315, 80);
            this.grpBufe.Name = "grpBufe";
            this.grpBufe.Size = new System.Drawing.Size(280, 130);
            this.grpBufe.TabIndex = 5;
            this.grpBufe.TabStop = false;
            this.grpBufe.Text = "Büfe Satışı";
            // 
            // lblBufeNakit
            // 
            this.lblBufeNakit.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblBufeNakit.Location = new System.Drawing.Point(16, 28);
            this.lblBufeNakit.Name = "lblBufeNakit";
            this.lblBufeNakit.Size = new System.Drawing.Size(250, 20);
            this.lblBufeNakit.TabIndex = 0;
            this.lblBufeNakit.Text = "Nakit: -";
            // 
            // lblBufeKart
            // 
            this.lblBufeKart.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblBufeKart.Location = new System.Drawing.Point(16, 52);
            this.lblBufeKart.Name = "lblBufeKart";
            this.lblBufeKart.Size = new System.Drawing.Size(250, 20);
            this.lblBufeKart.TabIndex = 1;
            this.lblBufeKart.Text = "Kart: -";
            // 
            // lblBufeToplam
            // 
            this.lblBufeToplam.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblBufeToplam.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblBufeToplam.Location = new System.Drawing.Point(16, 100);
            this.lblBufeToplam.Name = "lblBufeToplam";
            this.lblBufeToplam.Size = new System.Drawing.Size(250, 24);
            this.lblBufeToplam.TabIndex = 2;
            this.lblBufeToplam.Text = "Toplam: -";
            // 
            // grpGenel
            // 
            this.grpGenel.Controls.Add(this.lblGirisler);
            this.grpGenel.Controls.Add(this.lblGenelToplam);
            this.grpGenel.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.grpGenel.Location = new System.Drawing.Point(610, 80);
            this.grpGenel.Name = "grpGenel";
            this.grpGenel.Size = new System.Drawing.Size(290, 130);
            this.grpGenel.TabIndex = 6;
            this.grpGenel.TabStop = false;
            this.grpGenel.Text = "Genel";
            // 
            // lblGenelToplam
            // 
            this.lblGenelToplam.Font = new System.Drawing.Font("Segoe UI", 15F, System.Drawing.FontStyle.Bold);
            this.lblGenelToplam.ForeColor = System.Drawing.Color.FromArgb(74, 222, 128);
            this.lblGenelToplam.Location = new System.Drawing.Point(16, 32);
            this.lblGenelToplam.Name = "lblGenelToplam";
            this.lblGenelToplam.Size = new System.Drawing.Size(260, 34);
            this.lblGenelToplam.TabIndex = 0;
            this.lblGenelToplam.Text = "-";
            // 
            // lblGirisler
            // 
            this.lblGirisler.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblGirisler.Location = new System.Drawing.Point(16, 76);
            this.lblGirisler.Name = "lblGirisler";
            this.lblGirisler.Size = new System.Drawing.Size(260, 40);
            this.lblGirisler.TabIndex = 1;
            this.lblGirisler.Text = "Giriş: -   Ret: -";
            // 
            // lblUyelikListeEtiket
            // 
            this.lblUyelikListeEtiket.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblUyelikListeEtiket.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblUyelikListeEtiket.Location = new System.Drawing.Point(20, 225);
            this.lblUyelikListeEtiket.Name = "lblUyelikListeEtiket";
            this.lblUyelikListeEtiket.Size = new System.Drawing.Size(400, 24);
            this.lblUyelikListeEtiket.TabIndex = 7;
            this.lblUyelikListeEtiket.Text = "Bugün Satılan Üyelikler";
            // 
            // dgvUyelikler
            // 
            this.dgvUyelikler.AllowUserToAddRows = false;
            this.dgvUyelikler.AllowUserToDeleteRows = false;
            this.dgvUyelikler.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left) | System.Windows.Forms.AnchorStyles.Right)));
            this.dgvUyelikler.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvUyelikler.BackgroundColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.dgvUyelikler.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvUyelikler.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colUye, this.colPaket, this.colBaslangic, this.colBitis, this.colUcret, this.colOdenen});
            this.dgvUyelikler.Location = new System.Drawing.Point(20, 253);
            this.dgvUyelikler.Name = "dgvUyelikler";
            this.dgvUyelikler.ReadOnly = true;
            this.dgvUyelikler.RowHeadersVisible = false;
            this.dgvUyelikler.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvUyelikler.Size = new System.Drawing.Size(880, 280);
            this.dgvUyelikler.TabIndex = 8;
            // 
            // colUye
            // 
            this.colUye.HeaderText = "Üye";
            this.colUye.Name = "colUye";
            this.colUye.ReadOnly = true;
            // 
            // colPaket
            // 
            this.colPaket.HeaderText = "Paket";
            this.colPaket.Name = "colPaket";
            this.colPaket.ReadOnly = true;
            // 
            // colBaslangic
            // 
            this.colBaslangic.HeaderText = "Başlangıç";
            this.colBaslangic.Name = "colBaslangic";
            this.colBaslangic.ReadOnly = true;
            // 
            // colBitis
            // 
            this.colBitis.HeaderText = "Bitiş";
            this.colBitis.Name = "colBitis";
            this.colBitis.ReadOnly = true;
            // 
            // colUcret
            // 
            this.colUcret.HeaderText = "Ücret";
            this.colUcret.Name = "colUcret";
            this.colUcret.ReadOnly = true;
            // 
            // colOdenen
            // 
            this.colOdenen.HeaderText = "Ödenen";
            this.colOdenen.Name = "colOdenen";
            this.colOdenen.ReadOnly = true;
            // 
            // belge
            // 
            this.belge.PrintPage += new System.Drawing.Printing.PrintPageEventHandler(this.belge_PrintPage);
            // 
            // DailyReportForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.ClientSize = new System.Drawing.Size(924, 553);
            this.Controls.Add(this.dgvUyelikler);
            this.Controls.Add(this.lblUyelikListeEtiket);
            this.Controls.Add(this.grpGenel);
            this.Controls.Add(this.grpBufe);
            this.Controls.Add(this.grpUyelik);
            this.Controls.Add(this.btnYazdir);
            this.Controls.Add(this.btnGetir);
            this.Controls.Add(this.dtpTarih);
            this.Controls.Add(this.lblTarih);
            this.Name = "DailyReportForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Gün Sonu Raporu";
            this.Load += new System.EventHandler(this.DailyReportForm_Load);
            this.grpUyelik.ResumeLayout(false);
            this.grpBufe.ResumeLayout(false);
            this.grpGenel.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.dgvUyelikler)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblTarih;
        private System.Windows.Forms.DateTimePicker dtpTarih;
        private System.Windows.Forms.Button btnGetir;
        private System.Windows.Forms.Button btnYazdir;
        private System.Windows.Forms.GroupBox grpUyelik;
        private System.Windows.Forms.Label lblUyelikNakit;
        private System.Windows.Forms.Label lblUyelikKart;
        private System.Windows.Forms.Label lblUyelikHavale;
        private System.Windows.Forms.Label lblUyelikToplam;
        private System.Windows.Forms.GroupBox grpBufe;
        private System.Windows.Forms.Label lblBufeNakit;
        private System.Windows.Forms.Label lblBufeKart;
        private System.Windows.Forms.Label lblBufeToplam;
        private System.Windows.Forms.GroupBox grpGenel;
        private System.Windows.Forms.Label lblGenelToplam;
        private System.Windows.Forms.Label lblGirisler;
        private System.Windows.Forms.Label lblUyelikListeEtiket;
        private System.Windows.Forms.DataGridView dgvUyelikler;
        private System.Windows.Forms.DataGridViewTextBoxColumn colUye;
        private System.Windows.Forms.DataGridViewTextBoxColumn colPaket;
        private System.Windows.Forms.DataGridViewTextBoxColumn colBaslangic;
        private System.Windows.Forms.DataGridViewTextBoxColumn colBitis;
        private System.Windows.Forms.DataGridViewTextBoxColumn colUcret;
        private System.Windows.Forms.DataGridViewTextBoxColumn colOdenen;
        private System.Drawing.Printing.PrintDocument belge;
    }
}
