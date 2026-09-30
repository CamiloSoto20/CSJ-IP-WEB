import { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const InformacionEstudiante = () => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNoticias = async () => {
    try {
      // Filtramos para que SOLO traiga los avisos de estudiantes
      const { data, error } = await supabase
        .from('information')
        .select('*')
        .in('categoria', ['IMPORTANTE', 'Salida', 'Recordatorio']) 
        .order('fecha_publicacion', { ascending: false });
        
      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error("Error al cargar información:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const getEstilosAviso = (categoria) => {
    switch(categoria) {
      case 'IMPORTANTE': 
        return { bg: 'danger', border: '#dc3545', icon: '🔴', text: 'light' };
      case 'Salida': 
        return { bg: 'warning', border: '#ffc107', icon: '🟡', text: 'dark' };
      case 'Recordatorio': 
        return { bg: 'info', border: '#0dcaf0', icon: '🔵', text: 'dark' };
      default: 
        return { bg: 'primary', border: 'var(--border-color)', icon: '📰', text: 'light' };
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <Button variant="link" className="text-decoration-none mb-3 px-0 fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/panel-estudiante')}>
          &larr; Volver al Panel
        </Button>

        <div className="mb-4">
          <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Muro de Avisos Internos</h2>
          <p className="text-muted">Comunicaciones oficiales exclusivas para estudiantes de la Clínica</p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Row className="g-4">
            {noticias.length === 0 ? (
              <Col><p className="text-muted text-center py-5 bg-white rounded shadow-sm">No hay avisos recientes de coordinación.</p></Col>
            ) : noticias.map(item => {
              const estilos = getEstilosAviso(item.categoria);
              
              return (
                <Col md={6} lg={4} key={item.id}>
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px', borderTop: `4px solid ${estilos.border}` }}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg={estilos.bg} text={estilos.text} className="px-3 py-2 rounded-pill text-uppercase fw-bold">
                          {estilos.icon} {item.categoria}
                        </Badge>
                        <small className="text-muted fw-bold">
                          {new Date(item.fecha_publicacion || item.created_at).toLocaleDateString('es-CL')}
                        </small>
                      </div>
                      
                      <h5 className="fw-bolder text-dark mb-3">{item.titulo}</h5>
                      
                      <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                        {item.descripcion_corta}
                      </p>
                      
                      {item.contenido_completo && (
                        <div className="mt-auto pt-3 border-top">
                          <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {item.contenido_completo}
                          </p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default InformacionEstudiante;