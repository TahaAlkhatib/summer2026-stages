namespace SporSalonuKasa
{
    partial class MembersForm
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
            this.lblAra = new System.Windows.Forms.Label();
            this.txtAra = new System.Windows.Forms.TextBox();
            this.btnAra = new System.Windows.Forms.Button();
            this.dgvUyeler = new System.Windows.Forms.DataGridView();
            this.colAd = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colTelefon = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colQr = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colUyelik = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colBitis = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.colSeans = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.grpPaket = new System.Windows.Forms.GroupBox();
            this.lblSecilenUye = new System.Windows.Forms.Label();
            this.lblPaket = new System.Windows.Forms.Label();
            this.cmbPaket = new System.Windows.Forms.ComboBox();
            this.lblBaslangic = new System.Windows.Forms.Label();
            this.dtpBaslangic = new System.Windows.Forms.DateTimePicker();
            this.lblPesinat = new System.Windows.Forms.Label();
            this.numPesinat = new System.Windows.Forms.NumericUpDown();
            this.lblYontem = new System.Windows.Forms.Label();
            this.cmbYontem = new System.Windows.Forms.ComboBox();
            this.btnPaketSat = new System.Windows.Forms.Button();
            this.lblSonuc = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.dgvUyeler)).BeginInit();
            this.grpPaket.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.numPesinat)).BeginInit();
            this.SuspendLayout();
            // 
            // lblAra
            // 
            this.lblAra.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblAra.Location = new System.Drawing.Point(20, 16);
            this.lblAra.Name = "lblAra";
            this.lblAra.Size = new System.Drawing.Size(300, 20);
            this.lblAra.TabIndex = 0;
            this.lblAra.Text = "Üye Ara (ad, telefon veya QR kodu)";
            // 
            // txtAra
            // 
            this.txtAra.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.txtAra.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtAra.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.txtAra.Location = new System.Drawing.Point(20, 38);
            this.txtAra.Name = "txtAra";
            this.txtAra.Size = new System.Drawing.Size(400, 23);
            this.txtAra.TabIndex = 1;
            this.txtAra.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtAra_KeyDown);
            // 
            // btnAra
            // 
            this.btnAra.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnAra.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnAra.Location = new System.Drawing.Point(430, 37);
            this.btnAra.Name = "btnAra";
            this.btnAra.Size = new System.Drawing.Size(90, 26);
            this.btnAra.TabIndex = 2;
            this.btnAra.Text = "Ara";
            this.btnAra.UseVisualStyleBackColor = true;
            this.btnAra.Click += new System.EventHandler(this.btnAra_Click);
            // 
            // dgvUyeler
            // 
            this.dgvUyeler.AllowUserToAddRows = false;
            this.dgvUyeler.AllowUserToDeleteRows = false;
            this.dgvUyeler.AutoSizeColumnsMode = System.Windows.Forms.DataGridViewAutoSizeColumnsMode.Fill;
            this.dgvUyeler.BackgroundColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.dgvUyeler.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvUyeler.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.colAd, this.colTelefon, this.colQr, this.colUyelik, this.colBitis, this.colSeans});
            this.dgvUyeler.Location = new System.Drawing.Point(20, 75);
            this.dgvUyeler.MultiSelect = false;
            this.dgvUyeler.Name = "dgvUyeler";
            this.dgvUyeler.ReadOnly = true;
            this.dgvUyeler.RowHeadersVisible = false;
            this.dgvUyeler.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvUyeler.Size = new System.Drawing.Size(880, 240);
            this.dgvUyeler.TabIndex = 3;
            this.dgvUyeler.SelectionChanged += new System.EventHandler(this.dgvUyeler_SelectionChanged);
            // 
            // colAd
            // 
            this.colAd.HeaderText = "Ad Soyad";
            this.colAd.Name = "colAd";
            this.colAd.ReadOnly = true;
            // 
            // colTelefon
            // 
            this.colTelefon.HeaderText = "Telefon";
            this.colTelefon.Name = "colTelefon";
            this.colTelefon.ReadOnly = true;
            // 
            // colQr
            // 
            this.colQr.HeaderText = "QR Kodu";
            this.colQr.Name = "colQr";
            this.colQr.ReadOnly = true;
            // 
            // colUyelik
            // 
            this.colUyelik.HeaderText = "Üyelik";
            this.colUyelik.Name = "colUyelik";
            this.colUyelik.ReadOnly = true;
            // 
            // colBitis
            // 
            this.colBitis.HeaderText = "Bitiş";
            this.colBitis.Name = "colBitis";
            this.colBitis.ReadOnly = true;
            // 
            // colSeans
            // 
            this.colSeans.HeaderText = "Kalan Seans";
            this.colSeans.Name = "colSeans";
            this.colSeans.ReadOnly = true;
            // 
            // grpPaket
            // 
            this.grpPaket.Controls.Add(this.lblSonuc);
            this.grpPaket.Controls.Add(this.btnPaketSat);
            this.grpPaket.Controls.Add(this.cmbYontem);
            this.grpPaket.Controls.Add(this.lblYontem);
            this.grpPaket.Controls.Add(this.numPesinat);
            this.grpPaket.Controls.Add(this.lblPesinat);
            this.grpPaket.Controls.Add(this.dtpBaslangic);
            this.grpPaket.Controls.Add(this.lblBaslangic);
            this.grpPaket.Controls.Add(this.cmbPaket);
            this.grpPaket.Controls.Add(this.lblPaket);
            this.grpPaket.Controls.Add(this.lblSecilenUye);
            this.grpPaket.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.grpPaket.Location = new System.Drawing.Point(20, 330);
            this.grpPaket.Name = "grpPaket";
            this.grpPaket.Size = new System.Drawing.Size(880, 190);
            this.grpPaket.TabIndex = 4;
            this.grpPaket.TabStop = false;
            this.grpPaket.Text = "Paket Satışı";
            // 
            // lblSecilenUye
            // 
            this.lblSecilenUye.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.lblSecilenUye.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblSecilenUye.Location = new System.Drawing.Point(20, 28);
            this.lblSecilenUye.Name = "lblSecilenUye";
            this.lblSecilenUye.Size = new System.Drawing.Size(840, 26);
            this.lblSecilenUye.TabIndex = 0;
            this.lblSecilenUye.Text = "Listeden bir üye seçin";
            // 
            // lblPaket
            // 
            this.lblPaket.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblPaket.Location = new System.Drawing.Point(20, 62);
            this.lblPaket.Name = "lblPaket";
            this.lblPaket.Size = new System.Drawing.Size(100, 20);
            this.lblPaket.TabIndex = 1;
            this.lblPaket.Text = "Paket";
            // 
            // cmbPaket
            // 
            this.cmbPaket.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.cmbPaket.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbPaket.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.cmbPaket.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.cmbPaket.Location = new System.Drawing.Point(20, 84);
            this.cmbPaket.Name = "cmbPaket";
            this.cmbPaket.Size = new System.Drawing.Size(420, 23);
            this.cmbPaket.TabIndex = 2;
            // 
            // lblBaslangic
            // 
            this.lblBaslangic.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblBaslangic.Location = new System.Drawing.Point(455, 62);
            this.lblBaslangic.Name = "lblBaslangic";
            this.lblBaslangic.Size = new System.Drawing.Size(120, 20);
            this.lblBaslangic.TabIndex = 3;
            this.lblBaslangic.Text = "Başlangıç";
            // 
            // dtpBaslangic
            // 
            this.dtpBaslangic.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpBaslangic.Location = new System.Drawing.Point(455, 84);
            this.dtpBaslangic.Name = "dtpBaslangic";
            this.dtpBaslangic.Size = new System.Drawing.Size(140, 23);
            this.dtpBaslangic.TabIndex = 4;
            // 
            // lblPesinat
            // 
            this.lblPesinat.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblPesinat.Location = new System.Drawing.Point(610, 62);
            this.lblPesinat.Name = "lblPesinat";
            this.lblPesinat.Size = new System.Drawing.Size(120, 20);
            this.lblPesinat.TabIndex = 5;
            this.lblPesinat.Text = "Peşinat (₺)";
            // 
            // numPesinat
            // 
            this.numPesinat.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.numPesinat.DecimalPlaces = 2;
            this.numPesinat.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.numPesinat.Location = new System.Drawing.Point(610, 84);
            this.numPesinat.Maximum = new decimal(new int[] { 1000000, 0, 0, 0 });
            this.numPesinat.Name = "numPesinat";
            this.numPesinat.Size = new System.Drawing.Size(120, 23);
            this.numPesinat.TabIndex = 6;
            // 
            // lblYontem
            // 
            this.lblYontem.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblYontem.Location = new System.Drawing.Point(745, 62);
            this.lblYontem.Name = "lblYontem";
            this.lblYontem.Size = new System.Drawing.Size(115, 20);
            this.lblYontem.TabIndex = 7;
            this.lblYontem.Text = "Yöntem";
            // 
            // cmbYontem
            // 
            this.cmbYontem.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.cmbYontem.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbYontem.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.cmbYontem.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.cmbYontem.Location = new System.Drawing.Point(745, 84);
            this.cmbYontem.Name = "cmbYontem";
            this.cmbYontem.Size = new System.Drawing.Size(115, 23);
            this.cmbYontem.TabIndex = 8;
            // 
            // btnPaketSat
            // 
            this.btnPaketSat.BackColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnPaketSat.Enabled = false;
            this.btnPaketSat.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnPaketSat.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnPaketSat.ForeColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.btnPaketSat.Location = new System.Drawing.Point(20, 120);
            this.btnPaketSat.Name = "btnPaketSat";
            this.btnPaketSat.Size = new System.Drawing.Size(200, 36);
            this.btnPaketSat.TabIndex = 9;
            this.btnPaketSat.Text = "Paketi Sat";
            this.btnPaketSat.UseVisualStyleBackColor = false;
            this.btnPaketSat.Click += new System.EventHandler(this.btnPaketSat_Click);
            // 
            // lblSonuc
            // 
            this.lblSonuc.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.lblSonuc.Location = new System.Drawing.Point(235, 128);
            this.lblSonuc.Name = "lblSonuc";
            this.lblSonuc.Size = new System.Drawing.Size(625, 40);
            this.lblSonuc.TabIndex = 10;
            // 
            // MembersForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.ClientSize = new System.Drawing.Size(924, 541);
            this.Controls.Add(this.grpPaket);
            this.Controls.Add(this.dgvUyeler);
            this.Controls.Add(this.btnAra);
            this.Controls.Add(this.txtAra);
            this.Controls.Add(this.lblAra);
            this.Name = "MembersForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Üyeler ve Paket Satışı";
            this.Load += new System.EventHandler(this.MembersForm_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dgvUyeler)).EndInit();
            this.grpPaket.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.numPesinat)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblAra;
        private System.Windows.Forms.TextBox txtAra;
        private System.Windows.Forms.Button btnAra;
        private System.Windows.Forms.DataGridView dgvUyeler;
        private System.Windows.Forms.DataGridViewTextBoxColumn colAd;
        private System.Windows.Forms.DataGridViewTextBoxColumn colTelefon;
        private System.Windows.Forms.DataGridViewTextBoxColumn colQr;
        private System.Windows.Forms.DataGridViewTextBoxColumn colUyelik;
        private System.Windows.Forms.DataGridViewTextBoxColumn colBitis;
        private System.Windows.Forms.DataGridViewTextBoxColumn colSeans;
        private System.Windows.Forms.GroupBox grpPaket;
        private System.Windows.Forms.Label lblSecilenUye;
        private System.Windows.Forms.Label lblPaket;
        private System.Windows.Forms.ComboBox cmbPaket;
        private System.Windows.Forms.Label lblBaslangic;
        private System.Windows.Forms.DateTimePicker dtpBaslangic;
        private System.Windows.Forms.Label lblPesinat;
        private System.Windows.Forms.NumericUpDown numPesinat;
        private System.Windows.Forms.Label lblYontem;
        private System.Windows.Forms.ComboBox cmbYontem;
        private System.Windows.Forms.Button btnPaketSat;
        private System.Windows.Forms.Label lblSonuc;
    }
}
