namespace DepoYonetim
{
    partial class FaturalarForm
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
            this.lblOdeme = new System.Windows.Forms.Label();
            this.cmbOdeme = new System.Windows.Forms.ComboBox();
            this.chkTarih = new System.Windows.Forms.CheckBox();
            this.dtpTarih = new System.Windows.Forms.DateTimePicker();
            this.chkAcik = new System.Windows.Forms.CheckBox();
            this.btnListele = new System.Windows.Forms.Button();
            this.dgvFaturalar = new System.Windows.Forms.DataGridView();
            this.pnlAlt = new System.Windows.Forms.Panel();
            this.btnDetay = new System.Windows.Forms.Button();
            this.lblDurum = new System.Windows.Forms.Label();
            this.pnlUst.SuspendLayout();
            this.pnlAlt.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.White;
            this.pnlUst.Controls.Add(this.btnListele);
            this.pnlUst.Controls.Add(this.chkAcik);
            this.pnlUst.Controls.Add(this.dtpTarih);
            this.pnlUst.Controls.Add(this.chkTarih);
            this.pnlUst.Controls.Add(this.cmbOdeme);
            this.pnlUst.Controls.Add(this.lblOdeme);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(980, 52);
            this.pnlUst.TabIndex = 0;
            // 
            // lblOdeme
            // 
            this.lblOdeme.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblOdeme.Location = new System.Drawing.Point(14, 18);
            this.lblOdeme.Name = "lblOdeme";
            this.lblOdeme.Size = new System.Drawing.Size(52, 20);
            this.lblOdeme.TabIndex = 0;
            this.lblOdeme.Text = "Ödeme";
            // 
            // cmbOdeme
            // 
            this.cmbOdeme.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbOdeme.Items.AddRange(new object[] { "Hepsi", "Nakit", "Vadeli" });
            this.cmbOdeme.Location = new System.Drawing.Point(66, 15);
            this.cmbOdeme.Name = "cmbOdeme";
            this.cmbOdeme.Size = new System.Drawing.Size(120, 23);
            this.cmbOdeme.TabIndex = 1;
            // 
            // chkTarih
            // 
            this.chkTarih.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.chkTarih.Location = new System.Drawing.Point(202, 16);
            this.chkTarih.Name = "chkTarih";
            this.chkTarih.Size = new System.Drawing.Size(60, 22);
            this.chkTarih.TabIndex = 2;
            this.chkTarih.Text = "Tarih";
            this.chkTarih.UseVisualStyleBackColor = true;
            // 
            // dtpTarih
            // 
            this.dtpTarih.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpTarih.Location = new System.Drawing.Point(266, 14);
            this.dtpTarih.Name = "dtpTarih";
            this.dtpTarih.Size = new System.Drawing.Size(130, 23);
            this.dtpTarih.TabIndex = 3;
            // 
            // chkAcik
            // 
            this.chkAcik.ForeColor = System.Drawing.Color.FromArgb(180, 83, 9);
            this.chkAcik.Location = new System.Drawing.Point(412, 16);
            this.chkAcik.Name = "chkAcik";
            this.chkAcik.Size = new System.Drawing.Size(190, 22);
            this.chkAcik.TabIndex = 4;
            this.chkAcik.Text = "Sadece ödenmemiş faturalar";
            this.chkAcik.UseVisualStyleBackColor = true;
            // 
            // btnListele
            // 
            this.btnListele.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnListele.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnListele.ForeColor = System.Drawing.Color.White;
            this.btnListele.Location = new System.Drawing.Point(612, 13);
            this.btnListele.Name = "btnListele";
            this.btnListele.Size = new System.Drawing.Size(110, 26);
            this.btnListele.TabIndex = 5;
            this.btnListele.Text = "Listele";
            this.btnListele.UseVisualStyleBackColor = false;
            this.btnListele.Click += new System.EventHandler(this.btnListele_Click);
            // 
            // dgvFaturalar
            // 
            this.dgvFaturalar.AllowUserToAddRows = false;
            this.dgvFaturalar.AllowUserToDeleteRows = false;
            this.dgvFaturalar.BackgroundColor = System.Drawing.Color.White;
            this.dgvFaturalar.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvFaturalar.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvFaturalar.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvFaturalar.Location = new System.Drawing.Point(0, 52);
            this.dgvFaturalar.MultiSelect = false;
            this.dgvFaturalar.Name = "dgvFaturalar";
            this.dgvFaturalar.ReadOnly = true;
            this.dgvFaturalar.RowHeadersVisible = false;
            this.dgvFaturalar.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvFaturalar.Size = new System.Drawing.Size(980, 448);
            this.dgvFaturalar.TabIndex = 1;
            this.dgvFaturalar.CellDoubleClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dgvFaturalar_CellDoubleClick);
            // 
            // pnlAlt
            // 
            this.pnlAlt.BackColor = System.Drawing.Color.White;
            this.pnlAlt.Controls.Add(this.lblDurum);
            this.pnlAlt.Controls.Add(this.btnDetay);
            this.pnlAlt.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.pnlAlt.Location = new System.Drawing.Point(0, 500);
            this.pnlAlt.Name = "pnlAlt";
            this.pnlAlt.Size = new System.Drawing.Size(980, 50);
            this.pnlAlt.TabIndex = 2;
            // 
            // btnDetay
            // 
            this.btnDetay.BackColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.btnDetay.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnDetay.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnDetay.ForeColor = System.Drawing.Color.White;
            this.btnDetay.Location = new System.Drawing.Point(14, 10);
            this.btnDetay.Name = "btnDetay";
            this.btnDetay.Size = new System.Drawing.Size(160, 30);
            this.btnDetay.TabIndex = 0;
            this.btnDetay.Text = "Fatura Detayı";
            this.btnDetay.UseVisualStyleBackColor = false;
            this.btnDetay.Click += new System.EventHandler(this.btnDetay_Click);
            // 
            // lblDurum
            // 
            this.lblDurum.ForeColor = System.Drawing.Color.FromArgb(107, 122, 140);
            this.lblDurum.Location = new System.Drawing.Point(190, 16);
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Size = new System.Drawing.Size(770, 20);
            this.lblDurum.TabIndex = 1;
            this.lblDurum.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // FaturalarForm
            // 
            this.AcceptButton = this.btnListele;
            this.BackColor = System.Drawing.Color.FromArgb(242, 245, 248);
            this.ClientSize = new System.Drawing.Size(980, 550);
            this.Controls.Add(this.dgvFaturalar);
            this.Controls.Add(this.pnlAlt);
            this.Controls.Add(this.pnlUst);
            this.MinimizeBox = false;
            this.Name = "FaturalarForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Faturalar";
            this.Load += new System.EventHandler(this.FaturalarForm_Load);
            this.pnlUst.ResumeLayout(false);
            this.pnlAlt.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblOdeme;
        private System.Windows.Forms.ComboBox cmbOdeme;
        private System.Windows.Forms.CheckBox chkTarih;
        private System.Windows.Forms.DateTimePicker dtpTarih;
        private System.Windows.Forms.CheckBox chkAcik;
        private System.Windows.Forms.Button btnListele;
        private System.Windows.Forms.DataGridView dgvFaturalar;
        private System.Windows.Forms.Panel pnlAlt;
        private System.Windows.Forms.Button btnDetay;
        private System.Windows.Forms.Label lblDurum;
    }
}
