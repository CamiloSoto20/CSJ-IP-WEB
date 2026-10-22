import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const AppointmentModal = ({ show, handleClose }) => {
  // 1. Obtener Fecha Actual local en formato YYYY-MM-DD
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
    return fechaLocal.toISOString().split('T')[0];
  };

  // 2. Obtener Hora Actual local en formato HH:MM
  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  const [fechaMinima, setFechaMinima] = useState(obtenerFechaActual());
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    telefono: '',
    correo: '',
    fecha_cita: obtenerFechaActual(),
    hora_cita: obtenerHoraActual(),
  });

  useEffect(() => {
    if (show) {
      const hoy = obtenerFechaActual();
      const ahora = obtenerHoraActual();
      setFechaMinima(hoy);
      setFormData((prev) => ({
        ...prev,
        fecha_cita: prev.fecha_cita || hoy,
        hora_cita: ahora
      }));
    }
  }, [show]);

  const formatRUT = (rut) => {
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    if (!cleanRut) return '';
    if (cleanRut.length <= 1) return cleanRut;
    
    const dv = cleanRut.slice(-1);
    const rutBody = cleanRut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${rutBody}-${dv}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rut') {
      setFormData({ ...formData, rut: formatRUT(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rut.length < 11) {
      alert('Por favor, ingrese un RUT válido completo.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('appointments').insert([
        {
          nombre: formData.nombre,
          rut: formData.rut,
          telefono: formData.telefono,
          correo: formData.correo, // <-- Incluido para cumplir con la restricción de la BD
          fecha_cita: formData.fecha_cita,
          hora_cita: formData.hora_cita,
          estado: 'Pendiente'
        }
      ]);

      if (error) throw error;

      alert('¡Solicitud de cita enviada con éxito! Nos pondremos en contacto pronto.');
      setFormData({
        nombre: '',
        rut: '',
        telefono: '',
        correo: '',
        fecha_cita: obtenerFechaActual(),
        hora_cita: obtenerHoraActual(),
      });
      handleClose();
    } catch (error) {
      console.error('Error al agendar cita:', error.message);
      alert('Hubo un error al agendar la cita: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ backgroundColor: 'var(--color-principal, #006A38)', color: 'white' }}>
        <Modal.Title className="fw-bold fs-5">📅 Agendar Cita de Atención</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              placeholder="Ej: Juan Pérez González"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Label className="fw-bold small text-muted">RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={handleChange}
                maxLength={12}
                required
              />
            </Col>

            <Col sm={6}>
              <Form.Label className="fw-bold small text-muted">Teléfono / Celular</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={handleChange}
                maxLength={15}
                required
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              placeholder="correo@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Label className="fw-bold small text-muted">Fecha de la Cita</Form.Label>
              <Form.Control
                type="date"
                name="fecha_cita"
                value={formData.fecha_cita}
                min={fechaMinima}
                onChange={handleChange}
                required
              />
            </Col>

            <Col sm={6}>
              <Form.Label className="fw-bold small text-muted">Hora Sugerida</Form.Label>
              <Form.Control
                type="time"
                name="hora_cita"
                value={formData.hora_cita}
                min={formData.fecha_cita === fechaMinima ? obtenerHoraActual() : undefined}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="fw-bold text-white px-4"
              style={{ backgroundColor: 'var(--color-principal, #006A38)', border: 'none' }}
              disabled={saving}
            >
              {saving ? <Spinner animation="border" size="sm" /> : 'Confirmar Cita'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentModal;