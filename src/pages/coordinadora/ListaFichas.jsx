import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ListaFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFichas();
  }, []);

  const fetchFichas = async () => {
    try {
      // Cruzamos social_records con participants para obtener RUT y Nombre
      const { data, error } = await supabase
        .from('social_records')
        .select(`
          id,
          created_at,
          fecha_cierre,
          participants (
            rut,
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFichas(data || []);
    } catch (error) {
      console.error('Error al obtener fichas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-CL');
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Gestión de Fichas</h3>
          <p className="text-muted mb-0">Panel de administración exclusivo de la Coordinadora</p>
        </div>
        <Button 
          variant="primary" 
          style={{ backgroundColor: '#0d6efd', border: 'none' }}
          onClick={() => navigate('/dashboard/fichas/nueva-social')}
        >
          + Nueva Ficha
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="text-muted border-0 py-3 px-4">FECHA</th>
                <th className="text-muted border-0 py-3">RUT</th>
                <th className="text-muted border-0 py-3">PARTICIPANTE</th>
                <th className="text-muted border-0 py-3">TIPO</th>
                <th className="text-muted border-0 py-3">ESTADO</th>
                <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <p className="text-muted mt-2 mb-0">Cargando registros...</p>
                  </td>
                </tr>
              ) : fichas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No hay fichas registradas.
                  </td>
                </tr>
              ) : (
                fichas.map((ficha) => (
                  <tr key={ficha.id}>
                    <td className="px-4">{formatearFecha(ficha.created_at)}</td>
                    <td className="fw-medium">{ficha.participants?.rut || 'Sin RUT'}</td>
                    <td>{ficha.participants?.nombre || 'Desconocido'}</td>
                    <td>
                      <Badge bg="info" text="dark" className="bg-opacity-25 border border-info">
                        Social
                      </Badge>
                    </td>
                    <td>
                      {ficha.fecha_cierre ? (
                        <Badge bg="secondary">Cerrado</Badge>
                      ) : (
                        <Badge bg="success">Activo</Badge>
                      )}
                    </td>
                    <td className="px-4 text-end">
                      <Button variant="outline-secondary" size="sm" className="me-2">
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListaFichas;