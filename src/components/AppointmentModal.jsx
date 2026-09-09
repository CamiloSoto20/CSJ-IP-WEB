import { useState } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const AppointmentModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    rut: '', nombre: '', correo: '', telefono: '', fecha_cita: '', hora_cita: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('appointments').insert([formData]);
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ rut: '', nombre: '', correo: '', telefono: '', fecha_cita: '', hora_cita: '' });
        handleClose();
      }, 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg('Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
          Agendar una cita
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {success ? (
          <Alert variant="success" className="text-center">
            ¡Tu solicitud ha sido enviada con éxito! Nos contactaremos contigo pronto.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            
            <h6 className="fw-bold mb-3 text-muted">Datos de Contacto</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">RUT</Form.Label>
                  <Form.Control name="rut" value={formData.rut} onChange={handleChange} placeholder="Ej: 12345678-9" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Nombre completo</Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Correo electrónico</Form.Label>
                  <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="ejemplo@correo.com" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Teléfono</Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678" required />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-muted">Preferencia de Horario</h6>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Fecha sugerida</Form.Label>
                  <Form.Control type="date" name="fecha_cita" value={formData.fecha_cita} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Hora sugerida</Form.Label>
                  <Form.Control type="time" name="hora_cita" value={formData.hora_cita} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2">
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Enviar solicitud de cita'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentModal;