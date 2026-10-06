import { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const FichaVisitaDomiciliaria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [perfilProfesional, setPerfilProfesional] = useState({ nombre: 'Cargando...', rol: '...' });

  const rutaBase = location.pathname.includes('panel-estudiante') ? '/panel-estudiante/fichas' : '/dashboard/fichas';
  const fechaActual = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', rut: '', fechaVisita: fechaActual, direccion: '', fechaNacimiento: '', 
    correo: '', celular: '', ocupacion: '', edad: '', rsh: '', 
    lugarVisita: '', quienSolicita: '',
    objetivo: '', problematicas: '', desarrollo: '', resultados: '', registroTexto: ''
  });

  const [participantes, setParticipantes] = useState(
    Array(4).fill({ nombre: '', cargo: '' })
  );

  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      if (user?.id) {
        const { data } = await supabase.from('perfiles').select('nombre, rol').eq('id', user.id).single();
        if (data) setPerfilProfesional(data);
      }
    };
    fetchPerfil();
  }, [user]);

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

  const handleParticipanteChange = (index, campo, valor) => {
    const nuevosParticipantes = [...participantes];
    nuevosParticipantes[index] = { ...nuevosParticipantes[index], [campo]: valor };
    setParticipantes(nuevosParticipantes);
  };

  const handleFileChange = (e) => setArchivo(e.target.files[0]);

  const validarCorreo = (correo) => {
    const regex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
    return regex.test(correo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.correo && !validarCorreo(formData.correo)) {
      alert('Por favor, ingrese un correo electrónico válido (@gmail.com o @hotmail.com)');
      return;
    }
    setSaving(true);
    
    try {
      let { data: participante } = await supabase.from('participants').select('id').eq('rut', formData.rut).maybeSingle();

      if (!participante) {
        const { data: nuevoPart, error: errPart } = await supabase
          .from('participants')
          .insert([{ 
            rut: formData.rut, nombre: formData.nombre, apellido: formData.apellido,
            fecha_nacimiento: formData.fechaNacimiento || null, direccion: formData.direccion,
            correo: formData.correo, telefono: formData.celular
          }]).select().single();
        if (errPart) throw errPart;
        participante = nuevoPart;
      } else {
         await supabase.from('participants').update({ direccion: formData.direccion }).eq('id', participante.id);
      }

      let archivoUrl = null;
      if (archivo) {
        const fileExt = archivo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('evidencias').upload(`visitas/${fileName}`, archivo);
        if (!uploadError) {
          const { data } = supabase.storage.from('evidencias').getPublicUrl(`visitas/${fileName}`);
          archivoUrl = data.publicUrl;
        }
      }

      const participantesValidos = participantes.filter(p => p.nombre.trim() !== '');

      const { error: errVisita } = await supabase
        .from('visitas_records')
        .insert([{
          participant_id: participante.id, professional_id: user?.id || null,
          fecha_visita: formData.fechaVisita, lugar_visita: formData.lugarVisita,
          quien_solicita: formData.quienSolicita, ocupacion: formData.ocupacion,
          rsh: formData.rsh ? parseInt(formData.rsh) : null, objetivo: formData.objetivo,
          participantes: participantesValidos, problematicas: formData.problematicas,
          desarrollo: formData.desarrollo, resultados: formData.resultados,
          registro_texto: formData.registroTexto, registro_archivo_url: archivoUrl
        }]);

      if (errVisita) throw errVisita;

      alert('Ficha de Visita Domiciliaria guardada exitosamente.');
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
      <style>{`.form-control-minimal { border: none; border-radius: 0; border-bottom: 1px solid #dee2e6; background-color: transparent; padding: 0.35rem 0.5rem; font-size: 0.85rem; } .form-control-minimal:focus { box-shadow: none; border-bottom-color: var(--color-principal); } .table-participantes th { color: #495057; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }`}</style>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Ficha Reporte Visita Domiciliaria</h3>
          <p className="text-muted mb-0">Instrumento de registro e intervención en terreno</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" onClick={() => navigate(rutaBase)}>&larr; Volver</Button>
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
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Nombres</Form.Label>
                <Form.Control name="nombre" placeholder="Nombres" onChange={handleChange} required />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Apellidos</Form.Label>
                <Form.Control name="apellido" placeholder="Apellidos" onChange={handleChange} required />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Fecha de la Visita</Form.Label>
                <Form.Control type="date" name="fechaVisita" value={formData.fechaVisita} readOnly className="bg-light fw-bold" />
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">RUT</Form.Label>
                <Form.Control name="rut" value={formData.rut} placeholder="12.345.678-9" onChange={handleChange} required maxLength={12} className="fw-bold"/>
              </Col>
              <Col md={9}>
                <Form.Label className="small fw-bold text-muted">Dirección Completa</Form.Label>
                <Form.Control name="direccion" placeholder="Calle, Número, Depto..." onChange={handleChange} required/>
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Fecha Nacimiento</Form.Label>
                <Form.Control type="date" name="fechaNacimiento" onChange={handleChange} />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Correo Electrónico (@gmail/@hotmail)</Form.Label>
                <Form.Control type="email" name="correo" placeholder="ejemplo@gmail.com" onChange={handleChange} required/>
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">N° Celular</Form.Label>
                <Form.Control name="celular" placeholder="+56 9..." onChange={handleChange} />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Edad</Form.Label>
                <Form.Control type="number" name="edad" placeholder="Años" onChange={handleChange} />
              </Col>

              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Ocupación</Form.Label>
                <Form.Control name="ocupacion" placeholder="Profesión u oficio" onChange={handleChange} />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">RSH %</Form.Label>
                <Form.Control type="number" name="rsh" placeholder="Ej: 40" onChange={handleChange} />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Lugar de la Visita</Form.Label>
                <Form.Control name="lugarVisita" placeholder="Comuna / Sector" onChange={handleChange} />
              </Col>

              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">Quién Solicita la Visita</Form.Label>
                <Form.Control name="quienSolicita" placeholder="Tribunal, Usuario, CSJ..." onChange={handleChange} />
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

        {/* V. REGISTRO FOTOGRÁFICO / VERIFICADOR */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>V. Registro Verificador</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-4">
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">Registro Fotográfico / Documental (Opcional)</Form.Label>
                <Form.Control type="file" accept="image/*,.pdf" onChange={handleFileChange} className="mb-2" />
                <Form.Control name="registroTexto" placeholder="O describa el verificador (Ej: Se revisó libreta de familia...)" onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* FIRMA DEL PROFESIONAL */}
        <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
           <Card.Body className="text-center py-4">
              <p className="text-muted small text-uppercase fw-bold mb-1">Registrado y Elaborado por</p>
              <h4 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{perfilProfesional.nombre}</h4>
              <Badge bg="secondary" className="mt-2 text-capitalize px-3 py-2 fs-6">{perfilProfesional.rol}</Badge>
           </Card.Body>
        </Card>

        {/* CONTROLES */}
        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate(rutaBase)}>Cancelar</Button>
          <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
            {saving ? 'Guardando Reporte en BD...' : 'Guardar Visita Domiciliaria'}
          </Button>
        </div>

      </Form>
    </Container>
  );
};

export default FichaVisitaDomiciliaria;