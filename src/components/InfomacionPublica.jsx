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
    <section id="informacion" className="py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Centro de Información</h2>
          <p className="text-muted">Noticias, artículos legales y recursos de interés</p>
        </div>

        <Row className="g-4">
          {publicaciones.map(pub => (
            <Col md={6} lg={4} key={pub.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg={pub.categoria === 'Noticia' ? 'info' : 'primary'}>{pub.categoria}</Badge>
                    <small className="text-muted">{new Date(pub.fecha_publicacion).toLocaleDateString('es-CL')}</small>
                  </div>
                  <Card.Title className="fw-bold mt-2">{pub.titulo}</Card.Title>
                  
                  {/* Se actualizó para usar la descripción corta */}
                  <Card.Text className="text-muted flex-grow-1">
                    {pub.descripcion_corta}
                  </Card.Text>
                  
                  <Button variant="link" className="text-decoration-none px-0 mt-auto text-start" onClick={() => handleOpen(pub)} style={{ color: 'var(--color-secundario)' }}>
                    Leer más &rarr;
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
          <Modal.Body className="pt-0 p-4 p-md-5">
            {pubSeleccionada && (
              <>
                <Badge bg={pubSeleccionada.categoria === 'Noticia' ? 'info' : 'primary'} className="mb-3">
                  {pubSeleccionada.categoria}
                </Badge>
                <h3 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>{pubSeleccionada.titulo}</h3>
                <p className="text-muted small mb-4">
                  Publicado el {new Date(pubSeleccionada.fecha_publicacion).toLocaleDateString('es-CL')}
                </p>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {pubSeleccionada.contenido_completo}
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