namespace CamasirhaneKasa
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();

            // Once giris ekrani acilir, basarili olursa ana ekran calisir
            using (LoginForm giris = new LoginForm())
            {
                if (giris.ShowDialog() != DialogResult.OK)
                {
                    return;
                }
            }

            Application.Run(new MainForm());
        }
    }
}
