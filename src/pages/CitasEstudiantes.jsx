import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Button, Container, Card, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CitasEstudiante = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);

  const fetchMisCitas = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      const userId = authData.user.id;

      // Filtra las citas en las que este estudiante ha sido asignado
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('estudiante_id', userId)
        .order('fecha_cita', { ascending: true })
        .order('hora_cita', { ascending: true });

      if (error) throw error;
      setCitas(data || []);
    } catch (error) {
      console.error("Error al cargar las citas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisCitas();

    // Actualización en vivo si la coordinadora le asigna una nueva
    const { data: authData } = supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const channel = supabase.channel('citas-estudiante')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `estudiante_id=eq.${data.user.id}` }, () => {
            fetchMisCitas();
          }).subscribe();
        return () => supabase.removeChannel(channel);
      }
    });
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Confirmada': return 'primary';
      case 'Completada': case 'Atendida': return 'success';
      case 'Cancelada': return 'danger';
      case 'Pendiente': return 'warning';
      default: return 'secondary';
    }
  };

  const formatearFecha = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleVerPaciente = (cita) => {
    setCitaSeleccionada(cita);
    setShowDetalles(true);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '2rem' }}>
      <Container fluid className="px-0">
        
        {/* NAVEGACIÓN Y TÍTULO LIMPIO */}
        <div className="mb-4">
          <Button 
            variant="link" 
            className="text-muted text-decoration-none px-0 mb-2 p-0" 
            style={{ fontSize: '0.9rem' }}
            onClick={() => navigate('/panel-estudiante')}
          >
            &larr; Volver al Panel Principal
          </Button>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bolder mb-0" style={{ color: 'var(--color-principal, #006A38)' }}>
              Mis Citas Asignadas
            </h2>
          </div>
        </div>

        {/* TABLA MINIMALISTA */}
        <Card className="border shadow-sm rounded-3">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              </div>
            ) : (
              <Table responsive className="align-middle mb-0 border-white">
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f3f5' }}>
                    <th className="text-dark border-0 py-3 px-4" style={{ fontSize: '0.8rem', fontWeight: '800' }}>FECHA Y HORA</th>
                    <th className="text-dark border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '800' }}>PACIENTE DERIVADO</th>
                    <th className="text-dark border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '800' }}>ESTADO</th>
                    <th className="text-dark border-0 py-3 px-4 text-end" style={{ fontSize: '0.8rem', fontWeight: '800' }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted" style={{ fontSize: '0.95rem' }}>
                        No tienes citas agendadas actualmente. La coordinadora te asignará pacientes aquí.
                      </td>
                    </tr>
                  ) : (
                    citas.map((cita) => (
                      <tr key={cita.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td className="px-4 text-muted small">
                          <span className="fw-bold d-block text-dark">{formatearFecha(cita.fecha_cita)}</span>
                          ⏰ {cita.hora_cita?.substring(0, 5)} hrs
                        </td>
                        <td>
                          <span className="fw-bold d-block text-dark">{cita.nombre}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>RUT: {cita.rut}</span>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(cita.estado)} text={cita.estado === 'Pendiente' ? 'dark' : 'light'} className="px-2 py-1">
                            {cita.estado}
                          </Badge>
                        </td>
                        <td className="px-4 text-end">
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="fw-bold"
                            onClick={() => handleVerPaciente(cita)}
                          >
                            Abrir Paciente &rarr;
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal Resumen de Cita */}
        <Modal show={showDetalles} onHide={() => setShowDetalles(false)} centered>
          <Modal.Header closeButton className="border-0 bg-light">
            <Modal.Title className="fw-bolder fs-5 text-dark">Detalle de la Derivación</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 pt-4">
            <h5 className="fw-bold text-dark mb-1">{citaSeleccionada?.nombre}</h5>
            <p className="text-muted mb-4">RUT: {citaSeleccionada?.rut}</p>
            
            <Row className="g-3 mb-4">
              <Col xs={6}>
                <div className="p-3 rounded bg-light border">
                  <span className="d-block small text-muted fw-bold mb-1">Fecha Programada</span>
                  <span className="fw-bold">{formatearFecha(citaSeleccionada?.fecha_cita)}</span>
                </div>
              </Col>
              <Col xs={6}>
                <div className="p-3 rounded bg-light border">
                  <span className="d-block small text-muted fw-bold mb-1">Hora</span>
                  <span className="fw-bold text-primary">{citaSeleccionada?.hora_cita?.substring(0, 5)} hrs</span>
                </div>
              </Col>
            </Row>

            <h6 className="fw-bold small text-muted text-uppercase mb-2">Datos de Contacto:</h6>
            <p className="mb-1"><span className="fw-medium">📞 Teléfono:</span> {citaSeleccionada?.telefono}</p>
            <p className="mb-1"><span className="fw-medium">✉️ Correo:</span> {citaSeleccionada?.correo}</p>

          </Modal.Body>
          <Modal.Footer className="border-0 bg-light rounded-bottom d-flex justify-content-between">
            <Button variant="link" className="text-muted fw-bold text-decoration-none" onClick={() => setShowDetalles(false)}>Cerrar</Button>
            <Button 
              style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} 
              className="fw-bold px-4 text-white"
              onClick={() => {
                setShowDetalles(false);
                navigate('/panel-estudiante/fichas');
              }}
            >
              Iniciar Ficha a este Paciente
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default CitasEstudiante;