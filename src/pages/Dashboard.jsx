import { Card, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
  return (
    <div>
      <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }} className="mb-4">
        Resumen General
      </h2>
      <Row className="g-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title className="text-muted small fw-bold">FICHAS PENDIENTES</Card.Title>
              <h2 style={{ color: 'var(--color-principal)' }} className="display-5 fw-bold">0</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title className="text-muted small fw-bold">CITAS DE HOY</Card.Title>
              <h2 style={{ color: 'var(--color-principal)' }} className="display-5 fw-bold">0</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;