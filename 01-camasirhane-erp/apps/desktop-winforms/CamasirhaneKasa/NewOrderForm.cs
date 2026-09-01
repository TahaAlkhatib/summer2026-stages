using System.Text.Json;

namespace CamasirhaneKasa
{
    // ComboBox içinde gösterilecek hizmet satırı
    public class HizmetOge
    {
        public int Id;
        public string Ad;
        public string Birim;
        public decimal Fiyat;

        public override string ToString()
        {
            return Ad + " (" + Birim + ") — " + Bicim.Para(Fiyat);
        }
    }

    // ComboBox içinde gösterilecek müşteri satırı
    public class MusteriOge
    {
        public int Id;
        public string Ad;
        public string Telefon;
        public string Adres;

        public override string ToString()
        {
            return Ad + " — " + Telefon;
        }
    }

    // Siparişe eklenen kalem
    public class KalemOge
    {
        public int ServiceId;
        public string Ad;
        public decimal Miktar;
        public decimal BirimFiyat;
        public decimal Tutar;
    }

    public partial class NewOrderForm : Form
    {
        private List<KalemOge> kalemler = new List<KalemOge>();

        public NewOrderForm()
        {
            InitializeComponent();
        }

        private async void NewOrderForm_Load(object sender, EventArgs e)
        {
            dtpSozVerilen.Value = DateTime.Now.AddDays(2);
            lblToplam.Text = "Toplam: " + Bicim.Para(0);
            await HizmetleriYukle();
        }

        private async Task HizmetleriYukle()
        {
            try
            {
                JsonElement liste = await ApiClient.GetAsync("/services?active=1");
                cmbHizmet.Items.Clear();
                foreach (JsonElement h in liste.EnumerateArray())
                {
                    HizmetOge oge = new HizmetOge();
                    oge.Id = ApiClient.Tam(h, "id");
                    oge.Ad = ApiClient.Metin(h, "name");
                    oge.Birim = ApiClient.Metin(h, "unit");
                    oge.Fiyat = ApiClient.Para(h, "price");
                    cmbHizmet.Items.Add(oge);
                }
                if (cmbHizmet.Items.Count > 0)
                {
                    cmbHizmet.SelectedIndex = 0;
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void btnAra_Click(object sender, EventArgs e)
        {
            try
            {
                string arama = Uri.EscapeDataString(txtMusteriAra.Text.Trim());
                JsonElement liste = await ApiClient.GetAsync("/customers?q=" + arama);

                cmbMusteri.Items.Clear();
                foreach (JsonElement m in liste.EnumerateArray())
                {
                    MusteriOge oge = new MusteriOge();
                    oge.Id = ApiClient.Tam(m, "id");
                    oge.Ad = ApiClient.Metin(m, "full_name");
                    oge.Telefon = ApiClient.Metin(m, "phone");
                    oge.Adres = ApiClient.Metin(m, "address");
                    cmbMusteri.Items.Add(oge);
                }

                if (cmbMusteri.Items.Count > 0)
                {
                    cmbMusteri.SelectedIndex = 0;
                }
                else
                {
                    MessageBox.Show("Müşteri bulunamadı.", "Bilgi",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void btnYeniMusteri_Click(object sender, EventArgs e)
        {
            using (NewCustomerForm f = new NewCustomerForm())
            {
                if (f.ShowDialog() == DialogResult.OK && f.EklenenMusteri != null)
                {
                    cmbMusteri.Items.Add(f.EklenenMusteri);
                    cmbMusteri.SelectedItem = f.EklenenMusteri;
                }
            }
        }

        private void btnEkle_Click(object sender, EventArgs e)
        {
            HizmetOge hizmet = cmbHizmet.SelectedItem as HizmetOge;
            if (hizmet == null)
            {
                MessageBox.Show("Lütfen bir hizmet seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            KalemOge kalem = new KalemOge();
            kalem.ServiceId = hizmet.Id;
            kalem.Ad = hizmet.Ad;
            kalem.Miktar = numMiktar.Value;
            kalem.BirimFiyat = hizmet.Fiyat;
            kalem.Tutar = numMiktar.Value * hizmet.Fiyat;
            kalemler.Add(kalem);

            TabloyuTazele();
            numMiktar.Value = 1;
        }

        private void btnKalemSil_Click(object sender, EventArgs e)
        {
            if (dgvKalemler.CurrentRow == null)
            {
                return;
            }
            int satir = dgvKalemler.CurrentRow.Index;
            if (satir >= 0 && satir < kalemler.Count)
            {
                kalemler.RemoveAt(satir);
                TabloyuTazele();
            }
        }

        private void TabloyuTazele()
        {
            dgvKalemler.Rows.Clear();
            decimal toplam = 0;
            foreach (KalemOge k in kalemler)
            {
                dgvKalemler.Rows.Add(k.Ad, k.Miktar, Bicim.Para(k.BirimFiyat), Bicim.Para(k.Tutar));
                toplam += k.Tutar;
            }
            lblToplam.Text = "Toplam: " + Bicim.Para(toplam);
        }

        private async void btnKaydet_Click(object sender, EventArgs e)
        {
            MusteriOge musteri = cmbMusteri.SelectedItem as MusteriOge;
            if (musteri == null)
            {
                MessageBox.Show("Lütfen müşteri seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            if (kalemler.Count == 0)
            {
                MessageBox.Show("Siparişe en az bir hizmet ekleyin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnKaydet.Enabled = false;
            try
            {
                List<object> gonderilecek = new List<object>();
                foreach (KalemOge k in kalemler)
                {
                    gonderilecek.Add(new
                    {
                        service_id = k.ServiceId,
                        item_name = k.Ad,
                        quantity = k.Miktar
                    });
                }

                JsonElement cevap = await ApiClient.PostAsync("/orders", new
                {
                    customer_id = musteri.Id,
                    delivery_type = rbKurye.Checked ? "kurye" : "magaza",
                    promised_date = Bicim.ApiTarih(dtpSozVerilen.Value),
                    notes = txtNot.Text,
                    items = gonderilecek
                });

                string siparisNo = ApiClient.Metin(cevap, "order_no");

                // Basılacak etiketleri hazırla
                List<Etiket> etiketler = new List<Etiket>();
                foreach (JsonElement k in cevap.GetProperty("items").EnumerateArray())
                {
                    Etiket et = new Etiket();
                    et.Barkod = ApiClient.Metin(k, "barcode");
                    et.Musteri = musteri.Ad;
                    et.Hizmet = ApiClient.Metin(k, "item_name");
                    et.SiparisNo = siparisNo;
                    et.Tarih = DateTime.Now;
                    etiketler.Add(et);
                }

                MessageBox.Show("Sipariş oluşturuldu: " + siparisNo, "Başarılı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);

                using (LabelPrintForm f = new LabelPrintForm(etiketler))
                {
                    f.ShowDialog();
                }

                Close();
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
            finally
            {
                btnKaydet.Enabled = true;
            }
        }
    }
}
