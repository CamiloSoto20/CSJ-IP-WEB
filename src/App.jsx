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
import CharaDetalle from './pages/CharlaDetalle';
import Informacion from './pages/Informacion';
import PanelEstudiantes from './pages/PanelEstudiantes'
import FichasEstudiante from './pages/FichaEstudiantes';
import GestionEstudiantes from './pages/GestionEstudiantes';
import PanelSoporte from './pages/PanelSoporte';

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
          <Route path="/dashboard/charlas/:id" element={<CharaDetalle />} />
          <Route path="/dashboard/informacion" element={<Informacion />} />
          <Route path="/dashboard/gestion-estudiantes" element={<GestionEstudiantes />} />
          <Route path="/panel-estudiante" element={<PanelEstudiantes />} />
          <Route path="/panel-estudiante/fichas" element={<FichasEstudiante />} />
          <Route path="/panel-estudiante/citas" element={<Citas />} />
          <Route path="/panel-estudiante/charlas" element={<Charlas />} />
          <Route path="/panel-estudiante/informacion" element={<Informacion />} />
          <Route path="/panel-soporte" element={<PanelSoporte />} />
          {/* Aquí agregaremos /dashboard/fichas y /dashboard/citas después */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;