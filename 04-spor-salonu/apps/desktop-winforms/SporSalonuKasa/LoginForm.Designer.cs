namespace SporSalonuKasa
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
            this.lblBaslik = new System.Windows.Forms.Label();
            this.lblKullanici = new System.Windows.Forms.Label();
            this.txtKullanici = new System.Windows.Forms.TextBox();
            this.lblSifre = new System.Windows.Forms.Label();
            this.txtSifre = new System.Windows.Forms.TextBox();
            this.btnGiris = new System.Windows.Forms.Button();
            this.lblHata = new System.Windows.Forms.Label();
            this.lblIpucu = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // lblBaslik
            // 
            this.lblBaslik.Font = new System.Drawing.Font("Segoe UI", 15F, System.Drawing.FontStyle.Bold);
            this.lblBaslik.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.lblBaslik.Location = new System.Drawing.Point(20, 18);
            this.lblBaslik.Name = "lblBaslik";
            this.lblBaslik.Size = new System.Drawing.Size(340, 34);
            this.lblBaslik.TabIndex = 0;
            this.lblBaslik.Text = "SPOR SALONU";
            this.lblBaslik.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblKullanici
            // 
            this.lblKullanici.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblKullanici.Location = new System.Drawing.Point(30, 64);
            this.lblKullanici.Name = "lblKullanici";
            this.lblKullanici.Size = new System.Drawing.Size(120, 20);
            this.lblKullanici.TabIndex = 1;
            this.lblKullanici.Text = "Kullanıcı Adı";
            // 
            // txtKullanici
            // 
            this.txtKullanici.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.txtKullanici.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtKullanici.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.txtKullanici.Location = new System.Drawing.Point(30, 86);
            this.txtKullanici.Name = "txtKullanici";
            this.txtKullanici.Size = new System.Drawing.Size(320, 23);
            this.txtKullanici.TabIndex = 2;
            // 
            // lblSifre
            // 
            this.lblSifre.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblSifre.Location = new System.Drawing.Point(30, 120);
            this.lblSifre.Name = "lblSifre";
            this.lblSifre.Size = new System.Drawing.Size(120, 20);
            this.lblSifre.TabIndex = 3;
            this.lblSifre.Text = "Şifre";
            // 
            // txtSifre
            // 
            this.txtSifre.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.txtSifre.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtSifre.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.txtSifre.Location = new System.Drawing.Point(30, 142);
            this.txtSifre.Name = "txtSifre";
            this.txtSifre.Size = new System.Drawing.Size(320, 23);
            this.txtSifre.TabIndex = 4;
            this.txtSifre.UseSystemPasswordChar = true;
            // 
            // btnGiris
            // 
            this.btnGiris.BackColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnGiris.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnGiris.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnGiris.ForeColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.btnGiris.Location = new System.Drawing.Point(30, 180);
            this.btnGiris.Name = "btnGiris";
            this.btnGiris.Size = new System.Drawing.Size(320, 36);
            this.btnGiris.TabIndex = 5;
            this.btnGiris.Text = "Giriş Yap";
            this.btnGiris.UseVisualStyleBackColor = false;
            this.btnGiris.Click += new System.EventHandler(this.btnGiris_Click);
            // 
            // lblHata
            // 
            this.lblHata.ForeColor = System.Drawing.Color.FromArgb(248, 113, 113);
            this.lblHata.Location = new System.Drawing.Point(30, 222);
            this.lblHata.Name = "lblHata";
            this.lblHata.Size = new System.Drawing.Size(320, 34);
            this.lblHata.TabIndex = 6;
            // 
            // lblIpucu
            // 
            this.lblIpucu.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblIpucu.Location = new System.Drawing.Point(30, 244);
            this.lblIpucu.Name = "lblIpucu";
            this.lblIpucu.Size = new System.Drawing.Size(320, 20);
            this.lblIpucu.TabIndex = 7;
            this.lblIpucu.Text = "Demo: kasiyer1 / 123456";
            this.lblIpucu.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // LoginForm
            // 
            this.AcceptButton = this.btnGiris;
            this.BackColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.ClientSize = new System.Drawing.Size(384, 275);
            this.Controls.Add(this.lblIpucu);
            this.Controls.Add(this.lblHata);
            this.Controls.Add(this.btnGiris);
            this.Controls.Add(this.txtSifre);
            this.Controls.Add(this.lblSifre);
            this.Controls.Add(this.txtKullanici);
            this.Controls.Add(this.lblKullanici);
            this.Controls.Add(this.lblBaslik);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "LoginForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Spor Salonu Kasa — Giriş";
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblBaslik;
        private System.Windows.Forms.Label lblKullanici;
        private System.Windows.Forms.TextBox txtKullanici;
        private System.Windows.Forms.Label lblSifre;
        private System.Windows.Forms.TextBox txtSifre;
        private System.Windows.Forms.Button btnGiris;
        private System.Windows.Forms.Label lblHata;
        private System.Windows.Forms.Label lblIpucu;
    }
}
