using System.Text.Json;

namespace CamasirhaneKasa
{
    public class ScanStageForm : Form
    {
        private TextBox txtBarkod;
        private Label lblSiparisNo;
        private Label lblMusteri;
        private Label lblTelefon;
        private Label lblParca;
        private Label lblMevcutDurum;
        private ComboBox cmbYeniDurum;
        private Button btnGuncelle;
        private Label lblSonuc;
        private ListBox lstGecmis;

        // Aşama sırası — okutulunca bir sonrakine otomatik geçilir
        private readonly string[] durumSirasi =
            { "alindi", "yikamada", "utude", "hazir", "teslim_edildi" };

        private string bulunanBarkod = "";

        public ScanStageForm()
        {
            Text = "Barkod ile Aşama Güncelle";
            Size = new Size(720, 520);
            StartPosition = FormStartPosition.CenterParent;
            BackColor = Color.FromArgb(244, 246, 248);

            Label etBarkod = new Label();
            etBarkod.Text = "Barkodu okutun veya yazıp Enter'a basın:";
            etBarkod.SetBounds(20, 15, 400, 20);
            Controls.Add(etBarkod);

            txtBarkod = new TextBox();
            txtBarkod.Font = new Font("Consolas", 16);
            txtBarkod.SetBounds(20, 38, 460, 34);
            txtBarkod.KeyDown += txtBarkod_KeyDown;
            Controls.Add(txtBarkod);

            Button btnSorgula = new Button();
            btnSorgula.Text = "Sorgula";
            btnSorgula.SetBounds(495, 38, 110, 34);
            btnSorgula.Click += async (s, e) => await Sorgula();
            Controls.Add(btnSorgula);

            // ---- Sonuç kartı ----
            GroupBox kutu = new GroupBox();
            kutu.Text = "Sipariş Bilgisi";
            kutu.SetBounds(20, 85, 660, 150);
            kutu.BackColor = Color.White;

            lblSiparisNo = BilgiSatiri(kutu, "Sipariş No", 0);
            lblMusteri = BilgiSatiri(kutu, "Müşteri", 1);
            lblTelefon = BilgiSatiri(kutu, "Telefon", 2);
            lblParca = BilgiSatiri(kutu, "Parça", 3);
            lblMevcutDurum = BilgiSatiri(kutu, "Mevcut Durum", 4);
            Controls.Add(kutu);

            // ---- Güncelleme ----
            Label etYeni = new Label();
            etYeni.Text = "Yeni Aşama";
            etYeni.SetBounds(20, 250, 120, 20);
            Controls.Add(etYeni);

            cmbYeniDurum = new ComboBox();
            cmbYeniDurum.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbYeniDurum.SetBounds(20, 272, 250, 28);
            foreach (string d in durumSirasi)
            {
                cmbYeniDurum.Items.Add(Bicim.Durum(d));
            }
            Controls.Add(cmbYeniDurum);

            btnGuncelle = new Button();
            btnGuncelle.Text = "Aşamayı Güncelle";
            btnGuncelle.SetBounds(285, 270, 180, 32);
            btnGuncelle.BackColor = Color.FromArgb(30, 96, 145);
            btnGuncelle.ForeColor = Color.White;
            btnGuncelle.FlatStyle = FlatStyle.Flat;
            btnGuncelle.Enabled = false;
            btnGuncelle.Click += async (s, e) => await Guncelle();
            Controls.Add(btnGuncelle);

            lblSonuc = new Label();
            lblSonuc.SetBounds(20, 310, 660, 24);
            lblSonuc.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            Controls.Add(lblSonuc);

            Label etGecmis = new Label();
            etGecmis.Text = "Bu oturumda okutulanlar:";
            etGecmis.SetBounds(20, 340, 300, 20);
            Controls.Add(etGecmis);

            lstGecmis = new ListBox();
            lstGecmis.SetBounds(20, 362, 660, 105);
            Controls.Add(lstGecmis);

            Shown += (s, e) => txtBarkod.Focus();
        }

        private Label BilgiSatiri(GroupBox kutu, string etiket, int sira)
        {
            Label et = new Label();
            et.Text = etiket + ":";
            et.ForeColor = Color.Gray;
            et.SetBounds(15, 25 + sira * 24, 120, 20);
            kutu.Controls.Add(et);

            Label deger = new Label();
            deger.Text = "-";
            deger.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            deger.SetBounds(145, 25 + sira * 24, 480, 20);
            kutu.Controls.Add(deger);

            return deger;
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
                JsonElement kayit = await ApiClient.GetAsync("/orders/barcode/" + Uri.EscapeDataString(barkod));

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
