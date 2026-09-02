using System.IO.Ports;

namespace SporSalonuKasa
{
    // Turnike donanimi ile haberlesme katmani.
    //
    // Gercek kurulumda turnike kontrol karti bilgisayara seri porttan (RS-232 / USB)
    // baglanir. Kart okuyucu okudugu kodu porta yazar, biz de kapiyi acmak icin
    // porta komut gondeririz.
    //
    // Gelistirme ve okul sunumu icin donanim olmadigindan SIMULASYON modu vardir:
    // bu modda komutlar gercekten gonderilmez, sadece olay olarak bildirilir.
    public class TurnikeDonanimi : IDisposable
    {
        private SerialPort port;

        public bool SimulasyonModu { get; private set; } = true;
        public string PortAdi { get; private set; } = "";

        // Karttan / QR okuyucudan kod okundugunda tetiklenir
        public event Action<string> KodOkundu;

        // Donanima gonderilen her komut (log ekraninda gosterilir)
        public event Action<string> KomutGonderildi;

        public static string[] PortlariListele()
        {
            try
            {
                return SerialPort.GetPortNames();
            }
            catch
            {
                return new string[0];
            }
        }

        // Gercek turnikeye baglan. Basarisiz olursa simulasyon moduna duser.
        public bool Baglan(string portAdi, int baudRate = 9600)
        {
            Kapat();

            if (string.IsNullOrEmpty(portAdi) || portAdi == "SIMULASYON")
            {
                SimulasyonModu = true;
                PortAdi = "SIMULASYON";
                KomutGonderildi?.Invoke("Simülasyon modu etkin (donanım bağlı değil).");
                return true;
            }

            try
            {
                port = new SerialPort(portAdi, baudRate, Parity.None, 8, StopBits.One);
                port.ReadTimeout = 500;
                port.WriteTimeout = 500;
                port.DataReceived += Port_DataReceived;
                port.Open();

                SimulasyonModu = false;
                PortAdi = portAdi;
                KomutGonderildi?.Invoke(portAdi + " portuna bağlanıldı.");
                return true;
            }
            catch (Exception hata)
            {
                SimulasyonModu = true;
                PortAdi = "SIMULASYON";
                KomutGonderildi?.Invoke(
                    portAdi + " portuna bağlanılamadı (" + hata.Message + "). Simülasyon moduna geçildi.");
                return false;
            }
        }

        private void Port_DataReceived(object gonderen, SerialDataReceivedEventArgs e)
        {
            try
            {
                string satir = port.ReadLine().Trim();
                if (!string.IsNullOrEmpty(satir))
                {
                    KodOkundu?.Invoke(satir);
                }
            }
            catch (TimeoutException)
            {
                // Veri tamamlanmamis, bir sonraki olayda okunur
            }
            catch (Exception)
            {
                // Port kapandiysa sessizce gec
            }
        }

        // Turnikeyi ac (giris izni verildi)
        public void KapiyiAc()
        {
            Komut("OPEN\r\n", "Kapı açma komutu gönderildi (OPEN).");
        }

        // Kirmizi isik / sesli uyari (giris reddedildi)
        public void RedSinyali()
        {
            Komut("DENY\r\n", "Ret sinyali gönderildi (DENY).");
        }

        private void Komut(string komut, string aciklama)
        {
            if (SimulasyonModu || port == null || !port.IsOpen)
            {
                KomutGonderildi?.Invoke("[simülasyon] " + aciklama);
                return;
            }

            try
            {
                port.Write(komut);
                KomutGonderildi?.Invoke(aciklama);
            }
            catch (Exception hata)
            {
                KomutGonderildi?.Invoke("Komut gönderilemedi: " + hata.Message);
            }
        }

        public void Kapat()
        {
            if (port != null)
            {
                try
                {
                    if (port.IsOpen)
                    {
                        port.Close();
                    }
                    port.Dispose();
                }
                catch { }
                port = null;
            }
        }

        public void Dispose()
        {
            Kapat();
        }
    }
}
