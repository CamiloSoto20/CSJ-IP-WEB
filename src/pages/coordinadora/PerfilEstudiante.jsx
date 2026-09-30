import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const PerfilEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [metricas, setMetricas] = useState({ fichas: 0, citas: 0, charlas: 0, horasCalculadas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatosEstudiante = async () => {
      try {
        // 1. Traer datos del perfil del estudiante
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', id)
          .single();

        if (perfilError) throw perfilError;
        setEstudiante(perfilData);

        // 2. Extraer métricas reales desde la Base de Datos (Conteo rápido)
        // Nota: Asumimos que "professional_id" es la columna que vincula al estudiante con la ficha/cita
        const [fichasRes, citasRes, charlasRes] = await Promise.all([
          supabase.from('social_records').select('*', { count: 'exact', head: true }).eq('professional_id', id),
          // Si appointments no tiene professional_id, cuenta de manera global o ajusta según tu estructura:
          supabase.from('appointments').select('*', { count: 'exact', head: true }), 
          supabase.from('talks').select('*', { count: 'exact', head: true }) 
        ]);

        const totalFichas = fichasRes.count || 0;
        const totalCitas = citasRes.count || 0;
        const totalCharlas = charlasRes.count || 0;

        // Calculamos un estimado de horas (Ej: 2 hrs por ficha + 1.5 hrs por cita/charla)
        const horasCalculadas = (totalFichas * 2) + (totalCitas * 1.5) + (totalCharlas * 1.5);

        setMetricas({
          fichas: totalFichas,
          citas: totalCitas,
          charlas: totalCharlas,
          horasCalculadas: horasCalculadas
        });

      } catch (error) {
        console.error("Error al cargar perfil y métricas:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosEstudiante();
  }, [id]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>;
  }

  if (!estudiante) {
    return <div className="text-center py-5 text-muted">Estudiante no encontrado.</div>;
  }

  return (
    <div>
      <Button variant="link" className="text-decoration-none mb-3 px-0 fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/dashboard/estudiantes')}>
        &larr; Volver al Directorio
      </Button>

      <Row className="g-4">
        {/* TARJETA DE DATOS DEL ESTUDIANTE */}
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="text-center p-4">
              <div 
                className="rounded-circle d-inline-flex justify-content-center align-items-center mb-3 text-white fw-bold fs-2" 
                style={{ width: '100px', height: '100px', backgroundColor: 'var(--color-principal)' }}
              >
                {estudiante.nombre.charAt(0).toUpperCase()}
              </div>
              <h4 className="fw-bold mb-1">{estudiante.nombre}</h4>
              <p className="text-muted small mb-3">{estudiante.correo}</p>
              
              <Badge bg={estudiante.estado === 'Activo' ? 'success' : 'danger'} className="mb-3 px-3 py-2">
                Estado: {estudiante.estado || 'Activo'}
              </Badge>

              <hr />
              
              <div className="text-start mt-3">
                <p className="mb-2"><span className="text-muted small fw-bold d-block">RUT</span> {estudiante.rut || 'No registrado'}</p>
                <p className="mb-2"><span className="text-muted small fw-bold d-block">Carrera</span> {estudiante.carrera || 'No especificada'}</p>
                <p className="mb-0"><span className="text-muted small fw-bold d-block">Fecha de Ingreso</span> {new Date(estudiante.created_at).toLocaleDateString('es-CL')}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* MÉTRICAS CONECTADAS A SUPABASE */}
        <Col md={8}>
          <h4 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Rendimiento y Métricas (En vivo)</h4>
          <Row className="g-3 mb-4">
            <Col sm={6}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '15px', borderBottom: '4px solid #0d6efd' }}>
                <h2 className="fw-bolder mb-0 text-primary">{metricas.fichas}</h2>
                <p className="text-muted small fw-bold text-uppercase mb-0">Fichas Creadas</p>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '15px', borderBottom: '4px solid #198754' }}>
                <h2 className="fw-bolder mb-0 text-success">{metricas.citas}</h2>
                <p className="text-muted small fw-bold text-uppercase mb-0">Casos / Citas Atendidas</p>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '15px', borderBottom: '4px solid #ffc107' }}>
                <h2 className="fw-bolder mb-0 text-warning">{metricas.charlas}</h2>
                <p className="text-muted small fw-bold text-uppercase mb-0">Charlas Registradas</p>
              </Card>
            </Col>
            <Col sm={6}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '15px', borderBottom: '4px solid #6c757d' }}>
                <h2 className="fw-bolder mb-0 text-secondary">{metricas.horasCalculadas} hrs</h2>
                <p className="text-muted small fw-bold text-uppercase mb-0">Horas Estimadas Práctica</p>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default PerfilEstudiante;