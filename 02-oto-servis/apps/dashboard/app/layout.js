import "./globals.css";

export const metadata = {
  title: "Oto Servis Yönetim Paneli",
  description: "Araç bakım ve onarım takip sistemi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
