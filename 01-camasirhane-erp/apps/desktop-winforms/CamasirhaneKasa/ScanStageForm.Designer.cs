namespace CamasirhaneKasa
{
    partial class ScanStageForm
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
            this.lblAciklama = new System.Windows.Forms.Label();
            this.txtBarkod = new System.Windows.Forms.TextBox();
            this.btnSorgula = new System.Windows.Forms.Button();
            this.grpBilgi = new System.Windows.Forms.GroupBox();
            this.lblEtSiparisNo = new System.Windows.Forms.Label();
            this.lblSiparisNo = new System.Windows.Forms.Label();
            this.lblEtMusteri = new System.Windows.Forms.Label();
            this.lblMusteri = new System.Windows.Forms.Label();
            this.lblEtTelefon = new System.Windows.Forms.Label();
            this.lblTelefon = new System.Windows.Forms.Label();
            this.lblEtParca = new System.Windows.Forms.Label();
            this.lblParca = new System.Windows.Forms.Label();
            this.lblEtMevcut = new System.Windows.Forms.Label();
            this.lblMevcutDurum = new System.Windows.Forms.Label();
            this.lblEtYeni = new System.Windows.Forms.Label();
            this.cmbYeniDurum = new System.Windows.Forms.ComboBox();
            this.btnGuncelle = new System.Windows.Forms.Button();
            this.lblSonuc = new System.Windows.Forms.Label();
            this.lblEtGecmis = new System.Windows.Forms.Label();
            this.lstGecmis = new System.Windows.Forms.ListBox();
            this.grpBilgi.SuspendLayout();
            this.SuspendLayout();
            // 
            // lblAciklama
            // 
            this.lblAciklama.Location = new System.Drawing.Point(20, 15);
            this.lblAciklama.Name = "lblAciklama";
            this.lblAciklama.Size = new System.Drawing.Size(400, 20);
            this.lblAciklama.TabIndex = 0;
            this.lblAciklama.Text = "Barkodu okutun veya yazıp Enter\'a basın:";
            // 
            // txtBarkod
            // 
            this.txtBarkod.Font = new System.Drawing.Font("Consolas", 16F);
            this.txtBarkod.Location = new System.Drawing.Point(20, 38);
            this.txtBarkod.Name = "txtBarkod";
            this.txtBarkod.Size = new System.Drawing.Size(460, 36);
            this.txtBarkod.TabIndex = 1;
            this.txtBarkod.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtBarkod_KeyDown);
            // 
            // btnSorgula
            // 
            this.btnSorgula.Location = new System.Drawing.Point(495, 38);
            this.btnSorgula.Name = "btnSorgula";
            this.btnSorgula.Size = new System.Drawing.Size(110, 34);
            this.btnSorgula.TabIndex = 2;
            this.btnSorgula.Text = "Sorgula";
            this.btnSorgula.UseVisualStyleBackColor = true;
            this.btnSorgula.Click += new System.EventHandler(this.btnSorgula_Click);
            // 
            // grpBilgi
            // 
            this.grpBilgi.BackColor = System.Drawing.Color.White;
            this.grpBilgi.Controls.Add(this.lblMevcutDurum);
            this.grpBilgi.Controls.Add(this.lblEtMevcut);
            this.grpBilgi.Controls.Add(this.lblParca);
            this.grpBilgi.Controls.Add(this.lblEtParca);
            this.grpBilgi.Controls.Add(this.lblTelefon);
            this.grpBilgi.Controls.Add(this.lblEtTelefon);
            this.grpBilgi.Controls.Add(this.lblMusteri);
            this.grpBilgi.Controls.Add(this.lblEtMusteri);
            this.grpBilgi.Controls.Add(this.lblSiparisNo);
            this.grpBilgi.Controls.Add(this.lblEtSiparisNo);
            this.grpBilgi.Location = new System.Drawing.Point(20, 85);
            this.grpBilgi.Name = "grpBilgi";
            this.grpBilgi.Size = new System.Drawing.Size(660, 150);
            this.grpBilgi.TabIndex = 3;
            this.grpBilgi.TabStop = false;
            this.grpBilgi.Text = "Sipariş Bilgisi";
            // 
            // lblEtSiparisNo
            // 
            this.lblEtSiparisNo.ForeColor = System.Drawing.Color.Gray;
            this.lblEtSiparisNo.Location = new System.Drawing.Point(15, 25);
            this.lblEtSiparisNo.Name = "lblEtSiparisNo";
            this.lblEtSiparisNo.Size = new System.Drawing.Size(120, 20);
            this.lblEtSiparisNo.TabIndex = 0;
            this.lblEtSiparisNo.Text = "Sipariş No:";
            // 
            // lblSiparisNo
            // 
            this.lblSiparisNo.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.lblSiparisNo.Location = new System.Drawing.Point(145, 25);
            this.lblSiparisNo.Name = "lblSiparisNo";
            this.lblSiparisNo.Size = new System.Drawing.Size(480, 20);
            this.lblSiparisNo.TabIndex = 1;
            this.lblSiparisNo.Text = "-";
            // 
            // lblEtMusteri
            // 
            this.lblEtMusteri.ForeColor = System.Drawing.Color.Gray;
            this.lblEtMusteri.Location = new System.Drawing.Point(15, 49);
            this.lblEtMusteri.Name = "lblEtMusteri";
            this.lblEtMusteri.Size = new System.Drawing.Size(120, 20);
            this.lblEtMusteri.TabIndex = 2;
            this.lblEtMusteri.Text = "Müşteri:";
            // 
            // lblMusteri
            // 
            this.lblMusteri.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.lblMusteri.Location = new System.Drawing.Point(145, 49);
            this.lblMusteri.Name = "lblMusteri";
            this.lblMusteri.Size = new System.Drawing.Size(480, 20);
            this.lblMusteri.TabIndex = 3;
            this.lblMusteri.Text = "-";
            // 
            // lblEtTelefon
            // 
            this.lblEtTelefon.ForeColor = System.Drawing.Color.Gray;
            this.lblEtTelefon.Location = new System.Drawing.Point(15, 73);
            this.lblEtTelefon.Name = "lblEtTelefon";
            this.lblEtTelefon.Size = new System.Drawing.Size(120, 20);
            this.lblEtTelefon.TabIndex = 4;
            this.lblEtTelefon.Text = "Telefon:";
            // 
            // lblTelefon
            // 
            this.lblTelefon.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.lblTelefon.Location = new System.Drawing.Point(145, 73);
            this.lblTelefon.Name = "lblTelefon";
            this.lblTelefon.Size = new System.Drawing.Size(480, 20);
            this.lblTelefon.TabIndex = 5;
            this.lblTelefon.Text = "-";
            // 
            // lblEtParca
            // 
            this.lblEtParca.ForeColor = System.Drawing.Color.Gray;
            this.lblEtParca.Location = new System.Drawing.Point(15, 97);
            this.lblEtParca.Name = "lblEtParca";
            this.lblEtParca.Size = new System.Drawing.Size(120, 20);
            this.lblEtParca.TabIndex = 6;
            this.lblEtParca.Text = "Parça:";
            // 
            // lblParca
            // 
            this.lblParca.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.lblParca.Location = new System.Drawing.Point(145, 97);
            this.lblParca.Name = "lblParca";
            this.lblParca.Size = new System.Drawing.Size(480, 20);
            this.lblParca.TabIndex = 7;
            this.lblParca.Text = "-";
            // 
            // lblEtMevcut
            // 
            this.lblEtMevcut.ForeColor = System.Drawing.Color.Gray;
            this.lblEtMevcut.Location = new System.Drawing.Point(15, 121);
            this.lblEtMevcut.Name = "lblEtMevcut";
            this.lblEtMevcut.Size = new System.Drawing.Size(120, 20);
            this.lblEtMevcut.TabIndex = 8;
            this.lblEtMevcut.Text = "Mevcut Durum:";
            // 
            // lblMevcutDurum
            // 
            this.lblMevcutDurum.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.lblMevcutDurum.Location = new System.Drawing.Point(145, 121);
            this.lblMevcutDurum.Name = "lblMevcutDurum";
            this.lblMevcutDurum.Size = new System.Drawing.Size(480, 20);
            this.lblMevcutDurum.TabIndex = 9;
            this.lblMevcutDurum.Text = "-";
            // 
            // lblEtYeni
            // 
            this.lblEtYeni.Location = new System.Drawing.Point(20, 250);
            this.lblEtYeni.Name = "lblEtYeni";
            this.lblEtYeni.Size = new System.Drawing.Size(120, 20);
            this.lblEtYeni.TabIndex = 4;
            this.lblEtYeni.Text = "Yeni Aşama";
            // 
            // cmbYeniDurum
            // 
            this.cmbYeniDurum.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbYeniDurum.Location = new System.Drawing.Point(20, 272);
            this.cmbYeniDurum.Name = "cmbYeniDurum";
            this.cmbYeniDurum.Size = new System.Drawing.Size(250, 23);
            this.cmbYeniDurum.TabIndex = 5;
            // 
            // btnGuncelle
            // 
            this.btnGuncelle.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnGuncelle.Enabled = false;
            this.btnGuncelle.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnGuncelle.ForeColor = System.Drawing.Color.White;
            this.btnGuncelle.Location = new System.Drawing.Point(285, 270);
            this.btnGuncelle.Name = "btnGuncelle";
            this.btnGuncelle.Size = new System.Drawing.Size(180, 32);
            this.btnGuncelle.TabIndex = 6;
            this.btnGuncelle.Text = "Aşamayı Güncelle";
            this.btnGuncelle.UseVisualStyleBackColor = false;
            this.btnGuncelle.Click += new System.EventHandler(this.btnGuncelle_Click);
            // 
            // lblSonuc
            // 
            this.lblSonuc.Font = new System.Drawing.Font("Segoe UI", 10F, System.Drawing.FontStyle.Bold);
            this.lblSonuc.Location = new System.Drawing.Point(20, 310);
            this.lblSonuc.Name = "lblSonuc";
            this.lblSonuc.Size = new System.Drawing.Size(660, 24);
            this.lblSonuc.TabIndex = 7;
            // 
            // lblEtGecmis
            // 
            this.lblEtGecmis.Location = new System.Drawing.Point(20, 340);
            this.lblEtGecmis.Name = "lblEtGecmis";
            this.lblEtGecmis.Size = new System.Drawing.Size(300, 20);
            this.lblEtGecmis.TabIndex = 8;
            this.lblEtGecmis.Text = "Bu oturumda okutulanlar:";
            // 
            // lstGecmis
            // 
            this.lstGecmis.ItemHeight = 15;
            this.lstGecmis.Location = new System.Drawing.Point(20, 362);
            this.lstGecmis.Name = "lstGecmis";
            this.lstGecmis.Size = new System.Drawing.Size(660, 109);
            this.lstGecmis.TabIndex = 9;
            // 
            // ScanStageForm
            // 
            this.BackColor = System.Drawing.Color.FromArgb(244, 246, 248);
            this.ClientSize = new System.Drawing.Size(704, 491);
            this.Controls.Add(this.lstGecmis);
            this.Controls.Add(this.lblEtGecmis);
            this.Controls.Add(this.lblSonuc);
            this.Controls.Add(this.btnGuncelle);
            this.Controls.Add(this.cmbYeniDurum);
            this.Controls.Add(this.lblEtYeni);
            this.Controls.Add(this.grpBilgi);
            this.Controls.Add(this.btnSorgula);
            this.Controls.Add(this.txtBarkod);
            this.Controls.Add(this.lblAciklama);
            this.Name = "ScanStageForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Barkod ile Aşama Güncelle";
            this.Shown += new System.EventHandler(this.ScanStageForm_Shown);
            this.Load += new System.EventHandler(this.ScanStageForm_Load);
            this.grpBilgi.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        #endregion

        private System.Windows.Forms.Label lblAciklama;
        private System.Windows.Forms.TextBox txtBarkod;
        private System.Windows.Forms.Button btnSorgula;
        private System.Windows.Forms.GroupBox grpBilgi;
        private System.Windows.Forms.Label lblEtSiparisNo;
        private System.Windows.Forms.Label lblSiparisNo;
        private System.Windows.Forms.Label lblEtMusteri;
        private System.Windows.Forms.Label lblMusteri;
        private System.Windows.Forms.Label lblEtTelefon;
        private System.Windows.Forms.Label lblTelefon;
        private System.Windows.Forms.Label lblEtParca;
        private System.Windows.Forms.Label lblParca;
        private System.Windows.Forms.Label lblEtMevcut;
        private System.Windows.Forms.Label lblMevcutDurum;
        private System.Windows.Forms.Label lblEtYeni;
        private System.Windows.Forms.ComboBox cmbYeniDurum;
        private System.Windows.Forms.Button btnGuncelle;
        private System.Windows.Forms.Label lblSonuc;
        private System.Windows.Forms.Label lblEtGecmis;
        private System.Windows.Forms.ListBox lstGecmis;
    }
}
