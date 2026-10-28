import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const FichasEstudiante = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showTiposFicha, setShowTiposFicha] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMisFichas();
  }, []);

  const fetchMisFichas = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      const userId = authData.user.id;

      // Consulta modificada para traer información de co_estudiante en 'social_records'
      const [socialesRes, juridicasRes, recopilacionRes, visitasRes, intervencionRes] = await Promise.all([
        supabase.from('social_records').select('id, fecha_creacion, fecha_cierre, participants(rut, nombre, apellido), co_estudiante:perfiles!co_estudiante_id(nombre)').eq('professional_id', userId),
        supabase.from('legal_records').select('id, created_at, fecha_cierre, participants(rut, nombre, apellido)').eq('professional_id', userId),
        supabase.from('recopilacion_records').select('id, created_at, participants(rut, nombre, apellido)').eq('professional_id', userId),
        supabase.from('visitas_records').select('id, created_at, participants(rut, nombre, apellido)').eq('professional_id', userId),
        supabase.from('intervencion_records').select('id, created_at, participants(rut, nombre, apellido)').eq('professional_id', userId)
      ]);

      const formatearData = (data, area, tipoEspecifico, campoFecha) => {
        return (data || []).map(item => ({
          ...item,
          area,
          tipoEspecifico,
          fecha_registro: item[campoFecha], 
          timestamp: new Date(item[campoFecha] || 0).getTime()
        }));
      };

      const combinadas = [
        ...formatearData(socialesRes.data, 'Social', 'Atención Social', 'fecha_creacion'),
        ...formatearData(juridicasRes.data, 'Jurídica', 'Caso Jurídico', 'created_at'),
        ...formatearData(recopilacionRes.data, 'Social', 'Recopilación Info.', 'created_at'),
        ...formatearData(visitasRes.data, 'Social', 'Visita Domiciliaria', 'created_at'),
        ...formatearData(intervencionRes.data, 'Social', 'Intervención', 'created_at')
      ].sort((a, b) => b.timestamp - a.timestamp);

      setFichas(combinadas);
    } catch (error) {
      console.error('Error al obtener mis fichas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleVerDetalles = (ficha) => {
    setFichaSeleccionada(ficha);
    setShowDetalles(true);
  };

  const renderEstado = (ficha) => {
    if (ficha.tipoEspecifico === 'Recopilación Info.' || ficha.tipoEspecifico === 'Visita Domiciliaria') return <Badge bg="success" className="px-3 py-2">Registrada</Badge>; 
    if (ficha.fecha_cierre) return <Badge bg="secondary" className="px-3 py-2">Cerrado</Badge>;
    return <Badge bg="primary" className="px-3 py-2">Activo</Badge>;
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="mb-4">
        <Button variant="link" className="text-decoration-none fw-bold px-0 mb-3" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/panel-estudiante')}>
          &larr; Volver al Panel Principal
        </Button>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Mis Fichas</h3>
            <p className="text-muted mb-0">Gestión de tus atenciones y casos asignados</p>
          </div>
          <div className="d-flex gap-2">
            <Button style={{ backgroundColor: '#0dcaf0', border: 'none', color: '#000' }} className="fw-bold shadow-sm" onClick={() => navigate('/panel-estudiante/fichas/nueva-juridica')}>
              + Ficha Jurídica
            </Button>
            <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} className="fw-bold shadow-sm" onClick={() => setShowTiposFicha(true)}>
              + Ficha Social
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2 mb-0">Cargando tus registros...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA</th>
                  <th className="text-muted border-0 py-3">USUARIO</th>
                  <th className="text-muted border-0 py-3">ÁREA Y TIPO</th>
                  <th className="text-muted border-0 py-3">ESTADO</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {fichas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">Aún no has creado ninguna ficha.</td>
                  </tr>
                ) : (
                  fichas.map((ficha) => (
                    <tr key={ficha.id}>
                      <td className="px-4 fw-medium text-secondary">{formatearFecha(ficha.fecha_registro)}</td>
                      <td>
                        <span className="fw-bold d-block text-dark">{ficha.participants?.nombre} {ficha.participants?.apellido}</span>
                        <span className="text-muted small">{ficha.participants?.rut || 'Sin RUT'}</span>
                        
                        {/* MUESTRA SI HUBO ALGUIEN MÁS ATENDIENDO CON EL ESTUDIANTE */}
                        {ficha.co_estudiante && (
                           <div className="small fw-bold mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                             👥 Atendido con: {ficha.co_estudiante.nombre}
                           </div>
                        )}
                      </td>
                      <td>
                        <Badge bg={ficha.area === 'Social' ? 'info' : 'warning'} text="dark" className="text-uppercase mb-1">{ficha.area}</Badge>
                        <span className="d-block small fw-bold text-muted">{ficha.tipoEspecifico}</span>
                      </td>
                      <td>{renderEstado(ficha)}</td>
                      <td className="px-4 text-end">
                        <Button variant="outline-primary" size="sm" className="fw-bold" onClick={() => handleVerDetalles(ficha)}>Ver Detalles &rarr;</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showTiposFicha} onHide={() => setShowTiposFicha(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5" style={{ color: 'var(--color-principal)' }}>Seleccione el tipo de Ficha Social</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}><Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/panel-estudiante/fichas/nueva-social')} style={{ borderWidth: '2px' }}><div className="d-flex align-items-center gap-2"><span className="fs-3">📝</span><span className="fs-5 text-dark">Atención Social</span></div><span className="small text-muted fw-normal">Registro principal de ingreso y seguimiento.</span></Button></Col>
            <Col md={6}><Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/panel-estudiante/fichas/visita')} style={{ borderWidth: '2px' }}><div className="d-flex align-items-center gap-2"><span className="fs-3">🏠</span><span className="fs-5 text-dark">Visita Domiciliaria</span></div><span className="small text-muted fw-normal">Reporte de terreno y evaluación in situ.</span></Button></Col>
            <Col md={6}><Button variant="outline-primary" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/panel-estudiante/fichas/recopilacion')} style={{ borderWidth: '2px' }}><div className="d-flex align-items-center gap-2"><span className="fs-3">📂</span><span className="fs-5 text-dark">Recopilación Info.</span></div><span className="small text-muted fw-normal">Instrumento de recolección de datos socioeconómicos.</span></Button></Col>
            <Col md={6}><Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/panel-estudiante/fichas/intervencion')} style={{ borderWidth: '2px' }}><div className="d-flex align-items-center gap-2"><span className="fs-3">🤝</span><span className="fs-5 text-dark">Intervención</span></div><span className="small text-muted fw-normal">Documento de intervención y tratamiento social.</span></Button></Col>
          </Row>
        </Modal.Body>
      </Modal>

      <Modal show={showDetalles} onHide={() => setShowDetalles(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold fs-5 text-uppercase text-primary">📄 Resumen: {fichaSeleccionada?.tipoEspecifico}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <h6 className="text-muted fw-bold small text-uppercase mb-2">👤 Datos del Usuario</h6>
          <h4 className="fw-bolder mb-1">{fichaSeleccionada?.participants?.nombre} {fichaSeleccionada?.participants?.apellido}</h4>
          <p className="text-secondary fw-bold mb-2">RUT: {fichaSeleccionada?.participants?.rut || 'Sin registrar'}</p>
          
          {/* Muestra Co-estudiante en el Modal */}
          {fichaSeleccionada?.co_estudiante && (
             <div className="mb-4">
               <span className="d-block small text-muted fw-bold mb-1">👥 Atendido con:</span>
               <Badge bg="secondary" className="fw-bold">{fichaSeleccionada.co_estudiante.nombre}</Badge>
             </div>
          )}

          <Row className={fichaSeleccionada?.co_estudiante ? '' : 'mt-4'}>
            <Col xs={6}><h6 className="text-muted fw-bold small text-uppercase mb-1">Fecha de Creación</h6><p className="fw-medium fs-5">{formatearFecha(fichaSeleccionada?.fecha_registro)}</p></Col>
            <Col xs={6}><h6 className="text-muted fw-bold small text-uppercase mb-2">Estado</h6>{fichaSeleccionada && renderEstado(fichaSeleccionada)}</Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light d-flex justify-content-between">
          <Button variant="outline-secondary" className="fw-bold" onClick={() => setShowDetalles(false)}>Cerrar</Button>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" className="fw-bold px-4 shadow-sm bg-white" onClick={() => {
                let rutaTipo = '';
                if (fichaSeleccionada?.tipoEspecifico === 'Atención Social') rutaTipo = 'social';
                else if (fichaSeleccionada?.tipoEspecifico === 'Visita Domiciliaria') rutaTipo = 'visita';
                else if (fichaSeleccionada?.tipoEspecifico === 'Recopilación Info.') rutaTipo = 'recopilacion';
                else if (fichaSeleccionada?.tipoEspecifico === 'Intervención') rutaTipo = 'intervencion';
                else rutaTipo = 'juridica';
                navigate(`/panel-estudiante/fichas/editar/${rutaTipo}/${fichaSeleccionada.id}`);
              }}>✏️ Editar Ficha</Button>
            <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} className="fw-bold shadow-sm" onClick={() => {
                let rutaTipo = '';
                if (fichaSeleccionada?.tipoEspecifico === 'Atención Social') rutaTipo = 'social';
                else if (fichaSeleccionada?.tipoEspecifico === 'Visita Domiciliaria') rutaTipo = 'visita';
                else if (fichaSeleccionada?.tipoEspecifico === 'Recopilación Info.') rutaTipo = 'recopilacion';
                else if (fichaSeleccionada?.tipoEspecifico === 'Intervención') rutaTipo = 'intervencion';
                else rutaTipo = 'juridica';
                navigate(`/panel-estudiante/fichas/ver/${rutaTipo}/${fichaSeleccionada.id}`);
            }}>Abrir Ficha Completa</Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FichasEstudiante;