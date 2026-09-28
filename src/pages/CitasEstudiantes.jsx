import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CitasEstudiante = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMisCitas = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('fecha', { ascending: true });

        if (error) throw error;
        setCitas(data || []);
      } catch (error) {
        console.error("Error al cargar las citas:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMisCitas();
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Confirmada': return 'primary';
      case 'Completada': return 'success';
      case 'Cancelada': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <Button variant="link" className="text-decoration-none mb-3 px-0 text-secondary" onClick={() => navigate('/panel-estudiante')}>
        &larr; Volver al Panel
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Mis Citas Agendadas</h2>
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
                <th>FECHA Y HORA</th>
                <th>PARTICIPANTE</th>
                <th>TIPO</th>
                <th>ESTADO</th>
                <th className="text-end">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td className="fw-bold text-secondary">
                    {cita.fecha} <br/> <span className="small fw-normal">⏰ {cita.hora.substring(0, 5)} hrs</span>
                  </td>
                  <td className="fw-bold">{cita.nombre} <br/><span className="text-muted fw-normal small">{cita.rut}</span></td>
                  <td>{cita.tipo_atencion}</td>
                  <td>
                    <Badge bg={getStatusBadge(cita.estado)} text={cita.estado === 'Pendiente' ? 'dark' : 'light'}>
                      {cita.estado}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="outline-success" size="sm">
                      Iniciar Atención
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {!loading && citas.length === 0 && (
          <div className="text-center text-muted py-4">No tienes citas agendadas actualmente.</div>
        )}
      </div>
    </Container>
  );
};

export default CitasEstudiante;