import { useState, useEffect } from 'react';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './PanelEstudiantes.css';

const PanelEstudiante = () => {
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Datos simulados (Mock data)
  const citasHoy = 1;
  const participantes = [
    { id: 1, nombre: 'Ana López', estado: 'En atención' },
    { id: 2, nombre: 'Carlos Ruiz', estado: 'Pendiente' },
    { id: 3, nombre: 'María Silva', estado: 'Cerrado' },
    { id: 4, nombre: 'Jorge Soto', estado: 'Pendiente' },
    { id: 5, nombre: 'Elena Mora', estado: 'En atención' },
  ];

  return (
    <div className={`estudiante-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Barra superior de controles */}
      <div className="d-flex justify-content-end mb-3 gap-3 align-items-center">
        <Button
          variant={isDarkMode ? 'outline-light' : 'outline-dark'}
          className="rounded-circle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Alternar modo oscuro"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </Button>
        <div className="position-relative" style={{ cursor: 'pointer', fontSize: '1.5rem' }}>
          🔔
          <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill" style={{ fontSize: '0.6rem' }}>
            3
          </Badge>
        </div>
      </div>

      <Row className="g-4 h-100">

        {/* COLUMNA 1: Perfil y Soporte */}
        <Col lg={3} className="d-flex flex-column gap-4">
          <div className="panel-card profile-section">
            <div className="profile-header">
              <h4 className="mb-0">CSJ</h4>
              <p className="text-muted small mb-4">Clínica Socio Jurídica</p>

              <div className="mb-4">
                <h5 className="fw-bold mb-1">Nombre del Estudiante</h5>
                <p className="mb-0 text-muted">Derecho</p>
                <Badge bg="secondary" className="mt-2">IP-ST</Badge>
              </div>

              <Button variant="outline-danger" className="w-100 mt-2 rounded-pill fw-bold" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>

            <div className="support-section mt-auto">
              <div className="clock-display">
                {time.toLocaleTimeString('es-CL', { hour12: false })}
              </div>
              <h6 className="fw-bold text-center mb-3">Soporte Técnico</h6>
              <div className="small text-center text-muted">
                <p className="mb-1">📧 soporte@csj.cl</p>
                <p className="mb-0">📞 +56 9 1234 5678</p>
              </div>
            </div>
          </div>
        </Col>

        {/* COLUMNA 2: Centro de Operaciones */}
        <Col lg={6} className="d-flex flex-column gap-4">

          {/* Botones principales */}
          <div className="panel-card">
            <h5 className="fw-bold mb-4">Accesos Rápidos</h5>
            <Row className="g-3">
              <Col sm={6}>
                <button className="action-btn" onClick={() => navigate('/panel-estudiante/fichas')}>📂 Mis Fichas</button>
              </Col>
              <Col sm={6}>
                <button className="action-btn" onClick={() => navigate('/panel-estudiante/citas')}>📅 Mis Citas</button>
              </Col>
              <Col sm={6}>
                <button className="action-btn" onClick={() => navigate('/panel-estudiante/charlas')}>📢 Charlas</button>
              </Col>
              <Col sm={6}>
                <button className="action-btn" onClick={() => navigate('/panel-estudiante/informacion')}>📰 Información</button>
              </Col>
            </Row>
          </div>

          {/* Analíticas */}
          <div className="panel-card">
            <h5 className="fw-bold mb-4">Tus Estadísticas</h5>
            <Row className="g-3">
              <Col sm={4}>
                <div className="analytics-box">
                  <div className="analytics-value">85%</div>
                  <div className="small text-muted">Personas Atendidas</div>
                </div>
              </Col>
              <Col sm={4}>
                <div className="analytics-box">
                  <div className="analytics-value">12</div>
                  <div className="small text-muted">Citas Completadas</div>
                </div>
              </Col>
              <Col sm={4}>
                <div className="analytics-box">
                  <div className="analytics-value">24</div>
                  <div className="small text-muted">Trabajos Realizados</div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Calendario y Reportes */}
          <div className="panel-card">
            <Row>
              <Col md={8}>
                <h5 className="fw-bold mb-3">Calendario</h5>
                <div className="p-3 rounded mb-3" style={{ backgroundColor: 'rgba(120, 190, 32, 0.1)', border: '1px solid var(--color-secundario, #78BE20)' }}>
                  <h6 className="fw-bold mb-1">{time.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
                  <p className="mb-0 text-muted">
                    {citasHoy > 0 ? `Tienes ${citasHoy} cita(s) agendada(s) para hoy.` : 'No hay citas para hoy.'}
                  </p>
                </div>
              </Col>
              <Col md={4} className="d-flex flex-column gap-2 justify-content-center">
                <Button variant="outline-primary" className="w-100 fw-bold">Enviar Reporte</Button>
                <Button variant="outline-success" className="w-100 fw-bold">Enviar Evidencias</Button>
              </Col>
            </Row>
          </div>
        </Col>

        {/* COLUMNA 3: Avisos y Participantes */}
        <Col lg={3} className="d-flex flex-column gap-4">
          <div className="panel-card d-flex flex-column">

            <h5 className="fw-bold mb-4">Muro de Avisos</h5>
            <div className="avisos-box">
              <h6 className="fw-bold mb-1">⚠️ Reunión de equipo</h6>
              <p className="small mb-0 text-dark">Viernes a las 15:00 hrs. Asistencia obligatoria para revisión de casos.</p>
            </div>

            <h5 className="fw-bold mb-3 mt-2">Participantes Recientes</h5>
            <div className="participantes-list flex-grow-1">
              {participantes.map(p => (
                <div key={p.id} className="participante-item">
                  <div>
                    <span className="fw-bold d-block" style={{ fontSize: '0.9rem' }}>{p.nombre}</span>
                  </div>
                  <Badge bg={p.estado === 'En atención' ? 'primary' : p.estado === 'Cerrado' ? 'success' : 'warning'}>
                    {p.estado}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="logo-container">
              {/* Asegúrate de tener tu imagen en la carpeta public o assets y ajustar la ruta */}
              <img src="/assets/LOGO_CSJ.png" alt="Logo Institucional" onError={(e) => e.target.style.display = 'none'} />
            </div>

          </div>
        </Col>

      </Row>
    </div>
  );
};

export default PanelEstudiante;