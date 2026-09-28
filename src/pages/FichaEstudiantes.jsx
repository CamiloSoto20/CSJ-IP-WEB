import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const FichasEstudiante = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMisFichas = async () => {
      try {
        // En el futuro aquí filtraremos por el ID del estudiante (eq('estudiante_id', user.id))
        // Por ahora traemos las fichas para armar la interfaz
        const { data, error } = await supabase
          .from('legal_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFichas(data || []);
      } catch (error) {
        console.error("Error al cargar las fichas:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMisFichas();
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'En atención': return 'primary';
      case 'Cerrada': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <Button variant="link" className="text-decoration-none mb-3 px-0 text-secondary" onClick={() => navigate('/panel-estudiante')}>
        &larr; Volver al Panel
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Casos Asignados</h2>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
          </div>
        ) : (
          <Table hover responsive className="align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th>FECHA ASIGNACIÓN</th>
                <th>PARTICIPANTE</th>
                <th>TIPO DE ATENCIÓN</th>
                <th>ESTADO</th>
                <th className="text-end">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {fichas.map((ficha) => (
                <tr key={ficha.id}>
                  <td className="text-secondary">{new Date(ficha.created_at).toLocaleDateString('es-CL')}</td>
                  <td className="fw-bold">{ficha.nombre} <br/><span className="text-muted fw-normal small">{ficha.rut}</span></td>
                  <td>{ficha.tipo_atencion}</td>
                  <td>
                    <Badge bg={getStatusBadge(ficha.estado)} text={ficha.estado === 'Pendiente' ? 'dark' : 'light'}>
                      {ficha.estado}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="outline-primary" size="sm">
                      Revisar Antecedentes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {!loading && fichas.length === 0 && (
          <div className="text-center text-muted py-4">No tienes casos asignados actualmente.</div>
        )}
      </div>
    </Container>
  );
};

export default FichasEstudiante;