import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUser } from "./api";

const ROL_ETIKETLERI = {
  admin: "Yönetici",
  kasiyer: "Kasiyer",
  kurye: "Kurye",
};

function Layout() {
  const kullanici = getUser();
  const navigate = useNavigate();

  function cikisYap() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Aktif menü bağlantısına sınıf ekler
  const sinif = ({ isActive }) => (isActive ? "aktif" : "");

  return (
    <div className="duzen">
      <div className="menu">
        <h2>Çamaşırhane ERP</h2>
        <NavLink to="/" className={sinif} end>Panel</NavLink>
        <NavLink to="/siparisler" className={sinif}>Siparişler</NavLink>
        <NavLink to="/yeni-siparis" className={sinif}>Yeni Sipariş</NavLink>
        <NavLink to="/musteriler" className={sinif}>Müşteriler</NavLink>
        <NavLink to="/hizmetler" className={sinif}>Hizmetler</NavLink>
        <NavLink to="/raporlar" className={sinif}>Raporlar</NavLink>
      </div>

      <div className="icerik">
        <div className="ust-bar">
          <div>
            <strong>{kullanici.full_name}</strong>
            <span style={{ color: "#6c757d" }}>
              {" "}— {ROL_ETIKETLERI[kullanici.role]}
            </span>
          </div>
          <button className="ikincil kucuk" onClick={cikisYap}>Çıkış</button>
        </div>

        <div className="sayfa">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
