using System.Text.Json;

namespace CamasirhaneKasa
{
    public partial class ScanStageForm : Form
    {
        // Aşama sırası — okutulunca bir sonrakine otomatik geçilir
        private readonly string[] durumSirasi =
            { "alindi", "yikamada", "utude", "hazir", "teslim_edildi" };

        private string bulunanBarkod = "";

        public ScanStageForm()
        {
            InitializeComponent();
        }

        private void ScanStageForm_Load(object sender, EventArgs e)
        {
            cmbYeniDurum.Items.Clear();
            foreach (string d in durumSirasi)
            {
                cmbYeniDurum.Items.Add(Bicim.Durum(d));
            }
        }

        private void ScanStageForm_Shown(object sender, EventArgs e)
        {
            txtBarkod.Focus();
        }

        private async void txtBarkod_KeyDown(object sender, KeyEventArgs e)
        {
            // Barkod okuyucular okuma sonunda Enter gönderir
            if (e.KeyCode == Keys.Enter)
            {
                e.SuppressKeyPress = true;
                await Sorgula();
            }
        }

        private async void btnSorgula_Click(object sender, EventArgs e)
        {
            await Sorgula();
        }

        private async void btnGuncelle_Click(object sender, EventArgs e)
        {
            await Guncelle();
        }

        private async Task Sorgula()
        {
            string barkod = txtBarkod.Text.Trim();
            if (barkod == "")
            {
                return;
            }

            lblSonuc.Text = "";
            try
            {
                JsonElement kayit = await ApiClient.GetAsync(
                    "/orders/barcode/" + Uri.EscapeDataString(barkod));

                bulunanBarkod = barkod;
                lblSiparisNo.Text = ApiClient.Metin(kayit, "order_no");
                lblMusteri.Text = ApiClient.Metin(kayit, "customer_name");
                lblTelefon.Text = ApiClient.Metin(kayit, "customer_phone");
                lblParca.Text = ApiClient.Metin(kayit, "item_name") +
                                " (" + ApiClient.Para(kayit, "quantity") + ")";

                string mevcut = ApiClient.Metin(kayit, "status");
                lblMevcutDurum.Text = Bicim.Durum(mevcut);
                lblMevcutDurum.ForeColor = DurumRengi(mevcut);

                // Bir sonraki aşamayı otomatik seç
                int indeks = Array.IndexOf(durumSirasi, mevcut);
                if (indeks >= 0 && indeks < durumSirasi.Length - 1)
                {
                    cmbYeniDurum.SelectedIndex = indeks + 1;
                }
                else if (indeks >= 0)
                {
                    cmbYeniDurum.SelectedIndex = indeks;
                }

                btnGuncelle.Enabled = true;
            }
            catch (ApiException hata)
            {
                Temizle();
                lblSonuc.ForeColor = Color.FromArgb(220, 53, 69);
                lblSonuc.Text = hata.Message;
                btnGuncelle.Enabled = false;
            }
        }

        private async Task Guncelle()
        {
            if (bulunanBarkod == "" || cmbYeniDurum.SelectedIndex < 0)
            {
                return;
            }

            string yeniDurum = durumSirasi[cmbYeniDurum.SelectedIndex];

            try
            {
                await ApiClient.PutAsync(
                    "/orders/barcode/" + Uri.EscapeDataString(bulunanBarkod) + "/status",
                    new { status = yeniDurum });

                lblSonuc.ForeColor = Color.FromArgb(25, 135, 84);
                lblSonuc.Text = "Güncellendi: " + Bicim.Durum(yeniDurum);

                lstGecmis.Items.Insert(0, DateTime.Now.ToString("HH:mm") + "  —  " +
                                          bulunanBarkod + "  —  " + Bicim.Durum(yeniDurum));

                // Arka arkaya okutma için alanı temizle ve odakla
                Temizle();
                txtBarkod.Clear();
                txtBarkod.Focus();
                btnGuncelle.Enabled = false;
            }
            catch (ApiException hata)
            {
                lblSonuc.ForeColor = Color.FromArgb(220, 53, 69);
                lblSonuc.Text = hata.Message;
            }
        }

        private void Temizle()
        {
            bulunanBarkod = "";
            lblSiparisNo.Text = "-";
            lblMusteri.Text = "-";
            lblTelefon.Text = "-";
            lblParca.Text = "-";
            lblMevcutDurum.Text = "-";
            lblMevcutDurum.ForeColor = Color.Black;
        }

        private Color DurumRengi(string durum)
        {
            if (durum == "yikamada") return Color.FromArgb(13, 110, 253);
            if (durum == "utude") return Color.FromArgb(253, 126, 20);
            if (durum == "hazir") return Color.FromArgb(25, 135, 84);
            if (durum == "iptal") return Color.FromArgb(220, 53, 69);
            return Color.FromArgb(73, 80, 87);
        }
    }
}
