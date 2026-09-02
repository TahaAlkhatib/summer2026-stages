"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { kullaniciAl, oturumKapat, tokenAl } from "@/lib/api";

const MENU = [
  { yol: "/takvim", etiket: "Oda Takvimi", roller: ["admin", "resepsiyon"] },
  { yol: "/rezervasyonlar", etiket: "Rezervasyonlar", roller: ["admin", "resepsiyon"] },
  { yol: "/odalar", etiket: "Odalar", roller: ["admin", "resepsiyon"] },
  { yol: "/gorevler", etiket: "Görevler", roller: ["admin", "resepsiyon", "temizlik", "teknik"] },
  { yol: "/misafirler", etiket: "Misafirler", roller: ["admin", "resepsiyon"] },
  { yol: "/raporlar", etiket: "Raporlar", roller: ["admin", "resepsiyon"] },
];

export default function PanelYerlesimi({ children }) {
  const router = useRouter();
  const yol = usePathname();
  const [kullanici, setKullanici] = useState(null);

  useEffect(() => {
    if (!tokenAl()) {
      router.replace("/giris");
      return;
    }
    setKullanici(kullaniciAl());
  }, [router]);

  if (!kullanici) {
    return <div className="p-10 text-gray-500">Yükleniyor...</div>;
  }

  const menu = MENU.filter((m) => m.roller.includes(kullanici.role));

  function cikisYap() {
    oturumKapat();
    router.replace("/giris");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-lacivert text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="font-bold text-lg leading-tight">Apart &amp; Otel</div>
          <div className="text-xs text-bakir-acik">Yönetim Paneli</div>
        </div>

        <nav className="flex-1 py-3">
          {menu.map((m) => {
            const aktif = yol === m.yol || yol.startsWith(m.yol + "/");
            return (
              <Link
                key={m.yol}
                href={m.yol}
                className={
                  "block px-5 py-2.5 text-sm transition " +
                  (aktif
                    ? "bg-lacivert-acik border-l-4 border-bakir font-semibold"
                    : "border-l-4 border-transparent hover:bg-white/5")
                }
              >
                {m.etiket}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 text-sm">
          <div className="font-medium">{kullanici.fullName}</div>
          <div className="text-xs text-white/60 mb-3">{rolAdi(kullanici.role)}</div>
          <button
            onClick={cikisYap}
            className="text-xs bg-white/10 hover:bg-white/20 rounded px-3 py-1.5 w-full transition"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}

function rolAdi(rol) {
  if (rol === "admin") return "Yönetici";
  if (rol === "resepsiyon") return "Ön Büro";
  if (rol === "temizlik") return "Temizlik Ekibi";
  if (rol === "teknik") return "Teknik Ekip";
  return rol;
}
