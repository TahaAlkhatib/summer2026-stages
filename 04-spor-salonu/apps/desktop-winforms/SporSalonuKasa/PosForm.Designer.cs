namespace SporSalonuKasa
{
    partial class PosForm
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
            this.lblUrunler = new System.Windows.Forms.Label();
            this.lstUrunler = new System.Windows.Forms.ListBox();
            this.btnSepeteEkle = new System.Windows.Forms.Button();
            this.lblSepet = new System.Windows.Forms.Label();
            this.dgvSepet = new System.Windows.Forms.DataGridView();
            this.colUrun = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colAdet = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colTutar = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.btnSepettenCikar = new System.Windows.Forms.Button();
            this.lblToplam = new System.Windows.Forms.Label();
            this.lblYontem = new System.Windows.Forms.Label();
            this.cmbYontem = new System.Windows.Forms.ComboBox();
            this.btnSatisiTamamla = new System.Windows.Forms.Button();
            this.lblSonuc = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.dgvSepet)).BeginInit();
            this.SuspendLayout();
            // 
            // lblUrunler
            // 
            this.lblUrunler.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblUrunler.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblUrunler.Location = new System.Drawing.Point(20, 16);
            this.lblUrunler.Name = "lblUrunler";
            this.lblUrunler.Size = new System.Drawing.Size(300, 24);
            this.lblUrunler.TabIndex = 0;
            this.lblUrunler.Text = "Ürünler";
            // 
            // lstUrunler
            // 
            this.lstUrunler.BackColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.lstUrunler.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lstUrunler.Font = new System.Drawing.Font("Segoe UI", 11F);
            this.lstUrunler.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lstUrunler.ItemHeight = 20;
            this.lstUrunler.Location = new System.Drawing.Point(20, 44);
            this.lstUrunler.Name = "lstUrunler";
            this.lstUrunler.Size = new System.Drawing.Size(400, 324);
            this.lstUrunler.TabIndex = 1;
            this.lstUrunler.DoubleClick += new System.EventHandler(this.btnSepeteEkle_Click);
            // 
            // btnSepeteEkle
            // 
            this.btnSepeteEkle.BackColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnSepeteEkle.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSepeteEkle.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnSepeteEkle.ForeColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.btnSepeteEkle.Location = new System.Drawing.Point(20, 378);
            this.btnSepeteEkle.Name = "btnSepeteEkle";
            this.btnSepeteEkle.Size = new System.Drawing.Size(400, 34);
            this.btnSepeteEkle.TabIndex = 2;
            this.btnSepeteEkle.Text = "Sepete Ekle  (çift tıklama da ekler)";
            this.btnSepeteEkle.UseVisualStyleBackColor = false;
            this.btnSepeteEkle.Click += new System.EventHandler(this.btnSepeteEkle_Click);
            // 
            // lblSepet
            // 
            this.lblSepet.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblSepet.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblSepet.Location = new System.Drawing.Point(440, 16);
            this.lblSepet.Name = "lblSepet";
            this.lblSepet.Size = new System.Drawing.Size(300, 24);
            this.lblSepet.TabIndex = 3;
            this.lblSepet.Text = "Sepet";
            // 
            // dgvSepet
            // 
            this.dgvSepet.AllowUserToAddRows = false;
            this.dgvSepet.AllowUserToDeleteRows = false;
            this.dgvSepet.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvSepet.BackgroundColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.dgvSepet.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvSepet.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colUrun, this.colAdet, this.colTutar});
            this.dgvSepet.Location = new System.Drawing.Point(440, 44);
            this.dgvSepet.MultiSelect = false;
            this.dgvSepet.Name = "dgvSepet";
            this.dgvSepet.ReadOnly = true;
            this.dgvSepet.RowHeadersVisible = false;
            this.dgvSepet.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvSepet.Size = new System.Drawing.Size(440, 280);
            this.dgvSepet.TabIndex = 4;
            // 
            // colUrun
            // 
            this.colUrun.HeaderText = "Ürün";
            this.colUrun.Name = "colUrun";
            this.colUrun.ReadOnly = true;
            // 
            // colAdet
            // 
            this.colAdet.HeaderText = "Adet";
            this.colAdet.Name = "colAdet";
            this.colAdet.ReadOnly = true;
            // 
            // colTutar
            // 
            this.colTutar.HeaderText = "Tutar";
            this.colTutar.Name = "colTutar";
            this.colTutar.ReadOnly = true;
            // 
            // btnSepettenCikar
            // 
            this.btnSepettenCikar.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSepettenCikar.ForeColor = System.Drawing.Color.FromArgb(248, 113, 113);
            this.btnSepettenCikar.Location = new System.Drawing.Point(440, 330);
            this.btnSepettenCikar.Name = "btnSepettenCikar";
            this.btnSepettenCikar.Size = new System.Drawing.Size(180, 28);
            this.btnSepettenCikar.TabIndex = 5;
            this.btnSepettenCikar.Text = "Seçili Kalemi Çıkar";
            this.btnSepettenCikar.UseVisualStyleBackColor = true;
            this.btnSepettenCikar.Click += new System.EventHandler(this.btnSepettenCikar_Click);
            // 
            // lblToplam
            // 
            this.lblToplam.Font = new System.Drawing.Font("Segoe UI", 16F, System.Drawing.FontStyle.Bold);
            this.lblToplam.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblToplam.Location = new System.Drawing.Point(630, 328);
            this.lblToplam.Name = "lblToplam";
            this.lblToplam.Size = new System.Drawing.Size(250, 32);
            this.lblToplam.TabIndex = 6;
            this.lblToplam.Text = "Toplam: 0,00 ₺";
            this.lblToplam.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // lblYontem
            // 
            this.lblYontem.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblYontem.Location = new System.Drawing.Point(440, 372);
            this.lblYontem.Name = "lblYontem";
            this.lblYontem.Size = new System.Drawing.Size(120, 20);
            this.lblYontem.TabIndex = 7;
            this.lblYontem.Text = "Ödeme Yöntemi";
            // 
            // cmbYontem
            // 
            this.cmbYontem.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.cmbYontem.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbYontem.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.cmbYontem.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.cmbYontem.Location = new System.Drawing.Point(565, 370);
            this.cmbYontem.Name = "cmbYontem";
            this.cmbYontem.Size = new System.Drawing.Size(120, 23);
            this.cmbYontem.TabIndex = 8;
            // 
            // btnSatisiTamamla
            // 
            this.btnSatisiTamamla.BackColor = System.Drawing.Color.FromArgb(74, 222, 128);
            this.btnSatisiTamamla.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSatisiTamamla.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnSatisiTamamla.ForeColor = System.Drawing.Color.FromArgb(15, 46, 29);
            this.btnSatisiTamamla.Location = new System.Drawing.Point(700, 368);
            this.btnSatisiTamamla.Name = "btnSatisiTamamla";
            this.btnSatisiTamamla.Size = new System.Drawing.Size(180, 44);
            this.btnSatisiTamamla.TabIndex = 9;
            this.btnSatisiTamamla.Text = "Satışı Tamamla";
            this.btnSatisiTamamla.UseVisualStyleBackColor = false;
            this.btnSatisiTamamla.Click += new System.EventHandler(this.btnSatisiTamamla_Click);
            // 
            // lblSonuc
            // 
            this.lblSonuc.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.lblSonuc.Location = new System.Drawing.Point(20, 424);
            this.lblSonuc.Name = "lblSonuc";
            this.lblSonuc.Size = new System.Drawing.Size(860, 26);
            this.lblSonuc.TabIndex = 10;
            // 
            // PosForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.ClientSize = new System.Drawing.Size(904, 461);
            this.Controls.Add(this.lblSonuc);
            this.Controls.Add(this.btnSatisiTamamla);
            this.Controls.Add(this.cmbYontem);
            this.Controls.Add(this.lblYontem);
            this.Controls.Add(this.lblToplam);
            this.Controls.Add(this.btnSepettenCikar);
            this.Controls.Add(this.dgvSepet);
            this.Controls.Add(this.lblSepet);
            this.Controls.Add(this.btnSepeteEkle);
            this.Controls.Add(this.lstUrunler);
            this.Controls.Add(this.lblUrunler);
            this.Name = "PosForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Büfe / Kasa Satışı";
            this.Load += new System.EventHandler(this.PosForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dgvSepet)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblUrunler;
        private System.Windows.Forms.ListBox lstUrunler;
        private System.Windows.Forms.Button btnSepeteEkle;
        private System.Windows.Forms.Label lblSepet;
        private System.Windows.Forms.DataGridView dgvSepet;
        private System.Windows.Forms.DataGridViewTextBoxColumn colUrun;
        private System.Windows.Forms.DataGridViewTextBoxColumn colAdet;
        private System.Windows.Forms.DataGridViewTextBoxColumn colTutar;
        private System.Windows.Forms.Button btnSepettenCikar;
        private System.Windows.Forms.Label lblToplam;
        private System.Windows.Forms.Label lblYontem;
        private System.Windows.Forms.ComboBox cmbYontem;
        private System.Windows.Forms.Button btnSatisiTamamla;
        private System.Windows.Forms.Label lblSonuc;
    }
}
