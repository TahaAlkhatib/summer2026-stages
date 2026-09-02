using System.Text.Json;

namespace SporSalonuKasa
{
    // ListBox içinde gösterilecek ürün
    public class UrunOge
    {
        public int Id;
        public string Kod;
        public string Ad;
        public decimal Fiyat;
        public int Stok;

        public override string ToString()
        {
            return Ad + "   —   " + Bicim.Para(Fiyat) + "   (stok: " + Stok + ")";
        }
    }

    // Sepetteki kalem
    public class SepetKalemi
    {
        public int UrunId;
        public string Ad;
        public decimal BirimFiyat;
        public int Adet;
        public decimal Tutar { get { return BirimFiyat * Adet; } }
    }

    public partial class PosForm : Form
    {
        private List<SepetKalemi> sepet = new List<SepetKalemi>();

        public PosForm()
        {
            InitializeComponent();
        }

        private async void PosForm_Load(object sender, EventArgs e)
        {
            cmbYontem.Items.AddRange(new object[] { "Nakit", "Kart" });
            cmbYontem.SelectedIndex = 0;
            await UrunleriYukle();
        }

        private async Task UrunleriYukle()
        {
            try
            {
                JsonElement liste = await ApiClient.GetAsync("/pos/products?active=1");
                lstUrunler.Items.Clear();
                foreach (JsonElement u in liste.EnumerateArray())
                {
                    UrunOge oge = new UrunOge();
                    oge.Id = ApiClient.Tam(u, "id");
                    oge.Kod = ApiClient.Metin(u, "code");
                    oge.Ad = ApiClient.Metin(u, "name");
                    oge.Fiyat = ApiClient.Para(u, "price");
                    oge.Stok = ApiClient.Tam(u, "stock_quantity");
                    lstUrunler.Items.Add(oge);
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void btnSepeteEkle_Click(object sender, EventArgs e)
        {
            UrunOge urun = lstUrunler.SelectedItem as UrunOge;
            if (urun == null)
            {
                return;
            }
            if (urun.Stok <= 0)
            {
                MessageBox.Show(urun.Ad + " için stok kalmadı.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            SepetKalemi mevcut = sepet.Find(k => k.UrunId == urun.Id);
            if (mevcut != null)
            {
                if (mevcut.Adet >= urun.Stok)
                {
                    MessageBox.Show("Stok yetersiz. Depoda " + urun.Stok + " adet var.", "Uyarı",
                        MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
                mevcut.Adet++;
            }
            else
            {
                SepetKalemi kalem = new SepetKalemi();
                kalem.UrunId = urun.Id;
                kalem.Ad = urun.Ad;
                kalem.BirimFiyat = urun.Fiyat;
                kalem.Adet = 1;
                sepet.Add(kalem);
            }

            SepetiTazele();
        }

        private void btnSepettenCikar_Click(object sender, EventArgs e)
        {
            if (dgvSepet.CurrentRow == null) return;
            int satir = dgvSepet.CurrentRow.Index;
            if (satir >= 0 && satir < sepet.Count)
            {
                sepet.RemoveAt(satir);
                SepetiTazele();
            }
        }

        private void SepetiTazele()
        {
            dgvSepet.Rows.Clear();
            decimal toplam = 0;
            foreach (SepetKalemi k in sepet)
            {
                dgvSepet.Rows.Add(k.Ad, k.Adet, Bicim.Para(k.Tutar));
                toplam += k.Tutar;
            }
            lblToplam.Text = "Toplam: " + Bicim.Para(toplam);
        }

        private async void btnSatisiTamamla_Click(object sender, EventArgs e)
        {
            if (sepet.Count == 0)
            {
                MessageBox.Show("Sepet boş.", "Uyarı", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnSatisiTamamla.Enabled = false;
            try
            {
                List<object> kalemler = new List<object>();
                foreach (SepetKalemi k in sepet)
                {
                    kalemler.Add(new { product_id = k.UrunId, quantity = k.Adet });
                }

                JsonElement cevap = await ApiClient.PostAsync("/pos/sales", new
                {
                    member_id = (int?)null,
                    method = cmbYontem.SelectedIndex == 1 ? "kart" : "nakit",
                    items = kalemler
                });

                lblSonuc.ForeColor = Color.FromArgb(74, 222, 128);
                lblSonuc.Text = "Satış tamamlandı: " + ApiClient.Metin(cevap, "sale_no") +
                                "  —  " + Bicim.Para(ApiClient.Para(cevap, "total_amount"));

                sepet.Clear();
                SepetiTazele();
                await UrunleriYukle();
            }
            catch (ApiException hata)
            {
                lblSonuc.ForeColor = Color.FromArgb(248, 113, 113);
                lblSonuc.Text = hata.Message;
            }
            finally
            {
                btnSatisiTamamla.Enabled = true;
            }
        }
    }
}
