import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ListaFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showTiposFicha, setShowTiposFicha] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchFichas();
  }, []);

  const fetchFichas = async () => {
    try {
      // Hacemos las 4 consultas en paralelo
      const [socialesRes, juridicasRes, recopilacionRes, visitasRes] = await Promise.all([
        supabase.from('social_records').select('id, fecha_creacion, fecha_cierre, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('legal_records').select('id, created_at, fecha_cierre, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('recopilacion_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('visitas_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)')
      ]);

      if (socialesRes.error) console.error('Error sociales:', socialesRes.error.message);
      if (juridicasRes.error) console.error('Error jurídicas:', juridicasRes.error.message);
      if (recopilacionRes.error) console.error('Error recopilación:', recopilacionRes.error.message);
      if (visitasRes.error) console.error('Error visitas:', visitasRes.error.message);

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
        ...formatearData(visitasRes.data, 'Social', 'Visita Domiciliaria', 'created_at')
      ].sort((a, b) => b.timestamp - a.timestamp);

      setFichas(combinadas);
    } catch (error) {
      console.error('Error general al obtener fichas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleVerDetalles = (ficha) => {
    setFichaSeleccionada(ficha);
    setShowDetalles(true);
  };

  const renderEstado = (ficha) => {
    if (ficha.tipoEspecifico === 'Recopilación Info.' || ficha.tipoEspecifico === 'Visita Domiciliaria') {
      return <Badge bg="success" className="px-3 py-2">Registrada</Badge>; 
    }
    if (ficha.fecha_cierre) {
      return <Badge bg="secondary" className="px-3 py-2">Cerrado</Badge>;
    }
    return <Badge bg="primary" className="px-3 py-2">Activo</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Gestión de Fichas</h3>
          <p className="text-muted mb-0">Panel unificado de todas las atenciones, visitas y reportes</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            style={{ backgroundColor: '#0dcaf0', border: 'none', color: '#000' }}
            className="fw-bold shadow-sm"
            onClick={() => alert('Módulo de ficha jurídica en construcción')}
          >
            + Ficha Jurídica
          </Button>
          
          <Button 
            style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
            className="fw-bold shadow-sm"
            onClick={() => setShowTiposFicha(true)}
          >
            + Fichas Sociales
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2 mb-0">Cargando registros de todas las áreas...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA</th>
                  <th className="text-muted border-0 py-3">PACIENTE</th>
                  <th className="text-muted border-0 py-3">CREADA POR</th>
                  <th className="text-muted border-0 py-3">ÁREA Y TIPO</th>
                  <th className="text-muted border-0 py-3">ESTADO</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {fichas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No hay fichas registradas en el sistema.
                    </td>
                  </tr>
                ) : (
                  fichas.map((ficha) => (
                    <tr key={ficha.id}>
                      <td className="px-4 fw-medium text-secondary">
                        {formatearFecha(ficha.fecha_registro)}
                      </td>
                      <td>
                        <span className="fw-bold d-block text-dark">
                          {ficha.participants?.nombre} {ficha.participants?.apellido}
                        </span>
                        <span className="text-muted small">{ficha.participants?.rut || 'Sin RUT'}</span>
                      </td>
                      <td>
                        <span className="fw-medium d-block">{ficha.perfiles?.nombre || 'Sistema (Registro Antiguo)'}</span>
                        {ficha.perfiles?.rol && (
                          <Badge bg="light" text="dark" className="border mt-1 text-capitalize" style={{ fontSize: '0.65rem' }}>
                            {ficha.perfiles.rol}
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge 
                          bg={ficha.area === 'Social' ? 'info' : 'warning'} 
                          text="dark" 
                          className="text-uppercase mb-1"
                        >
                          {ficha.area}
                        </Badge>
                        <span className="d-block small fw-bold text-muted">
                          {ficha.tipoEspecifico}
                        </span>
                      </td>
                      <td>
                        {renderEstado(ficha)}
                      </td>
                      <td className="px-4 text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="fw-bold"
                          onClick={() => handleVerDetalles(ficha)}
                        >
                          Ver Detalles &rarr;
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

      {/* MODAL 1: CUADRO DE SELECCIÓN DE TIPO DE FICHA SOCIAL */}
      <Modal show={showTiposFicha} onHide={() => setShowTiposFicha(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5" style={{ color: 'var(--color-principal, #006A38)' }}>
            Seleccione el tipo de Ficha Social a crear
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Button 
                variant="outline-success" 
                className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" 
                onClick={() => navigate('/dashboard/fichas/nueva-social')}
                style={{ borderWidth: '2px' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">📝</span> 
                  <span className="fs-5 text-dark">Atención Social</span>
                </div>
                <span className="small text-muted fw-normal">Registro principal de ingreso y seguimiento de casos sociales.</span>
              </Button>
            </Col>

            <Col md={6}>
              <Button 
                variant="outline-success" 
                className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" 
                onClick={() => navigate('/dashboard/fichas/visita')}
                style={{ borderWidth: '2px' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">🏠</span> 
                  <span className="fs-5 text-dark">Visita Domiciliaria</span>
                </div>
                <span className="small text-muted fw-normal">Reporte de terreno, evaluación in situ y verificación.</span>
              </Button>
            </Col>

            <Col md={6}>
              <Button 
                variant="outline-primary" 
                className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" 
                onClick={() => navigate('/dashboard/fichas/recopilacion')}
                style={{ borderWidth: '2px' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">📂</span> 
                  <span className="fs-5 text-dark">Recopilación Info.</span>
                </div>
                <span className="small text-muted fw-normal">Instrumento de recolección de datos socioeconómicos detallados.</span>
              </Button>
            </Col>

            <Col md={6}>
              <Button 
                variant="outline-secondary" 
                className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2 opacity-75" 
                onClick={() => alert('Módulo en construcción: Pronto podrás registrar Intervenciones.')}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">🤝</span> 
                  <span className="fs-5 text-dark">Intervención</span>
                </div>
                <span className="small text-muted fw-normal">Documento de intervención y tratamiento social.</span>
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* MODAL 2: DETALLES RÁPIDOS DE LA FICHA (DISEÑO MEJORADO) */}
      <Modal show={showDetalles} onHide={() => setShowDetalles(false)} centered size="lg">
        <Modal.Header closeButton className={fichaSeleccionada?.area === 'Social' ? 'bg-info bg-opacity-10' : 'bg-warning bg-opacity-10'}>
          <Modal.Title className="fw-bold fs-5 text-uppercase" style={{ color: 'var(--color-principal)' }}>
            📄 Resumen: {fichaSeleccionada?.tipoEspecifico}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-0">
          {/* SECCIÓN 1: PROTAGONISTAS (Paciente y Creador) */}
          <div className="bg-light p-4 border-bottom">
            <Row className="g-4">
              {/* Bloque Paciente */}
              <Col md={6} className="border-end-md">
                <h6 className="text-muted fw-bold small text-uppercase mb-2">👤 Datos del Paciente</h6>
                <h4 className="fw-bolder mb-1">
                  {fichaSeleccionada?.participants?.nombre} {fichaSeleccionada?.participants?.apellido}
                </h4>
                <p className="text-secondary fw-bold mb-0">RUT: {fichaSeleccionada?.participants?.rut || 'Sin registrar'}</p>
              </Col>
              
              {/* Bloque Creador / Coordinadora */}
              <Col md={6}>
                <h6 className="text-muted fw-bold small text-uppercase mb-2">✍️ Elaborado Por</h6>
                <div className="d-flex align-items-center gap-3 mt-2">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '45px', height: '45px' }}>
                    {fichaSeleccionada?.perfiles?.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="fw-bolder d-block fs-5 text-dark">
                      {fichaSeleccionada?.perfiles?.nombre || 'Sistema (Registro Antiguo)'}
                    </span>
                    <Badge bg="success" className="text-capitalize mt-1 px-2 py-1">
                      {fichaSeleccionada?.perfiles?.rol || 'Rol no especificado'}
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* SECCIÓN 2: DATOS DEL DOCUMENTO */}
          <div className="p-4">
            <Row className="g-4">
              <Col xs={6}>
                <h6 className="text-muted fw-bold small text-uppercase mb-1">Fecha de Creación</h6>
                <p className="fw-medium fs-5 mb-0">{formatearFecha(fichaSeleccionada?.fecha_registro)}</p>
              </Col>

              <Col xs={6}>
                <h6 className="text-muted fw-bold small text-uppercase mb-2">Estado Actual</h6>
                {fichaSeleccionada && renderEstado(fichaSeleccionada)}
              </Col>
            </Row>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" className="fw-bold" onClick={() => setShowDetalles(false)}>
            Cerrar Resumen
          </Button>
          <Button 
            style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
            className="fw-bold px-4 shadow-sm"
            onClick={() => alert(`Navegando a la vista completa de la ficha ID: ${fichaSeleccionada?.id}`)}
          >
            Abrir Ficha Completa
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          @media (min-width: 768px) {
            .border-end-md { border-right: 1px solid #dee2e6; }
          }
        `}
      </style>
    </Container>
  );
};

export default ListaFichas;