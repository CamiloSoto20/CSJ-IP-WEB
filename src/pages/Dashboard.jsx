import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [stats, setStats] = useState({ fichas: 0, citasHoy: 0, charlas: 0, estudiantes: 0 });
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Obtener nombre de la coordinadora para el saludo
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('nombre')
            .eq('id', authData.user.id)
            .single();

          if (perfil) {
            // Extraer solo el primer nombre para un saludo más cercano
            const primerNombre = perfil.nombre.split(' ')[0];
            setNombre(primerNombre);
          }
        }

        // 2. Obtener métricas reales desde Supabase
        const hoy = new Date().toISOString().split('T')[0];

        const [fichasRes, citasRes, charlasRes, estudiantesRes] = await Promise.all([
          supabase.from('social_records').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('fecha_cita, fecha'), // Traemos fechas para ver cuáles son hoy
          supabase.from('talks').select('*', { count: 'exact', head: true }),
          supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante')
        ]);

        // Contar cuántas citas corresponden al día de hoy (revisando posibles nombres de columna)
        const citasDeHoy = (citasRes.data || []).filter(c => c.fecha_cita === hoy || c.fecha === hoy).length;

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

    fetchDashboardData();
  }, []);

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

            {/* HERRAMIENTAS EXTERNAS */}
            <div>
              <h5 className="fw-bold mb-3" style={{ color: '#404040' }}>Herramientas Externas</h5>
              <Row className="g-3">
                <Col sm={4}>
                  <Button
                    className="w-100 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center p-4 hover-lift"
                    style={{ backgroundColor: '#0078D4', borderRadius: '12px' }}
                    onClick={() => window.open('https://outlook.office.com/mail/', '_blank')}
                  >
                    <span className="fs-1 mb-2">📧</span>
                    <span className="fw-bold">Outlook</span>
                  </Button>
                </Col>
                <Col sm={4}>
                  <Button
                    className="w-100 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center p-4 hover-lift"
                    style={{ backgroundColor: '#EA4335', borderRadius: '12px' }}
                    onClick={() => window.open('https://mail.google.com/', '_blank')}
                  >
                    <span className="fs-1 mb-2">✉️</span>
                    <span className="fw-bold">Gmail</span>
                  </Button>
                </Col>
                <Col sm={4}>
                  <Button
                    className="w-100 border-0 shadow-sm d-flex flex-column align-items-center justify-content-center p-4 hover-lift"
                    style={{ backgroundColor: '#0F9D58', borderRadius: '12px' }}
                    onClick={() => window.open('https://drive.google.com/', '_blank')}
                  >
                    <span className="fs-1 mb-2">📁</span>
                    <span className="fw-bold">Drive</span>
                  </Button>
                </Col>
              </Row>
            </div>

            {/* ACCESOS DE GESTIÓN */}
            <div>
              <h5 className="fw-bold mb-3" style={{ color: '#404040' }}>Accesos Rápidos de Gestión</h5>
              <Row className="g-3 h-100">
                <Col sm={6}>
                  <Card className="border-0 shadow-sm h-100 rounded-3 hover-card">
                    <Card.Body className="p-4 d-flex flex-column">
                      <h5 className="fw-bold" style={{ color: 'var(--color-principal)' }}>Ficha Atención Social</h5>
                      <p className="text-muted small mb-4 flex-grow-1">
                        Crear nueva ficha de atención, seguimiento y cierre para área social.
                      </p>
                      <Button
                        className="w-100 fw-bold"
                        style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
                        onClick={() => navigate('/dashboard/fichas')}
                      >
                        Ingresar Nueva Ficha
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="border-0 shadow-sm h-100 rounded-3 hover-card">
                    <Card.Body className="p-4 d-flex flex-column">
                      <h5 className="fw-bold" style={{ color: 'var(--color-principal)' }}>Fichas Jurídicas</h5>
                      <p className="text-muted small mb-4 flex-grow-1">
                        Gestión y seguimiento de atenciones del área jurídica.
                      </p>
                      <Button
                        className="w-100 fw-bold"
                        variant="outline-secondary"
                        onClick={() => alert('Módulo Jurídico en desarrollo')}
                      >
                        Ver Casos Jurídicos
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>

          {/* CALENDARIO */}
          <Col lg={5}>
            <h5 className="fw-bold mb-3" style={{ color: '#404040' }}>Calendario</h5>
            <Card className="border-0 shadow-sm p-4 h-100 rounded-3 d-flex flex-column align-items-center justify-content-center">
              <Calendar
                onChange={setFecha}
                value={fecha}
                className="border-0 w-100 rounded-4 shadow-none"
              />
            </Card>
          </Col>
        </Row>
      </Container>

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
          
          /* Ajustes limpios para el calendario */
          .react-calendar { border: none !important; font-family: inherit !important; width: 100% !important; background: transparent; }
          .react-calendar__tile--active { background: var(--color-principal, #006A38) !important; border-radius: 8px; }
          .react-calendar__tile--now { background: rgba(0, 106, 56, 0.1) !important; border-radius: 8px; color: var(--color-principal); font-weight: bold; }
          .react-calendar__navigation button { font-weight: bold; font-size: 1.1rem; }
        `}
      </style>
    </div>
  );
};

export default Dashboard;