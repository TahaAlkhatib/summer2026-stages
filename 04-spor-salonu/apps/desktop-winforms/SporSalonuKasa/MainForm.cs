using System.Text.Json;

namespace SporSalonuKasa
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
            await OzetiYukle();
        }

        private async Task OzetiYukle()
        {
            try
            {
                JsonElement ozet = await ApiClient.GetAsync("/reports/summary");

                lblUyeSayisi.Text = ApiClient.Tam(ozet, "member_count").ToString();
                lblBugunGiris.Text = ApiClient.Tam(ozet, "today_entries").ToString();
                lblBugunRed.Text = ApiClient.Tam(ozet, "today_rejects").ToString();
                lblBorc.Text = Bicim.Para(ApiClient.Para(ozet, "unpaid_total"));

                dgvBitecek.Rows.Clear();
                if (ozet.TryGetProperty("expiring_soon", out JsonElement liste) &&
                    liste.ValueKind == JsonValueKind.Array)
                {
                    foreach (JsonElement u in liste.EnumerateArray())
                    {
                        dgvBitecek.Rows.Add(
                            ApiClient.Metin(u, "full_name"),
                            ApiClient.Metin(u, "phone"),
                            ApiClient.Metin(u, "package_name"),
                            Bicim.Tarih(ApiClient.Metin(u, "end_date"))
                        );
                    }
                }

                lblDurum.Text = ApiClient.UserName + " — " + Bicim.Rol(ApiClient.Role) +
                                "  |  " + DateTime.Now.ToString("dd.MM.yyyy HH:mm");
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void mnuTurnike_Click(object sender, EventArgs e)
        {
            using (TurnstileForm f = new TurnstileForm())
            {
                f.ShowDialog();
            }
            await OzetiYukle();
        }

        private async void mnuUyeler_Click(object sender, EventArgs e)
        {
            using (MembersForm f = new MembersForm())
            {
                f.ShowDialog();
            }
            await OzetiYukle();
        }

        private async void mnuBufe_Click(object sender, EventArgs e)
        {
            using (PosForm f = new PosForm())
            {
                f.ShowDialog();
            }
            await OzetiYukle();
        }

        private void mnuGunSonu_Click(object sender, EventArgs e)
        {
            using (DailyReportForm f = new DailyReportForm())
            {
                f.ShowDialog();
            }
        }

        private void mnuCikis_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
