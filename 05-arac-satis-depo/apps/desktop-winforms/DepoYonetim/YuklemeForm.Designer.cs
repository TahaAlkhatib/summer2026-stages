namespace DepoYonetim
{
    partial class YuklemeForm
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
            this.lblArac = new System.Windows.Forms.Label();
            this.cmbArac = new System.Windows.Forms.ComboBox();
            this.lblNot = new System.Windows.Forms.Label();
            this.txtNot = new System.Windows.Forms.TextBox();
            this.grpDepo = new System.Windows.Forms.GroupBox();
            this.dgvDepo = new System.Windows.Forms.DataGridView();
            this.pnlOrta = new System.Windows.Forms.Panel();
            this.lblMiktar = new System.Windows.Forms.Label();
            this.numMiktar = new System.Windows.Forms.NumericUpDown();
            this.btnEkle = new System.Windows.Forms.Button();
            this.btnCikar = new System.Windows.Forms.Button();
            this.grpYukleme = new System.Windows.Forms.GroupBox();
            this.dgvYukleme = new System.Windows.Forms.DataGridView();
            this.pnlAlt = new System.Windows.Forms.Panel();
            this.btnKaydet = new System.Windows.Forms.Button();
            this.btnKapat = new System.Windows.Forms.Button();
            this.lblDurum = new System.Windows.Forms.Label();
            this.pnlUst.SuspendLayout();
            this.grpDepo.SuspendLayout();
            this.pnlOrta.SuspendLayout();
            this.grpYukleme.SuspendLayout();
            this.pnlAlt.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.White;
            this.pnlUst.Controls.Add(this.txtNot);
            this.pnlUst.Controls.Add(this.lblNot);
            this.pnlUst.Controls.Add(this.cmbArac);
            this.pnlUst.Controls.Add(this.lblArac);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(940, 54);
            this.pnlUst.TabIndex = 0;
            // 
            // lblArac
            // 
            this.lblArac.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.lblArac.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.lblArac.Location = new System.Drawing.Point(14, 18);
            this.lblArac.Name = "lblArac";
            this.lblArac.Size = new System.Drawing.Size(50, 20);
            this.lblArac.TabIndex = 0;
            this.lblArac.Text = "Araç";
            // 
            // cmbArac
            // 
            this.cmbArac.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbArac.Location = new System.Drawing.Point(64, 15);
            this.cmbArac.Name = "cmbArac";
            this.cmbArac.Size = new System.Drawing.Size(260, 23);
            this.cmbArac.TabIndex = 1;
            // 
            // lblNot
            // 
            this.lblNot.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblNot.Location = new System.Drawing.Point(346, 18);
            this.lblNot.Name = "lblNot";
            this.lblNot.Size = new System.Drawing.Size(36, 20);
            this.lblNot.TabIndex = 2;
            this.lblNot.Text = "Not";
            // 
            // txtNot
            // 
            this.txtNot.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtNot.Location = new System.Drawing.Point(384, 15);
            this.txtNot.Name = "txtNot";
            this.txtNot.Size = new System.Drawing.Size(540, 23);
            this.txtNot.TabIndex = 3;
            // 
            // grpDepo
            // 
            this.grpDepo.Controls.Add(this.dgvDepo);
            this.grpDepo.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpDepo.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.grpDepo.Location = new System.Drawing.Point(12, 62);
            this.grpDepo.Name = "grpDepo";
            this.grpDepo.Size = new System.Drawing.Size(450, 400);
            this.grpDepo.TabIndex = 1;
            this.grpDepo.TabStop = false;
            this.grpDepo.Text = "Depo Stoğu";
            // 
            // dgvDepo
            // 
            this.dgvDepo.AllowUserToAddRows = false;
            this.dgvDepo.AllowUserToDeleteRows = false;
            this.dgvDepo.BackgroundColor = System.Drawing.Color.White;
            this.dgvDepo.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvDepo.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvDepo.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvDepo.Location = new System.Drawing.Point(3, 21);
            this.dgvDepo.MultiSelect = false;
            this.dgvDepo.Name = "dgvDepo";
            this.dgvDepo.ReadOnly = true;
            this.dgvDepo.RowHeadersVisible = false;
            this.dgvDepo.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvDepo.Size = new System.Drawing.Size(444, 376);
            this.dgvDepo.TabIndex = 0;
            this.dgvDepo.CellDoubleClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dgvDepo_CellDoubleClick);
            // 
            // pnlOrta
            // 
            this.pnlOrta.Controls.Add(this.btnCikar);
            this.pnlOrta.Controls.Add(this.btnEkle);
            this.pnlOrta.Controls.Add(this.numMiktar);
            this.pnlOrta.Controls.Add(this.lblMiktar);
            this.pnlOrta.Location = new System.Drawing.Point(468, 62);
            this.pnlOrta.Name = "pnlOrta";
            this.pnlOrta.Size = new System.Drawing.Size(110, 400);
            this.pnlOrta.TabIndex = 2;
            // 
            // lblMiktar
            // 
            this.lblMiktar.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblMiktar.Location = new System.Drawing.Point(4, 140);
            this.lblMiktar.Name = "lblMiktar";
            this.lblMiktar.Size = new System.Drawing.Size(100, 20);
            this.lblMiktar.TabIndex = 0;
            this.lblMiktar.Text = "Miktar";
            this.lblMiktar.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // numMiktar
            // 
            this.numMiktar.Location = new System.Drawing.Point(9, 162);
            this.numMiktar.Maximum = new decimal(new int[] { 100000, 0, 0, 0 });
            this.numMiktar.Minimum = new decimal(new int[] { 1, 0, 0, 0 });
            this.numMiktar.Name = "numMiktar";
            this.numMiktar.Size = new System.Drawing.Size(90, 23);
            this.numMiktar.TabIndex = 1;
            this.numMiktar.TextAlign = System.Windows.Forms.HorizontalAlignment.Center;
            this.numMiktar.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // btnEkle
            // 
            this.btnEkle.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnEkle.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnEkle.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnEkle.ForeColor = System.Drawing.Color.White;
            this.btnEkle.Location = new System.Drawing.Point(9, 196);
            this.btnEkle.Name = "btnEkle";
            this.btnEkle.Size = new System.Drawing.Size(90, 32);
            this.btnEkle.TabIndex = 2;
            this.btnEkle.Text = "Ekle →";
            this.btnEkle.UseVisualStyleBackColor = false;
            this.btnEkle.Click += new System.EventHandler(this.btnEkle_Click);
            // 
            // btnCikar
            // 
            this.btnCikar.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnCikar.ForeColor = System.Drawing.Color.FromArgb(185, 28, 28);
            this.btnCikar.Location = new System.Drawing.Point(9, 234);
            this.btnCikar.Name = "btnCikar";
            this.btnCikar.Size = new System.Drawing.Size(90, 30);
            this.btnCikar.TabIndex = 3;
            this.btnCikar.Text = "← Çıkar";
            this.btnCikar.UseVisualStyleBackColor = true;
            this.btnCikar.Click += new System.EventHandler(this.btnCikar_Click);
            // 
            // grpYukleme
            // 
            this.grpYukleme.Controls.Add(this.dgvYukleme);
            this.grpYukleme.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpYukleme.ForeColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.grpYukleme.Location = new System.Drawing.Point(584, 62);
            this.grpYukleme.Name = "grpYukleme";
            this.grpYukleme.Size = new System.Drawing.Size(344, 400);
            this.grpYukleme.TabIndex = 3;
            this.grpYukleme.TabStop = false;
            this.grpYukleme.Text = "Yüklenecekler";
            // 
            // dgvYukleme
            // 
            this.dgvYukleme.AllowUserToAddRows = false;
            this.dgvYukleme.AllowUserToDeleteRows = false;
            this.dgvYukleme.BackgroundColor = System.Drawing.Color.White;
            this.dgvYukleme.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvYukleme.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvYukleme.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvYukleme.Location = new System.Drawing.Point(3, 21);
            this.dgvYukleme.MultiSelect = false;
            this.dgvYukleme.Name = "dgvYukleme";
            this.dgvYukleme.ReadOnly = true;
            this.dgvYukleme.RowHeadersVisible = false;
            this.dgvYukleme.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvYukleme.Size = new System.Drawing.Size(338, 376);
            this.dgvYukleme.TabIndex = 0;
            // 
            // pnlAlt
            // 
            this.pnlAlt.BackColor = System.Drawing.Color.White;
            this.pnlAlt.Controls.Add(this.lblDurum);
            this.pnlAlt.Controls.Add(this.btnKapat);
            this.pnlAlt.Controls.Add(this.btnKaydet);
            this.pnlAlt.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.pnlAlt.Location = new System.Drawing.Point(0, 472);
            this.pnlAlt.Name = "pnlAlt";
            this.pnlAlt.Size = new System.Drawing.Size(940, 50);
            this.pnlAlt.TabIndex = 4;
            // 
            // btnKaydet
            // 
            this.btnKaydet.BackColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.btnKaydet.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnKaydet.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnKaydet.ForeColor = System.Drawing.Color.White;
            this.btnKaydet.Location = new System.Drawing.Point(690, 10);
            this.btnKaydet.Name = "btnKaydet";
            this.btnKaydet.Size = new System.Drawing.Size(150, 32);
            this.btnKaydet.TabIndex = 0;
            this.btnKaydet.Text = "Yüklemeyi Kaydet";
            this.btnKaydet.UseVisualStyleBackColor = false;
            this.btnKaydet.Click += new System.EventHandler(this.btnKaydet_Click);
            // 
            // btnKapat
            // 
            this.btnKapat.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnKapat.Location = new System.Drawing.Point(850, 10);
            this.btnKapat.Name = "btnKapat";
            this.btnKapat.Size = new System.Drawing.Size(78, 32);
            this.btnKapat.TabIndex = 1;
            this.btnKapat.Text = "Kapat";
            this.btnKapat.UseVisualStyleBackColor = true;
            this.btnKapat.Click += new System.EventHandler(this.btnKapat_Click);
            // 
            // lblDurum
            // 
            this.lblDurum.ForeColor = System.Drawing.Color.FromArgb(107, 122, 140);
            this.lblDurum.Location = new System.Drawing.Point(14, 16);
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Size = new System.Drawing.Size(660, 20);
            this.lblDurum.TabIndex = 2;
            // 
            // YuklemeForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(242, 245, 248);
            this.ClientSize = new System.Drawing.Size(940, 522);
            this.Controls.Add(this.grpYukleme);
            this.Controls.Add(this.pnlOrta);
            this.Controls.Add(this.grpDepo);
            this.Controls.Add(this.pnlAlt);
            this.Controls.Add(this.pnlUst);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "YuklemeForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Depodan Araca Yükleme";
            this.Load += new System.EventHandler(this.YuklemeForm_Load);
            this.pnlUst.ResumeLayout(false);
            this.pnlUst.PerformLayout();
            this.grpDepo.ResumeLayout(false);
            this.pnlOrta.ResumeLayout(false);
            this.grpYukleme.ResumeLayout(false);
            this.pnlAlt.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblArac;
        private System.Windows.Forms.ComboBox cmbArac;
        private System.Windows.Forms.Label lblNot;
        private System.Windows.Forms.TextBox txtNot;
        private System.Windows.Forms.GroupBox grpDepo;
        private System.Windows.Forms.DataGridView dgvDepo;
        private System.Windows.Forms.Panel pnlOrta;
        private System.Windows.Forms.Label lblMiktar;
        private System.Windows.Forms.NumericUpDown numMiktar;
        private System.Windows.Forms.Button btnEkle;
        private System.Windows.Forms.Button btnCikar;
        private System.Windows.Forms.GroupBox grpYukleme;
        private System.Windows.Forms.DataGridView dgvYukleme;
        private System.Windows.Forms.Panel pnlAlt;
        private System.Windows.Forms.Button btnKaydet;
        private System.Windows.Forms.Button btnKapat;
        private System.Windows.Forms.Label lblDurum;
    }
}
