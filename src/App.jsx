import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/Dashboard';
import Fichas from './pages/Fichas';
import FichaDetalle from './pages/FichaDetalle';
import Citas from './pages/Citas';
import Charlas from './pages/Charlas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/fichas" element={<Fichas />} />
          <Route path="/dashboard/fichas/:id" element={<FichaDetalle />} />
          <Route path="/dashboard/citas" element={<Citas />} />
          <Route path="/dashboard/charlas" element={<Charlas />} />
          {/* Aquí agregaremos /dashboard/fichas y /dashboard/citas después */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;