using System.Text.Json;

namespace CamasirhaneKasa
{
    public class MainForm : Form
    {
        private DataGridView dgvBugun;
        private ToolStripStatusLabel lblDurum;

        public MainForm()
        {
            Text = "Çamaşırhane Kasa";
            Size = new Size(1000, 650);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(244, 246, 248);

            // ---- Menü ----
            MenuStrip menu = new MenuStrip();

            ToolStripMenuItem mSiparis = new ToolStripMenuItem("Sipariş");
            ToolStripMenuItem miYeni = new ToolStripMenuItem("Yeni Sipariş");
            miYeni.Click += (s, e) => YeniSiparisAc();
            ToolStripMenuItem miCikis = new ToolStripMenuItem("Çıkış");
            miCikis.Click += (s, e) => Close();
            mSiparis.DropDownItems.Add(miYeni);
            mSiparis.DropDownItems.Add(new ToolStripSeparator());
            mSiparis.DropDownItems.Add(miCikis);

            ToolStripMenuItem mIslem = new ToolStripMenuItem("İşlemler");
            ToolStripMenuItem miBarkod = new ToolStripMenuItem("Barkod ile Aşama Güncelle");
            miBarkod.Click += (s, e) => BarkodAc();
            mIslem.DropDownItems.Add(miBarkod);

            ToolStripMenuItem mRapor = new ToolStripMenuItem("Raporlar");
            ToolStripMenuItem miGunSonu = new ToolStripMenuItem("Gün Sonu Raporu");
            miGunSonu.Click += (s, e) => RaporAc();
            mRapor.DropDownItems.Add(miGunSonu);

            menu.Items.Add(mSiparis);
            menu.Items.Add(mIslem);
            menu.Items.Add(mRapor);
            MainMenuStrip = menu;
            Controls.Add(menu);

            // ---- Büyük butonlar ----
            Button btnYeni = BuyukButon("Yeni Sipariş", 20, 40);
            btnYeni.Click += (s, e) => YeniSiparisAc();
            Controls.Add(btnYeni);

            Button btnBarkod = BuyukButon("Barkod Okut", 250, 40);
            btnBarkod.Click += (s, e) => BarkodAc();
            Controls.Add(btnBarkod);

            Button btnRapor = BuyukButon("Gün Sonu Raporu", 480, 40);
            btnRapor.Click += (s, e) => RaporAc();
            Controls.Add(btnRapor);

            Button btnYenile = BuyukButon("Listeyi Yenile", 710, 40);
            btnYenile.Click += async (s, e) => await BugunuYukle();
            Controls.Add(btnYenile);

            // ---- Bugünkü siparişler ----
            Label baslik = new Label();
            baslik.Text = "Bugünkü Siparişler";
            baslik.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            baslik.ForeColor = Color.FromArgb(30, 96, 145);
            baslik.SetBounds(20, 115, 300, 24);
            Controls.Add(baslik);

            dgvBugun = new DataGridView();
            dgvBugun.SetBounds(20, 145, 940, 400);
            dgvBugun.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Bottom;
            dgvBugun.ReadOnly = true;
            dgvBugun.AllowUserToAddRows = false;
            dgvBugun.AllowUserToDeleteRows = false;
            dgvBugun.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dgvBugun.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dgvBugun.BackgroundColor = Color.White;
            dgvBugun.Columns.Add("order_no", "Sipariş No");
            dgvBugun.Columns.Add("musteri", "Müşteri");
            dgvBugun.Columns.Add("tutar", "Tutar");
            dgvBugun.Columns.Add("odenen", "Ödenen");
            dgvBugun.Columns.Add("durum", "Durum");
            Controls.Add(dgvBugun);

            // ---- Durum çubuğu ----
            StatusStrip durumCubugu = new StatusStrip();
            lblDurum = new ToolStripStatusLabel();
            lblDurum.Text = ApiClient.UserName + " — " + Bicim.Rol(ApiClient.Role);
            durumCubugu.Items.Add(lblDurum);
            Controls.Add(durumCubugu);

            Load += async (s, e) => await BugunuYukle();
        }

        private Button BuyukButon(string yazi, int x, int y)
        {
            Button b = new Button();
            b.Text = yazi;
            b.SetBounds(x, y, 210, 60);
            b.BackColor = Color.FromArgb(30, 96, 145);
            b.ForeColor = Color.White;
            b.FlatStyle = FlatStyle.Flat;
            b.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            return b;
        }

        private async Task BugunuYukle()
        {
            try
            {
                // Yerel gün kullanılıyor (UTC değil)
                string bugun = Bicim.ApiTarih(DateTime.Now);
                JsonElement liste = await ApiClient.GetAsync("/orders?date=" + bugun);

                dgvBugun.Rows.Clear();
                foreach (JsonElement s in liste.EnumerateArray())
                {
                    dgvBugun.Rows.Add(
                        ApiClient.Metin(s, "order_no"),
                        ApiClient.Metin(s, "customer_name"),
                        Bicim.Para(ApiClient.Para(s, "total_amount")),
                        Bicim.Para(ApiClient.Para(s, "paid_amount")),
                        Bicim.Durum(ApiClient.Metin(s, "status"))
                    );
                }

                lblDurum.Text = ApiClient.UserName + " — " + Bicim.Rol(ApiClient.Role) + "  |  " +
                                dgvBugun.Rows.Count + " sipariş  |  " +
                                DateTime.Now.ToString("dd.MM.yyyy HH:mm");
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void YeniSiparisAc()
        {
            using (NewOrderForm f = new NewOrderForm())
            {
                f.ShowDialog();
            }
            await BugunuYukle();
        }

        private async void BarkodAc()
        {
            using (ScanStageForm f = new ScanStageForm())
            {
                f.ShowDialog();
            }
            await BugunuYukle();
        }

        private void RaporAc()
        {
            using (DailyReportForm f = new DailyReportForm())
            {
                f.ShowDialog();
            }
        }
    }
}
