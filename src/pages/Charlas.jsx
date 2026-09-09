import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const Charlas = () => {
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharlas = async () => {
      try {
        const { data, error } = await supabase
          .from('talks')
          .select('*')
          .order('fecha', { ascending: true });

        if (error) throw error;
        setCharlas(data || []);
      } catch (error) {
        console.error("Error al cargar charlas:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCharlas();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Gestión de Charlas</h2>
        <Button style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }}>
          + Nueva Charla
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Table hover className="align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th>FECHA Y HORA</th>
                <th>TÍTULO</th>
                <th>CUPOS</th>
                <th>ESTADO</th>
                <th className="text-end">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {charlas.map((charla) => (
                <tr key={charla.id}>
                  <td className="fw-bold text-secondary">
                    {charla.fecha} <br />
                    <span className="text-muted small">⏰ {charla.hora.substring(0, 5)} hrs</span>
                  </td>
                  <td>{charla.titulo}</td>
                  <td>{charla.cupos_disponibles} / {charla.cupos_totales}</td>
                  <td>
                    <Badge bg={charla.estado === 'Disponible' ? 'success' : 'secondary'}>
                      {charla.estado}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button variant="outline-secondary" size="sm">Ver inscritos</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {!loading && charlas.length === 0 && (
          <div className="text-center text-muted py-4">
            No hay charlas registradas actualmente.
          </div>
        )}
      </div>
    </div>
  );
};

export default Charlas;