"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnaSayfa() {
  const router = useRouter();

  useEffect(() => {
    // Giriş yapılmışsa panele, yapılmamışsa giriş sayfasına
    const token = localStorage.getItem("token");
    router.replace(token ? "/panel" : "/giris");
  }, [router]);

  return <div style={{ padding: 40 }}>Yönlendiriliyor...</div>;
}
