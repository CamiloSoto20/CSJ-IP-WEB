import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Datos provisionales simulando Supabase
const mockTalks = [
  {
    id: 1,
    title: 'Charla: Derechos laborales básicos',
    description: 'Conoce tus derechos fundamentales en el ámbito laboral y cómo protegerlos ante situaciones irregulares.',
    date: '20/10/2026',
    time: '15:00',
    location: 'Auditorio Principal, Sede Centro',
    spots: 15,
    status: 'Disponible',
    image: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: 2,
    title: 'Taller: Rutas de denuncia VIF',
    description: 'Capacitación sobre prevención, detección y rutas de denuncia en casos de violencia intrafamiliar.',
    date: '25/10/2026',
    time: '10:00',
    location: 'Sala 302, Edificio A',
    spots: 0,
    status: 'Completo',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=400&h=250'
  }
];

const Talks = () => {
  return (
    <section id="charlas" className="py-5 bg-white">
      <Container>
        <div className="text-center mb-5">
          <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Charlas y capacitaciones</h2>
          <p className="text-muted">Participa en nuestras actividades formativas abiertas a la comunidad.</p>
        </div>

        <Row className="g-4 justify-content-center">
          {mockTalks.map((talk) => (
            <Col key={talk.id} md={6} lg={5}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img variant="top" src={talk.image} alt={talk.title} style={{ objectFit: 'cover', height: '200px' }} />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                      {talk.title}
                    </Card.Title>
                    <Badge bg={talk.spots > 0 ? "success" : "danger"} className="ms-2">
                      {talk.status}
                    </Badge>
                  </div>
                  
                  <Card.Text className="text-muted flex-grow-1">
                    {talk.description}
                  </Card.Text>
                  
                  <ul className="list-unstyled text-muted small mb-4">
                    <li>📅 <strong>Fecha:</strong> {talk.date}</li>
                    <li>⏰ <strong>Hora:</strong> {talk.time}</li>
                    <li>📍 <strong>Ubicación:</strong> {talk.location}</li>
                    <li>👥 <strong>Cupos disponibles:</strong> {talk.spots}</li>
                  </ul>

                  <Button 
                    variant={talk.spots > 0 ? "outline-success" : "secondary"} 
                    as={Link} 
                    to={`/inscripcion/${talk.id}`}
                    disabled={talk.spots === 0}
                    className="w-100 mt-auto"
                  >
                    {talk.spots > 0 ? 'Inscribirme' : 'Cupos agotados'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Talks;