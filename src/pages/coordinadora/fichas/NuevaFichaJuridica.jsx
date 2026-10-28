import { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const NuevaFichaJuridica = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [perfilProfesional, setPerfilProfesional] = useState({ nombre: 'Cargando...', rol: '...' });

  // Ruteo dinámico para Coordinadora o Estudiante
  const rutaBase = location.pathname.includes('panel-estudiante') ? '/panel-estudiante/fichas' : '/dashboard/fichas';
  const fechaActual = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', rut: '', fechaNacimiento: '', edad: '',
    direccion: '', ciudadResidencia: '', correo: '', celular: '', nacionalidad: '',
    fecha: fechaActual, tiempoAtencion: '',
    motivoConsulta: '', asesoria: '', seguimiento: '',
    causalCierre: '', fechaCierre: ''
  });

  // Obtener datos del profesional para la firma
  useEffect(() => {
    const fetchPerfil = async () => {
      if (user?.id) {
        const { data } = await supabase.from('perfiles').select('nombre, rol').eq('id', user.id).single();
        if (data) setPerfilProfesional(data);
      }
    };
    fetchPerfil();
  }, [user]);

  // Formateador de RUT (12.345.678-9)
  const formatRUT = (rut) => {
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
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

  const validarCorreo = (correo) => {
    const regex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
    return regex.test(correo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.correo && !validarCorreo(formData.correo)) {
      alert('Por favor, ingrese un correo válido que sea de @gmail.com o @hotmail.com');
      return;
    }

    setSaving(true);
    
    try {
      // 1. Buscar o Crear Participante
      let { data: participante } = await supabase.from('participants').select('id').eq('rut', formData.rut).maybeSingle();

      if (!participante) {
        const { data: nuevoPart, error: errPart } = await supabase
          .from('participants')
          .insert([{ 
            rut: formData.rut, nombre: formData.nombre, apellido: formData.apellido,
            fecha_nacimiento: formData.fechaNacimiento || null, direccion: formData.direccion,
            correo: formData.correo, telefono: formData.celular, nacionalidad: formData.nacionalidad
          }]).select().single();
        if (errPart) throw errPart;
        participante = nuevoPart;
      }

      // 2. Insertar Ficha Jurídica
      const { error: errFicha } = await supabase
        .from('legal_records')
        .insert([{
          participant_id: participante.id,
          professional_id: user?.id || null,
          fecha: formData.fecha,
          tiempo_atencion: formData.tiempoAtencion,
          ciudad_residencia: formData.ciudadResidencia,
          motivo_consulta: formData.motivoConsulta,
          asesoria: formData.asesoria,
          seguimiento: formData.seguimiento,
          causal_cierre: formData.causalCierre,
          fecha_cierre: formData.fechaCierre || null
        }]);

      if (errFicha) throw errFicha;

      alert('Ficha de Atención Jurídica guardada exitosamente.');
      navigate(rutaBase);
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: '#0d6efd' }}>Reporte Atención Jurídica</h3>
          <p className="text-muted mb-0">Documento oficial de consulta y asesoría legal</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" onClick={() => navigate(rutaBase)}>
            &larr; Volver
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        
        {/* I. IDENTIFICACIÓN DEL USUARIO */}
        <Card className="border-0 shadow-sm mb-4 rounded-4 border-top border-4 border-primary">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase text-primary">I. Identificación del Usuario</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Nombres</Form.Label>
                <Form.Control name="nombre" placeholder="Nombres" onChange={handleChange} required />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Apellidos</Form.Label>
                <Form.Control name="apellido" placeholder="Apellidos" onChange={handleChange} required />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Fecha de Atención</Form.Label>
                <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Tiempo Aprox. Atención</Form.Label>
                <Form.Control name="tiempoAtencion" placeholder="Ej: 45 min" onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Cédula de Identidad</Form.Label>
                <Form.Control name="rut" value={formData.rut} placeholder="12.345.678-9" onChange={handleChange} required maxLength={12} className="fw-bold"/>
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Edad</Form.Label>
                <Form.Control type="number" name="edad" placeholder="Años" onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Dirección Completa</Form.Label>
                <Form.Control name="direccion" placeholder="Calle, Número, Depto..." onChange={handleChange} />
              </Col>
              
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Ciudad de Residencia</Form.Label>
                <Form.Control name="ciudadResidencia" placeholder="Comuna / Ciudad" onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Correo Electrónico</Form.Label>
                <Form.Control type="email" name="correo" placeholder="ejemplo@gmail.com" onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">N° Celular</Form.Label>
                <Form.Control name="celular" placeholder="+56 9..." onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Nacionalidad</Form.Label>
                <Form.Control name="nacionalidad" placeholder="Nacionalidad" onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. MOTIVO DE LA CONSULTA */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase text-primary">II. Motivo de la Consulta</h6>
          </Card.Header>
          <Card.Body>
            <Form.Control as="textarea" rows={4} name="motivoConsulta" placeholder="Describa detalladamente el motivo por el cual el usuario solicita atención jurídica..." onChange={handleChange} required />
          </Card.Body>
        </Card>

        {/* III. ASESORÍA */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase text-primary">III. Asesoría Otorgada</h6>
          </Card.Header>
          <Card.Body>
            <Form.Control as="textarea" rows={4} name="asesoria" placeholder="Indique la orientación, normativa legal aplicable y pasos a seguir explicados al usuario..." onChange={handleChange} required />
          </Card.Body>
        </Card>

        {/* IV. SEGUIMIENTO */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase text-primary">IV. Seguimiento</h6>
          </Card.Header>
          <Card.Body>
            <Form.Control as="textarea" rows={3} name="seguimiento" placeholder="Gestiones posteriores, derivaciones o próximas citaciones..." onChange={handleChange} />
          </Card.Body>
        </Card>

        {/* V. CIERRE DEL CASO Y FIRMA PROFESIONAL */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase text-primary">V. Cierre del Caso</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-4">
              <Col md={8}>
                <Form.Label className="small fw-bold text-muted">Causal de Cierre</Form.Label>
                <Form.Control as="textarea" rows={2} name="causalCierre" placeholder="Motivo por el cual se finaliza la atención..." onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Fecha de Cierre</Form.Label>
                <Form.Control type="date" name="fechaCierre" onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* IDENTIFICACIÓN FINAL DEL PROFESIONAL QUE ATIENDE */}
        <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body className="text-center py-4">
            <p className="text-muted small text-uppercase fw-bold mb-1">Identificación del Personal que Atiende</p>
            <h4 className="fw-bold mb-0 text-primary">{perfilProfesional.nombre}</h4>
            <Badge bg="secondary" className="mt-2 text-capitalize px-3 py-2 fs-6">
              {perfilProfesional.rol}
            </Badge>
          </Card.Body>
        </Card>

        {/* CONTROLES */}
        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate(rutaBase)}>Cancelar</Button>
          <Button type="submit" size="lg" variant="primary" className="border-0 fw-bold" disabled={saving}>
            {saving ? 'Guardando en BD...' : 'Guardar Ficha Jurídica'}
          </Button>
        </div>

      </Form>
    </Container>
  );
};

export default NuevaFichaJuridica;