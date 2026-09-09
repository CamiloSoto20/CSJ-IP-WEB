import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Table, Button, Spinner, Badge } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const CharlaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charla, setCharla] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener detalles de la charla
        const { data: charlaData, error: charlaError } = await supabase
          .from('talks')
          .select('*')
          .eq('id', id)
          .single();

        if (charlaError) throw charlaError;
        setCharla(charlaData);

        // 2. Obtener los inscritos
        const { data: inscritosData, error: inscritosError } = await supabase
          .from('talk_registrations')
          .select('*')
          .eq('talk_id', id)
          .order('fecha_inscripcion', { ascending: true });

        if (inscritosError) throw inscritosError;
        setInscritos(inscritosData || []);
      } catch (error) {
        console.error("Error:", error.message);
        alert("Error al cargar los datos de la charla");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-5 text-center"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>;
  if (!charla) return <div className="p-5 text-center text-muted">Charla no encontrada</div>;

  return (
    <Container>
      <Button variant="link" className="text-decoration-none mb-3 px-0 text-secondary" onClick={() => navigate(-1)}>
        &larr; Volver a Charlas
      </Button>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>{charla.titulo}</h4>
              <p className="text-muted mb-0">📅 {charla.fecha} | ⏰ {charla.hora.substring(0, 5)} hrs | 📍 {charla.ubicacion}</p>
            </div>
            <Badge bg={charla.estado === 'Disponible' ? 'success' : 'secondary'}>{charla.estado}</Badge>
          </div>
          <p>{charla.descripcion}</p>
          <div className="p-3 rounded mt-3" style={{ backgroundColor: 'var(--color-fondo)' }}>
            <strong>Cupos:</strong> {charla.cupos_disponibles} disponibles de {charla.cupos_totales} totales.
          </div>
        </Card.Body>
      </Card>

      <h5 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }} className="mb-3">
        Lista de Inscritos ({inscritos.length})
      </h5>
      
      <div className="bg-white p-4 rounded shadow-sm border-0">
        {inscritos.length === 0 ? (
          <p className="text-muted text-center mb-0 py-3">Aún no hay personas inscritas en esta charla.</p>
        ) : (
          <Table responsive hover className="align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th>RUT</th>
                <th>NOMBRE</th>
                <th>CORREO</th>
                <th>TELÉFONO</th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((persona) => (
                <tr key={persona.id}>
                  <td className="fw-bold text-secondary">{persona.rut}</td>
                  <td>{persona.nombre}</td>
                  <td>{persona.correo}</td>
                  <td>{persona.telefono}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default CharlaDetalle;