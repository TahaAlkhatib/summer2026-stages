namespace CamasirhaneKasa
{
    partial class NewOrderForm
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
            this.lblBaslik1 = new System.Windows.Forms.Label();
            this.txtMusteriAra = new System.Windows.Forms.TextBox();
            this.btnAra = new System.Windows.Forms.Button();
            this.btnYeniMusteri = new System.Windows.Forms.Button();
            this.cmbMusteri = new System.Windows.Forms.ComboBox();
            this.lblBaslik2 = new System.Windows.Forms.Label();
            this.cmbHizmet = new System.Windows.Forms.ComboBox();
            this.lblMiktar = new System.Windows.Forms.Label();
            this.numMiktar = new System.Windows.Forms.NumericUpDown();
            this.btnEkle = new System.Windows.Forms.Button();
            this.btnKalemSil = new System.Windows.Forms.Button();
            this.dgvKalemler = new System.Windows.Forms.DataGridView();
            this.colHizmet = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colMiktar = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colBirimFiyat = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colTutar = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.lblToplam = new System.Windows.Forms.Label();
            this.lblBaslik3 = new System.Windows.Forms.Label();
            this.rbMagaza = new System.Windows.Forms.RadioButton();
            this.rbKurye = new System.Windows.Forms.RadioButton();
            this.lblSozVerilen = new System.Windows.Forms.Label();
            this.dtpSozVerilen = new System.Windows.Forms.DateTimePicker();
            this.lblNot = new System.Windows.Forms.Label();
            this.txtNot = new System.Windows.Forms.TextBox();
            this.btnKaydet = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.numMiktar)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvKalemler)).BeginInit();
            this.SuspendLayout();
            // 
            // lblBaslik1
            // 
            this.lblBaslik1.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblBaslik1.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblBaslik1.Location = new System.Drawing.Point(20, 15);
            this.lblBaslik1.Name = "lblBaslik1";
            this.lblBaslik1.Size = new System.Drawing.Size(300, 24);
            this.lblBaslik1.TabIndex = 0;
            this.lblBaslik1.Text = "1. Müşteri";
            // 
            // txtMusteriAra
            // 
            this.txtMusteriAra.Location = new System.Drawing.Point(20, 45);
            this.txtMusteriAra.Name = "txtMusteriAra";
            this.txtMusteriAra.PlaceholderText = "Ad, telefon veya ilçe";
            this.txtMusteriAra.Size = new System.Drawing.Size(300, 23);
            this.txtMusteriAra.TabIndex = 1;
            // 
            // btnAra
            // 
            this.btnAra.Location = new System.Drawing.Point(330, 44);
            this.btnAra.Name = "btnAra";
            this.btnAra.Size = new System.Drawing.Size(80, 28);
            this.btnAra.TabIndex = 2;
            this.btnAra.Text = "Ara";
            this.btnAra.UseVisualStyleBackColor = true;
            this.btnAra.Click += new System.EventHandler(this.btnAra_Click);
            // 
            // btnYeniMusteri
            // 
            this.btnYeniMusteri.Location = new System.Drawing.Point(420, 44);
            this.btnYeniMusteri.Name = "btnYeniMusteri";
            this.btnYeniMusteri.Size = new System.Drawing.Size(120, 28);
            this.btnYeniMusteri.TabIndex = 3;
            this.btnYeniMusteri.Text = "Yeni Müşteri";
            this.btnYeniMusteri.UseVisualStyleBackColor = true;
            this.btnYeniMusteri.Click += new System.EventHandler(this.btnYeniMusteri_Click);
            // 
            // cmbMusteri
            // 
            this.cmbMusteri.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbMusteri.Location = new System.Drawing.Point(20, 80);
            this.cmbMusteri.Name = "cmbMusteri";
            this.cmbMusteri.Size = new System.Drawing.Size(520, 23);
            this.cmbMusteri.TabIndex = 4;
            // 
            // lblBaslik2
            // 
            this.lblBaslik2.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblBaslik2.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblBaslik2.Location = new System.Drawing.Point(20, 125);
            this.lblBaslik2.Name = "lblBaslik2";
            this.lblBaslik2.Size = new System.Drawing.Size(300, 24);
            this.lblBaslik2.TabIndex = 5;
            this.lblBaslik2.Text = "2. Hizmetler";
            // 
            // cmbHizmet
            // 
            this.cmbHizmet.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbHizmet.Location = new System.Drawing.Point(20, 155);
            this.cmbHizmet.Name = "cmbHizmet";
            this.cmbHizmet.Size = new System.Drawing.Size(480, 23);
            this.cmbHizmet.TabIndex = 6;
            // 
            // lblMiktar
            // 
            this.lblMiktar.Location = new System.Drawing.Point(515, 138);
            this.lblMiktar.Name = "lblMiktar";
            this.lblMiktar.Size = new System.Drawing.Size(60, 18);
            this.lblMiktar.TabIndex = 7;
            this.lblMiktar.Text = "Miktar";
            // 
            // numMiktar
            // 
            this.numMiktar.DecimalPlaces = 1;
            this.numMiktar.Increment = new decimal(new int[] { 5, 0, 0, 65536 });
            this.numMiktar.Location = new System.Drawing.Point(515, 155);
            this.numMiktar.Maximum = new decimal(new int[] { 1000, 0, 0, 0 });
            this.numMiktar.Minimum = new decimal(new int[] { 5, 0, 0, 65536 });
            this.numMiktar.Name = "numMiktar";
            this.numMiktar.Size = new System.Drawing.Size(80, 23);
            this.numMiktar.TabIndex = 8;
            this.numMiktar.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // btnEkle
            // 
            this.btnEkle.Location = new System.Drawing.Point(605, 154);
            this.btnEkle.Name = "btnEkle";
            this.btnEkle.Size = new System.Drawing.Size(90, 28);
            this.btnEkle.TabIndex = 9;
            this.btnEkle.Text = "Ekle";
            this.btnEkle.UseVisualStyleBackColor = true;
            this.btnEkle.Click += new System.EventHandler(this.btnEkle_Click);
            // 
            // btnKalemSil
            // 
            this.btnKalemSil.Location = new System.Drawing.Point(705, 154);
            this.btnKalemSil.Name = "btnKalemSil";
            this.btnKalemSil.Size = new System.Drawing.Size(140, 28);
            this.btnKalemSil.TabIndex = 10;
            this.btnKalemSil.Text = "Seçili Kalemi Sil";
            this.btnKalemSil.UseVisualStyleBackColor = true;
            this.btnKalemSil.Click += new System.EventHandler(this.btnKalemSil_Click);
            // 
            // dgvKalemler
            // 
            this.dgvKalemler.AllowUserToAddRows = false;
            this.dgvKalemler.AllowUserToDeleteRows = false;
            this.dgvKalemler.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvKalemler.BackgroundColor = System.Drawing.Color.White;
            this.dgvKalemler.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvKalemler.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colHizmet,
            this.colMiktar,
            this.colBirimFiyat,
            this.colTutar});
            this.dgvKalemler.Location = new System.Drawing.Point(20, 190);
            this.dgvKalemler.Name = "dgvKalemler";
            this.dgvKalemler.ReadOnly = true;
            this.dgvKalemler.RowHeadersVisible = false;
            this.dgvKalemler.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvKalemler.Size = new System.Drawing.Size(825, 190);
            this.dgvKalemler.TabIndex = 11;
            // 
            // colHizmet
            // 
            this.colHizmet.HeaderText = "Hizmet";
            this.colHizmet.Name = "colHizmet";
            this.colHizmet.ReadOnly = true;
            // 
            // colMiktar
            // 
            this.colMiktar.HeaderText = "Miktar";
            this.colMiktar.Name = "colMiktar";
            this.colMiktar.ReadOnly = true;
            // 
            // colBirimFiyat
            // 
            this.colBirimFiyat.HeaderText = "Birim Fiyat";
            this.colBirimFiyat.Name = "colBirimFiyat";
            this.colBirimFiyat.ReadOnly = true;
            // 
            // colTutar
            // 
            this.colTutar.HeaderText = "Tutar";
            this.colTutar.Name = "colTutar";
            this.colTutar.ReadOnly = true;
            // 
            // lblToplam
            // 
            this.lblToplam.Font = new System.Drawing.Font("Segoe UI", 12F, System.Drawing.FontStyle.Bold);
            this.lblToplam.Location = new System.Drawing.Point(600, 388);
            this.lblToplam.Name = "lblToplam";
            this.lblToplam.Size = new System.Drawing.Size(245, 26);
            this.lblToplam.TabIndex = 12;
            this.lblToplam.Text = "Toplam: 0,00 ₺";
            this.lblToplam.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // lblBaslik3
            // 
            this.lblBaslik3.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblBaslik3.ForeColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.lblBaslik3.Location = new System.Drawing.Point(20, 425);
            this.lblBaslik3.Name = "lblBaslik3";
            this.lblBaslik3.Size = new System.Drawing.Size(300, 24);
            this.lblBaslik3.TabIndex = 13;
            this.lblBaslik3.Text = "3. Teslim";
            // 
            // rbMagaza
            // 
            this.rbMagaza.Checked = true;
            this.rbMagaza.Location = new System.Drawing.Point(20, 455);
            this.rbMagaza.Name = "rbMagaza";
            this.rbMagaza.Size = new System.Drawing.Size(160, 24);
            this.rbMagaza.TabIndex = 14;
            this.rbMagaza.TabStop = true;
            this.rbMagaza.Text = "Mağazadan Teslim";
            this.rbMagaza.UseVisualStyleBackColor = true;
            // 
            // rbKurye
            // 
            this.rbKurye.Location = new System.Drawing.Point(190, 455);
            this.rbKurye.Name = "rbKurye";
            this.rbKurye.Size = new System.Drawing.Size(160, 24);
            this.rbKurye.TabIndex = 15;
            this.rbKurye.Text = "Kurye ile Teslim";
            this.rbKurye.UseVisualStyleBackColor = true;
            // 
            // lblSozVerilen
            // 
            this.lblSozVerilen.Location = new System.Drawing.Point(20, 490);
            this.lblSozVerilen.Name = "lblSozVerilen";
            this.lblSozVerilen.Size = new System.Drawing.Size(140, 20);
            this.lblSozVerilen.TabIndex = 16;
            this.lblSozVerilen.Text = "Söz Verilen Tarih";
            // 
            // dtpSozVerilen
            // 
            this.dtpSozVerilen.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpSozVerilen.Location = new System.Drawing.Point(20, 512);
            this.dtpSozVerilen.Name = "dtpSozVerilen";
            this.dtpSozVerilen.Size = new System.Drawing.Size(180, 23);
            this.dtpSozVerilen.TabIndex = 17;
            // 
            // lblNot
            // 
            this.lblNot.Location = new System.Drawing.Point(220, 490);
            this.lblNot.Name = "lblNot";
            this.lblNot.Size = new System.Drawing.Size(100, 20);
            this.lblNot.TabIndex = 18;
            this.lblNot.Text = "Notlar";
            // 
            // txtNot
            // 
            this.txtNot.Location = new System.Drawing.Point(220, 512);
            this.txtNot.Multiline = true;
            this.txtNot.Name = "txtNot";
            this.txtNot.Size = new System.Drawing.Size(400, 50);
            this.txtNot.TabIndex = 19;
            // 
            // btnKaydet
            // 
            this.btnKaydet.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnKaydet.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnKaydet.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnKaydet.ForeColor = System.Drawing.Color.White;
            this.btnKaydet.Location = new System.Drawing.Point(640, 512);
            this.btnKaydet.Name = "btnKaydet";
            this.btnKaydet.Size = new System.Drawing.Size(205, 50);
            this.btnKaydet.TabIndex = 20;
            this.btnKaydet.Text = "Siparişi Oluştur";
            this.btnKaydet.UseVisualStyleBackColor = false;
            this.btnKaydet.Click += new System.EventHandler(this.btnKaydet_Click);
            // 
            // NewOrderForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(244, 246, 248);
            this.ClientSize = new System.Drawing.Size(884, 641);
            this.Controls.Add(this.btnKaydet);
            this.Controls.Add(this.txtNot);
            this.Controls.Add(this.lblNot);
            this.Controls.Add(this.dtpSozVerilen);
            this.Controls.Add(this.lblSozVerilen);
            this.Controls.Add(this.rbKurye);
            this.Controls.Add(this.rbMagaza);
            this.Controls.Add(this.lblBaslik3);
            this.Controls.Add(this.lblToplam);
            this.Controls.Add(this.dgvKalemler);
            this.Controls.Add(this.btnKalemSil);
            this.Controls.Add(this.btnEkle);
            this.Controls.Add(this.numMiktar);
            this.Controls.Add(this.lblMiktar);
            this.Controls.Add(this.cmbHizmet);
            this.Controls.Add(this.lblBaslik2);
            this.Controls.Add(this.cmbMusteri);
            this.Controls.Add(this.btnYeniMusteri);
            this.Controls.Add(this.btnAra);
            this.Controls.Add(this.txtMusteriAra);
            this.Controls.Add(this.lblBaslik1);
            this.Name = "NewOrderForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Yeni Sipariş";
            this.Load += new System.EventHandler(this.NewOrderForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.numMiktar)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvKalemler)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblBaslik1;
        private System.Windows.Forms.TextBox txtMusteriAra;
        private System.Windows.Forms.Button btnAra;
        private System.Windows.Forms.Button btnYeniMusteri;
        private System.Windows.Forms.ComboBox cmbMusteri;
        private System.Windows.Forms.Label lblBaslik2;
        private System.Windows.Forms.ComboBox cmbHizmet;
        private System.Windows.Forms.Label lblMiktar;
        private System.Windows.Forms.NumericUpDown numMiktar;
        private System.Windows.Forms.Button btnEkle;
        private System.Windows.Forms.Button btnKalemSil;
        private System.Windows.Forms.DataGridView dgvKalemler;
        private System.Windows.Forms.DataGridViewTextBoxColumn colHizmet;
        private System.Windows.Forms.DataGridViewTextBoxColumn colMiktar;
        private System.Windows.Forms.DataGridViewTextBoxColumn colBirimFiyat;
        private System.Windows.Forms.DataGridViewTextBoxColumn colTutar;
        private System.Windows.Forms.Label lblToplam;
        private System.Windows.Forms.Label lblBaslik3;
        private System.Windows.Forms.RadioButton rbMagaza;
        private System.Windows.Forms.RadioButton rbKurye;
        private System.Windows.Forms.Label lblSozVerilen;
        private System.Windows.Forms.DateTimePicker dtpSozVerilen;
        private System.Windows.Forms.Label lblNot;
        private System.Windows.Forms.TextBox txtNot;
        private System.Windows.Forms.Button btnKaydet;
    }
}
