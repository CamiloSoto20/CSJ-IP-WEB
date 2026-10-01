import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card, Modal, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const FichaEstudiantes = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showTiposFicha, setShowTiposFicha] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchMisFichas();
  }, [user]);

  const fetchMisFichas = async () => {
    try {
      const userId = user.id;
      const [socialesRes, juridicasRes, recopilacionRes, visitasRes, intervencionRes] = await Promise.all([
        supabase.from('social_records').select('id, fecha_creacion, fecha_cierre, participants(rut, nombre, apellido), perfiles(nombre, rol)').eq('professional_id', userId),
        supabase.from('legal_records').select('id, created_at, fecha_cierre, participants(rut, nombre, apellido), perfiles(nombre, rol)').eq('professional_id', userId),
        supabase.from('recopilacion_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)').eq('professional_id', userId),
        supabase.from('visitas_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)').eq('professional_id', userId),
        supabase.from('intervencion_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)').eq('professional_id', userId)
      ]);

      const formatearData = (data, area, tipoEspecifico, campoFecha) => {
        return (data || []).map(item => ({
          ...item, area, tipoEspecifico,
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
    return new Date(fechaISO).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderEstado = (ficha) => {
    if (ficha.tipoEspecifico === 'Recopilación Info.' || ficha.tipoEspecifico === 'Visita Domiciliaria') {
      return <span className="fw-bold text-success">Registrada</span>;
    }
    if (ficha.fecha_cierre) return <span className="fw-bold text-secondary">Cerrado</span>;
    return <span className="fw-bold text-primary">Activo</span>;
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
            &larr; Volver al Panel
          </Button>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bolder mb-0" style={{ color: 'var(--color-principal, #006A38)' }}>
              Mis Fichas de Intervención
            </h2>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" className="fw-bold" onClick={() => alert('Módulo de ficha jurídica en construcción')}>
                + Ficha Jurídica
              </Button>
              <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} className="fw-bold" onClick={() => setShowTiposFicha(true)}>
                + Nueva Ficha Social
              </Button>
            </div>
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
                    <th className="text-dark border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '800' }}>PARTICIPANTE</th>
                    <th className="text-dark border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '800' }}>TIPO</th>
                    <th className="text-dark border-0 py-3" style={{ fontSize: '0.8rem', fontWeight: '800' }}>ESTADO</th>
                    <th className="text-dark border-0 py-3 px-4 text-end" style={{ fontSize: '0.8rem', fontWeight: '800' }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {fichas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted" style={{ fontSize: '0.95rem' }}>
                        No tienes fichas registradas actualmente.
                      </td>
                    </tr>
                  ) : (
                    fichas.map((ficha) => (
                      <tr key={ficha.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td className="px-4 text-muted small">{formatearFecha(ficha.fecha_registro)}</td>
                        <td>
                          <span className="fw-bold d-block text-dark">{ficha.participants?.nombre} {ficha.participants?.apellido}</span>
                        </td>
                        <td>
                          <span className="d-block fw-bold" style={{ color: '#495057', fontSize: '0.9rem' }}>{ficha.tipoEspecifico}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Área {ficha.area}</span>
                        </td>
                        <td>{renderEstado(ficha)}</td>
                        <td className="px-4 text-end">
                          <Button variant="link" className="text-decoration-none fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => { setFichaSeleccionada(ficha); setShowDetalles(true); }}>
                            Ver Detalles
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

        {/* MODAL 1: SELECCIÓN DE FICHA (Mantiene funcionalidad) */}
        <Modal show={showTiposFicha} onHide={() => setShowTiposFicha(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-5" style={{ color: 'var(--color-principal)' }}>Seleccione el tipo de Ficha Social</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 pt-3">
            <Row className="g-3">
              <Col md={6}>
                <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" style={{ borderWidth: '2px' }} onClick={() => navigate('/panel-estudiante/fichas/nueva-social')}>
                  <div className="d-flex align-items-center gap-2"><span className="fs-4">📝</span><span className="fs-6 text-dark">Atención Social</span></div>
                  <span className="small text-muted fw-normal">Ingreso y seguimiento de casos.</span>
                </Button>
              </Col>
              <Col md={6}>
                <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" style={{ borderWidth: '2px' }} onClick={() => navigate('/panel-estudiante/fichas/visita')}>
                  <div className="d-flex align-items-center gap-2"><span className="fs-4">🏠</span><span className="fs-6 text-dark">Visita Domiciliaria</span></div>
                  <span className="small text-muted fw-normal">Reporte de terreno y evaluación in situ.</span>
                </Button>
              </Col>
              <Col md={6}>
                <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" style={{ borderWidth: '2px' }} onClick={() => navigate('/panel-estudiante/fichas/recopilacion')}>
                  <div className="d-flex align-items-center gap-2"><span className="fs-4">📂</span><span className="fs-6 text-dark">Recopilación Info.</span></div>
                  <span className="small text-muted fw-normal">Datos socioeconómicos detallados.</span>
                </Button>
              </Col>
              <Col md={6}>
                <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" style={{ borderWidth: '2px' }} onClick={() => navigate('/panel-estudiante/fichas/intervencion')}>
                  <div className="d-flex align-items-center gap-2"><span className="fs-4">🤝</span><span className="fs-6 text-dark">Intervención</span></div>
                  <span className="small text-muted fw-normal">Documento de intervención social.</span>
                </Button>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>

        {/* MODAL 2: DETALLES RÁPIDOS */}
        <Modal show={showDetalles} onHide={() => setShowDetalles(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bolder fs-5 text-dark">Resumen de Ficha</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 pt-0">
            <h4 className="fw-bold" style={{ color: 'var(--color-principal)' }}>{fichaSeleccionada?.tipoEspecifico}</h4>
            <hr />
            <p className="mb-1"><span className="text-muted fw-bold">Paciente:</span> {fichaSeleccionada?.participants?.nombre} {fichaSeleccionada?.participants?.apellido}</p>
            <p className="mb-1"><span className="text-muted fw-bold">RUT:</span> {fichaSeleccionada?.participants?.rut}</p>
            <p className="mb-1"><span className="text-muted fw-bold">Fecha:</span> {formatearFecha(fichaSeleccionada?.fecha_registro)}</p>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light rounded-bottom">
            <Button variant="link" className="text-muted fw-bold text-decoration-none" onClick={() => setShowDetalles(false)}>Cerrar</Button>
            <Button 
              style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} 
              className="fw-bold px-4"
              onClick={() => {
                let rutaTipo = 'social';
                if (fichaSeleccionada?.tipoEspecifico === 'Visita Domiciliaria') rutaTipo = 'visita';
                if (fichaSeleccionada?.tipoEspecifico === 'Recopilación Info.') rutaTipo = 'recopilacion';
                if (fichaSeleccionada?.tipoEspecifico === 'Intervención') rutaTipo = 'intervencion';
                navigate(`/panel-estudiante/fichas/ver/${rutaTipo}/${fichaSeleccionada.id}`);
              }}
            >
              Ver Ficha Completa
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default FichaEstudiantes;