import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Modal, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [perfilId, setPerfilId] = useState(null);
  const [stats, setStats] = useState({ fichas: 0, citasHoy: 0, charlas: 0, estudiantes: 0 });
  const [loading, setLoading] = useState(true);

  // Estados para el Calendario (Agenda Personal + Citas)
  const [fecha, setFecha] = useState(new Date());
  const [misCitas, setMisCitas] = useState([]);
  const [miAgenda, setMiAgenda] = useState([]);

  // Estados del Modal
  const [showRecordatorioModal, setShowRecordatorioModal] = useState(false);
  const [citasDelDiaSeleccionado, setCitasDelDiaSeleccionado] = useState([]);
  const [agendaDelDiaSeleccionado, setAgendaDelDiaSeleccionado] = useState([]);

  // Estados Formulario Nueva Actividad
  const [showFormAgenda, setShowFormAgenda] = useState(false);
  const [savingAgenda, setSavingAgenda] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({ titulo: '', descripcion: '', hora: '' });

  const fetchDashboardData = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const userId = authData.user.id;
      setPerfilId(userId);

      // 1. Obtener nombre
      const { data: perfil } = await supabase.from('perfiles').select('nombre').eq('id', userId).single();
      if (perfil) setNombre(perfil.nombre.split(' ')[0]);

      // 2. Obtener Citas asignadas a la coordinadora
      const { data: misCitasRes } = await supabase
        .from('appointments')
        .select('id, fecha_cita, hora_cita, estado, nombre, rut')
        .eq('estudiante_id', userId);
      setMisCitas(misCitasRes || []);

      // 3. Obtener Agenda Personal (Reuniones/Recordatorios)
      const { data: agendaRes } = await supabase
        .from('personal_agenda')
        .select('*')
        .eq('user_id', userId)
        .order('hora', { ascending: true });
      setMiAgenda(agendaRes || []);

      // 4. Obtener métricas globales
      const hoy = new Date().toISOString().split('T')[0];
      const [fichasRes, citasRes, charlasRes, estudiantesRes] = await Promise.all([
        supabase.from('social_records').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('fecha_cita'),
        supabase.from('talks').select('*', { count: 'exact', head: true }),
        supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante')
      ]);

      const citasDeHoy = (citasRes.data || []).filter(c => c.fecha_cita === hoy).length;

      setStats({
        fichas: fichasRes.count || 0,
        citasHoy: citasDeHoy,
        charlas: charlasRes.count || 0,
        estudiantes: estudiantesRes.count || 0
      });

    } catch (error) {
      console.error("Error al cargar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Helpers de Fecha y Calendario ---
  const fechaFormateada = fecha.toISOString().split('T')[0];
  const citasHoyText = misCitas.filter(cita => cita.fecha_cita === fechaFormateada);
  const agendaHoyText = miAgenda.filter(item => item.fecha === fechaFormateada);

  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const getEventosDelDia = (date) => {
    const dateStr = getLocalDateString(date);
    return {
      citas: misCitas.filter(cita => cita.fecha_cita === dateStr),
      agenda: miAgenda.filter(item => item.fecha === dateStr)
    };
  };

  // Pintar días en el calendario
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const { citas, agenda } = getEventosDelDia(date);
      if (citas.length > 0 && agenda.length > 0) return 'has-both';
      if (citas.length > 0) return 'has-citas';
      if (agenda.length > 0) return 'has-agenda';
    }
    return null;
  };

  const handleDayClick = (value) => {
    setFecha(value);
    const { citas, agenda } = getEventosDelDia(value);
    setCitasDelDiaSeleccionado(citas);
    setAgendaDelDiaSeleccionado(agenda);
    setShowFormAgenda(false);
    setShowRecordatorioModal(true); // Siempre abrir el modal para poder agregar actividades, incluso si está vacío
  };

  // --- Gestión de Agenda Personal ---
  const handleGuardarActividad = async (e) => {
    e.preventDefault();
    setSavingAgenda(true);
    try {
      const fechaStr = getLocalDateString(fecha);
      const { error } = await supabase.from('personal_agenda').insert([{
        user_id: perfilId,
        fecha: fechaStr,
        hora: nuevaActividad.hora || null,
        titulo: nuevaActividad.titulo,
        descripcion: nuevaActividad.descripcion
      }]);

      if (error) throw error;

      setNuevaActividad({ titulo: '', descripcion: '', hora: '' });
      setShowFormAgenda(false);
      await fetchDashboardData(); // Recargar datos

      // Actualizar estado local del modal sin cerrarlo
      const { agenda } = getEventosDelDia(fecha);
      setAgendaDelDiaSeleccionado([...agenda, { titulo: nuevaActividad.titulo, hora: nuevaActividad.hora, descripcion: nuevaActividad.descripcion }]);

    } catch (error) {
      alert("Error al guardar la actividad: " + error.message);
    } finally {
      setSavingAgenda(false);
    }
  };

  const handleEliminarActividad = async (id) => {
    if (!window.confirm("¿Eliminar este recordatorio?")) return;
    try {
      await supabase.from('personal_agenda').delete().eq('id', id);
      setAgendaDelDiaSeleccionado(agendaDelDiaSeleccionado.filter(item => item.id !== id));
      fetchDashboardData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '1rem 2rem' }}>
      <Container fluid className="px-0">

        {/* ENCABEZADO Y SALUDO */}
        <div className="mb-5 border-bottom pb-3 animate-up">
          <h1 className="fw-bolder mb-2" style={{ color: 'var(--color-principal)', fontSize: '2.5rem', letterSpacing: '-1px' }}>
            Bienvenida Coordinadora, {nombre} 👋
          </h1>
          <p className="text-muted fs-5 mb-0">Visión general y gestión de atenciones de la Clínica Socio-Jurídica</p>
        </div>

        {/* MÉTRICAS CONECTADAS A LA BD */}
        <Row className="g-4 mb-5 animate-up delay-1">
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Fichas Activas</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{stats.fichas}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Citas Hoy</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{stats.citasHoy}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Charlas Activas</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{stats.charlas}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Estudiantes</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{stats.estudiantes}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 animate-up delay-2">
          {/* ACCESOS RÁPIDOS Y HERRAMIENTAS */}
          <Col lg={7} className="d-flex flex-column gap-4">
            <div>
              <h5 className="fw-bold mb-3" style={{ color: '#404040' }}>Herramientas Externas</h5>
              <Row className="g-3">
                <Col sm={4}>
                  <Button className="w-100 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center p-4 hover-lift" style={{ backgroundColor: '#0078D4', borderRadius: '12px' }} onClick={() => window.open('https://outlook.office.com/mail/', '_blank')}>
                    <span className="fs-1 mb-2">📧</span><span className="fw-bold">Outlook</span>
                  </Button>
                </Col>
                <Col sm={4}>
                  <Button className="w-100 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center p-4 hover-lift" style={{ backgroundColor: '#EA4335', borderRadius: '12px' }} onClick={() => window.open('https://mail.google.com/', '_blank')}>
                    <span className="fs-1 mb-2">✉️</span><span className="fw-bold">Gmail</span>
                  </Button>
                </Col>
                <Col sm={4}>
                  <Button className="w-100 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center p-4 hover-lift" style={{ backgroundColor: '#0F9D58', borderRadius: '12px' }} onClick={() => window.open('https://drive.google.com/', '_blank')}>
                    <span className="fs-1 mb-2">📁</span><span className="fw-bold">Drive</span>
                  </Button>
                </Col>
              </Row>
            </div>

            <div>
              <h5 className="fw-bold mb-3" style={{ color: '#404040' }}>Accesos Rápidos de Gestión</h5>
              <Row className="g-3 h-100">
                <Col sm={6}>
                  <Card className="border-0 shadow-sm h-100 rounded-3 hover-card">
                    <Card.Body className="p-4 d-flex flex-column">
                      <h5 className="fw-bold" style={{ color: 'var(--color-principal)' }}>Gestión Fichas Sociales</h5>
                      <p className="text-muted small mb-4 flex-grow-1">Panel unificado de atenciones sociales, visitas y recopilación.</p>
                      <Button className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} onClick={() => navigate('/dashboard/fichas')}>
                        Ir a Fichas Sociales
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="border-0 shadow-sm h-100 rounded-3 hover-card">
                    <Card.Body className="p-4 d-flex flex-column">
                      <h5 className="fw-bold" style={{ color: '#0dcaf0' }}>Gestión Fichas Jurídicas</h5>
                      <p className="text-muted small mb-4 flex-grow-1">Panel de creación y seguimiento de atenciones del área jurídica.</p>
                      <Button className="w-100 fw-bold text-dark" style={{ backgroundColor: '#0dcaf0', border: 'none' }} onClick={() => navigate('/dashboard/fichas/nueva-juridica')}>
                        Ingresar Ficha Jurídica
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>

          {/* CALENDARIO (AGENDA PERSONAL) */}
          <Col lg={5}>
            <h5 className="fw-bold mb-3" style={{ color: '#404040' }}>Mi Agenda y Actividades</h5>
            <Card className="border-0 shadow-sm p-4 h-100 rounded-3 d-flex flex-column align-items-center justify-content-center">
              <Calendar
                onClickDay={handleDayClick}
                onChange={setFecha}
                value={fecha}
                tileClassName={tileClassName}
                className="border-0 w-100 rounded-4 shadow-none calendar-custom"
              />

              <div className="w-100 mt-4 d-flex flex-column gap-2">
                <div className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(120, 190, 32, 0.1)', border: '1px solid var(--color-secundario, #78BE20)' }}>
                  <span className="fw-bold" style={{ color: 'var(--color-secundario, #78BE20)' }}>📅 Citas Asignadas:</span>
                  <Badge bg="success" pill className="fs-6">{citasHoyText.length}</Badge>
                </div>
                <div className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)', border: '1px solid #0dcaf0' }}>
                  <span className="fw-bold text-info" style={{ color: '#0dcaf0' }}>📌 Recordatorios / Agenda:</span>
                  <Badge bg="info" text="dark" pill className="fs-6">{agendaHoyText.length}</Badge>
                </div>
                <Button variant="outline-secondary" size="sm" className="mt-2 fw-bold" onClick={() => handleDayClick(fecha)}>
                  Abrir Agenda de este día
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL DE AGENDA INTERACTIVA */}
      <Modal show={showRecordatorioModal} onHide={() => setShowRecordatorioModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-principal)', color: 'white' }}>
          <Modal.Title className="fw-bold fs-5">
            Agenda del {fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-4">
          <Row className="g-4">

            {/* SECCIÓN 1: CITAS ASIGNADAS (Pacientes) */}
            <Col md={6}>
              <h6 className="fw-bold mb-3 text-success border-bottom pb-2">🩺 Citas Asignadas</h6>
              {citasDelDiaSeleccionado.length === 0 ? (
                <p className="text-muted small">No hay citas de usuarios para este día.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {citasDelDiaSeleccionado.map((cita) => (
                    <div key={cita.id} className="p-3 rounded-3 border shadow-sm bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-success">⏰ {cita.hora_cita?.substring(0, 5)} hrs</span>
                        <Badge bg="warning" text="dark">{cita.estado}</Badge>
                      </div>
                      <h6 className="fw-bold mb-0">{cita.nombre}</h6>
                      <p className="small text-muted mb-0">RUT: {cita.rut}</p>
                    </div>
                  ))}
                </div>
              )}
            </Col>

            {/* SECCIÓN 2: RECORDATORIOS Y AGENDA PERSONAL */}
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 className="fw-bold mb-0 text-info">📌 Mis Actividades</h6>
                <Button variant="link" size="sm" className="p-0 text-decoration-none fw-bold text-info" onClick={() => setShowFormAgenda(!showFormAgenda)}>
                  {showFormAgenda ? 'Cerrar Formulario' : '+ Añadir'}
                </Button>
              </div>

              {/* Formulario de Nueva Actividad */}
              {showFormAgenda && (
                <Card className="border-info mb-3 shadow-sm bg-white">
                  <Card.Body className="p-3">
                    <Form onSubmit={handleGuardarActividad}>
                      <Form.Group className="mb-2">
                        <Form.Control size="sm" type="text" placeholder="Título (Ej. Reunión equipo)" required value={nuevaActividad.titulo} onChange={(e) => setNuevaActividad({ ...nuevaActividad, titulo: e.target.value })} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control size="sm" type="time" value={nuevaActividad.hora} onChange={(e) => setNuevaActividad({ ...nuevaActividad, hora: e.target.value })} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Control size="sm" as="textarea" rows={2} placeholder="Detalles o notas..." value={nuevaActividad.descripcion} onChange={(e) => setNuevaActividad({ ...nuevaActividad, descripcion: e.target.value })} />
                      </Form.Group>
                      <Button size="sm" type="submit" variant="info" className="w-100 fw-bold text-white" disabled={savingAgenda}>
                        {savingAgenda ? <Spinner size="sm" /> : 'Guardar Actividad'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {/* Lista de Actividades Personales */}
              {agendaDelDiaSeleccionado.length === 0 && !showFormAgenda ? (
                <p className="text-muted small">No hay recordatorios personales para este día.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {agendaDelDiaSeleccionado.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-3 border shadow-sm bg-white position-relative">
                      {item.id && (
                        <button onClick={() => handleEliminarActividad(item.id)} className="btn btn-link text-danger p-0 position-absolute top-0 end-0 mt-2 me-2" title="Eliminar">✖</button>
                      )}
                      {item.hora && <span className="fw-bold text-info d-block mb-1">⏰ {item.hora.substring(0, 5)} hrs</span>}
                      <h6 className="fw-bold mb-1">{item.titulo}</h6>
                      {item.descripcion && <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>{item.descripcion}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" className="fw-bold" onClick={() => setShowRecordatorioModal(false)}>
            Cerrar Agenda
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estilos locales para las animaciones y el calendario */}
      <style>
        {`
          .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; color: white !important; }
          .hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .hover-card:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.05) !important; }
          .animate-up { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .delay-1 { animation-delay: 0.1s; }
          .delay-2 { animation-delay: 0.2s; }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          
          /* Ajustes limpios e interactivos para el calendario */
          .react-calendar { border: none !important; font-family: inherit !important; width: 100% !important; background: transparent; }
          .react-calendar__tile--active { background: var(--color-principal, #006A38) !important; border-radius: 8px; }
          .react-calendar__tile--now { background: rgba(0, 106, 56, 0.1) !important; border-radius: 8px; color: var(--color-principal); font-weight: bold; }
          .react-calendar__navigation button { font-weight: bold; font-size: 1.1rem; }
          
          /* Colores dinámicos de eventos */
          .calendar-custom .has-citas {
            background-color: var(--color-secundario, #78BE20) !important; color: white !important; border-radius: 50% !important; font-weight: bold; transform: scale(0.9); transition: all 0.2s;
          }
          .calendar-custom .has-agenda {
            background-color: #0dcaf0 !important; color: white !important; border-radius: 50% !important; font-weight: bold; transform: scale(0.9); transition: all 0.2s;
          }
          .calendar-custom .has-both {
            background: linear-gradient(135deg, #78BE20 50%, #0dcaf0 50%) !important; color: white !important; border-radius: 50% !important; font-weight: bold; transform: scale(0.9); transition: all 0.2s;
          }
          .calendar-custom .has-citas:hover, .calendar-custom .has-agenda:hover, .calendar-custom .has-both:hover {
            transform: scale(1); opacity: 0.9;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;