import "./globals.css";

export const metadata = {
  title: "Apart & Otel Yönetimi",
  description: "Rezervasyon, oda takvimi ve temizlik/bakım görev takibi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
