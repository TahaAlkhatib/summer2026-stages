namespace DepoYonetim
{
    partial class LoginForm
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
            this.lblBaslik = new System.Windows.Forms.Label();
            this.lblAltBaslik = new System.Windows.Forms.Label();
            this.lblKullanici = new System.Windows.Forms.Label();
            this.txtKullanici = new System.Windows.Forms.TextBox();
            this.lblSifre = new System.Windows.Forms.Label();
            this.txtSifre = new System.Windows.Forms.TextBox();
            this.btnGiris = new System.Windows.Forms.Button();
            this.lblHata = new System.Windows.Forms.Label();
            this.lblIpucu = new System.Windows.Forms.Label();
            this.pnlUst.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlUst
            // 
            this.pnlUst.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.pnlUst.Controls.Add(this.lblAltBaslik);
            this.pnlUst.Controls.Add(this.lblBaslik);
            this.pnlUst.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlUst.Location = new System.Drawing.Point(0, 0);
            this.pnlUst.Name = "pnlUst";
            this.pnlUst.Size = new System.Drawing.Size(400, 90);
            this.pnlUst.TabIndex = 0;
            // 
            // lblBaslik
            // 
            this.lblBaslik.Font = new System.Drawing.Font("Segoe UI", 16F, System.Drawing.FontStyle.Bold);
            this.lblBaslik.ForeColor = System.Drawing.Color.White;
            this.lblBaslik.Location = new System.Drawing.Point(20, 20);
            this.lblBaslik.Name = "lblBaslik";
            this.lblBaslik.Size = new System.Drawing.Size(360, 32);
            this.lblBaslik.TabIndex = 0;
            this.lblBaslik.Text = "DEPO YÖNETİMİ";
            this.lblBaslik.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblAltBaslik
            // 
            this.lblAltBaslik.ForeColor = System.Drawing.Color.FromArgb(247, 127, 0);
            this.lblAltBaslik.Location = new System.Drawing.Point(20, 54);
            this.lblAltBaslik.Name = "lblAltBaslik";
            this.lblAltBaslik.Size = new System.Drawing.Size(360, 20);
            this.lblAltBaslik.TabIndex = 1;
            this.lblAltBaslik.Text = "Araç Üstü Satış — Merkez Depo";
            this.lblAltBaslik.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblKullanici
            // 
            this.lblKullanici.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblKullanici.Location = new System.Drawing.Point(40, 112);
            this.lblKullanici.Name = "lblKullanici";
            this.lblKullanici.Size = new System.Drawing.Size(120, 20);
            this.lblKullanici.TabIndex = 1;
            this.lblKullanici.Text = "Kullanıcı Adı";
            // 
            // txtKullanici
            // 
            this.txtKullanici.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtKullanici.Location = new System.Drawing.Point(40, 134);
            this.txtKullanici.Name = "txtKullanici";
            this.txtKullanici.Size = new System.Drawing.Size(320, 23);
            this.txtKullanici.TabIndex = 2;
            // 
            // lblSifre
            // 
            this.lblSifre.ForeColor = System.Drawing.Color.FromArgb(51, 65, 85);
            this.lblSifre.Location = new System.Drawing.Point(40, 168);
            this.lblSifre.Name = "lblSifre";
            this.lblSifre.Size = new System.Drawing.Size(120, 20);
            this.lblSifre.TabIndex = 3;
            this.lblSifre.Text = "Şifre";
            // 
            // txtSifre
            // 
            this.txtSifre.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtSifre.Location = new System.Drawing.Point(40, 190);
            this.txtSifre.Name = "txtSifre";
            this.txtSifre.Size = new System.Drawing.Size(320, 23);
            this.txtSifre.TabIndex = 4;
            this.txtSifre.UseSystemPasswordChar = true;
            // 
            // btnGiris
            // 
            this.btnGiris.BackColor = System.Drawing.Color.FromArgb(29, 78, 137);
            this.btnGiris.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnGiris.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnGiris.ForeColor = System.Drawing.Color.White;
            this.btnGiris.Location = new System.Drawing.Point(40, 228);
            this.btnGiris.Name = "btnGiris";
            this.btnGiris.Size = new System.Drawing.Size(320, 38);
            this.btnGiris.TabIndex = 5;
            this.btnGiris.Text = "Giriş Yap";
            this.btnGiris.UseVisualStyleBackColor = false;
            this.btnGiris.Click += new System.EventHandler(this.btnGiris_Click);
            // 
            // lblHata
            // 
            this.lblHata.ForeColor = System.Drawing.Color.FromArgb(185, 28, 28);
            this.lblHata.Location = new System.Drawing.Point(40, 272);
            this.lblHata.Name = "lblHata";
            this.lblHata.Size = new System.Drawing.Size(320, 34);
            this.lblHata.TabIndex = 6;
            // 
            // lblIpucu
            // 
            this.lblIpucu.ForeColor = System.Drawing.Color.FromArgb(148, 163, 184);
            this.lblIpucu.Location = new System.Drawing.Point(40, 308);
            this.lblIpucu.Name = "lblIpucu";
            this.lblIpucu.Size = new System.Drawing.Size(320, 20);
            this.lblIpucu.TabIndex = 7;
            this.lblIpucu.Text = "Demo: depo1 / 123456";
            this.lblIpucu.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // LoginForm
            // 
            this.AcceptButton = this.btnGiris;
            this.BackColor = System.Drawing.Color.White;
            this.ClientSize = new System.Drawing.Size(400, 340);
            this.Controls.Add(this.lblIpucu);
            this.Controls.Add(this.lblHata);
            this.Controls.Add(this.btnGiris);
            this.Controls.Add(this.txtSifre);
            this.Controls.Add(this.lblSifre);
            this.Controls.Add(this.txtKullanici);
            this.Controls.Add(this.lblKullanici);
            this.Controls.Add(this.pnlUst);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "LoginForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Depo Yönetimi — Giriş";
            this.pnlUst.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Panel pnlUst;
        private System.Windows.Forms.Label lblBaslik;
        private System.Windows.Forms.Label lblAltBaslik;
        private System.Windows.Forms.Label lblKullanici;
        private System.Windows.Forms.TextBox txtKullanici;
        private System.Windows.Forms.Label lblSifre;
        private System.Windows.Forms.TextBox txtSifre;
        private System.Windows.Forms.Button btnGiris;
        private System.Windows.Forms.Label lblHata;
        private System.Windows.Forms.Label lblIpucu;
    }
}
