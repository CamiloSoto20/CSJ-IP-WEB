import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Dropdown, DropdownButton, Card, Modal, Form, Button } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para reagendamiento
  const [showReagendar, setShowReagendar] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [savingReagendamiento, setSavingReagendamiento] = useState(false);

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
      setCitas(citas.map(cita => cita.id === id ? { ...cita, estado: newStatus } : cita));
    } catch (error) {
      console.error("Error al actualizar:", error.message);
      alert("Error al actualizar el estado de la cita.");
    }
  };

  const abrirReagendar = (cita) => {
    setCitaSeleccionada(cita);
    setNuevaFecha(cita.fecha_cita);
    setNuevaHora(cita.hora_cita);
    setShowReagendar(true);
  };

  const handleReagendarSubmit = async (e) => {
    e.preventDefault();
    setSavingReagendamiento(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          fecha_cita: nuevaFecha, 
          hora_cita: nuevaHora,
          estado: 'Confirmada' // Asumimos que al reagendar queda confirmada
        })
        .eq('id', citaSeleccionada.id);

      if (error) throw error;
      
      setCitas(citas.map(cita => 
        cita.id === citaSeleccionada.id 
          ? { ...cita, fecha_cita: nuevaFecha, hora_cita: nuevaHora, estado: 'Confirmada' } 
          : cita
      ));
      setShowReagendar(false);
    } catch (error) {
      alert("Error al reagendar la cita.");
    } finally {
      setSavingReagendamiento(false);
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'Confirmada': return 'primary';
      case 'Atendida': return 'success';
      case 'Cancelada': return 'danger';
      case 'Pendiente': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Gestión de Citas</h3>
          <p className="text-muted mb-0">Administración de solicitudes de atención</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2 mb-0">Cargando agenda...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA Y HORA</th>
                  <th className="text-muted border-0 py-3">PACIENTE (RUT)</th>
                  <th className="text-muted border-0 py-3">CONTACTO</th>
                  <th className="text-muted border-0 py-3">ESTADO</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id}>
                    <td className="px-4">
                      <span className="fw-bold d-block text-dark">{formatDate(cita.fecha_cita)}</span>
                      <span className="text-muted small">⏰ {cita.hora_cita?.substring(0, 5) || '--:--'} hrs</span>
                    </td>
                    <td>
                      <span className="fw-bold d-block">{cita.nombre}</span>
                      <span className="text-muted small">{cita.rut}</span>
                    </td>
                    <td>
                      <span className="d-block text-dark">{cita.correo}</span>
                      <span className="text-muted small">📞 {cita.telefono}</span>
                    </td>
                    <td>
                      <Badge bg={getBadgeColor(cita.estado)} text={cita.estado === 'Pendiente' ? 'dark' : 'light'} className="px-2 py-1">
                        {cita.estado}
                      </Badge>
                    </td>
                    <td className="px-4 text-end">
                      <DropdownButton
                        variant="outline-secondary"
                        size="sm"
                        title="Gestionar"
                        align="end"
                      >
                        <Dropdown.Item onClick={() => handleStatusChange(cita.id, 'Confirmada')} disabled={cita.estado === 'Confirmada'} className="text-primary">
                          Aprobar (Confirmar)
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => abrirReagendar(cita)}>
                          📅 Reagendar
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusChange(cita.id, 'Cancelada')} disabled={cita.estado === 'Cancelada'} className="text-danger">
                          Rechazar / Cancelar
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleStatusChange(cita.id, 'Atendida')} disabled={cita.estado === 'Atendida'} className="text-success fw-bold">
                          Marcar como Atendida
                        </Dropdown.Item>
                      </DropdownButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!loading && citas.length === 0 && (
            <div className="text-center text-muted py-5">
              No hay citas registradas en el sistema.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para Reagendar */}
      <Modal show={showReagendar} onHide={() => setShowReagendar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal, #006A38)' }}>Reagendar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReagendarSubmit}>
            <p className="text-muted small mb-3">Reagendando a <strong>{citaSeleccionada?.nombre}</strong></p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Nueva Fecha</Form.Label>
              <Form.Control type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small">Nueva Hora</Form.Label>
              <Form.Control type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} required />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowReagendar(false)} disabled={savingReagendamiento}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={savingReagendamiento}>
                {savingReagendamiento ? <Spinner size="sm" /> : 'Confirmar Nueva Fecha'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Citas;