using System.Text.Json;

namespace SporSalonuKasa
{
    // ComboBox içinde gösterilecek paket satırı
    public class PaketOge
    {
        public int Id;
        public string Ad;
        public int SureGun;
        public int? SeansSayisi;
        public decimal Fiyat;

        public override string ToString()
        {
            string seans = SeansSayisi.HasValue ? SeansSayisi.Value + " seans" : "sınırsız";
            return Ad + " — " + SureGun + " gün / " + seans + " — " + Bicim.Para(Fiyat);
        }
    }

    public partial class MembersForm : Form
    {
        private List<int> uyeIdleri = new List<int>();

        public MembersForm()
        {
            InitializeComponent();
        }

        private async void MembersForm_Load(object sender, EventArgs e)
        {
            cmbYontem.Items.AddRange(new object[] { "Nakit", "Kart", "Havale" });
            cmbYontem.SelectedIndex = 0;
            dtpBaslangic.Value = DateTime.Now;

            await PaketleriYukle();
            await UyeleriYukle("");
        }

        private async Task PaketleriYukle()
        {
            try
            {
                JsonElement liste = await ApiClient.GetAsync("/packages?active=1");
                cmbPaket.Items.Clear();
                foreach (JsonElement p in liste.EnumerateArray())
                {
                    PaketOge oge = new PaketOge();
                    oge.Id = ApiClient.Tam(p, "id");
                    oge.Ad = ApiClient.Metin(p, "name");
                    oge.SureGun = ApiClient.Tam(p, "duration_days");
                    oge.Fiyat = ApiClient.Para(p, "price");

                    string seansMetni = ApiClient.Metin(p, "session_count");
                    oge.SeansSayisi = seansMetni == "" ? (int?)null : ApiClient.Tam(p, "session_count");

                    cmbPaket.Items.Add(oge);
                }
                if (cmbPaket.Items.Count > 0)
                {
                    cmbPaket.SelectedIndex = 0;
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async Task UyeleriYukle(string arama)
        {
            try
            {
                JsonElement liste = await ApiClient.GetAsync("/members?q=" + Uri.EscapeDataString(arama));

                dgvUyeler.Rows.Clear();
                uyeIdleri.Clear();

                foreach (JsonElement u in liste.EnumerateArray())
                {
                    string seansMetni = ApiClient.Metin(u, "remaining_sessions");
                    string seans = seansMetni == "" ? "Sınırsız" : seansMetni;

                    dgvUyeler.Rows.Add(
                        ApiClient.Metin(u, "full_name"),
                        ApiClient.Metin(u, "phone"),
                        ApiClient.Metin(u, "qr_code"),
                        ApiClient.Tam(u, "active_membership") > 0 ? "Aktif" : "Yok",
                        Bicim.Tarih(ApiClient.Metin(u, "end_date")),
                        seans
                    );
                    uyeIdleri.Add(ApiClient.Tam(u, "id"));
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void btnAra_Click(object sender, EventArgs e)
        {
            await UyeleriYukle(txtAra.Text.Trim());
        }

        private async void txtAra_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                e.SuppressKeyPress = true;
                await UyeleriYukle(txtAra.Text.Trim());
            }
        }

        private void dgvUyeler_SelectionChanged(object sender, EventArgs e)
        {
            if (dgvUyeler.CurrentRow == null || dgvUyeler.CurrentRow.Index < 0 ||
                dgvUyeler.CurrentRow.Index >= uyeIdleri.Count)
            {
                btnPaketSat.Enabled = false;
                return;
            }

            lblSecilenUye.Text = dgvUyeler.CurrentRow.Cells[0].Value + "  ·  " +
                                 dgvUyeler.CurrentRow.Cells[2].Value;
            btnPaketSat.Enabled = true;
        }

        private async void btnPaketSat_Click(object sender, EventArgs e)
        {
            if (dgvUyeler.CurrentRow == null) return;

            int satir = dgvUyeler.CurrentRow.Index;
            if (satir < 0 || satir >= uyeIdleri.Count) return;

            PaketOge paket = cmbPaket.SelectedItem as PaketOge;
            if (paket == null)
            {
                MessageBox.Show("Lütfen bir paket seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            string yontem = cmbYontem.SelectedIndex == 1 ? "kart"
                          : (cmbYontem.SelectedIndex == 2 ? "havale" : "nakit");

            btnPaketSat.Enabled = false;
            try
            {
                JsonElement cevap = await ApiClient.PostAsync(
                    "/members/" + uyeIdleri[satir] + "/memberships",
                    new
                    {
                        package_id = paket.Id,
                        start_date = Bicim.ApiTarih(dtpBaslangic.Value),
                        paid_amount = numPesinat.Value,
                        method = yontem
                    });

                decimal toplam = ApiClient.Para(cevap, "total_price");
                decimal odenen = ApiClient.Para(cevap, "paid_amount");

                lblSonuc.ForeColor = Color.FromArgb(74, 222, 128);
                lblSonuc.Text = "Üyelik oluşturuldu: " + ApiClient.Metin(cevap, "package_name") +
                                "  ·  Bitiş: " + Bicim.Tarih(ApiClient.Metin(cevap, "end_date")) +
                                "  ·  Kalan borç: " + Bicim.Para(toplam - odenen);

                numPesinat.Value = 0;
                await UyeleriYukle(txtAra.Text.Trim());
            }
            catch (ApiException hata)
            {
                lblSonuc.ForeColor = Color.FromArgb(248, 113, 113);
                lblSonuc.Text = hata.Message;
            }
            finally
            {
                btnPaketSat.Enabled = true;
            }
        }
    }
}
