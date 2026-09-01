namespace CamasirhaneKasa
{
    partial class LabelPrintForm
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
            this.components = new System.ComponentModel.Container();
            this.belge = new System.Drawing.Printing.PrintDocument();
            this.onizleme = new System.Windows.Forms.PrintPreviewControl();
            this.pnlAlt = new System.Windows.Forms.Panel();
            this.btnYazdir = new System.Windows.Forms.Button();
            this.btnKapat = new System.Windows.Forms.Button();
            this.lblBilgi = new System.Windows.Forms.Label();
            this.pnlAlt.SuspendLayout();
            this.SuspendLayout();
            // 
            // belge
            // 
            this.belge.BeginPrint += new System.Drawing.Printing.PrintEventHandler(this.belge_BeginPrint);
            this.belge.PrintPage += new System.Drawing.Printing.PrintPageEventHandler(this.belge_PrintPage);
            // 
            // onizleme
            // 
            this.onizleme.Dock = System.Windows.Forms.DockStyle.Fill;
            this.onizleme.Location = new System.Drawing.Point(0, 0);
            this.onizleme.Name = "onizleme";
            this.onizleme.Size = new System.Drawing.Size(684, 606);
            this.onizleme.TabIndex = 0;
            this.onizleme.Zoom = 2D;
            // 
            // pnlAlt
            // 
            this.pnlAlt.Controls.Add(this.lblBilgi);
            this.pnlAlt.Controls.Add(this.btnKapat);
            this.pnlAlt.Controls.Add(this.btnYazdir);
            this.pnlAlt.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.pnlAlt.Location = new System.Drawing.Point(0, 606);
            this.pnlAlt.Name = "pnlAlt";
            this.pnlAlt.Size = new System.Drawing.Size(684, 55);
            this.pnlAlt.TabIndex = 1;
            // 
            // btnYazdir
            // 
            this.btnYazdir.BackColor = System.Drawing.Color.FromArgb(30, 96, 145);
            this.btnYazdir.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnYazdir.ForeColor = System.Drawing.Color.White;
            this.btnYazdir.Location = new System.Drawing.Point(15, 12);
            this.btnYazdir.Name = "btnYazdir";
            this.btnYazdir.Size = new System.Drawing.Size(130, 32);
            this.btnYazdir.TabIndex = 0;
            this.btnYazdir.Text = "Yazdır";
            this.btnYazdir.UseVisualStyleBackColor = false;
            this.btnYazdir.Click += new System.EventHandler(this.btnYazdir_Click);
            // 
            // btnKapat
            // 
            this.btnKapat.Location = new System.Drawing.Point(155, 12);
            this.btnKapat.Name = "btnKapat";
            this.btnKapat.Size = new System.Drawing.Size(130, 32);
            this.btnKapat.TabIndex = 1;
            this.btnKapat.Text = "Kapat";
            this.btnKapat.UseVisualStyleBackColor = true;
            this.btnKapat.Click += new System.EventHandler(this.btnKapat_Click);
            // 
            // lblBilgi
            // 
            this.lblBilgi.ForeColor = System.Drawing.Color.Gray;
            this.lblBilgi.Location = new System.Drawing.Point(300, 20);
            this.lblBilgi.Name = "lblBilgi";
            this.lblBilgi.Size = new System.Drawing.Size(320, 20);
            this.lblBilgi.TabIndex = 2;
            // 
            // LabelPrintForm
            // 
            this.ClientSize = new System.Drawing.Size(684, 661);
            this.Controls.Add(this.onizleme);
            this.Controls.Add(this.pnlAlt);
            this.Name = "LabelPrintForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Barkod Etiketleri";
            this.pnlAlt.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Drawing.Printing.PrintDocument belge;
        private System.Windows.Forms.PrintPreviewControl onizleme;
        private System.Windows.Forms.Panel pnlAlt;
        private System.Windows.Forms.Button btnYazdir;
        private System.Windows.Forms.Button btnKapat;
        private System.Windows.Forms.Label lblBilgi;
    }
}
