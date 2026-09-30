import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ListaFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Detalles
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchFichas();
  }, []);

  const fetchFichas = async () => {
    try {
      // 1. Ejecutamos las consultas de forma INDEPENDIENTE
      const socialesRes = await supabase.from('social_records').select(`
        id,
        fecha_creacion,
        fecha_cierre,
        participants (rut, nombre, apellido),
        perfiles (nombre, rol)
      `);

      const juridicasRes = await supabase.from('legal_records').select(`
        id,
        created_at,
        fecha_cierre,
        participants (rut, nombre, apellido),
        perfiles (nombre, rol)
      `);

      // Mostramos los errores en consola si alguna tabla falla, pero NO detenemos la app
      if (socialesRes.error) console.error('Error en fichas sociales:', socialesRes.error.message);
      if (juridicasRes.error) console.error('Error en fichas jurídicas:', juridicasRes.error.message);

      // 2. Formateamos los datos asegurándonos de que si una tabla viene nula, use un arreglo vacío
      const formatearData = (data, tipo, campoFecha) => {
        return (data || []).map(item => ({
          ...item,
          tipo,
          fecha_registro: item[campoFecha], 
          timestamp: new Date(item[campoFecha] || 0).getTime()
        }));
      };

      // 3. Combinamos solo la data que sí logró llegar exitosamente
      const combinadas = [
        ...formatearData(socialesRes.data, 'Social', 'fecha_creacion'),
        ...formatearData(juridicasRes.data, 'Jurídica', 'created_at')
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

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Gestión de Fichas</h3>
          <p className="text-muted mb-0">Panel unificado de fichas Sociales y Jurídicas</p>
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
            onClick={() => navigate('/dashboard/fichas/nueva-social')}
          >
            + Ficha Social
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2 mb-0">Cargando registros...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA</th>
                  <th className="text-muted border-0 py-3">PACIENTE</th>
                  <th className="text-muted border-0 py-3">CREADA POR</th>
                  <th className="text-muted border-0 py-3">TIPO</th>
                  <th className="text-muted border-0 py-3">ESTADO</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {fichas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No hay fichas registradas.
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
                        <span className="fw-medium d-block">{ficha.perfiles?.nombre || 'Sistema'}</span>
                        {ficha.perfiles?.rol && (
                          <Badge bg="secondary" className="bg-opacity-25 text-dark border" style={{ fontSize: '0.65rem' }}>
                            {ficha.perfiles.rol}
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge 
                          bg={ficha.tipo === 'Social' ? 'info' : 'warning'} 
                          text="dark" 
                          className="px-2 py-1 text-uppercase"
                        >
                          {ficha.tipo}
                        </Badge>
                      </td>
                      <td>
                        {ficha.fecha_cierre ? (
                          <Badge bg="secondary">Cerrado</Badge>
                        ) : (
                          <Badge bg="success">Activo</Badge>
                        )}
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

      {/* MODAL DE DETALLES RÁPIDOS */}
      <Modal show={showDetalles} onHide={() => setShowDetalles(false)} centered>
        <Modal.Header closeButton className={fichaSeleccionada?.tipo === 'Social' ? 'bg-info bg-opacity-25' : 'bg-warning bg-opacity-25'}>
          <Modal.Title className="fw-bold fs-5">
            Ficha {fichaSeleccionada?.tipo} - Resumen
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col xs={12}>
              <h6 className="text-muted fw-bold small text-uppercase mb-1">Paciente Atendido</h6>
              <p className="fs-5 fw-bold mb-0">
                {fichaSeleccionada?.participants?.nombre} {fichaSeleccionada?.participants?.apellido}
              </p>
              <p className="text-muted">{fichaSeleccionada?.participants?.rut}</p>
            </Col>
            
            <Col xs={6}>
              <h6 className="text-muted fw-bold small text-uppercase mb-1">Fecha de Creación</h6>
              <p className="fw-medium">{formatearFecha(fichaSeleccionada?.fecha_registro)}</p>
            </Col>

            <Col xs={6}>
              <h6 className="text-muted fw-bold small text-uppercase mb-1">Estado del Caso</h6>
              <Badge bg={fichaSeleccionada?.fecha_cierre ? 'secondary' : 'success'} className="px-3 py-2 fs-6">
                {fichaSeleccionada?.fecha_cierre ? `Cerrado (${formatearFecha(fichaSeleccionada.fecha_cierre)})` : 'Caso Activo'}
              </Badge>
            </Col>

            <Col xs={12}>
              <Card className="bg-light border-0 p-3 mt-2">
                <h6 className="text-muted fw-bold small text-uppercase mb-2">Profesional a Cargo (Creador)</h6>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                    {fichaSeleccionada?.perfiles?.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="fw-bold d-block">{fichaSeleccionada?.perfiles?.nombre || 'Usuario no asignado'}</span>
                    <span className="text-muted small text-capitalize">{fichaSeleccionada?.perfiles?.rol || 'Sin rol'}</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowDetalles(false)}>
            Cerrar
          </Button>
          <Button 
            style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
            onClick={() => alert(`Navegando a la vista completa de la ficha ID: ${fichaSeleccionada?.id}`)}
          >
            Abrir Ficha Completa
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default ListaFichas;