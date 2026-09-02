using System.Text.Json;

namespace SporSalonuKasa
{
    public partial class TurnstileForm : Form
    {
        // Turnike donanimi (seri port) — bagli degilse simulasyon modunda calisir
        private TurnikeDonanimi donanim = new TurnikeDonanimi();

        public TurnstileForm()
        {
            InitializeComponent();

            donanim.KomutGonderildi += DonanimMesaji;
            // Karttan kod okunduğunda otomatik sorgula
            donanim.KodOkundu += DonanimdanKodGeldi;
        }

        private void TurnstileForm_Load(object sender, EventArgs e)
        {
            cmbPort.Items.Add("SIMULASYON");
            foreach (string p in TurnikeDonanimi.PortlariListele())
            {
                cmbPort.Items.Add(p);
            }
            cmbPort.SelectedIndex = 0;

            donanim.Baglan("SIMULASYON");
            lblDurum.Text = "Simülasyon modu (donanım bağlı değil)";
        }

        private void TurnstileForm_Shown(object sender, EventArgs e)
        {
            txtKod.Focus();
        }

        private void btnBaglan_Click(object sender, EventArgs e)
        {
            string secilen = cmbPort.SelectedItem == null ? "SIMULASYON" : cmbPort.SelectedItem.ToString();
            donanim.Baglan(secilen);
            lblDurum.Text = donanim.SimulasyonModu
                ? "Simülasyon modu (donanım bağlı değil)"
                : donanim.PortAdi + " bağlı";
            txtKod.Focus();
        }

        // Seri porttan kod geldiğinde arayüz iş parçacığına geç
        private void DonanimdanKodGeldi(string kod)
        {
            if (InvokeRequired)
            {
                BeginInvoke(new Action<string>(DonanimdanKodGeldi), kod);
                return;
            }
            txtKod.Text = kod;
            _ = Okut();
        }

        private void DonanimMesaji(string mesaj)
        {
            if (InvokeRequired)
            {
                BeginInvoke(new Action<string>(DonanimMesaji), mesaj);
                return;
            }
            LogEkle(mesaj);
        }

        private void LogEkle(string mesaj)
        {
            lstLog.Items.Insert(0, DateTime.Now.ToString("HH:mm:ss") + "  —  " + mesaj);
            if (lstLog.Items.Count > 200)
            {
                lstLog.Items.RemoveAt(lstLog.Items.Count - 1);
            }
        }

        private async void txtKod_KeyDown(object sender, KeyEventArgs e)
        {
            // Kart okuyucular okuma sonunda Enter gönderir
            if (e.KeyCode == Keys.Enter)
            {
                e.SuppressKeyPress = true;
                await Okut();
            }
        }

        private async void btnOkut_Click(object sender, EventArgs e)
        {
            await Okut();
        }

        private async Task Okut()
        {
            string kod = txtKod.Text.Trim();
            if (kod == "")
            {
                return;
            }

            try
            {
                JsonElement cevap = await ApiClient.PostAsync("/checkins/scan", new
                {
                    code = kod,
                    method = donanim.SimulasyonModu ? "manuel" : "rfid",
                    gateId = 1
                });

                bool izinli = ApiClient.Mantik(cevap, "allowed");

                if (izinli)
                {
                    pnlSonuc.BackColor = Color.FromArgb(15, 46, 29);
                    lblSonuc.ForeColor = Color.FromArgb(74, 222, 128);
                    lblSonuc.Text = "GİRİŞ İZNİ";
                    donanim.KapiyiAc();
                }
                else
                {
                    pnlSonuc.BackColor = Color.FromArgb(59, 18, 25);
                    lblSonuc.ForeColor = Color.FromArgb(248, 113, 113);
                    lblSonuc.Text = "GİRİŞ REDDEDİLDİ";
                    donanim.RedSinyali();
                }

                string uyeAdi = "";
                if (cevap.TryGetProperty("member", out JsonElement uye) &&
                    uye.ValueKind == JsonValueKind.Object)
                {
                    uyeAdi = ApiClient.Metin(uye, "full_name");
                }
                lblUye.Text = uyeAdi == "" ? "(tanınmayan kart)" : uyeAdi;

                if (izinli && cevap.TryGetProperty("membership", out JsonElement uyelik) &&
                    uyelik.ValueKind == JsonValueKind.Object)
                {
                    string paket = ApiClient.Metin(uyelik, "package_name");
                    string bitis = Bicim.Tarih(ApiClient.Metin(uyelik, "end_date"));
                    bool sinirsiz = ApiClient.Mantik(uyelik, "unlimited");
                    string seans = sinirsiz
                        ? "Sınırsız giriş"
                        : "Kalan seans: " + ApiClient.Tam(uyelik, "remaining_sessions");

                    lblDetay.Text = paket + "   ·   Bitiş: " + bitis + "   ·   " + seans;
                }
                else
                {
                    lblDetay.Text = ApiClient.Metin(cevap, "reason");
                }

                LogEkle(kod + "  →  " + (izinli ? "İZİN" : "RET — " + ApiClient.Metin(cevap, "reason")));

                // Arka arkaya okutma için alanı temizle
                txtKod.Clear();
                txtKod.Focus();
            }
            catch (ApiException hata)
            {
                pnlSonuc.BackColor = Color.FromArgb(59, 18, 25);
                lblSonuc.ForeColor = Color.FromArgb(248, 113, 113);
                lblSonuc.Text = "HATA";
                lblUye.Text = "";
                lblDetay.Text = hata.Message;
                LogEkle("HATA: " + hata.Message);
            }
        }
    }
}
