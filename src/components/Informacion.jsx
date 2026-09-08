import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Datos provisionales simulando la futura conexión a Supabase
const mockInfo = [
  {
    id: 1,
    title: 'Postulación Beca de Alimentación',
    category: 'Beneficios',
    date: '10 Oct 2026',
    description: 'Se abren las postulaciones para la beca de alimentación correspondiente al segundo semestre. Revisa los requisitos.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: 2,
    title: 'Actualización en Ley de Familia',
    category: 'Información Jurídica',
    date: '05 Oct 2026',
    description: 'Resumen de los últimos cambios implementados en la ley de familia y cómo afectan los procesos vigentes.',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: 3,
    title: 'Operativo Social en Terreno',
    category: 'Noticias',
    date: '28 Sep 2026',
    description: 'La Clínica Socio Jurídica realizará un operativo en terreno este fin de semana. Conoce los detalles y horarios.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=400&h=250'
  }
];

const Information = () => {
  return (
    <section id="informacion" className="py-5" style={{ backgroundColor: 'var(--color-fondo)' }}>
      <Container>
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Información de interés</h2>
            <p className="text-muted mb-0">Noticias, beneficios y avisos importantes para la comunidad.</p>
          </div>
          <Button variant="outline-success" as={Link} to="/informacion" className="d-none d-md-block">
            Ver todo
          </Button>
        </div>

        <Row className="g-4">
          {mockInfo.map((info) => (
            <Col key={info.id} md={6} lg={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img variant="top" src={info.image} alt={info.title} style={{ objectFit: 'cover', height: '200px' }} />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="secondary" style={{ backgroundColor: 'var(--color-secundario) !important' }}>
                      {info.category}
                    </Badge>
                    <small className="text-muted">{info.date}</small>
                  </div>
                  <Card.Title style={{ fontWeight: 'bold' }}>{info.title}</Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    {info.description}
                  </Card.Text>
                  <Link to={`/informacion/${info.id}`} className="text-decoration-none fw-bold" style={{ color: 'var(--color-principal)' }}>
                    Leer más →
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* Botón visible solo en móviles */}
        <div className="text-center mt-4 d-md-none">
          <Button variant="outline-success" as={Link} to="/informacion" className="w-100">
            Ver todas las publicaciones
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default Information;