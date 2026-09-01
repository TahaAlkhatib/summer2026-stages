namespace CamasirhaneKasa
{
    partial class NewCustomerForm
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
            this.lblAd = new System.Windows.Forms.Label();
            this.txtAd = new System.Windows.Forms.TextBox();
            this.lblTelefon = new System.Windows.Forms.Label();
            this.txtTelefon = new System.Windows.Forms.TextBox();
            this.lblAdres = new System.Windows.Forms.Label();
            this.txtAdres = new System.Windows.Forms.TextBox();
            this.lblIlce = new System.Windows.Forms.Label();
            this.txtIlce = new System.Windows.Forms.TextBox();
            this.lblHata = new System.Windows.Forms.Label();
            this.btnKaydet = new System.Windows.Forms.Button();
            this.btnVazgec = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // lblAd
            // 
            this.lblAd.Location = new System.Drawing.Point(20, 18);
            this.lblAd.Name = "lblAd";
            this.lblAd.Size = new System.Drawing.Size(150, 20);
            this.lblAd.TabIndex = 0;
            this.lblAd.Text = "Ad Soyad *";
            // 
            // txtAd
            // 
            this.txtAd.Location = new System.Drawing.Point(20, 40);
            this.txtAd.Name = "txtAd";
            this.txtAd.Size = new System.Drawing.Size(400, 23);
            this.txtAd.TabIndex = 1;
            // 
            // lblTelefon
            // 
            this.lblTelefon.Location = new System.Drawing.Point(20, 72);
            this.lblTelefon.Name = "lblTelefon";
            this.lblTelefon.Size = new System.Drawing.Size(150, 20);
            this.lblTelefon.TabIndex = 2;
            this.lblTelefon.Text = "Telefon *";
            // 
            // txtTelefon
            // 
            this.txtTelefon.Location = new System.Drawing.Point(20, 94);
            this.txtTelefon.Name = "txtTelefon";
            this.txtTelefon.PlaceholderText = "+90 5xx xxx xx xx";
            this.txtTelefon.Size = new System.Drawing.Size(400, 23);
            this.txtTelefon.TabIndex = 3;
            // 
            // lblAdres
            // 
            this.lblAdres.Location = new System.Drawing.Point(20, 126);
            this.lblAdres.Name = "lblAdres";
            this.lblAdres.Size = new System.Drawing.Size(150, 20);
            this.lblAdres.TabIndex = 4;
            this.lblAdres.Text = "Adres";
            // 
            // txtAdres
            // 
            this.txtAdres.Location = new System.Drawing.Point(20, 148);
            this.txtAdres.Name = "txtAdres";
            this.txtAdres.Size = new System.Drawing.Size(400, 23);
            this.txtAdres.TabIndex = 5;
            // 
            // lblIlce
            // 
            this.lblIlce.Location = new System.Drawing.Point(20, 180);
            this.lblIlce.Name = "lblIlce";
            this.lblIlce.Size = new System.Drawing.Size(150, 20);
            this.lblIlce.TabIndex = 6;
            this.lblIlce.Text = "İlçe";
            // 
            // txtIlce
            // 
            this.txtIlce.Location = new System.Drawing.Point(20, 202);
            this.txtIlce.Name = "txtIlce";
            this.txtIlce.Size = new System.Drawing.Size(400, 23);
            this.txtIlce.TabIndex = 7;
            // 
            // lblHata
            // 
            this.lblHata.ForeColor = System.Drawing.Color.FromArgb(220, 53, 69);
            this.lblHata.Location = new System.Drawing.Point(20, 234);
            this.lblHata.Name = "lblHata";
            this.lblHata.Size = new System.Drawing.Size(400, 20);
            this.lblHata.TabIndex = 8;
            // 
            // btnKaydet
            // 
            this.btnKaydet.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnKaydet.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnKaydet.ForeColor = System.Drawing.Color.White;
            this.btnKaydet.Location = new System.Drawing.Point(230, 262);
            this.btnKaydet.Name = "btnKaydet";
            this.btnKaydet.Size = new System.Drawing.Size(90, 32);
            this.btnKaydet.TabIndex = 9;
            this.btnKaydet.Text = "Kaydet";
            this.btnKaydet.UseVisualStyleBackColor = false;
            this.btnKaydet.Click += new System.EventHandler(this.btnKaydet_Click);
            // 
            // btnVazgec
            // 
            this.btnVazgec.DialogResult = System.Windows.Forms.DialogResult.Cancel;
            this.btnVazgec.Location = new System.Drawing.Point(330, 262);
            this.btnVazgec.Name = "btnVazgec";
            this.btnVazgec.Size = new System.Drawing.Size(90, 32);
            this.btnVazgec.TabIndex = 10;
            this.btnVazgec.Text = "Vazgeç";
            this.btnVazgec.UseVisualStyleBackColor = true;
            // 
            // NewCustomerForm
            // 
            this.AcceptButton = this.btnKaydet;
            this.BackColor = System.Drawing.Color.White;
            this.CancelButton = this.btnVazgec;
            this.ClientSize = new System.Drawing.Size(444, 311);
            this.Controls.Add(this.btnVazgec);
            this.Controls.Add(this.btnKaydet);
            this.Controls.Add(this.lblHata);
            this.Controls.Add(this.txtIlce);
            this.Controls.Add(this.lblIlce);
            this.Controls.Add(this.txtAdres);
            this.Controls.Add(this.lblAdres);
            this.Controls.Add(this.txtTelefon);
            this.Controls.Add(this.lblTelefon);
            this.Controls.Add(this.txtAd);
            this.Controls.Add(this.lblAd);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "NewCustomerForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Yeni Müşteri";
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblAd;
        private System.Windows.Forms.TextBox txtAd;
        private System.Windows.Forms.Label lblTelefon;
        private System.Windows.Forms.TextBox txtTelefon;
        private System.Windows.Forms.Label lblAdres;
        private System.Windows.Forms.TextBox txtAdres;
        private System.Windows.Forms.Label lblIlce;
        private System.Windows.Forms.TextBox txtIlce;
        private System.Windows.Forms.Label lblHata;
        private System.Windows.Forms.Button btnKaydet;
        private System.Windows.Forms.Button btnVazgec;
    }
}
