import { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const FichaVisitaDomiciliaria = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [perfilProfesional, setPerfilProfesional] = useState({ nombre: 'Cargando...', rol: '...' });

  const fechaActual = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    nombre: '', fechaVisita: fechaActual, direccion: '', fechaNacimiento: '', 
    correo: '', celular: '', ocupacion: '', edad: '', rsh: '', 
    lugarVisita: '', quienSolicita: '',
    objetivo: '', problematicas: '', desarrollo: '', resultados: '', registroTexto: ''
  });

  const [participantes, setParticipantes] = useState(
    Array(4).fill({ nombre: '', cargo: '' })
  );

  const [archivo, setArchivo] = useState(null);

  // Obtener los datos del profesional que está llenando la ficha
  useEffect(() => {
    const fetchPerfil = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('perfiles')
          .select('nombre, rol')
          .eq('id', user.id)
          .single();
        if (data) setPerfilProfesional(data);
      }
    };
    fetchPerfil();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleParticipanteChange = (index, campo, valor) => {
    const nuevosParticipantes = [...participantes];
    nuevosParticipantes[index] = { ...nuevosParticipantes[index], [campo]: valor };
    setParticipantes(nuevosParticipantes);
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.correo && !formData.correo.includes('@')) {
      alert('Por favor, ingrese un correo electrónico válido que contenga "@"');
      return;
    }

    setSaving(true);
    
    // Simulación de guardado. Más adelante crearemos la tabla 'visitas_records' y el Storage para la imagen
    setTimeout(() => {
      console.log("Datos de la Visita:", formData);
      console.log("Participantes:", participantes.filter(p => p.nombre.trim() !== ''));
      console.log("Archivo Verificador:", archivo ? archivo.name : 'Sin archivo');
      
      alert('Ficha de Visita Domiciliaria guardada exitosamente (Simulación).');
      setSaving(false);
      navigate('/dashboard/fichas');
    }, 1500);
  };

  return (
    <Container fluid className="py-4">
      <style>
        {`
          .form-control-minimal { border: none; border-radius: 0; border-bottom: 1px solid #dee2e6; background-color: transparent; padding: 0.35rem 0.5rem; font-size: 0.85rem; }
          .form-control-minimal:focus { box-shadow: none; border-bottom-color: var(--color-principal); }
          .table-participantes th { color: #495057; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Ficha Reporte Visita Domiciliaria</h3>
          <p className="text-muted mb-0">Instrumento de registro e intervención en terreno</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Badge bg="light" text="dark" className="border px-3 py-2 fs-6">
            📅 Fecha: {new Date(fechaActual).toLocaleDateString('es-CL')}
          </Badge>
          <Button variant="outline-secondary" onClick={() => navigate('/dashboard/fichas')}>
            &larr; Volver
          </Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* I. IDENTIFICACIÓN DEL USUARIO */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>I. Identificación del Usuario y Visita</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Nombre Completo del Usuario</Form.Label>
                <Form.Control name="nombre" placeholder="Nombres y Apellidos" onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Fecha de la Visita</Form.Label>
                <Form.Control type="date" name="fechaVisita" value={formData.fechaVisita} onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Lugar de la Visita</Form.Label>
                <Form.Control name="lugarVisita" placeholder="Comuna / Sector" onChange={handleChange} />
              </Col>

              <Col md={8}>
                <Form.Label className="small fw-bold text-muted">Dirección Completa</Form.Label>
                <Form.Control name="direccion" placeholder="Calle, Número, Depto..." onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Quién Solicita la Visita</Form.Label>
                <Form.Control name="quienSolicita" placeholder="Tribunal, Usuario, CSJ..." onChange={handleChange} />
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Fecha Nacimiento</Form.Label>
                <Form.Control type="date" name="fechaNacimiento" onChange={handleChange} />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Edad</Form.Label>
                <Form.Control type="number" name="edad" placeholder="Años" onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Correo Electrónico</Form.Label>
                <Form.Control type="email" name="correo" placeholder="ejemplo@correo.com" onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">N° Celular</Form.Label>
                <Form.Control name="celular" placeholder="+56 9..." onChange={handleChange} />
              </Col>

              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Ocupación</Form.Label>
                <Form.Control name="ocupacion" placeholder="Profesión u oficio" onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Registro Social de Hogares (RSH) %</Form.Label>
                <Form.Control type="number" name="rsh" placeholder="Ej: 40" onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. OBJETIVO DE LA VISITA */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>II. Objetivo de la Visita</h6>
          </Card.Header>
          <Card.Body>
            <Form.Control as="textarea" rows={3} name="objetivo" placeholder="Describa el objetivo principal de la visita domiciliaria..." onChange={handleChange} required />
          </Card.Body>
        </Card>

        {/* III. PARTICIPANTES */}
        <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-3">
            <h6 className="fw-bold text-uppercase mb-0" style={{ color: 'var(--color-principal)' }}>III. Participantes de la Entrevista</h6>
          </Card.Header>
          <Table responsive hover className="mb-0 align-middle table-participantes">
            <thead className="bg-light">
              <tr>
                <th className="px-4 border-0 w-50">Nombre Completo</th>
                <th className="px-4 border-0 w-50">Cargo / Parentesco</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {participantes.map((participante, index) => (
                <tr key={index}>
                  <td className="px-4"><input className="form-control-minimal w-100" placeholder="Nombre de quien recibe la visita" value={participante.nombre} onChange={(e) => handleParticipanteChange(index, 'nombre', e.target.value)} /></td>
                  <td className="px-4"><input className="form-control-minimal w-100" placeholder="Ej: Entrevistado, Abuela, Profesional" value={participante.cargo} onChange={(e) => handleParticipanteChange(index, 'cargo', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* IV. DESARROLLO Y RESULTADOS */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>IV. Desarrollo y Conclusiones</h6>
          </Card.Header>
          <Card.Body>
            <Form.Label className="small fw-bold text-muted mt-2">Identificación de las Problemáticas</Form.Label>
            <Form.Control as="textarea" rows={3} name="problematicas" className="mb-3" placeholder="Detalle los problemas detectados en el terreno..." onChange={handleChange} />
            
            <Form.Label className="small fw-bold text-muted">Desarrollo de la Visita</Form.Label>
            <Form.Control as="textarea" rows={4} name="desarrollo" className="mb-3" placeholder="Relato de lo observado y conversado..." onChange={handleChange} />
            
            <Form.Label className="small fw-bold text-muted">Resultados y Compromisos</Form.Label>
            <Form.Control as="textarea" rows={3} name="resultados" placeholder="Acuerdos logrados, derivaciones o próximos pasos..." onChange={handleChange} />
          </Card.Body>
        </Card>

        {/* V. REGISTRO FOTOGRÁFICO / VERIFICADOR Y FIRMA */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>V. Registro Verificador y Cierre</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-4">
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">Registro Fotográfico / Documental (Opcional)</Form.Label>
                <Form.Control type="file" accept="image/*,.pdf" onChange={handleFileChange} className="mb-2" />
                <Form.Control name="registroTexto" placeholder="O describa el verificador (Ej: Se revisó libreta de familia...)" onChange={handleChange} />
              </Col>
              
              {/* FIRMA DEL PROFESIONAL */}
              <Col md={12} className="mt-4">
                <div className="p-4 bg-light rounded-3 border text-center mx-auto" style={{ maxWidth: '400px' }}>
                  <p className="text-muted small text-uppercase fw-bold mb-1">Registrado y Elaborado por</p>
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{perfilProfesional.nombre}</h5>
                  <Badge bg="secondary" className="mt-2 text-capitalize px-3 py-2">{perfilProfesional.rol}</Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* CONTROLES */}
        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate('/dashboard/fichas')}>Cancelar</Button>
          <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
            {saving ? 'Guardando Reporte...' : 'Guardar Visita Domiciliaria'}
          </Button>
        </div>

      </Form>
    </Container>
  );
};

export default FichaVisitaDomiciliaria;