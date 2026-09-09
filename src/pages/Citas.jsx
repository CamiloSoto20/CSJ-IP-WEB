import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Dropdown, DropdownButton } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCitas = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('fecha_cita', { ascending: true })
        .order('hora_cita', { ascending: true });

      if (error) throw error;
      setCitas(data || []);
    } catch (error) {
      console.error("Error al cargar citas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ estado: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Actualizar la interfaz instantáneamente sin recargar
      setCitas(citas.map(cita => cita.id === id ? { ...cita, estado: newStatus } : cita));
    } catch (error) {
      console.error("Error al actualizar:", error.message);
      alert("Error al actualizar el estado de la cita.");
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'Confirmada': return 'primary';
      case 'Atendida': return 'success';
      case 'Cancelada': return 'danger';
      default: return 'warning';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('es-CL');
  };

  return (
    <div>
      <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }} className="mb-4">
        Gestión de Citas
      </h2>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Table responsive hover className="align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th>FECHA Y HORA</th>
                <th>PACIENTE (RUT)</th>
                <th>CONTACTO</th>
                <th>ESTADO</th>
                <th className="text-end">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td className="fw-bold text-secondary">
                    {formatDate(cita.fecha_cita)} <br />
                    <span className="text-muted small">⏰ {cita.hora_cita.substring(0, 5)} hrs</span>
                  </td>
                  <td>
                    {cita.nombre} <br />
                    <span className="text-muted small">{cita.rut}</span>
                  </td>
                  <td>
                    {cita.correo} <br />
                    <span className="text-muted small">📞 {cita.telefono}</span>
                  </td>
                  <td>
                    <Badge bg={getBadgeColor(cita.estado)} text={cita.estado === 'Pendiente' ? 'dark' : 'light'}>
                      {cita.estado}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <DropdownButton
                      variant="outline-secondary"
                      size="sm"
                      title="Cambiar estado"
                      onSelect={(newStatus) => handleStatusChange(cita.id, newStatus)}
                      align="end"
                    >
                      <Dropdown.Item eventKey="Pendiente" disabled={cita.estado === 'Pendiente'}>Pendiente</Dropdown.Item>
                      <Dropdown.Item eventKey="Confirmada" disabled={cita.estado === 'Confirmada'}>Confirmada</Dropdown.Item>
                      <Dropdown.Item eventKey="Cancelada" disabled={cita.estado === 'Cancelada'}>Cancelada</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item eventKey="Atendida" disabled={cita.estado === 'Atendida'}>Atendida</Dropdown.Item>
                    </DropdownButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {!loading && citas.length === 0 && (
          <div className="text-center text-muted py-4">
            No hay citas registradas en el sistema.
          </div>
        )}
      </div>
    </div>
  );
};

export default Citas;