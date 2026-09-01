import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./api";
import Layout from "./Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import NewOrder from "./pages/NewOrder";
import Customers from "./pages/Customers";
import Services from "./pages/Services";
import Reports from "./pages/Reports";

// Giriş yapılmadıysa giriş sayfasına yönlendirir
function Korumali({ children }) {
  if (!getUser()) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Korumali>
            <Layout />
          </Korumali>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="siparisler" element={<Orders />} />
        <Route path="siparisler/:id" element={<OrderDetail />} />
        <Route path="yeni-siparis" element={<NewOrder />} />
        <Route path="musteriler" element={<Customers />} />
        <Route path="hizmetler" element={<Services />} />
        <Route path="raporlar" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
