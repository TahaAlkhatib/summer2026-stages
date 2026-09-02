namespace DepoYonetim
{
    partial class AraclarForm
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
            this.splitAna = new System.Windows.Forms.SplitContainer();
            this.dgvAraclar = new System.Windows.Forms.DataGridView();
            this.grpStok = new System.Windows.Forms.GroupBox();
            this.dgvStok = new System.Windows.Forms.DataGridView();
            this.grpRota = new System.Windows.Forms.GroupBox();
            this.dgvRota = new System.Windows.Forms.DataGridView();
            this.pnlUst = new System.Windows.Forms.Panel();
            this.lblTarih = new System.Windows.Forms.Label();
            this.dtpTarih = new System.Windows.Forms.DateTimePicker();
            this.btnRota = new System.Windows.Forms.Button();
            this.lblKonum = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.splitAna)).BeginInit();
            this.splitAna.Panel1.SuspendLayout();
            this.splitAna.Panel2.SuspendLayout();
            this.splitAna.SuspendLayout();
            this.grpStok.SuspendLayout();
            this.grpRota.SuspendLayout();
            this.pnlUst.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.White;
            this.pnlUst.Controls.Add(this.lblKonum);
            this.pnlUst.Controls.Add(this.btnRota);
            this.pnlUst.Controls.Add(this.dtpTarih);
            this.pnlUst.Controls.Add(this.lblTarih);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(960, 50);
            this.pnlUst.TabIndex = 0;
            // 
            // lblTarih
            // 
            this.lblTarih.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblTarih.Location = new System.Drawing.Point(14, 16);
            this.lblTarih.Name = "lblTarih";
            this.lblTarih.Size = new System.Drawing.Size(90, 20);
            this.lblTarih.TabIndex = 0;
            this.lblTarih.Text = "Rota tarihi";
            // 
            // dtpTarih
            // 
            this.dtpTarih.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dtpTarih.Location = new System.Drawing.Point(104, 13);
            this.dtpTarih.Name = "dtpTarih";
            this.dtpTarih.Size = new System.Drawing.Size(130, 23);
            this.dtpTarih.TabIndex = 1;
            // 
            // btnRota
            // 
            this.btnRota.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnRota.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnRota.ForeColor = System.Drawing.Color.White;
            this.btnRota.Location = new System.Drawing.Point(244, 12);
            this.btnRota.Name = "btnRota";
            this.btnRota.Size = new System.Drawing.Size(120, 26);
            this.btnRota.TabIndex = 2;
            this.btnRota.Text = "Rotayı Getir";
            this.btnRota.UseVisualStyleBackColor = false;
            this.btnRota.Click += new System.EventHandler(this.btnRota_Click);
            // 
            // lblKonum
            // 
            this.lblKonum.ForeColor = System.Drawing.Color.FromArgb(107, 122, 140);
            this.lblKonum.Location = new System.Drawing.Point(380, 16);
            this.lblKonum.Name = "lblKonum";
            this.lblKonum.Size = new System.Drawing.Size(560, 20);
            this.lblKonum.TabIndex = 3;
            // 
            // splitAna
            // 
            this.splitAna.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitAna.Location = new System.Drawing.Point(0, 50);
            this.splitAna.Name = "splitAna";
            this.splitAna.Orientation = System.Windows.Forms.Orientation.Horizontal;
            this.splitAna.Panel1.Controls.Add(this.dgvAraclar);
            this.splitAna.Panel2.Controls.Add(this.grpRota);
            this.splitAna.Panel2.Controls.Add(this.grpStok);
            this.splitAna.Size = new System.Drawing.Size(960, 550);
            this.splitAna.SplitterDistance = 200;
            this.splitAna.TabIndex = 1;
            // 
            // dgvAraclar
            // 
            this.dgvAraclar.AllowUserToAddRows = false;
            this.dgvAraclar.AllowUserToDeleteRows = false;
            this.dgvAraclar.BackgroundColor = System.Drawing.Color.White;
            this.dgvAraclar.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvAraclar.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvAraclar.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvAraclar.Location = new System.Drawing.Point(0, 0);
            this.dgvAraclar.MultiSelect = false;
            this.dgvAraclar.Name = "dgvAraclar";
            this.dgvAraclar.ReadOnly = true;
            this.dgvAraclar.RowHeadersVisible = false;
            this.dgvAraclar.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvAraclar.Size = new System.Drawing.Size(960, 200);
            this.dgvAraclar.TabIndex = 0;
            this.dgvAraclar.SelectionChanged += new System.EventHandler(this.dgvAraclar_SelectionChanged);
            // 
            // grpStok
            // 
            this.grpStok.Controls.Add(this.dgvStok);
            this.grpStok.Dock = System.Windows.Forms.DockStyle.Left;
            this.grpStok.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpStok.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.grpStok.Location = new System.Drawing.Point(0, 0);
            this.grpStok.Name = "grpStok";
            this.grpStok.Size = new System.Drawing.Size(420, 346);
            this.grpStok.TabIndex = 0;
            this.grpStok.TabStop = false;
            this.grpStok.Text = "Araç Üstü Stok";
            // 
            // dgvStok
            // 
            this.dgvStok.AllowUserToAddRows = false;
            this.dgvStok.AllowUserToDeleteRows = false;
            this.dgvStok.BackgroundColor = System.Drawing.Color.White;
            this.dgvStok.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvStok.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvStok.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvStok.Location = new System.Drawing.Point(3, 21);
            this.dgvStok.MultiSelect = false;
            this.dgvStok.Name = "dgvStok";
            this.dgvStok.ReadOnly = true;
            this.dgvStok.RowHeadersVisible = false;
            this.dgvStok.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvStok.Size = new System.Drawing.Size(414, 322);
            this.dgvStok.TabIndex = 0;
            // 
            // grpRota
            // 
            this.grpRota.Controls.Add(this.dgvRota);
            this.grpRota.Dock = System.Windows.Forms.DockStyle.Fill;
            this.grpRota.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.grpRota.ForeColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.grpRota.Location = new System.Drawing.Point(420, 0);
            this.grpRota.Name = "grpRota";
            this.grpRota.Size = new System.Drawing.Size(540, 346);
            this.grpRota.TabIndex = 1;
            this.grpRota.TabStop = false;
            this.grpRota.Text = "Günün Rotası (fatura kesilen duraklar)";
            // 
            // dgvRota
            // 
            this.dgvRota.AllowUserToAddRows = false;
            this.dgvRota.AllowUserToDeleteRows = false;
            this.dgvRota.BackgroundColor = System.Drawing.Color.White;
            this.dgvRota.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvRota.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvRota.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvRota.Location = new System.Drawing.Point(3, 21);
            this.dgvRota.MultiSelect = false;
            this.dgvRota.Name = "dgvRota";
            this.dgvRota.ReadOnly = true;
            this.dgvRota.RowHeadersVisible = false;
            this.dgvRota.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvRota.Size = new System.Drawing.Size(534, 322);
            this.dgvRota.TabIndex = 0;
            // 
            // AraclarForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(242, 245, 248);
            this.ClientSize = new System.Drawing.Size(960, 600);
            this.Controls.Add(this.splitAna);
            this.Controls.Add(this.pnlUst);
            this.MinimizeBox = false;
            this.Name = "AraclarForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Araçlar ve Rota Takibi";
            this.Load += new System.EventHandler(this.AraclarForm_Load);
            this.splitAna.Panel1.ResumeLayout(false);
            this.splitAna.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitAna)).EndInit();
            this.splitAna.ResumeLayout(false);
            this.grpStok.ResumeLayout(false);
            this.grpRota.ResumeLayout(false);
            this.pnlUst.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblTarih;
        private System.Windows.Forms.DateTimePicker dtpTarih;
        private System.Windows.Forms.Button btnRota;
        private System.Windows.Forms.Label lblKonum;
        private System.Windows.Forms.SplitContainer splitAna;
        private System.Windows.Forms.DataGridView dgvAraclar;
        private System.Windows.Forms.GroupBox grpStok;
        private System.Windows.Forms.DataGridView dgvStok;
        private System.Windows.Forms.GroupBox grpRota;
        private System.Windows.Forms.DataGridView dgvRota;
    }
}
