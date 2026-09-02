import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUser } from "./api";
import { ROL_ETIKETLERI } from "./ortak";

function Layout() {
  const kullanici = getUser();
  const navigate = useNavigate();

  function cikisYap() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/giris");
  }

  const sinif = ({ isActive }) => (isActive ? "aktif" : "");

  return (
    <div className="duzen">
      <div className="yan-menu">
        <div className="marka">SPOR SALONU</div>
        <NavLink to="/" className={sinif} end>Panel</NavLink>
        <NavLink to="/turnike" className={sinif}>Turnike</NavLink>
        <NavLink to="/uyeler" className={sinif}>Üyeler</NavLink>
        <NavLink to="/paketler" className={sinif}>Paketler</NavLink>
        <NavLink to="/dersler" className={sinif}>Dersler</NavLink>
        <NavLink to="/bufe" className={sinif}>Büfe / Kasa</NavLink>
        <NavLink to="/raporlar" className={sinif}>Raporlar</NavLink>
      </div>

      <div className="govde">
        <div className="ust-bar">
          <div>
            <strong>{kullanici.full_name}</strong>
            <span style={{ color: "#8b9bab" }}>
              {" "}— {ROL_ETIKETLERI[kullanici.role] || kullanici.role}
            </span>
          </div>
          <button className="ikincil kucuk" onClick={cikisYap}>Çıkış</button>
        </div>
        <div className="sayfa"><Outlet /></div>
      </div>
    </div>
  );
}

export default Layout;
