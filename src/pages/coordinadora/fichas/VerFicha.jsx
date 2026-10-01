import { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Table, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const VerFicha = () => {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFichaCompleta = async () => {
      try {
        // Determinar la tabla correcta según el parámetro de la URL
        let tabla = '';
        if (tipo === 'social') tabla = 'social_records';
        else if (tipo === 'visita') tabla = 'visitas_records';
        else if (tipo === 'recopilacion') tabla = 'recopilacion_records';
        else if (tipo === 'juridica') tabla = 'legal_records';

        if (!tabla) throw new Error("Tipo de ficha no válido");

        // Consultar la ficha y hacer JOIN con participante y perfil del profesional
        const { data, error } = await supabase
          .from(tabla)
          .select('*, participants(*), perfiles(nombre, rol)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setFicha(data);
      } catch (error) {
        console.error("Error al cargar la ficha:", error.message);
        alert("No se pudo cargar la información de la ficha.");
      } finally {
        setLoading(false);
      }
    };

    fetchFichaCompleta();
  }, [tipo, id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
      </div>
    );
  }

  if (!ficha) return <div className="text-center mt-5">Ficha no encontrada.</div>;

  // Función para formatear las claves (ej: linea_atencion -> Línea Atención)
  const formatearLlave = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filtrar campos técnicos que no necesitamos mostrar en la lista de detalles
  const camposOcultos = ['id', 'participant_id', 'professional_id', 'created_at', 'fecha_creacion', 'participants', 'perfiles'];
  
  // Extraer los detalles específicos de la ficha
  const detallesFicha = Object.entries(ficha).filter(([key, value]) => !camposOcultos.includes(key) && value !== null && value !== '');

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>
            📄 Ficha {tipo}
          </h3>
          <p className="text-muted mb-0">Visualización completa del documento</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          &larr; Volver
        </Button>
      </div>

      <Row className="g-4">
        {/* COLUMNA IZQUIERDA: Identificación */}
        <Col lg={4} className="d-flex flex-column gap-4">
          
          {/* Tarjeta del Paciente (DATOS REALES) */}
          <Card className="border-0 shadow-sm rounded-4 border-top border-4 border-primary">
            <Card.Body className="p-4">
              <h6 className="fw-bold text-muted text-uppercase mb-3">👤 Paciente Registrado</h6>
              <h4 className="fw-bolder mb-1">{ficha.participants?.nombre} {ficha.participants?.apellido}</h4>
              <p className="text-muted fw-bold mb-3">RUT: {ficha.participants?.rut || 'Sin registrar'}</p>
              
              <div className="small text-secondary">
                <p className="mb-1"><strong>Nacimiento:</strong> {ficha.participants?.fecha_nacimiento || 'N/A'}</p>
                <p className="mb-1"><strong>Correo:</strong> {ficha.participants?.correo || 'N/A'}</p>
                <p className="mb-1"><strong>Teléfono:</strong> {ficha.participants?.telefono || 'N/A'}</p>
                <p className="mb-0"><strong>Nacionalidad:</strong> {ficha.participants?.nacionalidad || 'N/A'}</p>
              </div>
            </Card.Body>
          </Card>

          {/* Tarjeta del Profesional */}
          <Card className="border-0 shadow-sm rounded-4 border-top border-4 border-success">
            <Card.Body className="p-4">
              <h6 className="fw-bold text-muted text-uppercase mb-3">✍️ Creada Por</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm" style={{ width: '50px', height: '50px' }}>
                  {ficha.perfiles?.nombre?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <span className="fw-bolder d-block fs-5 text-dark">
                    {ficha.perfiles?.nombre || 'Sistema'}
                  </span>
                  <Badge bg="success" className="text-capitalize mt-1 px-2 py-1">
                    {ficha.perfiles?.rol || 'Rol no especificado'}
                  </Badge>
                </div>
              </div>
              <hr />
              <p className="mb-0 small text-muted"><strong>Fecha de Registro:</strong> {new Date(ficha.fecha_creacion || ficha.created_at).toLocaleString('es-CL')}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA DERECHA: Detalles de la Ficha */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>Detalles del Formulario</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                {detallesFicha.map(([key, value]) => {
                  // Si el valor es un arreglo (Como el Grupo Familiar o Participantes en JSONB)
                  if (Array.isArray(value)) {
                    if (value.length === 0) return null;
                    const headers = Object.keys(value[0]);
                    return (
                      <Col xs={12} key={key} className="mt-4">
                        <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">{formatearLlave(key)}</h6>
                        <Table responsive bordered hover size="sm" className="small text-center">
                          <thead className="bg-light">
                            <tr>{headers.map(h => <th key={h} className="text-capitalize">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {value.map((row, i) => (
                              <tr key={i}>{headers.map(h => <td key={h}>{row[h]}</td>)}</tr>
                            ))}
                          </tbody>
                        </Table>
                      </Col>
                    );
                  }

                  // Renderizado normal para textos, booleanos o números
                  return (
                    <Col md={6} key={key}>
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <span className="d-block small fw-bold text-muted text-uppercase mb-1">{formatearLlave(key)}</span>
                        <span className="fw-medium text-dark" style={{ wordBreak: 'break-word' }}>
                          {typeof value === 'boolean' ? (value ? '✅ Sí' : '❌ No') : value}
                        </span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerFicha;