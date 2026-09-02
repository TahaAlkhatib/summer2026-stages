namespace SporSalonuKasa
{
    partial class TurnstileForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (components != null) { components.Dispose(); }
                if (donanim != null) { donanim.Dispose(); }
            }
            base.Dispose(disposing);
        }

        #region Windows Form Tasarımcısı tarafından oluşturulan kod

        private void InitializeComponent()
        {
            this.lblPort = new System.Windows.Forms.Label();
            this.cmbPort = new System.Windows.Forms.ComboBox();
            this.btnBaglan = new System.Windows.Forms.Button();
            this.lblDurum = new System.Windows.Forms.Label();
            this.lblKodEtiket = new System.Windows.Forms.Label();
            this.txtKod = new System.Windows.Forms.TextBox();
            this.btnOkut = new System.Windows.Forms.Button();
            this.pnlSonuc = new System.Windows.Forms.Panel();
            this.lblSonuc = new System.Windows.Forms.Label();
            this.lblUye = new System.Windows.Forms.Label();
            this.lblDetay = new System.Windows.Forms.Label();
            this.lblLogEtiket = new System.Windows.Forms.Label();
            this.lstLog = new System.Windows.Forms.ListBox();
            this.pnlSonuc.SuspendLayout();
            this.SuspendLayout();
            // 
            // lblPort
            // 
            this.lblPort.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblPort.Location = new System.Drawing.Point(20, 16);
            this.lblPort.Name = "lblPort";
            this.lblPort.Size = new System.Drawing.Size(140, 20);
            this.lblPort.TabIndex = 0;
            this.lblPort.Text = "Turnike Bağlantısı";
            // 
            // cmbPort
            // 
            this.cmbPort.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.cmbPort.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbPort.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.cmbPort.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.cmbPort.Location = new System.Drawing.Point(20, 38);
            this.cmbPort.Name = "cmbPort";
            this.cmbPort.Size = new System.Drawing.Size(200, 23);
            this.cmbPort.TabIndex = 1;
            // 
            // btnBaglan
            // 
            this.btnBaglan.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnBaglan.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnBaglan.Location = new System.Drawing.Point(230, 37);
            this.btnBaglan.Name = "btnBaglan";
            this.btnBaglan.Size = new System.Drawing.Size(100, 26);
            this.btnBaglan.TabIndex = 2;
            this.btnBaglan.Text = "Bağlan";
            this.btnBaglan.UseVisualStyleBackColor = true;
            this.btnBaglan.Click += new System.EventHandler(this.btnBaglan_Click);
            // 
            // lblDurum
            // 
            this.lblDurum.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblDurum.Location = new System.Drawing.Point(345, 42);
            this.lblDurum.Name = "lblDurum";
            this.lblDurum.Size = new System.Drawing.Size(400, 20);
            this.lblDurum.TabIndex = 3;
            this.lblDurum.Text = "Bağlantı yok";
            // 
            // lblKodEtiket
            // 
            this.lblKodEtiket.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblKodEtiket.Location = new System.Drawing.Point(20, 78);
            this.lblKodEtiket.Name = "lblKodEtiket";
            this.lblKodEtiket.Size = new System.Drawing.Size(400, 20);
            this.lblKodEtiket.TabIndex = 4;
            this.lblKodEtiket.Text = "Kart / QR kodunu okutun (okuyucu Enter gönderir):";
            // 
            // txtKod
            // 
            this.txtKod.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.txtKod.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtKod.Font = new System.Drawing.Font("Consolas", 16F);
            this.txtKod.ForeColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.txtKod.Location = new System.Drawing.Point(20, 100);
            this.txtKod.Name = "txtKod";
            this.txtKod.Size = new System.Drawing.Size(500, 32);
            this.txtKod.TabIndex = 5;
            this.txtKod.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtKod_KeyDown);
            // 
            // btnOkut
            // 
            this.btnOkut.BackColor = System.Drawing.Color.FromArgb(255, 183, 3);
            this.btnOkut.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnOkut.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.btnOkut.ForeColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.btnOkut.Location = new System.Drawing.Point(535, 99);
            this.btnOkut.Name = "btnOkut";
            this.btnOkut.Size = new System.Drawing.Size(120, 34);
            this.btnOkut.TabIndex = 6;
            this.btnOkut.Text = "Okut";
            this.btnOkut.UseVisualStyleBackColor = false;
            this.btnOkut.Click += new System.EventHandler(this.btnOkut_Click);
            // 
            // pnlSonuc
            // 
            this.pnlSonuc.BackColor = System.Drawing.Color.FromArgb(22, 32, 43);
            this.pnlSonuc.Controls.Add(this.lblDetay);
            this.pnlSonuc.Controls.Add(this.lblUye);
            this.pnlSonuc.Controls.Add(this.lblSonuc);
            this.pnlSonuc.Location = new System.Drawing.Point(20, 148);
            this.pnlSonuc.Name = "pnlSonuc";
            this.pnlSonuc.Size = new System.Drawing.Size(760, 150);
            this.pnlSonuc.TabIndex = 7;
            // 
            // lblSonuc
            // 
            this.lblSonuc.Font = new System.Drawing.Font("Segoe UI", 24F, System.Drawing.FontStyle.Bold);
            this.lblSonuc.ForeColor = System.Drawing.Color.FromArgb(139, 155, 171);
            this.lblSonuc.Location = new System.Drawing.Point(10, 16);
            this.lblSonuc.Name = "lblSonuc";
            this.lblSonuc.Size = new System.Drawing.Size(740, 46);
            this.lblSonuc.TabIndex = 0;
            this.lblSonuc.Text = "KART BEKLENİYOR";
            this.lblSonuc.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblUye
            // 
            this.lblUye.Font = new System.Drawing.Font("Segoe UI", 15F);
            this.lblUye.ForeColor = System.Drawing.Color.FromArgb(230, 237, 243);
            this.lblUye.Location = new System.Drawing.Point(10, 66);
            this.lblUye.Name = "lblUye";
            this.lblUye.Size = new System.Drawing.Size(740, 32);
            this.lblUye.TabIndex = 1;
            this.lblUye.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblDetay
            // 
            this.lblDetay.ForeColor = System.Drawing.Color.FromArgb(169, 183, 198);
            this.lblDetay.Location = new System.Drawing.Point(10, 102);
            this.lblDetay.Name = "lblDetay";
            this.lblDetay.Size = new System.Drawing.Size(740, 40);
            this.lblDetay.TabIndex = 2;
            this.lblDetay.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblLogEtiket
            // 
            this.lblLogEtiket.ForeColor = System.Drawing.Color.FromArgb(195, 207, 219);
            this.lblLogEtiket.Location = new System.Drawing.Point(20, 310);
            this.lblLogEtiket.Name = "lblLogEtiket";
            this.lblLogEtiket.Size = new System.Drawing.Size(400, 20);
            this.lblLogEtiket.TabIndex = 8;
            this.lblLogEtiket.Text = "Donanım ve okutma günlüğü:";
            // 
            // lstLog
            // 
            this.lstLog.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.lstLog.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.lstLog.ForeColor = System.Drawing.Color.FromArgb(169, 183, 198);
            this.lstLog.FormattingEnabled = true;
            this.lstLog.ItemHeight = 15;
            this.lstLog.Location = new System.Drawing.Point(20, 332);
            this.lstLog.Name = "lstLog";
            this.lstLog.Size = new System.Drawing.Size(760, 137);
            this.lstLog.TabIndex = 9;
            // 
            // TurnstileForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(15, 20, 25);
            this.ClientSize = new System.Drawing.Size(804, 491);
            this.Controls.Add(this.lstLog);
            this.Controls.Add(this.lblLogEtiket);
            this.Controls.Add(this.pnlSonuc);
            this.Controls.Add(this.btnOkut);
            this.Controls.Add(this.txtKod);
            this.Controls.Add(this.lblKodEtiket);
            this.Controls.Add(this.lblDurum);
            this.Controls.Add(this.btnBaglan);
            this.Controls.Add(this.cmbPort);
            this.Controls.Add(this.lblPort);
            this.Name = "TurnstileForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Turnike Kontrol";
            this.Load += new System.EventHandler(this.TurnstileForm_Load);
            this.Shown += new System.EventHandler(this.TurnstileForm_Shown);
            this.pnlSonuc.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblPort;
        private System.Windows.Forms.ComboBox cmbPort;
        private System.Windows.Forms.Button btnBaglan;
        private System.Windows.Forms.Label lblDurum;
        private System.Windows.Forms.Label lblKodEtiket;
        private System.Windows.Forms.TextBox txtKod;
        private System.Windows.Forms.Button btnOkut;
        private System.Windows.Forms.Panel pnlSonuc;
        private System.Windows.Forms.Label lblSonuc;
        private System.Windows.Forms.Label lblUye;
        private System.Windows.Forms.Label lblDetay;
        private System.Windows.Forms.Label lblLogEtiket;
        private System.Windows.Forms.ListBox lstLog;
    }
}
