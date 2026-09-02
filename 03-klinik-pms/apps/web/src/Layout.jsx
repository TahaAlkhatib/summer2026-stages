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
        <div className="marka">KLİNİK PMS</div>
        <NavLink to="/" className={sinif} end>Panel</NavLink>
        <NavLink to="/randevular" className={sinif}>Randevular</NavLink>
        <NavLink to="/randevular/yeni" className={sinif}>Yeni Randevu</NavLink>
        <NavLink to="/hastalar" className={sinif}>Hastalar</NavLink>
        <NavLink to="/malzemeler" className={sinif}>Sarf Malzeme</NavLink>
        <NavLink to="/faturalar" className={sinif}>Faturalar</NavLink>
      </div>

      <div className="govde">
        <div className="ust-bar">
          <div>
            <strong>{kullanici.full_name}</strong>
            <span style={{ color: "#6b7f7f" }}>
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
