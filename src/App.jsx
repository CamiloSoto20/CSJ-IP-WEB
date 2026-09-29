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

// Módulo Estudiantes
import PanelEstudiantes from './pages/PanelEstudiantes';
import FichasEstudiante from './pages/FichaEstudiantes';
import CitasEstudiante from './pages/CitasEstudiantes';
import CharlasEstudiante from './pages/CharlaEstufiante';
import InformacionEstudiante from './pages/InformacionEstudiante';

// Módulo Soporte
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

        {/* Rutas Protegidas - ESTUDIANTES (Vistas independientes sin Sidebar de Coordinadora) */}
        <Route path="/panel-estudiante" element={<ProtectedRoute><PanelEstudiantes /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas" element={<ProtectedRoute><FichasEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/citas" element={<ProtectedRoute><CitasEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/charlas" element={<ProtectedRoute><CharlasEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/informacion" element={<ProtectedRoute><InformacionEstudiante /></ProtectedRoute>} />
        {/* Futuras rutas de estudiante: Charlas e Información pueden ir aquí si requieren vistas adaptadas */}

        {/* Rutas Protegidas - SOPORTE TI (Vista independiente) */}
        <Route path="/panel-soporte" element={<ProtectedRoute><PanelSoporte /></ProtectedRoute>} />

        {/* Rutas Protegidas - COORDINADORA (Con Sidebar verde del DashboardLayout) */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/fichas" element={<Fichas />} />
          <Route path="/dashboard/fichas/:id" element={<FichaDetalle />} />
          <Route path="/dashboard/citas" element={<Citas />} />
          <Route path="/dashboard/charlas" element={<Charlas />} />
          <Route path="/dashboard/charlas/:id" element={<CharaDetalle />} />
          <Route path="/dashboard/informacion" element={<Informacion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;