import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const InformacionPublica = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        // Filtramos para que SOLO se muestren noticias públicas y NUNCA avisos internos de estudiantes
        const { data, error } = await supabase
          .from('information')
          .select('*')
          .in('categoria', ['Noticia', 'Artículo Legal', 'Aporte Estudiante'])
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
      </div>
    );
  }

  if (publicaciones.length === 0) return null;

  return (
    <section id="informacion" className="py-5" style={{ backgroundColor: '#f4f7f5' }}>
      <Container className="py-4">
        <div className="text-center mb-5">
          <h2 className="section-title fw-bold" style={{ color: 'var(--color-principal, #006A38)' }}>
            Centro de Información
          </h2>
          <div 
            className="mx-auto my-2 rounded" 
            style={{ width: '60px', height: '4px', backgroundColor: 'var(--color-secundario, #78BE20)' }}
          />
          <p className="text-muted lead mt-2">Noticias, artículos legales y recursos de interés para la comunidad</p>
        </div>

        <Row className="g-4 justify-content-center">
          {publicaciones.map((pub) => (
            <Col md={6} lg={4} key={pub.id}>
              <Card 
                className="h-100 border-0 shadow-sm" 
                style={{ 
                  borderRadius: '16px', 
                  borderTop: '5px solid var(--color-principal, #006A38)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <Card.Body className="d-flex flex-column p-4">
                  {/* Encabezado: Categoría y Fecha */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge 
                      bg={pub.categoria === 'Noticia' ? 'success' : 'primary'} 
                      className="px-3 py-2 rounded-pill fw-semibold"
                      style={{ fontSize: '0.78rem' }}
                    >
                      📰 {pub.categoria}
                    </Badge>
                    <small className="text-muted fw-bold">
                      📅 {new Date(pub.fecha_publicacion || pub.created_at).toLocaleDateString('es-CL')}
                    </small>
                  </div>

                  {/* Título de la Publicación */}
                  <Card.Title 
                    className="fw-bold mb-3" 
                    style={{ fontSize: '1.25rem', color: 'var(--color-principal, #006A38)', lineHeight: '1.4' }}
                  >
                    {pub.titulo}
                  </Card.Title>

                  {/* Descripción visible directamente sin botón "Leer más" */}
                  <div 
                    className="text-secondary flex-grow-1 mb-3" 
                    style={{ 
                      lineHeight: '1.7', 
                      fontSize: '0.96rem', 
                      whiteSpace: 'pre-wrap' 
                    }}
                  >
                    {pub.descripcion_corta}
                  </div>

                  {/* Pie de tarjeta con Autor / Fuente si existen */}
                  {(pub.autor_nombre || pub.fuente || pub.contenido_completo) && (
                    <div className="mt-auto pt-3 border-top d-flex flex-column gap-1 bg-light p-3 rounded-3">
                      {pub.autor_nombre && (
                        <small className="text-dark">
                          <strong>✍️ Autor:</strong> {pub.autor_nombre}
                        </small>
                      )}
                      {pub.fuente && (
                        <small className="text-muted">
                          <strong>🔗 Fuente:</strong> {pub.fuente}
                        </small>
                      )}
                      {!pub.autor_nombre && !pub.fuente && pub.contenido_completo && (
                        <small className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                          {pub.contenido_completo}
                        </small>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default InformacionPublica;