import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEstudiantes = async () => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('rol', 'estudiante')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setEstudiantes(data || []);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();

    // Suscripción en Tiempo Real para detectar nuevos estudiantes o cambios de estado
    const estudiantesSubscription = supabase
      .channel('estudiantes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfiles', filter: 'rol=eq.estudiante' }, () => {
        fetchEstudiantes(); // Recarga la lista silenciosamente
      })
      .subscribe();

    return () => {
      supabase.removeChannel(estudiantesSubscription);
    };
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Directorio de Estudiantes</h3>
          <p className="text-muted mb-0">Gestión y seguimiento de alumnos en práctica (Actualización en vivo)</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">RUT</th>
                  <th className="text-muted border-0 py-3">ESTUDIANTE / CORREO</th>
                  <th className="text-muted border-0 py-3">CARRERA</th>
                  <th className="text-muted border-0 py-3">ESTADO</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">No hay estudiantes registrados.</td>
                  </tr>
                ) : (
                  estudiantes.map((est) => (
                    <tr key={est.id}>
                      <td className="px-4 text-secondary small">{est.rut || 'S/N'}</td>
                      <td>
                        <span className="fw-bold d-block text-dark">{est.nombre}</span>
                        <span className="text-muted small">{est.correo}</span>
                      </td>
                      <td>
                        <Badge bg="secondary" className="bg-opacity-25 text-dark border">{est.carrera || 'No especificada'}</Badge>
                      </td>
                      <td>
                        <Badge bg={est.estado === 'Activo' ? 'success' : 'danger'}>
                          {est.estado || 'Activo'}
                        </Badge>
                      </td>
                      <td className="px-4 text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="fw-bold"
                          onClick={() => navigate(`/dashboard/estudiantes/${est.id}`)}
                        >
                          Ver Perfil &rarr;
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Estudiantes;