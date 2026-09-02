import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./api";
import Layout from "./Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import NewAppointment from "./pages/NewAppointment";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Examination from "./pages/Examination";
import Supplies from "./pages/Supplies";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";

function Korumali({ children }) {
  if (!getUser()) {
    return <Navigate to="/giris" />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/giris" element={<Login />} />
      <Route path="/" element={<Korumali><Layout /></Korumali>}>
        <Route index element={<Dashboard />} />
        <Route path="randevular" element={<Appointments />} />
        <Route path="randevular/yeni" element={<NewAppointment />} />
        <Route path="muayene/:randevuId" element={<Examination />} />
        <Route path="hastalar" element={<Patients />} />
        <Route path="hastalar/:id" element={<PatientDetail />} />
        <Route path="malzemeler" element={<Supplies />} />
        <Route path="faturalar" element={<Invoices />} />
        <Route path="faturalar/:id" element={<InvoiceDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
