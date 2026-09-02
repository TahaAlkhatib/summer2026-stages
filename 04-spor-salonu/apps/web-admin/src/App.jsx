import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./api";
import Layout from "./Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MemberDetail from "./pages/MemberDetail";
import Turnstile from "./pages/Turnstile";
import Packages from "./pages/Packages";
import Classes from "./pages/Classes";
import Shop from "./pages/Shop";
import Reports from "./pages/Reports";

function Korumali({ children }) {
  if (!getUser()) return <Navigate to="/giris" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/giris" element={<Login />} />
      <Route path="/" element={<Korumali><Layout /></Korumali>}>
        <Route index element={<Dashboard />} />
        <Route path="turnike" element={<Turnstile />} />
        <Route path="uyeler" element={<Members />} />
        <Route path="uyeler/:id" element={<MemberDetail />} />
        <Route path="paketler" element={<Packages />} />
        <Route path="dersler" element={<Classes />} />
        <Route path="bufe" element={<Shop />} />
        <Route path="raporlar" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
