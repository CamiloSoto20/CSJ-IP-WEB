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
import RecuperarPassword from './pages/recuperar/RecuperarPassword';

// Nuevas importaciones de Coordinadora
import Estudiantes from './pages/coordinadora/Estudiantes';
import PerfilEstudiante from './pages/coordinadora/PerfilEstudiante';
import RegistroAtencion from './pages/coordinadora/RegistroAtencion';
import ResumenGeneral from './pages/coordinadora/ResumenGeneral';

// Formularios de Fichas
import NuevaFichaSocial from './pages/coordinadora/fichas/NuevaFichaSocial';
import FichaRecopilacion from './pages/coordinadora/fichas/FichaRecopilacion';
import FichaVisitaDomiciliaria from './pages/coordinadora/fichas/FichaVisitaDomiciliaria';
import VerFicha from './pages/coordinadora/fichas/VerFicha';
import FichaIntervencion from './pages/coordinadora/fichas/FichaIntervencion';
import NuevaFichaJuridica from './pages/coordinadora/fichas/NuevaFichaJuridica';

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
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        {/* RUTAS ESTRICTAS - ESTUDIANTES */}
        <Route path="/panel-estudiante" element={<ProtectedRoute allowedRoles={['estudiante']}><PanelEstudiantes /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas" element={<ProtectedRoute allowedRoles={['estudiante']}><FichasEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/nueva-social" element={<ProtectedRoute allowedRoles={['estudiante']}><NuevaFichaSocial /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/recopilacion" element={<ProtectedRoute allowedRoles={['estudiante']}><FichaRecopilacion /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/visita" element={<ProtectedRoute allowedRoles={['estudiante']}><FichaVisitaDomiciliaria /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/intervencion" element={<ProtectedRoute allowedRoles={['estudiante']}><FichaIntervencion /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/nueva-juridica" element={<ProtectedRoute allowedRoles={['estudiante']}><NuevaFichaJuridica /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/ver/:tipo/:id" element={<ProtectedRoute allowedRoles={['estudiante']}><VerFicha /></ProtectedRoute>} />
        <Route path="/panel-estudiante/citas" element={<ProtectedRoute allowedRoles={['estudiante']}><CitasEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/charlas" element={<ProtectedRoute allowedRoles={['estudiante']}><CharlasEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/informacion" element={<ProtectedRoute allowedRoles={['estudiante']}><InformacionEstudiante /></ProtectedRoute>} />
        <Route path="/panel-estudiante/registro-atencion" element={<RegistroAtencion />} />

        {/* Rutas de Edición para Estudiantes */}
        <Route path="/panel-estudiante/fichas/editar/social/:id" element={<ProtectedRoute allowedRoles={['estudiante']}><NuevaFichaSocial /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/editar/intervencion/:id" element={<ProtectedRoute allowedRoles={['estudiante']}><FichaIntervencion /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/editar/recopilacion/:id" element={<ProtectedRoute allowedRoles={['estudiante']}><FichaRecopilacion /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/editar/visita/:id" element={<ProtectedRoute allowedRoles={['estudiante']}><FichaVisitaDomiciliaria /></ProtectedRoute>} />
        <Route path="/panel-estudiante/fichas/editar/juridica/:id" element={<ProtectedRoute allowedRoles={['estudiante']}><NuevaFichaJuridica /></ProtectedRoute>} />

        {/* RUTAS ESTRICTAS - SOPORTE TI */}
        <Route path="/panel-soporte" element={<ProtectedRoute allowedRoles={['soporte']}><PanelSoporte /></ProtectedRoute>} />

        {/* RUTAS ESTRICTAS - COORDINADORA */}
        <Route element={<ProtectedRoute allowedRoles={['coordinadora']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/resumen" element={<ResumenGeneral />} />
          <Route path="/dashboard/citas" element={<Citas />} />
          <Route path="/dashboard/charlas" element={<Charlas />} />
          <Route path="/dashboard/charlas/:id" element={<CharaDetalle />} />
          <Route path="/dashboard/informacion" element={<Informacion />} />
          <Route path="/dashboard/estudiantes" element={<Estudiantes />} />
          <Route path="/dashboard/estudiantes/:id" element={<PerfilEstudiante />} />
          <Route path="/dashboard/registro-atencion" element={<RegistroAtencion />} />


          {/* Fichas - Listado y Visor */}
          <Route path="/dashboard/fichas" element={<ListaFichas />} />
          <Route path="/dashboard/fichas/ver/:tipo/:id" element={<VerFicha />} />

          {/* Fichas - Creación */}
          <Route path="/dashboard/fichas/nueva-social" element={<NuevaFichaSocial />} />
          <Route path="/dashboard/fichas/recopilacion" element={<FichaRecopilacion />} />
          <Route path="/dashboard/fichas/visita" element={<FichaVisitaDomiciliaria />} />
          <Route path="/dashboard/fichas/intervencion" element={<FichaIntervencion />} />
          <Route path="/dashboard/fichas/nueva-juridica" element={<NuevaFichaJuridica />} />

          {/* Fichas - Edición (Nuevas Rutas) */}
          <Route path="/dashboard/fichas/editar/social/:id" element={<NuevaFichaSocial />} />
          <Route path="/dashboard/fichas/editar/intervencion/:id" element={<FichaIntervencion />} />
          <Route path="/dashboard/fichas/editar/recopilacion/:id" element={<FichaRecopilacion />} />
          <Route path="/dashboard/fichas/editar/visita/:id" element={<FichaVisitaDomiciliaria />} />
          <Route path="/dashboard/fichas/editar/juridica/:id" element={<NuevaFichaJuridica />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;