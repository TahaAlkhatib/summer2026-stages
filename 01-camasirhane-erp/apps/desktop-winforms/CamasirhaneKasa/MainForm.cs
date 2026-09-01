using System.Text.Json;

namespace CamasirhaneKasa
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            lblDurum.Text = ApiClient.UserName + " — " + Bicim.Rol(ApiClient.Role);
            await BugunuYukle();
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

        private async void mnuYeniSiparis_Click(object sender, EventArgs e)
        {
            using (NewOrderForm f = new NewOrderForm())
            {
                f.ShowDialog();
            }
            await BugunuYukle();
        }

        private async void mnuBarkod_Click(object sender, EventArgs e)
        {
            using (ScanStageForm f = new ScanStageForm())
            {
                f.ShowDialog();
            }
            await BugunuYukle();
        }

        private void mnuGunSonu_Click(object sender, EventArgs e)
        {
            using (DailyReportForm f = new DailyReportForm())
            {
                f.ShowDialog();
            }
        }

        private async void btnYenile_Click(object sender, EventArgs e)
        {
            await BugunuYukle();
        }

        private void mnuCikis_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
