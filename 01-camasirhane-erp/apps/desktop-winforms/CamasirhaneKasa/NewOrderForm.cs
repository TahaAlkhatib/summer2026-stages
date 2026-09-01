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

    public class NewOrderForm : Form
    {
        private TextBox txtMusteriAra;
        private ComboBox cmbMusteri;
        private ComboBox cmbHizmet;
        private NumericUpDown numMiktar;
        private DataGridView dgvKalemler;
        private Label lblToplam;
        private RadioButton rbMagaza;
        private RadioButton rbKurye;
        private DateTimePicker dtpSozVerilen;
        private TextBox txtNot;

        private List<KalemOge> kalemler = new List<KalemOge>();

        public NewOrderForm()
        {
            Text = "Yeni Sipariş";
            Size = new Size(900, 680);
            StartPosition = FormStartPosition.CenterParent;
            BackColor = Color.FromArgb(244, 246, 248);

            // ---- 1. Müşteri ----
            Controls.Add(Baslik("1. Müşteri", 20, 15));

            txtMusteriAra = new TextBox();
            txtMusteriAra.SetBounds(20, 45, 300, 26);
            Controls.Add(txtMusteriAra);

            Button btnAra = new Button();
            btnAra.Text = "Ara";
            btnAra.SetBounds(330, 44, 80, 28);
            btnAra.Click += btnAra_Click;
            Controls.Add(btnAra);

            Button btnYeniMusteri = new Button();
            btnYeniMusteri.Text = "Yeni Müşteri";
            btnYeniMusteri.SetBounds(420, 44, 120, 28);
            btnYeniMusteri.Click += btnYeniMusteri_Click;
            Controls.Add(btnYeniMusteri);

            cmbMusteri = new ComboBox();
            cmbMusteri.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbMusteri.SetBounds(20, 80, 520, 26);
            Controls.Add(cmbMusteri);

            // ---- 2. Hizmetler ----
            Controls.Add(Baslik("2. Hizmetler", 20, 125));

            cmbHizmet = new ComboBox();
            cmbHizmet.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbHizmet.SetBounds(20, 155, 480, 26);
            Controls.Add(cmbHizmet);

            Label etMiktar = new Label();
            etMiktar.Text = "Miktar";
            etMiktar.SetBounds(515, 138, 60, 18);
            Controls.Add(etMiktar);

            numMiktar = new NumericUpDown();
            numMiktar.DecimalPlaces = 1;
            numMiktar.Increment = 0.5M;
            numMiktar.Minimum = 0.5M;
            numMiktar.Maximum = 1000;
            numMiktar.Value = 1;
            numMiktar.SetBounds(515, 155, 80, 26);
            Controls.Add(numMiktar);

            Button btnEkle = new Button();
            btnEkle.Text = "Ekle";
            btnEkle.SetBounds(605, 154, 90, 28);
            btnEkle.Click += btnEkle_Click;
            Controls.Add(btnEkle);

            Button btnSil = new Button();
            btnSil.Text = "Seçili Kalemi Sil";
            btnSil.SetBounds(705, 154, 140, 28);
            btnSil.Click += btnSil_Click;
            Controls.Add(btnSil);

            dgvKalemler = new DataGridView();
            dgvKalemler.SetBounds(20, 190, 825, 190);
            dgvKalemler.ReadOnly = true;
            dgvKalemler.AllowUserToAddRows = false;
            dgvKalemler.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dgvKalemler.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dgvKalemler.BackgroundColor = Color.White;
            dgvKalemler.Columns.Add("hizmet", "Hizmet");
            dgvKalemler.Columns.Add("miktar", "Miktar");
            dgvKalemler.Columns.Add("birim", "Birim Fiyat");
            dgvKalemler.Columns.Add("tutar", "Tutar");
            Controls.Add(dgvKalemler);

            lblToplam = new Label();
            lblToplam.Text = "Toplam: " + Bicim.Para(0);
            lblToplam.Font = new Font("Segoe UI", 12, FontStyle.Bold);
            lblToplam.SetBounds(600, 388, 245, 26);
            lblToplam.TextAlign = ContentAlignment.MiddleRight;
            Controls.Add(lblToplam);

            // ---- 3. Teslim ----
            Controls.Add(Baslik("3. Teslim", 20, 425));

            rbMagaza = new RadioButton();
            rbMagaza.Text = "Mağazadan Teslim";
            rbMagaza.Checked = true;
            rbMagaza.SetBounds(20, 455, 160, 24);
            Controls.Add(rbMagaza);

            rbKurye = new RadioButton();
            rbKurye.Text = "Kurye ile Teslim";
            rbKurye.SetBounds(190, 455, 160, 24);
            Controls.Add(rbKurye);

            Label etTarih = new Label();
            etTarih.Text = "Söz Verilen Tarih";
            etTarih.SetBounds(20, 490, 140, 20);
            Controls.Add(etTarih);

            dtpSozVerilen = new DateTimePicker();
            dtpSozVerilen.Format = DateTimePickerFormat.Short;
            dtpSozVerilen.Value = DateTime.Now.AddDays(2);
            dtpSozVerilen.SetBounds(20, 512, 180, 26);
            Controls.Add(dtpSozVerilen);

            Label etNot = new Label();
            etNot.Text = "Notlar";
            etNot.SetBounds(220, 490, 100, 20);
            Controls.Add(etNot);

            txtNot = new TextBox();
            txtNot.Multiline = true;
            txtNot.SetBounds(220, 512, 400, 50);
            Controls.Add(txtNot);

            Button btnKaydet = new Button();
            btnKaydet.Text = "Siparişi Oluştur";
            btnKaydet.SetBounds(640, 512, 205, 50);
            btnKaydet.BackColor = Color.FromArgb(30, 96, 145);
            btnKaydet.ForeColor = Color.White;
            btnKaydet.FlatStyle = FlatStyle.Flat;
            btnKaydet.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            btnKaydet.Click += btnKaydet_Click;
            Controls.Add(btnKaydet);

            Load += async (s, e) => await HizmetleriYukle();
        }

        private Label Baslik(string yazi, int x, int y)
        {
            Label l = new Label();
            l.Text = yazi;
            l.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            l.ForeColor = Color.FromArgb(30, 96, 145);
            l.SetBounds(x, y, 300, 24);
            return l;
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

        private async void btnYeniMusteri_Click(object sender, EventArgs e)
        {
            string ad = Prompt.Sor("Yeni Müşteri", "Ad Soyad:");
            if (string.IsNullOrWhiteSpace(ad)) return;

            string telefon = Prompt.Sor("Yeni Müşteri", "Telefon:");
            if (string.IsNullOrWhiteSpace(telefon)) return;

            string adres = Prompt.Sor("Yeni Müşteri", "Adres:");
            string ilce = Prompt.Sor("Yeni Müşteri", "İlçe:");

            try
            {
                JsonElement yeni = await ApiClient.PostAsync("/customers", new
                {
                    full_name = ad,
                    phone = telefon,
                    address = adres,
                    district = ilce
                });

                MusteriOge oge = new MusteriOge();
                oge.Id = ApiClient.Tam(yeni, "id");
                oge.Ad = ApiClient.Metin(yeni, "full_name");
                oge.Telefon = ApiClient.Metin(yeni, "phone");
                oge.Adres = ApiClient.Metin(yeni, "address");

                cmbMusteri.Items.Add(oge);
                cmbMusteri.SelectedItem = oge;
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
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

        private void btnSil_Click(object sender, EventArgs e)
        {
            if (dgvKalemler.CurrentRow == null) return;
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
        }
    }

    // Basit metin sorma penceresi (WinForms'ta hazir InputBox yok)
    public static class Prompt
    {
        public static string Sor(string baslik, string soru)
        {
            Form f = new Form();
            f.Text = baslik;
            f.Size = new Size(400, 170);
            f.StartPosition = FormStartPosition.CenterParent;
            f.FormBorderStyle = FormBorderStyle.FixedDialog;
            f.MinimizeBox = false;
            f.MaximizeBox = false;

            Label l = new Label();
            l.Text = soru;
            l.SetBounds(15, 15, 350, 20);
            f.Controls.Add(l);

            TextBox t = new TextBox();
            t.SetBounds(15, 40, 350, 26);
            f.Controls.Add(t);

            Button tamam = new Button();
            tamam.Text = "Tamam";
            tamam.DialogResult = DialogResult.OK;
            tamam.SetBounds(190, 80, 85, 30);
            f.Controls.Add(tamam);

            Button vazgec = new Button();
            vazgec.Text = "Vazgeç";
            vazgec.DialogResult = DialogResult.Cancel;
            vazgec.SetBounds(285, 80, 85, 30);
            f.Controls.Add(vazgec);

            f.AcceptButton = tamam;
            f.CancelButton = vazgec;

            DialogResult sonuc = f.ShowDialog();
            string deger = t.Text;
            f.Dispose();

            return sonuc == DialogResult.OK ? deger : null;
        }
    }
}
