import { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabase';
import './PanelEstudiantes.css';
import logo from '../assets/LOGO_CSJ.png';

const PanelEstudiante = () => {
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({ nombre: 'Cargando...', carrera: 'Derecho' });
  const [stats, setStats] = useState({ totalFichas: 0, totalCitas: 0, totalCharlas: 0 });
  const [participantes, setParticipantes] = useState([]);

  // Estados para el calendario y avisos
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [misCitas, setMisCitas] = useState([]);
  const [avisosRecientes, setAvisosRecientes] = useState([]);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Carga optimizada (Paralela)
  useEffect(() => {
    const fetchDatosSistema = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) throw authError;
        const userId = authData.user.id;

        const [
          perfilRes,
          fichasRes,
          citasRes,
          charlasRes,
          usuariosRes,
          misCitasRes,
          avisosRes // Nueva consulta agregada
        ] = await Promise.all([
          supabase.from('perfiles').select('nombre, rol').eq('id', userId).single(),
          supabase.from('legal_records').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          supabase.from('talks').select('*', { count: 'exact', head: true }),
          supabase.from('perfiles').select('id, nombre, estado, created_at').neq('id', userId).order('created_at', { ascending: false }).limit(5),
          supabase.from('appointments').select('fecha, hora, estado'),
          supabase.from('information').select('*').in('categoria', ['IMPORTANTE', 'Salida', 'Recordatorio']) // Filtro de exclusividad          .order('fecha_publicacion', { ascending: false })            .limit(2)// Traemos solo los 2 más recientes
        ]);

        if (perfilRes.data) setPerfil({ nombre: perfilRes.data.nombre, carrera: 'Estudiante de Derecho' });

        setStats({
          totalFichas: fichasRes.count || 0,
          totalCitas: citasRes.count || 0,
          totalCharlas: charlasRes.count || 0
        });

        if (usuariosRes.data) setParticipantes(usuariosRes.data);
        if (misCitasRes.data) setMisCitas(misCitasRes.data);
        if (avisosRes.data) setAvisosRecientes(avisosRes.data);

      } catch (error) {
        console.error("Error al cargar datos:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosSistema();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleEnviarReporteOutlook = () => {
    window.open('https://outlook.live.com/mail/0/deeplink/compose?to=coordinadora@csj.cl&subject=Reporte%20Diario%20de%20Turno', '_blank');
  };

  const handleEnviarEvidenciasGmail = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=evidencias@csj.cl&su=Evidencias%20Casos%20Juridicos', '_blank');
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Filtrar citas
  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
  const citasDelDia = misCitas.filter(cita => cita.fecha === fechaFormateada);

  // Helper para estilos dinámicos de avisos
  const getEstiloAvisoDinámico = (categoria) => {
    switch (categoria) {
      case 'Importante':
        return { borderLeft: '4px solid #dc3545', background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.03))', icon: '🔴' };
      case 'Último Minuto':
        return { borderLeft: '4px solid #ffc107', background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.03))', icon: '🟡' };
      case 'Recordatorio':
        return { borderLeft: '4px solid #0dcaf0', background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.1), rgba(13, 202, 240, 0.03))', icon: '🔵' };
      default:
        return { borderLeft: '4px solid #0d6efd', background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1), rgba(13, 110, 253, 0.03))', icon: '📰' };
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--bg-color)' }}>
        <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
      </div>
    );
  }

  return (
    <div className={`estudiante-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="d-flex justify-content-end mb-4 gap-3 align-items-center animate-up">
        <Button
          variant={isDarkMode ? 'outline-light' : 'outline-dark'}
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '45px', height: '45px', border: '2px solid' }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Alternar modo oscuro"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </Button>
        <div className="position-relative" style={{ cursor: 'pointer', fontSize: '1.8rem' }} onClick={() => navigate('/panel-estudiante/informacion')}>
          🔔
          {avisosRecientes.length > 0 && (
            <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill border border-2 border-white" style={{ fontSize: '0.65rem' }}>
              {avisosRecientes.length}
            </Badge>
          )}
        </div>
      </div>

      <Row className="g-4 flex-grow-1">
        {/* COLUMNA 1: Perfil y Soporte */}
        <Col lg={3} className="d-flex flex-column gap-4 animate-up delay-1">
          <div className="panel-card profile-section h-100">
            <div className="profile-header">
              <h4 className="mb-1">CSJ</h4>
              <p className="text-muted small mb-4 fw-bold">Clínica Socio Jurídica</p>
              <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--color-principal)' }}>{perfil.nombre}</h5>
                <p className="mb-0 text-muted">{perfil.carrera}</p>
                <Badge bg="secondary" className="mt-3 px-3 py-2 rounded-pill">IP-ST</Badge>
              </div>
              <Button variant={isDarkMode ? "outline-light" : "outline-danger"} className="w-100 mt-2 rounded-pill fw-bold py-2" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
            <div className="support-section">
              <div className="clock-display">
                {time.toLocaleTimeString('es-CL', { hour12: false })}
              </div>
              <h6 className="fw-bold text-center mb-3 mt-2" style={{ color: 'var(--text-primary)' }}>Soporte Técnico</h6>
              <div className="small text-center" style={{ color: 'var(--text-secondary)' }}>
                <p className="mb-1 d-flex align-items-center justify-content-center gap-2"><span>📧</span> soporte@csj.cl</p>
                <p className="mb-0 d-flex align-items-center justify-content-center gap-2"><span>📞</span> +56 9 1234 5678</p>
              </div>
            </div>
          </div>
        </Col>

        {/* COLUMNA 2: Centro de Operaciones */}
        <Col lg={6} className="d-flex flex-column gap-4 animate-up delay-2">
          <div className="panel-card">
            <h5 className="fw-bold mb-4" style={{ color: 'var(--color-principal)' }}>Accesos Rápidos</h5>
            <Row className="g-3">
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/fichas')}><span className="fs-4">📂</span> Mis Fichas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/citas')}><span className="fs-4">📅</span> Mis Citas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/charlas')}><span className="fs-4">📢</span> Charlas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/informacion')}><span className="fs-4">📰</span> Información</button></Col>
            </Row>
          </div>

          <div className="panel-card">
            <h5 className="fw-bold mb-4" style={{ color: 'var(--color-principal)' }}>Métricas Globales</h5>
            <Row className="g-3">
              <Col sm={4}>
                <div className="analytics-box">
                  <div className="analytics-value">{stats.totalFichas}</div>
                  <div className="small fw-bold" style={{ color: 'var(--text-secondary)' }}>Fichas Activas</div>
                </div>
              </Col>
              <Col sm={4}>
                <div className="analytics-box">
                  <div className="analytics-value">{stats.totalCitas}</div>
                  <div className="small fw-bold" style={{ color: 'var(--text-secondary)' }}>Citas Agendadas</div>
                </div>
              </Col>
              <Col sm={4}>
                <div className="analytics-box">
                  <div className="analytics-value">{stats.totalCharlas}</div>
                  <div className="small fw-bold" style={{ color: 'var(--text-secondary)' }}>Charlas Creadas</div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="panel-card mt-auto">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Resumen del Día</h5>
            <Row className="align-items-start">
              <Col md={7}>
                <div className="mb-3">
                  <Calendar
                    onChange={setFechaSeleccionada}
                    value={fechaSeleccionada}
                    className="w-100 rounded-4 shadow-sm border-0"
                  />
                </div>
                <div className="p-3 rounded-4" style={{ backgroundColor: isDarkMode ? 'rgba(120, 190, 32, 0.1)' : 'rgba(120, 190, 32, 0.05)', border: '1px solid var(--color-secundario)' }}>
                  <h6 className="fw-bold mb-1 fs-6">{fechaSeleccionada.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--color-secundario)' }}>
                    {citasDelDia.length > 0
                      ? `🎯 Tienes ${citasDelDia.length} cita(s) para este día.`
                      : '✨ Día libre, no hay citas programadas.'}
                  </p>
                </div>
              </Col>
              <Col md={5} className="d-flex flex-column gap-3">
                <Button onClick={handleEnviarReporteOutlook} className="w-100 fw-bold py-3 rounded-4 shadow-sm" style={{ backgroundColor: '#0078D4', border: 'none' }}>
                  📧 Enviar Reporte
                </Button>
                <Button onClick={handleEnviarEvidenciasGmail} className="w-100 fw-bold py-3 rounded-4 text-white shadow-sm" style={{ backgroundColor: '#EA4335', border: 'none' }}>
                  📁 Subir Evidencias
                </Button>
              </Col>
            </Row>
          </div>
        </Col>

        {/* COLUMNA 3: Avisos y Participantes */}
        <Col lg={3} className="d-flex flex-column gap-4 animate-up delay-3">
          <div className="panel-card d-flex flex-column h-100">

            {/* Widget Muro de Avisos Dinámico */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>Muro de Avisos</h5>
              <Button variant="link" className="p-0 text-decoration-none small fw-bold" onClick={() => navigate('/panel-estudiante/informacion')}>Ver Todos</Button>
            </div>

            <div className="mb-4">
              {avisosRecientes.length === 0 ? (
                <p className="text-muted small">No hay avisos recientes de coordinación.</p>
              ) : (
                avisosRecientes.map((aviso) => {
                  const estilos = getEstiloAvisoDinámico(aviso.categoria);
                  return (
                    <div key={aviso.id} className="shadow-sm mb-3" style={{ padding: '1rem', borderRadius: '12px', borderLeft: estilos.borderLeft, background: estilos.background }}>
                      <h6 className="fw-bold mb-1 d-flex align-items-start gap-2" style={{ fontSize: '0.9rem' }}>
                        <span>{estilos.icon}</span> {aviso.titulo}
                      </h6>
                      <p className="small mb-0 mt-2" style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        {aviso.descripcion_corta}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <h5 className="fw-bold mb-3 mt-auto" style={{ color: 'var(--color-principal)' }}>Usuarios del Sistema</h5>
            <div className="participantes-list flex-grow-1">
              {participantes.length === 0 ? (
                <p className="text-muted small text-center mt-4">No hay otros usuarios registrados aún.</p>
              ) : (
                participantes.map(p => (
                  <div key={p.id} className="participante-item d-flex flex-column align-items-start gap-1">
                    <div className="w-100 d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-truncate" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', maxWidth: '140px' }}>
                        {p.nombre}
                      </span>
                      <Badge bg={p.estado === 'Activo' ? 'success' : 'secondary'} className="px-2 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
                        {p.estado === 'Activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    {p.estado !== 'Activo' && (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Últ. vez: {formatearFecha(p.created_at)}</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="logo-container">
              <img src="/assets/LOGO_CSJ.png" alt="Logo Institucional" onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PanelEstudiante;