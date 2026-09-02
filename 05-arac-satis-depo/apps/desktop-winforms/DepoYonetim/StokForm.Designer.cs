namespace DepoYonetim
{
    partial class StokForm
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
            this.lblAra = new System.Windows.Forms.Label();
            this.txtAra = new System.Windows.Forms.TextBox();
            this.chkKritik = new System.Windows.Forms.CheckBox();
            this.btnAra = new System.Windows.Forms.Button();
            this.dgvStok = new System.Windows.Forms.DataGridView();
            this.pnlAlt = new System.Windows.Forms.Panel();
            this.btnStokGiris = new System.Windows.Forms.Button();
            this.btnYeniUrun = new System.Windows.Forms.Button();
            this.lblDurum = new System.Windows.Forms.Label();
            this.pnlUst.SuspendLayout();
            this.pnlAlt.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.White;
            this.pnlUst.Controls.Add(this.btnAra);
            this.pnlUst.Controls.Add(this.chkKritik);
            this.pnlUst.Controls.Add(this.txtAra);
            this.pnlUst.Controls.Add(this.lblAra);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(900, 52);
            this.pnlUst.TabIndex = 0;
            // 
            // lblAra
            // 
            this.lblAra.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblAra.Location = new System.Drawing.Point(14, 18);
            this.lblAra.Name = "lblAra";
            this.lblAra.Size = new System.Drawing.Size(70, 20);
            this.lblAra.TabIndex = 0;
            this.lblAra.Text = "Ürün ara";
            // 
            // txtAra
            // 
            this.txtAra.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtAra.Location = new System.Drawing.Point(84, 15);
            this.txtAra.Name = "txtAra";
            this.txtAra.Size = new System.Drawing.Size(240, 23);
            this.txtAra.TabIndex = 1;
            // 
            // chkKritik
            // 
            this.chkKritik.ForeColor = System.Drawing.Color.FromArgb(185, 28, 28);
            this.chkKritik.Location = new System.Drawing.Point(340, 16);
            this.chkKritik.Name = "chkKritik";
            this.chkKritik.Size = new System.Drawing.Size(220, 22);
            this.chkKritik.TabIndex = 2;
            this.chkKritik.Text = "Sadece kritik stok seviyesindekiler";
            this.chkKritik.UseVisualStyleBackColor = true;
            // 
            // btnAra
            // 
            this.btnAra.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnAra.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnAra.ForeColor = System.Drawing.Color.White;
            this.btnAra.Location = new System.Drawing.Point(570, 14);
            this.btnAra.Name = "btnAra";
            this.btnAra.Size = new System.Drawing.Size(100, 26);
            this.btnAra.TabIndex = 3;
            this.btnAra.Text = "Listele";
            this.btnAra.UseVisualStyleBackColor = false;
            this.btnAra.Click += new System.EventHandler(this.btnAra_Click);
            // 
            // dgvStok
            // 
            this.dgvStok.AllowUserToAddRows = false;
            this.dgvStok.AllowUserToDeleteRows = false;
            this.dgvStok.BackgroundColor = System.Drawing.Color.White;
            this.dgvStok.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.dgvStok.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvStok.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvStok.Location = new System.Drawing.Point(0, 52);
            this.dgvStok.MultiSelect = false;
            this.dgvStok.Name = "dgvStok";
            this.dgvStok.ReadOnly = true;
            this.dgvStok.RowHeadersVisible = false;
            this.dgvStok.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvStok.Size = new System.Drawing.Size(900, 428);
            this.dgvStok.TabIndex = 1;
            // 
            // pnlAlt
            // 
            this.pnlAlt.BackColor = System.Drawing.Color.White;
            this.pnlAlt.Controls.Add(this.lblDurum);
            this.pnlAlt.Controls.Add(this.btnYeniUrun);
            this.pnlAlt.Controls.Add(this.btnStokGiris);
            this.pnlAlt.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.pnlAlt.Location = new System.Drawing.Point(0, 480);
            this.pnlAlt.Name = "pnlAlt";
            this.pnlAlt.Size = new System.Drawing.Size(900, 50);
            this.pnlAlt.TabIndex = 2;
            // 
            // btnStokGiris
            // 
            this.btnStokGiris.BackColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.btnStokGiris.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnStokGiris.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold);
            this.btnStokGiris.ForeColor = System.Drawing.Color.White;
            this.btnStokGiris.Location = new System.Drawing.Point(14, 10);
            this.btnStokGiris.Name = "btnStokGiris";
            this.btnStokGiris.Size = new System.Drawing.Size(170, 30);
            this.btnStokGiris.TabIndex = 0;
            this.btnStokGiris.Text = "Depoya Mal Girişi";
            this.btnStokGiris.UseVisualStyleBackColor = false;
            this.btnStokGiris.Click += new System.EventHandler(this.btnStokGiris_Click);
            // 
            // btnYeniUrun
            // 
            this.btnYeniUrun.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYeniUrun.ForeColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnYeniUrun.Location = new System.Drawing.Point(194, 10);
            this.btnYeniUrun.Name = "btnYeniUrun";
            this.btnYeniUrun.Size = new System.Drawing.Size(140, 30);
            this.btnYeniUrun.TabIndex = 1;
            this.btnYeniUrun.Text = "Yeni Ürün";
            this.btnYeniUrun.UseVisualStyleBackColor = true;
            this.btnYeniUrun.Click += new System.EventHandler(this.btnYeniUrun_Click);
            // 
            // lblDurum
            // 
            this.lblDurum.ForeColor = System.Drawing.Color.FromArgb(107, 122, 140);
            this.lblDurum.Location = new System.Drawing.Point(350, 16);
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Size = new System.Drawing.Size(530, 20);
            this.lblDurum.TabIndex = 2;
            this.lblDurum.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // StokForm
            // 
            this.AcceptButton = this.btnAra;
            this.BackColor = System.Drawing.Color.FromArgb(242, 245, 248);
            this.ClientSize = new System.Drawing.Size(900, 530);
            this.Controls.Add(this.dgvStok);
            this.Controls.Add(this.pnlAlt);
            this.Controls.Add(this.pnlUst);
            this.MinimizeBox = false;
            this.Name = "StokForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Merkez Depo Stoğu";
            this.Load += new System.EventHandler(this.StokForm_Load);
            this.pnlUst.ResumeLayout(false);
            this.pnlAlt.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblAra;
        private System.Windows.Forms.TextBox txtAra;
        private System.Windows.Forms.CheckBox chkKritik;
        private System.Windows.Forms.Button btnAra;
        private System.Windows.Forms.DataGridView dgvStok;
        private System.Windows.Forms.Panel pnlAlt;
        private System.Windows.Forms.Button btnStokGiris;
        private System.Windows.Forms.Button btnYeniUrun;
        private System.Windows.Forms.Label lblDurum;
    }
}
