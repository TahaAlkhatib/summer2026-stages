namespace DepoYonetim
{
    public partial class LoginForm : Form
    {
        public LoginForm()
        {
            InitializeComponent();
        }

        private async void btnGiris_Click(object sender, EventArgs e)
        {
            lblHata.Text = "";

            if (txtKullanici.Text.Trim() == "" || txtSifre.Text == "")
            {
                lblHata.Text = "Kullanıcı adı ve şifre zorunludur.";
                return;
            }

            btnGiris.Enabled = false;
            btnGiris.Text = "Giriş yapılıyor...";

            try
            {
                var cevap = await ApiClient.PostAsync("/auth/login", new
                {
                    username = txtKullanici.Text.Trim(),
                    password = txtSifre.Text
                });

                var kullanici = cevap.GetProperty("user");

                ApiClient.Token = ApiClient.Metin(cevap, "token");
                ApiClient.UserId = ApiClient.Tam(kullanici, "id");
                ApiClient.UserName = ApiClient.Metin(kullanici, "full_name");
                ApiClient.Role = ApiClient.Metin(kullanici, "role");

                // Saha temsilcileri mobil uygulamayi kullanir, bu program depo icin
                if (ApiClient.Role == "saha")
                {
                    lblHata.Text = "Bu program depo personeli içindir. " +
                                   "Saha temsilcileri mobil uygulamayı kullanmalıdır.";
                    ApiClient.Token = "";
                    return;
                }

                DialogResult = DialogResult.OK;
            }
            catch (ApiException hata)
            {
                lblHata.Text = hata.Message;
            }
            finally
            {
                btnGiris.Enabled = true;
                btnGiris.Text = "Giriş Yap";
            }
        }
    }
}
