import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Dropdown, DropdownButton, Card, Modal, Form, Button } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [showReagendar, setShowReagendar] = useState(false);
  const [showAsignar, setShowAsignar] = useState(false);
  
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  
  // Estados Reagendar
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  
  // Estados Asignación
  const [estudianteId, setEstudianteId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCitasYEstudiantes = async () => {
    try {
      const [citasRes, estRes] = await Promise.all([
        supabase.from('appointments').select('*, perfiles(nombre)').order('fecha_cita', { ascending: true }).order('hora_cita', { ascending: true }),
        supabase.from('perfiles').select('id, nombre').eq('rol', 'estudiante')
      ]);

      if (citasRes.error) throw citasRes.error;
      setCitas(citasRes.data || []);
      setEstudiantes(estRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitasYEstudiantes();

    const channel = supabase.channel('citas-coordinadora')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchCitasYEstudiantes();
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('appointments').update({ estado: newStatus }).eq('id', id);
      if (error) throw error;
      fetchCitasYEstudiantes();
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
    }
  };

  const abrirAsignar = (cita) => {
    setCitaSeleccionada(cita);
    setEstudianteId(cita.estudiante_id || '');
    setShowAsignar(true);
  };

  const handleAsignarSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('appointments')
        .update({ estudiante_id: estudianteId, estado: 'Confirmada' })
        .eq('id', citaSeleccionada.id);

      if (error) throw error;
      fetchCitasYEstudiantes();
      setShowAsignar(false);
    } catch (error) {
      alert("Error al asignar al estudiante.");
    } finally {
      setSaving(false);
    }
  };

  // NUEVO: Función para asignarse a sí misma
  const handleAsignarme = async (citaId) => {
    if (!window.confirm("¿Estás segura que deseas asignarte este caso a tu propia agenda?")) return;
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      
      const { error } = await supabase.from('appointments')
        .update({ estudiante_id: authData.user.id, estado: 'Confirmada' })
        .eq('id', citaId);

      if (error) throw error;
      alert("Cita asignada a tu agenda personal correctamente.");
      fetchCitasYEstudiantes();
    } catch (error) {
      alert("Error al asignarte la cita.");
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
    setSaving(true);
    try {
      const { error } = await supabase.from('appointments')
        .update({ fecha_cita: nuevaFecha, hora_cita: nuevaHora, estado: 'Confirmada' })
        .eq('id', citaSeleccionada.id);

      if (error) throw error;
      fetchCitasYEstudiantes();
      setShowReagendar(false);
    } catch (error) {
      alert("Error al reagendar la cita.");
    } finally {
      setSaving(false);
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
          <p className="text-muted mb-0">Recepción en vivo y derivación a estudiantes o a tu propia agenda</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA Y HORA</th>
                  <th className="text-muted border-0 py-3">USUARIO</th>
                  <th className="text-muted border-0 py-3">ASIGNACIÓN / DUEÑO</th>
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
                      <span className="text-muted small">📞 {cita.telefono} | {cita.rut}</span>
                    </td>
                    <td>
                      {cita.estudiante_id ? (
                        <Badge bg="info" text="dark" className="px-2 py-1 border border-info">
                          <span className="fw-bold">A cargo:</span> {cita.perfiles?.nombre}
                        </Badge>
                      ) : (
                        <Badge bg="warning" className="text-dark bg-opacity-25 border border-warning">
                          Libre en bolsa de citas
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={getBadgeColor(cita.estado)} text={cita.estado === 'Pendiente' ? 'dark' : 'light'} className="px-2 py-1">
                        {cita.estado}
                      </Badge>
                    </td>
                    <td className="px-4 text-end">
                      <DropdownButton variant="outline-secondary" size="sm" title="Gestionar" align="end">
                        <Dropdown.Item onClick={() => abrirAsignar(cita)} className="text-primary fw-bold">
                          👤 Asignar a Estudiante
                        </Dropdown.Item>
                        
                        {/* NUEVO BOTÓN: ASIGNARME A MÍ */}
                        <Dropdown.Item onClick={() => handleAsignarme(cita.id)} className="text-success fw-bold">
                          ✋ Asignarme a mí
                        </Dropdown.Item>

                        <Dropdown.Item onClick={() => abrirReagendar(cita)}>📅 Reagendar</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleStatusChange(cita.id, 'Cancelada')} disabled={cita.estado === 'Cancelada'} className="text-danger">
                          Cancelar Cita
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
        </Card.Body>
      </Card>

      {/* Modal Asignar Estudiante */}
      <Modal show={showAsignar} onHide={() => setShowAsignar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Asignar Caso a Estudiante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAsignarSubmit}>
            <p className="text-muted small mb-3">Usuario: <strong>{citaSeleccionada?.nombre}</strong></p>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small">Seleccione al practicante</Form.Label>
              <Form.Select value={estudianteId} onChange={(e) => setEstudianteId(e.target.value)} required>
                <option value="">-- Elegir estudiante --</option>
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="w-100 fw-bold text-white" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Confirmar Asignación'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Reagendar */}
      <Modal show={showReagendar} onHide={() => setShowReagendar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Reagendar Cita</Modal.Title>
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
            <Button type="submit" className="w-100 fw-bold text-white" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Confirmar Nueva Fecha'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Citas;