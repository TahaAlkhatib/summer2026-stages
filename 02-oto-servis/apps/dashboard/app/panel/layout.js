"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { kullanici, cikisYap } from "@/lib/api";

const ROL_ETIKETLERI = {
  admin: "Yönetici",
  danisman: "Servis Danışmanı",
  teknisyen: "Teknisyen",
};

const MENU = [
  { yol: "/panel", ad: "Panel" },
  { yol: "/panel/is-emirleri", ad: "İş Emirleri" },
  { yol: "/panel/is-emirleri/yeni", ad: "Yeni İş Emri" },
  { yol: "/panel/parcalar", ad: "Yedek Parça" },
  { yol: "/panel/faturalar", ad: "Faturalar" },
];

export default function PanelDuzeni({ children }) {
  const [aktifKullanici, setAktifKullanici] = useState(null);
  const yol = usePathname();
  const router = useRouter();

  useEffect(() => {
    const k = kullanici();
    if (!k) {
      router.replace("/giris");
      return;
    }
    setAktifKullanici(k);
  }, [router]);

  if (!aktifKullanici) {
    return <div style={{ padding: 40 }}>Yükleniyor...</div>;
  }

  return (
    <div className="duzen">
      <div className="yan-menu">
        <div className="marka">OTO SERVİS</div>
        {MENU.map((m) => (
          <Link
            key={m.yol}
            href={m.yol}
            className={yol === m.yol ? "aktif" : ""}
          >
            {m.ad}
          </Link>
        ))}
      </div>

      <div className="govde">
        <div className="ust-bar">
          <div>
            <strong>{aktifKullanici.full_name}</strong>
            <span style={{ color: "#7b8794" }}>
              {" "}— {ROL_ETIKETLERI[aktifKullanici.role] || aktifKullanici.role}
            </span>
          </div>
          <button className="ikincil kucuk" onClick={cikisYap}>Çıkış</button>
        </div>

        <div className="sayfa">{children}</div>
      </div>
    </div>
  );
}
