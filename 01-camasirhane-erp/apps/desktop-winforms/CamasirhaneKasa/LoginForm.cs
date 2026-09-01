namespace CamasirhaneKasa
{
    public class LoginForm : Form
    {
        private TextBox txtKullanici;
        private TextBox txtSifre;
        private Button btnGiris;
        private Label lblHata;

        public LoginForm()
        {
            Text = "Çamaşırhane Kasa — Giriş";
            Size = new Size(400, 300);
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            BackColor = Color.White;

            Label baslik = new Label();
            baslik.Text = "Çamaşırhane Kasa";
            baslik.Font = new Font("Segoe UI", 14, FontStyle.Bold);
            baslik.ForeColor = Color.FromArgb(30, 96, 145);
            baslik.TextAlign = ContentAlignment.MiddleCenter;
            baslik.SetBounds(20, 18, 340, 32);
            Controls.Add(baslik);

            Label etKullanici = new Label();
            etKullanici.Text = "Kullanıcı Adı";
            etKullanici.SetBounds(30, 62, 120, 20);
            Controls.Add(etKullanici);

            txtKullanici = new TextBox();
            txtKullanici.SetBounds(30, 84, 320, 26);
            Controls.Add(txtKullanici);

            Label etSifre = new Label();
            etSifre.Text = "Şifre";
            etSifre.SetBounds(30, 118, 120, 20);
            Controls.Add(etSifre);

            txtSifre = new TextBox();
            txtSifre.UseSystemPasswordChar = true;
            txtSifre.SetBounds(30, 140, 320, 26);
            Controls.Add(txtSifre);

            btnGiris = new Button();
            btnGiris.Text = "Giriş Yap";
            btnGiris.SetBounds(30, 178, 320, 34);
            btnGiris.BackColor = Color.FromArgb(30, 96, 145);
            btnGiris.ForeColor = Color.White;
            btnGiris.FlatStyle = FlatStyle.Flat;
            btnGiris.Click += btnGiris_Click;
            Controls.Add(btnGiris);

            lblHata = new Label();
            lblHata.ForeColor = Color.FromArgb(220, 53, 69);
            lblHata.SetBounds(30, 216, 320, 34);
            Controls.Add(lblHata);

            Label ipucu = new Label();
            ipucu.Text = "Demo: kasiyer1 / 123456";
            ipucu.ForeColor = Color.Gray;
            ipucu.TextAlign = ContentAlignment.MiddleCenter;
            ipucu.SetBounds(30, 236, 320, 20);
            Controls.Add(ipucu);

            AcceptButton = btnGiris;
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
                string rol = ApiClient.Metin(kullanici, "role");

                if (rol == "kurye")
                {
                    lblHata.Text = "Kasa uygulamasına kurye girişi yapılamaz.";
                    return;
                }

                ApiClient.Token = ApiClient.Metin(cevap, "token");
                ApiClient.UserId = ApiClient.Tam(kullanici, "id");
                ApiClient.UserName = ApiClient.Metin(kullanici, "full_name");
                ApiClient.Role = rol;

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
