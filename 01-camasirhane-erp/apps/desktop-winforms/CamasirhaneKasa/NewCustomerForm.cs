namespace CamasirhaneKasa
{
    public partial class NewCustomerForm : Form
    {
        // Kayıt başarılı olursa eklenen müşteri buraya konur
        public MusteriOge EklenenMusteri;

        public NewCustomerForm()
        {
            InitializeComponent();
        }

        private async void btnKaydet_Click(object sender, EventArgs e)
        {
            lblHata.Text = "";

            if (txtAd.Text.Trim() == "" || txtTelefon.Text.Trim() == "")
            {
                lblHata.Text = "Ad soyad ve telefon zorunludur.";
                return;
            }

            btnKaydet.Enabled = false;
            try
            {
                var yeni = await ApiClient.PostAsync("/customers", new
                {
                    full_name = txtAd.Text.Trim(),
                    phone = txtTelefon.Text.Trim(),
                    address = txtAdres.Text.Trim(),
                    district = txtIlce.Text.Trim()
                });

                EklenenMusteri = new MusteriOge();
                EklenenMusteri.Id = ApiClient.Metin(yeni, "id");
                EklenenMusteri.Ad = ApiClient.Metin(yeni, "full_name");
                EklenenMusteri.Telefon = ApiClient.Metin(yeni, "phone");
                EklenenMusteri.Adres = ApiClient.Metin(yeni, "address");

                DialogResult = DialogResult.OK;
            }
            catch (ApiException hata)
            {
                lblHata.Text = hata.Message;
            }
            finally
            {
                btnKaydet.Enabled = true;
            }
        }
    }
}
