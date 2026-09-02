// Electron ana süreç — şube masaüstü uygulamasını başlatır
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Geliştirme modunda Vite sunucusu, üretimde derlenmiş dosyalar kullanılır
const gelistirmeModu = !app.isPackaged && process.env.KARGO_DEV === '1';

function pencereOlustur() {
  const pencere = new BrowserWindow({
    width: 1380,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    title: 'Kargo Şube Operasyon',
    backgroundColor: '#f3f5f7',
    webPreferences: {
      // Uygulama sadece kendi arayüzünü yüklüyor, dış içerik açılmıyor
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  pencere.setMenuBarVisibility(false);

  if (gelistirmeModu) {
    pencere.loadURL('http://localhost:5118');
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
