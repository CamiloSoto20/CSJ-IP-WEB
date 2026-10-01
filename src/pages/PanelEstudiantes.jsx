import { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Spinner, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { supabase } from '../lib/supabase';
import './PanelEstudiantes.css';

const PanelEstudiante = () => {
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({ nombre: 'Cargando...', carrera: 'Derecho' });
  const [stats, setStats] = useState({ totalFichas: 0, totalCitas: 0, totalCharlas: 0 });
  const [participantes, setParticipantes] = useState([]);
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [misCitas, setMisCitas] = useState([]);
  const [avisosRecientes, setAvisosRecientes] = useState([]);

  // Estados para el Modal de Aviso Completo
  const [showAvisoModal, setShowAvisoModal] = useState(false);
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          avisosRes
        ] = await Promise.all([
          supabase.from('perfiles').select('nombre, rol').eq('id', userId).single(),
          supabase.from('social_records').select('*', { count: 'exact', head: true }).eq('professional_id', userId),
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          supabase.from('talks').select('*', { count: 'exact', head: true }),
          supabase.from('perfiles').select('id, nombre, estado, created_at, rol').neq('id', userId).order('created_at', { ascending: false }).limit(6),
          supabase.from('appointments').select('fecha_cita, hora, estado'),
          supabase.from('information').select('*').in('categoria', ['IMPORTANTE', 'Salida', 'Recordatorio']).order('fecha_publicacion', { ascending: false }).limit(5)
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

    // 📡 SUSCRIPCIÓN EN TIEMPO REAL A AVISOS
    const channel = supabase.channel('avisos-estudiantes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'information' }, (payload) => {
        const nuevoAviso = payload.new;
        // Solo atrapamos los avisos dirigidos a estudiantes
        if (['IMPORTANTE', 'Salida', 'Recordatorio'].includes(nuevoAviso.categoria)) {
          setAvisosRecientes(prevAvisos => [nuevoAviso, ...prevAvisos].slice(0, 5));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
  const citasDelDia = misCitas.filter(cita => cita.fecha_cita === fechaFormateada);

  const getEstiloAvisoDinámico = (categoria) => {
    switch (categoria) {
      case 'IMPORTANTE': 
        return { borderLeft: '4px solid #dc3545', background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.05), rgba(220, 53, 69, 0.01))', headerBg: '#dc3545', headerText: 'white', icon: '🔴' };
      case 'Salida': 
        return { borderLeft: '4px solid #ffc107', background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05), rgba(255, 193, 7, 0.01))', headerBg: '#ffc107', headerText: 'dark', icon: '🟡' };
      case 'Recordatorio': 
        return { borderLeft: '4px solid #0dcaf0', background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.05), rgba(13, 202, 240, 0.01))', headerBg: '#0dcaf0', headerText: 'dark', icon: '🔵' };
      default: 
        return { borderLeft: '4px solid #0d6efd', background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(13, 110, 253, 0.01))', headerBg: '#0d6efd', headerText: 'white', icon: '📰' };
    }
  };

  const handleAbrirAviso = (aviso) => {
    setAvisoSeleccionado(aviso);
    setShowAvisoModal(true);
  };

  const getRoleBadgeColor = (rol) => {
    switch(rol) {
      case 'coordinadora': return 'danger';
      case 'soporte': return 'dark';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
      </div>
    );
  }

  return (
    <div className={`estudiante-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* ⚠️ FIX Z-INDEX: position relative y zIndex 9999 forzado en el contenedor padre para romper el stacking context de la animación */}
      <div className="d-flex justify-content-end mb-4 gap-3 align-items-center animate-up" style={{ position: 'relative', zIndex: 9999 }}>
        <Button
          variant={isDarkMode ? 'outline-light' : 'outline-dark'}
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '45px', height: '45px', border: '2px solid' }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Alternar modo oscuro"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </Button>

        {/* MENÚ DESPLEGABLE DE NOTIFICACIONES */}
        <Dropdown align="end">
          <Dropdown.Toggle variant="link" className="p-0 text-decoration-none shadow-none text-dark" id="dropdown-notificaciones" bsPrefix="p-0">
            <div className="position-relative" style={{ cursor: 'pointer', fontSize: '1.8rem' }}>
              🔔
              {avisosRecientes.length > 0 && (
                <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill border border-2 border-white" style={{ fontSize: '0.65rem' }}>
                  {avisosRecientes.length}
                </Badge>
              )}
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-0" style={{ width: '320px', backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }}>
            <div className={`p-3 border-bottom d-flex justify-content-between align-items-center ${isDarkMode ? 'border-secondary' : ''}`}>
              <h6 className={`mb-0 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Notificaciones</h6>
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {avisosRecientes.length === 0 ? (
                <div className="p-4 text-center text-muted small">No hay notificaciones recientes.</div>
              ) : (
                avisosRecientes.map(aviso => (
                  <Dropdown.Item 
                    key={aviso.id} 
                    className={`text-wrap p-3 border-bottom d-flex gap-3 align-items-start ${isDarkMode ? 'text-light border-secondary hover-dark' : 'hover-light'}`}
                    onClick={() => handleAbrirAviso(aviso)}
                  >
                    <span className="fs-5">{getEstiloAvisoDinámico(aviso.categoria).icon}</span>
                    <div>
                      <strong className="d-block text-truncate" style={{ maxWidth: '220px', fontSize: '0.9rem' }}>{aviso.titulo}</strong>
                      <span className="small text-muted d-block">{aviso.categoria}</span>
                    </div>
                  </Dropdown.Item>
                ))
              )}
            </div>
            <div className={`p-2 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'} rounded-bottom-4`}>
              <Button variant="link" size="sm" className="text-decoration-none fw-bold" onClick={() => navigate('/panel-estudiante/informacion')}>
                Ver todo el Muro
              </Button>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Row className="g-4 flex-grow-1">
        {/* COLUMNA 1: Perfil y Soporte */}
        <Col lg={3} className="d-flex flex-column gap-4 animate-up delay-1">
          <div className="panel-card profile-section h-100">
            <div className="profile-header">
              <div className="mb-3 mx-auto bg-white rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm" style={{ width: '80px', height: '80px' }}>
                <img src="/assets/LOGO_CSJ.png" alt="CSJ" className="img-fluid rounded-circle" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '⚖️️'; }} />
              </div>
              <h4 className="mb-1">CSJ</h4>
              <p className="text-muted small mb-4 fw-bold">Clínica Socio Jurídica</p>
              
              <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>{perfil.nombre}</h5>
                <p className="mb-0 text-muted">{perfil.carrera}</p>
                <Badge bg="success" className="mt-3 px-3 py-2 rounded-pill">ESTUDIANTE</Badge>
              </div>
              <Button variant={isDarkMode ? "outline-light" : "outline-danger"} className="w-100 mt-2 rounded-pill fw-bold py-2" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </Col>

        {/* COLUMNA 2: Centro de Operaciones */}
        <Col lg={6} className="d-flex flex-column gap-4 animate-up delay-2">
          <div className="panel-card">
            <h5 className="fw-bold mb-4" style={{ color: 'var(--color-principal, #006A38)' }}>Accesos Rápidos</h5>
            <Row className="g-3">
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/fichas')}><span className="fs-4">📂</span> Mis Fichas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/citas')}><span className="fs-4">📅</span> Mis Citas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/charlas')}><span className="fs-4">📢</span> Charlas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/informacion')}><span className="fs-4">📰</span> Información</button></Col>
              <Col sm={12}>
                <button 
                  className="action-btn w-100 justify-content-center" 
                  style={{ backgroundColor: isDarkMode ? 'rgba(25, 135, 84, 0.2)' : 'rgba(25, 135, 84, 0.1)', color: '#198754', border: '1px solid rgba(25, 135, 84, 0.3)' }}
                  onClick={() => window.open('https://aulavirtual.santotomas.cl/', '_blank')}
                >
                  <span className="fs-4">🎓</span> Aula Virtual Santo Tomás
                </button>
              </Col>
            </Row>
          </div>

          <div className="panel-card mt-auto">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal, #006A38)' }}>Resumen del Día</h5>
            <Row className="align-items-start">
              <Col md={7}>
                <div className="mb-3">
                  <Calendar 
                    onChange={setFechaSeleccionada} 
                    value={fechaSeleccionada} 
                    className="w-100 rounded-4 shadow-sm border-0"
                  />
                </div>
                <div className="p-3 rounded-4" style={{ backgroundColor: isDarkMode ? 'rgba(120, 190, 32, 0.1)' : 'rgba(120, 190, 32, 0.05)', border: '1px solid var(--color-secundario, #78BE20)' }}>
                  <h6 className="fw-bold mb-1 fs-6">{fechaSeleccionada.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--color-secundario, #78BE20)' }}>
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
            
            {/* WIDGET: MURO DE AVISOS PERMANENTE */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal, #006A38)' }}>Muro de Avisos</h5>
              <Button variant="link" className="p-0 text-decoration-none small fw-bold" onClick={() => navigate('/panel-estudiante/informacion')}>Ver Todos</Button>
            </div>
            
            <div className="mb-4">
              {avisosRecientes.length === 0 ? (
                <p className="text-muted small">No hay avisos recientes de coordinación.</p>
              ) : (
                avisosRecientes.map((aviso) => {
                  const estilos = getEstiloAvisoDinámico(aviso.categoria);
                  return (
                    <div 
                      key={aviso.id} 
                      className="shadow-sm mb-3 overflow-hidden" 
                      style={{ 
                        borderRadius: '12px', 
                        borderLeft: estilos.borderLeft, 
                        background: estilos.background,
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onClick={() => handleAbrirAviso(aviso)}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div className={`px-3 py-1 fw-bold text-${estilos.headerText} d-flex align-items-center gap-2 text-uppercase`} style={{ backgroundColor: estilos.headerBg, fontSize: '0.8rem' }}>
                        <span>{estilos.icon}</span> {aviso.categoria}
                      </div>
                      <div className="p-3">
                        <h6 className="fw-bolder mb-1" style={{ fontSize: '0.95rem', color: isDarkMode ? '#f8fafc' : '#212529' }}>
                          {aviso.titulo}
                        </h6>
                        <p className="small mb-2 mt-2 text-truncate" style={{ color: isDarkMode ? '#94a3b8' : '#6c757d' }}>
                          {aviso.descripcion_corta}
                        </p>
                        <div className="text-end">
                          <span className="small fw-bold" style={{ color: estilos.headerBg === '#ffc107' || estilos.headerBg === '#0dcaf0' ? (isDarkMode ? '#ffc107' : '#000') : estilos.headerBg }}>
                            Abrir completo &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <h5 className="fw-bold mb-3 mt-auto" style={{ color: 'var(--color-principal, #006A38)' }}>Usuarios del Sistema</h5>
            <div className="participantes-list flex-grow-1 overflow-auto" style={{ maxHeight: '200px' }}>
              {participantes.length === 0 ? (
                <p className="text-muted small text-center mt-4">No hay otros usuarios registrados aún.</p>
              ) : (
                participantes.map(p => (
                  <div key={p.id} className="participante-item d-flex flex-column align-items-start gap-1 p-2 border-bottom" style={{ borderColor: isDarkMode ? '#333' : '#eee' }}>
                    <div className="w-100 d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-truncate" style={{ fontSize: '0.90rem', color: isDarkMode ? '#e2e8f0' : '#333', maxWidth: '130px' }}>
                        {p.nombre}
                      </span>
                      <Badge bg={getRoleBadgeColor(p.rol)} className="px-2 py-1 rounded-pill text-capitalize" style={{ fontSize: '0.65rem' }}>
                        {p.rol || 'Estudiante'}
                      </Badge>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.70rem' }}>
                      {p.estado === 'Activo' ? '🟢 En línea / Activo' : `Últ. vez: ${formatearFecha(p.created_at)}`}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="logo-container mt-auto pt-4 text-center">
              <img src="/assets/LOGO_CSJ.png" alt="Logo Institucional" style={{ maxWidth: '80px', opacity: '0.3' }} onError={(e) => e.target.style.display = 'none'} />
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal Aviso Completo */}
      <Modal show={showAvisoModal} onHide={() => setShowAvisoModal(false)} centered size="lg">
        {avisoSeleccionado && (() => {
          const estilos = getEstiloAvisoDinámico(avisoSeleccionado.categoria);
          return (
            <>
              <Modal.Header closeButton style={{ backgroundColor: estilos.headerBg, color: estilos.headerText === 'dark' ? '#000' : '#fff' }}>
                <Modal.Title className="fw-bold fs-5 text-uppercase">
                  {estilos.icon} Aviso {avisoSeleccionado.categoria}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-4" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                <h4 className="fw-bolder mb-3">{avisoSeleccionado.titulo}</h4>
                <div className="text-muted small fw-bold mb-3">
                  Publicado el {new Date(avisoSeleccionado.fecha_publicacion || avisoSeleccionado.created_at).toLocaleDateString('es-CL')}
                </div>
                <p className="fw-semibold mb-4" style={{ fontSize: '1.05rem' }}>
                  {avisoSeleccionado.descripcion_corta}
                </p>
                {avisoSeleccionado.contenido_completo && (
                  <>
                    <hr className={isDarkMode ? 'border-secondary' : ''} />
                    <p className="mt-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {avisoSeleccionado.contenido_completo}
                    </p>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', borderTop: isDarkMode ? '1px solid #333' : '1px solid #dee2e6' }}>
                <Button variant={isDarkMode ? "outline-light" : "outline-secondary"} onClick={() => setShowAvisoModal(false)}>
                  Cerrar
                </Button>
              </Modal.Footer>
            </>
          );
        })()}
      </Modal>
    </div>
  );
};

export default PanelEstudiante;