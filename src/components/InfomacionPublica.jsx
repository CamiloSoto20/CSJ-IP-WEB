import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Modal } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const InformacionPublica = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pubSeleccionada, setPubSeleccionada] = useState(null);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        const { data, error } = await supabase
          .from('information')
          .select('*')
          .order('fecha_publicacion', { ascending: false })
          .limit(6);

        if (error) throw error;
        setPublicaciones(data || []);
      } catch (error) {
        console.error("Error al cargar publicaciones:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicaciones();
  }, []);

  const handleOpen = (pub) => {
    setPubSeleccionada(pub);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setPubSeleccionada(null);
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>;
  if (publicaciones.length === 0) return null;

  return (
    <section id="informacion" className="py-5" style={{ backgroundColor: '#f4f7f5' }}>
      <Container className="py-4">
        <div className="text-center mb-5">
          <h2 className="section-title">Centro de Información</h2>
          <p className="text-muted lead">Noticias, artículos legales y recursos de interés</p>
        </div>

        <Row className="g-4">
          {publicaciones.map(pub => (
            <Col md={6} lg={4} key={pub.id}>
              <Card className="h-100 card-modern hover-lift p-2">
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge 
                      bg={pub.categoria === 'Noticia' ? 'success' : 'primary'} 
                      className="px-3 py-2 rounded-pill fw-medium"
                    >
                      {pub.categoria}
                    </Badge>
                    <small className="text-muted fw-bold">{new Date(pub.fecha_publicacion).toLocaleDateString('es-CL')}</small>
                  </div>
                  <Card.Title className="fw-bold mb-3" style={{ fontSize: '1.25rem', color: 'var(--color-principal)' }}>
                    {pub.titulo}
                  </Card.Title>
                  
                  <Card.Text className="text-secondary flex-grow-1" style={{ lineHeight: '1.6' }}>
                    {pub.descripcion_corta}
                  </Card.Text>
                  
                  <Button 
                    variant="link" 
                    className="text-decoration-none px-0 mt-auto text-start fw-bold" 
                    onClick={() => handleOpen(pub)} 
                    style={{ color: 'var(--color-secundario)' }}
                  >
                    Leer más &rarr;
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Modal de Lectura de Noticia */}
        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
          <Modal.Body className="pt-0 p-4 p-md-5">
            {pubSeleccionada && (
              <>
                <Badge bg={pubSeleccionada.categoria === 'Noticia' ? 'success' : 'primary'} className="mb-3 px-3 py-2 rounded-pill">
                  {pubSeleccionada.categoria}
                </Badge>
                <h2 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>{pubSeleccionada.titulo}</h2>
                <div className="d-flex gap-3 text-muted small mb-4 fw-bold border-bottom pb-3">
                  <span>📅 {new Date(pubSeleccionada.fecha_publicacion).toLocaleDateString('es-CL')}</span>
                  {pubSeleccionada.autor_nombre && <span>✍️ {pubSeleccionada.autor_nombre}</span>}
                  {pubSeleccionada.fuente && <span>🔗 {pubSeleccionada.fuente}</span>}
                </div>
                <div className="text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.1rem' }}>
                  {pubSeleccionada.contenido_completo || pubSeleccionada.descripcion_corta}
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </section>
  );
};

export default InformacionPublica;