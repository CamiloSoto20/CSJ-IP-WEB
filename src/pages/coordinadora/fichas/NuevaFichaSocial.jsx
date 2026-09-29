import { useState } from 'react';
import { Container, Card, Form, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const NuevaFichaSocial = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // I. Identificación
    nombre: '', rut: '', fechaNacimiento: '', direccion: '', 
    sistemaSalud: '', sistemaPrevisional: '', correo: '', celular: '', 
    nacionalidad: '', etnia: '',
    // II. Motivo
    lineaAtencion: '', viaDerivacion: '', materiaEspecifica: '', asesoramiento: '',
    creacionDocumento: '', otroMotivo: '', compromisoUsuario: '', compromisoProfesional: '', observacion: '',
    // III. Seguimiento
    llamadasCantidad: '', llamadasFechas: '', llamadasResultado: '',
    visitasCantidad: '', visitasFechas: '', visitasResultado: '',
    teamsCantidad: '', teamsFechas: '', teamsResultado: '',
    // IV. Cierre
    lugarDerivacion: '', causaCierre: '', profesionalDeriva: '', fechaCierre: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // 1. Verificar si el participante existe o crearlo
      let { data: participante } = await supabase
        .from('participants')
        .select('id')
        .eq('rut', formData.rut)
        .maybeSingle();

      if (!participante) {
        const { data: nuevoPart, error: errPart } = await supabase
          .from('participants')
          .insert([{ 
            rut: formData.rut, 
            nombre: formData.nombre, 
            fecha_nacimiento: formData.fechaNacimiento,
            direccion: formData.direccion,
            correo: formData.correo,
            telefono: formData.celular,
            nacionalidad: formData.nacionalidad 
          }])
          .select().single();
          
        if (errPart) throw errPart;
        participante = nuevoPart;
      }

      // 2. Insertar la Ficha Social
      const { error: errFicha } = await supabase
        .from('social_records')
        .insert([{
          participant_id: participante.id,
          professional_id: user?.id,
          linea_atencion: formData.lineaAtencion,
          via_derivacion: formData.viaDerivacion,
          materia_especifica: formData.materiaEspecifica,
          asesoramiento: formData.asesoramiento,
          creacion_documento: formData.creacionDocumento,
          otro_motivo: formData.otroMotivo,
          compromiso_usuario: formData.compromisoUsuario,
          compromiso_profesional: formData.compromisoProfesional,
          observacion: formData.observacion,
          llamadas_cantidad: formData.llamadasCantidad,
          llamadas_fechas: formData.llamadasFechas,
          llamadas_resultado: formData.llamadasResultado,
          visitas_cantidad: formData.visitasCantidad,
          visitas_fechas: formData.visitasFechas,
          visitas_resultado: formData.visitasResultado,
          teams_cantidad: formData.teamsCantidad,
          teams_fechas: formData.teamsFechas,
          teams_resultado: formData.teamsResultado,
          lugar_derivacion: formData.lugarDerivacion,
          causa_cierre: formData.causaCierre,
          profesional_deriva: formData.profesionalDeriva,
          fecha_cierre: formData.fechaCierre || null
        }]);

      if (errFicha) throw errFicha;

      alert('Ficha Social guardada exitosamente en la base de datos.');
      navigate('/dashboard/fichas');
      
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
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Ingreso Ficha Social</h3>
          <p className="text-muted mb-0">Formulario oficial de atención, seguimiento y cierre</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/dashboard/fichas')}>
          &larr; Volver a Fichas
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        
        {/* I. IDENTIFICACIÓN DE USUARIOS */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>I. Identificación del Usuario</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}><Form.Control name="nombre" placeholder="Nombre completo" onChange={handleChange} required /></Col>
              <Col md={3}><Form.Control name="rut" placeholder="Cédula de Identidad" onChange={handleChange} required /></Col>
              <Col md={3}>
                <Form.Control type="date" name="fechaNacimiento" onChange={handleChange} title="Fecha de Nacimiento" />
              </Col>
              <Col md={6}><Form.Control name="direccion" placeholder="Dirección completa" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="celular" placeholder="N° de Celular" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} /></Col>
              <Col md={3}>
                <Form.Select name="sistemaSalud" onChange={handleChange}>
                  <option value="">Sistema de Salud...</option>
                  <option value="Fonasa">Fonasa</option>
                  <option value="Isapre">Isapre</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>
              <Col md={3}><Form.Control name="sistemaPrevisional" placeholder="Sistema Previsional" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="nacionalidad" placeholder="Nacionalidad" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="etnia" placeholder="Etnia (Opcional)" onChange={handleChange} /></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. MOTIVO DE LA ATENCIÓN */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>II. Motivo de la Atención</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={4}><Form.Control name="lineaAtencion" placeholder="Línea de atención" onChange={handleChange} /></Col>
              <Col md={4}><Form.Control name="viaDerivacion" placeholder="Vía de derivación a la CSJ" onChange={handleChange} /></Col>
              <Col md={4}><Form.Control name="materiaEspecifica" placeholder="Materia específica" onChange={handleChange} /></Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col md={4}><Form.Control name="asesoramiento" placeholder="Detalle: Asesoramiento" onChange={handleChange} /></Col>
              <Col md={4}><Form.Control name="creacionDocumento" placeholder="Detalle: Creación de documento" onChange={handleChange} /></Col>
              <Col md={4}><Form.Control name="otroMotivo" placeholder="Detalle: Otro" onChange={handleChange} /></Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col md={6}><Form.Control as="textarea" rows={2} name="compromisoUsuario" placeholder="Compromiso del usuario" onChange={handleChange} /></Col>
              <Col md={6}><Form.Control as="textarea" rows={2} name="compromisoProfesional" placeholder="Compromiso del profesional" onChange={handleChange} /></Col>
            </Row>
            <Form.Control as="textarea" rows={2} name="observacion" placeholder="Observación general del profesional" onChange={handleChange} />
          </Card.Body>
        </Card>

        {/* III. SEGUIMIENTO Y GESTIONES */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>III. Seguimiento y Gestiones</h6>
          </Card.Header>
          <Card.Body>
            <div className="mb-3 p-3 bg-light rounded">
              <Form.Label className="small fw-bold text-muted">Llamado Telefónico</Form.Label>
              <Row className="g-2">
                <Col md={2}><Form.Control name="llamadasCantidad" placeholder="Cantidad" onChange={handleChange} /></Col>
                <Col md={3}><Form.Control name="llamadasFechas" placeholder="Fechas (ej. 10/10, 12/10)" onChange={handleChange} /></Col>
                <Col md={7}><Form.Control name="llamadasResultado" placeholder="Resultado obtenido" onChange={handleChange} /></Col>
              </Row>
            </div>
            <div className="mb-3 p-3 bg-light rounded">
              <Form.Label className="small fw-bold text-muted">Visita Domiciliaria</Form.Label>
              <Row className="g-2">
                <Col md={2}><Form.Control name="visitasCantidad" placeholder="Cantidad" onChange={handleChange} /></Col>
                <Col md={3}><Form.Control name="visitasFechas" placeholder="Fechas" onChange={handleChange} /></Col>
                <Col md={7}><Form.Control name="visitasResultado" placeholder="Resultado obtenido" onChange={handleChange} /></Col>
              </Row>
            </div>
            <div className="p-3 bg-light rounded">
              <Form.Label className="small fw-bold text-muted">Reunión por Teams</Form.Label>
              <Row className="g-2">
                <Col md={2}><Form.Control name="teamsCantidad" placeholder="Cantidad" onChange={handleChange} /></Col>
                <Col md={3}><Form.Control name="teamsFechas" placeholder="Fechas" onChange={handleChange} /></Col>
                <Col md={7}><Form.Control name="teamsResultado" placeholder="Resultado obtenido" onChange={handleChange} /></Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        {/* IV. CIERRE Y DERIVACIÓN */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>IV. Cierre y/o Derivación</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}><Form.Control name="lugarDerivacion" placeholder="Nombre del lugar de derivación" onChange={handleChange} /></Col>
              <Col md={6}><Form.Control name="profesionalDeriva" placeholder="Profesional donde deriva" onChange={handleChange} /></Col>
              <Col md={8}><Form.Control name="causaCierre" placeholder="Motivo y/o causa del cierre de la intervención" onChange={handleChange} /></Col>
              <Col md={4}><Form.Control type="date" name="fechaCierre" title="Fecha cierre de atención" onChange={handleChange} /></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* V. PROFESIONAL QUE ATIENDE */}
        <Card className="border-0 shadow-sm mb-4 bg-light">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted mb-1">Profesional que atiende</Form.Label>
                <Form.Control value="Nombre Coordinadora Sesión" disabled readOnly />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted mb-1">Cargo</Form.Label>
                <Form.Control value="Coordinadora" disabled readOnly />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* CONTROLES */}
        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate('/dashboard/fichas')}>Cancelar</Button>
          <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-principal, #006A38)', border: 'none' }} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Ficha Social'}
          </Button>
        </div>

      </Form>
    </Container>
  );
};

export default NuevaFichaSocial;