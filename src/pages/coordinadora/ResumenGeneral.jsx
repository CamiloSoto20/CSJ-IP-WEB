import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Spinner, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ResumenGeneral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Estados para métricas generales
  const [totalFichas, setTotalFichas] = useState(0);
  const [metricasAreas, setMetricasAreas] = useState({
    socialesTotales: 0,
    juridicasTotales: 0,
    porcentajeSocial: 0,
    porcentajeJuridica: 0
  });

  // Estado para la categorización de Motivos Sociales
  const [motivosSociales, setMotivosSociales] = useState([]);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      // 1. Obtener los totales de las 4 tablas de área social
      const [socialRes, recopilacionRes, visitasRes, intervencionRes, juridicasRes] = await Promise.all([
        supabase.from('social_records').select('materia_especifica'),
        supabase.from('recopilacion_records').select('*', { count: 'exact', head: true }),
        supabase.from('visitas_records').select('*', { count: 'exact', head: true }),
        supabase.from('intervencion_records').select('*', { count: 'exact', head: true }),
        supabase.from('legal_records').select('*', { count: 'exact', head: true })
      ]);

      const atencionesSocialesBase = socialRes.data || [];
      const totalRecopilacion = recopilacionRes.count || 0;
      const totalVisitas = visitasRes.count || 0;
      const totalIntervencion = intervencionRes.count || 0;
      const totalJuridicas = juridicasRes.count || 0;

      // Total de fichas del área social (sumando sus 4 variantes)
      const totalAreaSocial = atencionesSocialesBase.length + totalRecopilacion + totalVisitas + totalIntervencion;
      const granTotal = totalAreaSocial + totalJuridicas;

      setTotalFichas(granTotal);
      setMetricasAreas({
        socialesTotales: totalAreaSocial,
        juridicasTotales: totalJuridicas,
        porcentajeSocial: granTotal > 0 ? Math.round((totalAreaSocial / granTotal) * 100) : 0,
        porcentajeJuridica: granTotal > 0 ? Math.round((totalJuridicas / granTotal) * 100) : 0
      });

      // 2. Procesar y categorizar motivos de consulta (solo de social_records)
      const conteoMotivos = {};
      atencionesSocialesBase.forEach((ficha) => {
        const motivo = ficha.materia_especifica || 'Sin especificar';
        conteoMotivos[motivo] = (conteoMotivos[motivo] || 0) + 1;
      });

      // Convertir a un arreglo, ordenar de mayor a menor y calcular porcentajes (basado en el total de fichas de Atencion Social)
      const totalBaseSocial = atencionesSocialesBase.length;
      const arregloMotivos = Object.entries(conteoMotivos)
        .map(([nombre, cantidad]) => ({
          nombre,
          cantidad,
          porcentaje: totalBaseSocial > 0 ? ((cantidad / totalBaseSocial) * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.cantidad - a.cantidad);

      setMotivosSociales(arregloMotivos);

    } catch (error) {
      console.error("Error al cargar estadísticas analíticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Button variant="link" className="text-decoration-none mb-3 px-0 fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/dashboard')}>
        &larr; Volver al Dashboard
      </Button>

      <div className="mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Resumen General Analítico</h2>
        <p className="text-muted">Métricas, distribución porcentual y motivos de consulta históricos</p>
      </div>

      {/* BLOQUE 1: DISTRIBUCIÓN GLOBAL (SOCIAL VS JURÍDICO) */}
      <h5 className="fw-bold mb-3 text-secondary">Distribución de Casos por Área</h5>
      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>Área Social</h5>
                <h3 className="fw-bold mb-0 text-dark">{metricasAreas.socialesTotales} <span className="fs-6 text-muted fw-normal">fichas</span></h3>
              </div>
              <p className="small text-muted mb-2">Representa el {metricasAreas.porcentajeSocial}% del total de atenciones.</p>
              <ProgressBar now={metricasAreas.porcentajeSocial} variant="success" style={{ height: '12px', borderRadius: '10px' }} />
              
              <div className="mt-3 pt-3 border-top small text-muted">
                <span className="fw-bold text-dark">Incluye:</span> Atención Social, Recopilación, Visitas e Intervenciones.
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: '#0dcaf0' }}>Área Jurídica</h5>
                <h3 className="fw-bold mb-0 text-dark">{metricasAreas.juridicasTotales} <span className="fs-6 text-muted fw-normal">fichas</span></h3>
              </div>
              <p className="small text-muted mb-2">Representa el {metricasAreas.porcentajeJuridica}% del total de atenciones.</p>
              <ProgressBar now={metricasAreas.porcentajeJuridica} variant="info" style={{ height: '12px', borderRadius: '10px' }} />
              
              <div className="mt-3 pt-3 border-top small text-muted">
                <span className="fw-bold text-dark">Incluye:</span> Casos de familia, civil, patrocinios y asesorías legales.
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* BLOQUE 2: CATEGORIZACIÓN DE MOTIVOS DE CONSULTA SOCIAL */}
      <h5 className="fw-bold mb-3 text-secondary">Desglose de Motivos de Consulta (Atención Social)</h5>
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <Table responsive hover className="align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4 text-muted small border-0">MOTIVO ESPECÍFICO</th>
              <th className="py-3 text-muted small border-0 text-center">CANTIDAD</th>
              <th className="py-3 text-muted small border-0 text-center">PORCENTAJE</th>
              <th className="py-3 px-4 text-muted small border-0" style={{ width: '40%' }}>DISTRIBUCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {motivosSociales.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted small">No hay datos de atención social registrados.</td>
              </tr>
            ) : (
              motivosSociales.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 fw-bold text-dark">{item.nombre}</td>
                  <td className="text-center fw-medium">{item.cantidad}</td>
                  <td className="text-center text-secondary">{item.porcentaje}%</td>
                  <td className="px-4">
                    <ProgressBar now={item.porcentaje} variant={index % 2 === 0 ? "success" : "info"} style={{ height: '8px' }} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Card.Footer className="bg-white px-4 py-3 d-flex justify-content-end">
          <h5 className="fw-bold mb-0">Total General: <span style={{ color: 'var(--color-principal)' }}>{totalFichas} fichas registradas</span></h5>
        </Card.Footer>
      </Card>

    </Container>
  );
};

export default ResumenGeneral;