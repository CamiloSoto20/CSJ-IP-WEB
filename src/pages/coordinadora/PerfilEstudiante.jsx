import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Spinner, Badge, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const PerfilEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estudiante, setEstudiante] = useState(null);
  const [metricas, setMetricas] = useState({ fichas: 0, citas: 0, charlas: 0, horasCalculadas: 0 });
  const [fichasRealizadas, setFichasRealizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDatosEstudiante = async () => {
    try {
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', id)
        .single();

      if (perfilError) throw perfilError;
      setEstudiante(perfilData);

      const [socialRes, legalRes] = await Promise.all([
        supabase.from('social_records').select('id, created_at, paciente_nombre').eq('professional_id', id),
        supabase.from('legal_records').select('id, created_at, paciente_nombre').eq('professional_id', id)
      ]);

      const fichasSociales = (socialRes.data || []).map(f => ({ ...f, tipo: 'Social' }));
      const fichasLegales = (legalRes.data || []).map(f => ({ ...f, tipo: 'Jurídica' }));

      const todasLasFichas = [...fichasSociales, ...fichasLegales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFichasRealizadas(todasLasFichas);

      const [citasRes, charlasRes] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('estudiante_id', id),
        supabase.from('talks').select('*', { count: 'exact', head: true }).eq('creador_id', id)
      ]);

      const totalFichas = todasLasFichas.length;
      const totalCitas = citasRes.count || 0;
      const totalCharlas = charlasRes.count || 0;
      const horasCalculadas = (totalFichas * 2) + (totalCitas * 1.5) + (totalCharlas * 1.5);

      setMetricas({ fichas: totalFichas, citas: totalCitas, charlas: totalCharlas, horasCalculadas });

    } catch (error) {
      console.error("Error al cargar datos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosEstudiante();

    const realtimeChannel = supabase.channel(`perfil-estudiante-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_records', filter: `professional_id=eq.${id}` }, fetchDatosEstudiante)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'legal_records', filter: `professional_id=eq.${id}` }, fetchDatosEstudiante)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `estudiante_id=eq.${id}` }, fetchDatosEstudiante)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfiles', filter: `id=eq.${id}` }, fetchDatosEstudiante)
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [id]);

  const cambiarEstadoEstudiante = async (nuevoEstado) => {
    const confirmar = window.confirm(
      nuevoEstado === 'Eliminado'
        ? `ATENCIÓN: ¿Estás segura de que deseas ELIMINAR (Bloquear permanentemente) a este estudiante? Sus fichas se mantendrán, pero ya no podrá iniciar sesión.`
        : `¿Estás segura de que deseas marcar a este estudiante como "${nuevoEstado}"? Sus fichas y casos se mantendrán en el sistema.`
    );

    if (!confirmar) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;

      setEstudiante(prev => ({ ...prev, estado: nuevoEstado }));
      alert(`El estudiante ha sido ${nuevoEstado.toLowerCase()} exitosamente.`);

    } catch (error) {
      alert("Error al cambiar el estado: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

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
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
            <Card.Body className="text-center p-4">
              <div
                className="rounded-circle d-inline-flex justify-content-center align-items-center mb-3 text-white fw-bold fs-2 shadow-sm"
                style={{ width: '100px', height: '100px', backgroundColor: estudiante.estado === 'Activo' ? 'var(--color-principal)' : '#6c757d' }}
              >
                {estudiante.nombre.charAt(0).toUpperCase()}
              </div>
              <h4 className="fw-bold mb-1">{estudiante.nombre}</h4>
              <p className="text-muted small mb-3">{estudiante.correo}</p>

              <Badge bg={estudiante.estado === 'Activo' ? 'success' : (estudiante.estado === 'Bloqueado' ? 'warning' : 'danger')} className="mb-3 px-3 py-2 text-uppercase">
                {estudiante.estado || 'Activo'}
              </Badge>

              <hr />

              <div className="text-start mt-3 mb-4">
                <p className="mb-2"><span className="text-muted small fw-bold d-block">RUT</span> {estudiante.rut || 'No registrado'}</p>
                <p className="mb-2"><span className="text-muted small fw-bold d-block">Carrera</span> {estudiante.carrera || 'No especificada'}</p>
                <p className="mb-0"><span className="text-muted small fw-bold d-block">Fecha de Ingreso</span> {new Date(estudiante.created_at).toLocaleDateString('es-CL')}</p>
              </div>

              <div className="d-flex flex-column gap-2 mt-4">
                <Button
                  variant="outline-warning"
                  className="w-100 fw-bold"
                  disabled={actionLoading || estudiante.estado === 'Bloqueado'}
                  onClick={() => cambiarEstadoEstudiante('Bloqueado')}
                >
                  Bloquear Acceso
                </Button>
                <Button
                  variant="outline-danger"
                  className="w-100 fw-bold"
                  disabled={actionLoading || estudiante.estado === 'Eliminado'}
                  onClick={() => cambiarEstadoEstudiante('Eliminado')}
                >
                  Eliminar Estudiante
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Rendimiento en Tiempo Real</h5>
          <Row className="g-3 mb-4">
            <Col sm={3}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '12px', borderBottom: '4px solid #0d6efd' }}>
                <h3 className="fw-bolder mb-0 text-primary">{metricas.fichas}</h3>
                <p className="text-muted small fw-bold mb-0">Fichas</p>
              </Card>
            </Col>
            <Col sm={3}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '12px', borderBottom: '4px solid #198754' }}>
                <h3 className="fw-bolder mb-0 text-success">{metricas.citas}</h3>
                <p className="text-muted small fw-bold mb-0">Citas</p>
              </Card>
            </Col>
            <Col sm={3}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '12px', borderBottom: '4px solid #ffc107' }}>
                <h3 className="fw-bolder mb-0 text-warning">{metricas.charlas}</h3>
                <p className="text-muted small fw-bold mb-0">Charlas</p>
              </Card>
            </Col>
            <Col sm={3}>
              <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: '12px', borderBottom: '4px solid #6c757d' }}>
                <h3 className="fw-bolder mb-0 text-secondary">{metricas.horasCalculadas}</h3>
                <p className="text-muted small fw-bold mb-0">Hrs Estimadas</p>
              </Card>
            </Col>
          </Row>

          <h5 className="fw-bold mb-3 mt-4" style={{ color: 'var(--color-principal)' }}>Fichas Realizadas por {estudiante.nombre.split(' ')[0]}</h5>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4 border-0 text-muted small">FECHA</th>
                  <th className="py-3 border-0 text-muted small">PACIENTE</th>
                  <th className="py-3 border-0 text-muted small">TIPO DE FICHA</th>
                  <th className="py-3 px-4 border-0 text-end text-muted small">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {fichasRealizadas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted small">
                      Este estudiante aún no ha creado ninguna ficha.
                    </td>
                  </tr>
                ) : (
                  fichasRealizadas.map((ficha) => (
                    <tr key={`${ficha.tipo}-${ficha.id}`}>
                      <td className="px-4 text-secondary small fw-medium">
                        {new Date(ficha.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="fw-bold text-dark">
                        {ficha.paciente_nombre || 'Sin nombre registrado'}
                      </td>
                      <td>
                        <Badge bg={ficha.tipo === 'Social' ? 'info' : 'primary'} className="text-white">
                          {ficha.tipo}
                        </Badge>
                      </td>
                      <td className="px-4 text-end">
                        <Button
                          variant="light"
                          size="sm"
                          className="fw-bold border text-primary"
                          onClick={() => navigate('/dashboard/fichas')}
                        >
                          Ir al Directorio
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerfilEstudiante;