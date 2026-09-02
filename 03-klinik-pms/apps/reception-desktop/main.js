// Electron ana süreç — resepsiyon masaüstü uygulamasını başlatır
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Geliştirme modunda Vite sunucusu, üretimde derlenmiş dosyalar kullanılır
const gelistirmeModu = !app.isPackaged && process.env.KLINIK_DEV === '1';

function pencereOlustur() {
  const pencere = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'Klinik Resepsiyon',
    backgroundColor: '#f0f4f4',
    webPreferences: {
      // Uygulama sadece kendi arayüzünü yüklüyor, dış içerik açılmıyor
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Menü çubuğunu sadeleştir
  pencere.setMenuBarVisibility(false);

  if (gelistirmeModu) {
    pencere.loadURL('http://localhost:5113');
  } else {
    pencere.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  pencereOlustur();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      pencereOlustur();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
