import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/Dashboard';
import Citas from './pages/Citas';
import Charlas from './pages/Charlas';
import CharaDetalle from './pages/CharlaDetalle';
import Informacion from './pages/Informacion';
import ListaFichas from './pages/coordinadora/ListaFichas';
import NuevaFichaSocial from './pages/coordinadora/fichas/NuevaFichaSocial';

// Nuevas importaciones de Coordinadora
import Estudiantes from './pages/coordinadora/Estudiantes';
import PerfilEstudiante from './pages/coordinadora/PerfilEstudiante';
import FichaRecopilacion from './pages/coordinadora/fichas/FichaRecopilacion';
import FichaVisitaDomiciliaria from './pages/coordinadora/fichas/FichaVisitaDomiciliaria';
import VerFicha from './pages/coordinadora/fichas/VerFicha';
import FichaIntervencion from './pages/coordinadora/fichas/FichaIntervencion';

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

        {/* Rutas Protegidas - SOPORTE TI (Vista independiente) */}
        <Route path="/panel-soporte" element={<ProtectedRoute><PanelSoporte /></ProtectedRoute>} />

        {/* Rutas Protegidas - COORDINADORA (Con Sidebar verde del DashboardLayout) */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/citas" element={<Citas />} />
          <Route path="/dashboard/charlas" element={<Charlas />} />
          <Route path="/dashboard/charlas/:id" element={<CharaDetalle />} />
          <Route path="/dashboard/informacion" element={<Informacion />} />
          <Route path="/dashboard/fichas" element={<ListaFichas />} />
          <Route path="/dashboard/fichas/nueva-social" element={<NuevaFichaSocial />} />
          <Route path="/dashboard/fichas/recopilacion" element={<FichaRecopilacion />} />
          <Route path="/dashboard/fichas/visita" element={<FichaVisitaDomiciliaria />} />
          <Route path="/dashboard/fichas/intervencion" element={<FichaIntervencion />} />
          <Route path="/dashboard/fichas/ver/:tipo/:id" element={<VerFicha />} />

          {/* Rutas del Directorio de Estudiantes */}
          <Route path="/dashboard/estudiantes" element={<Estudiantes />} />
          <Route path="/dashboard/estudiantes/:id" element={<PerfilEstudiante />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;