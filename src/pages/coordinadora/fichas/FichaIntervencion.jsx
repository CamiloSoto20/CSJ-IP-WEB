import { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const FichaIntervencion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Perfil del creador de la ficha
  const [perfilActivo, setPerfilActivo] = useState({ nombre: 'Cargando...', rol: '...' });

  const rutaBase = location.pathname.includes('panel-estudiante') ? '/panel-estudiante/fichas' : '/dashboard/fichas';
  const fechaActual = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha: fechaActual,
    nombre: '', apellido: '', rut: '', fechaNacimiento: '', edad: '', direccion: '',
    sistemaSalud: '', sistemaPrevisional: '', correo: '', celular: '',
    nacionalidad: '', etnia: '', escolaridad: '', salud: '', situacionDiscapacidad: '',
    tipoVivienda: '', tenencia: '', estadoConservacion: '', material: '',
    luzElectrica: false, aguaPotable: false, alcantarillado: false, centroComunitario: '',
    sintesisDiagnostica: '', problemasDetectados: '', redFamiliar: '', redInstitucional: ''
  });

  const [grupoFamiliar, setGrupoFamiliar] = useState(
    Array(6).fill({ nombre: '', rut: '', estadoCivil: '', fechaNac: '', parentesco: '', escolaridad: '', ingreso: '', ocupacion: '' })
  );

  useEffect(() => {
    const fetchPerfil = async () => {
      if (user?.id) {
        const { data } = await supabase.from('perfiles').select('nombre, rol').eq('id', user.id).single();
        if (data) setPerfilActivo(data);
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
    const { name, value, type, checked } = e.target;
    if (name === 'rut') {
      setFormData({ ...formData, rut: formatRUT(value) });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleFamiliarChange = (index, campo, valor) => {
    const nuevosFamiliares = [...grupoFamiliar];
    nuevosFamiliares[index] = { ...nuevosFamiliares[index], [campo]: campo === 'rut' ? formatRUT(valor) : valor };
    setGrupoFamiliar(nuevosFamiliares);
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
      } else {
        await supabase.from('participants').update({ direccion: formData.direccion }).eq('id', participante.id);
      }

      const familiaresLlenos = grupoFamiliar.filter(f => f.nombre.trim() !== '');

      const { error: errFicha } = await supabase
        .from('intervencion_records')
        .insert([{
          participant_id: participante.id, professional_id: user?.id || null,
          fecha: formData.fecha, edad: formData.edad ? parseInt(formData.edad) : null,
          sistema_salud: formData.sistemaSalud, sistema_previsional: formData.sistemaPrevisional,
          escolaridad: formData.escolaridad, salud: formData.salud,
          situacion_discapacidad: formData.situacionDiscapacidad, grupo_familiar: familiaresLlenos,
          tipo_vivienda: formData.tipoVivienda, tenencia: formData.tenencia,
          estado_conservacion: formData.estadoConservacion, material: formData.material,
          luz_electrica: formData.luzElectrica, agua_potable: formData.aguaPotable,
          alcantarillado: formData.alcantarillado, centro_comunitario: formData.centroComunitario,
          sintesis_diagnostica: formData.sintesisDiagnostica, problemas_detectados: formData.problemasDetectados,
          red_familiar: formData.redFamiliar, red_institucional: formData.redInstitucional
        }]);

      if (errFicha) throw errFicha;

      alert('Ficha de Intervención guardada exitosamente.');
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
      <style>{`.form-control-minimal { border: none; border-radius: 0; border-bottom: 1px solid #dee2e6; background-color: transparent; padding: 0.35rem 0.5rem; font-size: 0.85rem; } .form-control-minimal:focus { box-shadow: none; border-bottom-color: var(--color-principal); } .table-grupo-familiar th { color: #495057; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }`}</style>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Ficha de Intervención</h3>
          <p className="text-muted mb-0">Documento de intervención y tratamiento social</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" onClick={() => navigate(rutaBase)}>&larr; Volver</Button>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* I. IDENTIFICACIÓN DEL USUARIO */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>I. Identificación del Usuario</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={5}><Form.Label className="small fw-bold text-muted">Nombres</Form.Label><Form.Control name="nombre" placeholder="Nombres" onChange={handleChange} required /></Col>
              <Col md={5}><Form.Label className="small fw-bold text-muted">Apellidos</Form.Label><Form.Control name="apellido" placeholder="Apellidos" onChange={handleChange} required /></Col>
              <Col md={2}>
                 <Form.Label className="small fw-bold text-muted">Fecha de Atención</Form.Label>
                 <Form.Control type="date" name="fecha" value={formData.fecha} readOnly className="fw-bold bg-light" />
              </Col>
              
              <Col md={3}><Form.Label className="small fw-bold text-muted">Cédula de Identidad</Form.Label><Form.Control name="rut" value={formData.rut} placeholder="12.345.678-9" onChange={handleChange} required maxLength={12} className="fw-bold"/></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Fecha Nacimiento</Form.Label><Form.Control type="date" name="fechaNacimiento" onChange={handleChange} /></Col>
              <Col md={2}><Form.Label className="small fw-bold text-muted">Edad</Form.Label><Form.Control type="number" name="edad" placeholder="Años" onChange={handleChange} /></Col>
              <Col md={4}><Form.Label className="small fw-bold text-muted">Dirección Completa</Form.Label><Form.Control name="direccion" placeholder="Calle, Número, Depto..." onChange={handleChange} /></Col>
              
              <Col md={3}><Form.Label className="small fw-bold text-muted">Sistema Salud</Form.Label><Form.Select name="sistemaSalud" onChange={handleChange}><option value="">Seleccione...</option><option value="Fonasa">Fonasa</option><option value="Isapre">Isapre</option><option value="Ninguno">Ninguno</option><option value="Otro">Otro</option></Form.Select></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Sistema Previsional</Form.Label><Form.Select name="sistemaPrevisional" onChange={handleChange}><option value="">Seleccione...</option><option value="AFP">AFP</option><option value="INP">INP / IPS</option><option value="Ninguno">Ninguno</option><option value="Otro">Otro</option></Form.Select></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Correo Electrónico (@gmail/@hotmail)</Form.Label><Form.Control type="email" name="correo" placeholder="ejemplo@gmail.com" onChange={handleChange} required/></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">N° Celular</Form.Label><Form.Control name="celular" placeholder="+56 9..." onChange={handleChange} /></Col>
              
              <Col md={3}><Form.Label className="small fw-bold text-muted">Nacionalidad</Form.Label><Form.Control name="nacionalidad" placeholder="Nacionalidad" onChange={handleChange} /></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Etnia</Form.Label><Form.Control name="etnia" placeholder="Opcional" onChange={handleChange} /></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Escolaridad</Form.Label><Form.Control name="escolaridad" placeholder="Nivel Educacional" onChange={handleChange} /></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Estado de Salud</Form.Label><Form.Control name="salud" placeholder="Enfermedades crónicas o relevantes" onChange={handleChange} /></Col>
              
              <Col md={12}><Form.Label className="small fw-bold text-muted">Situación de Discapacidad</Form.Label><Form.Control name="situacionDiscapacidad" placeholder="Indicar si posee" onChange={handleChange} /></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. IDENTIFICACIÓN DEL GRUPO FAMILIAR */}
        <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-3"><h6 className="fw-bold text-uppercase mb-0" style={{ color: 'var(--color-principal)' }}>II. Identificación del Grupo Familiar</h6></Card.Header>
          <Table responsive hover className="mb-0 align-middle table-grupo-familiar">
            <thead className="bg-light"><tr><th className="px-3 border-0">Nombre y Apellidos</th><th className="border-0" style={{ width: '140px' }}>C. Identidad</th><th className="border-0" style={{ width: '120px' }}>E. Civil</th><th className="border-0" style={{ width: '140px' }}>Fecha Nac.</th><th className="border-0" style={{ width: '130px' }}>Parentesco</th><th className="border-0" style={{ width: '140px' }}>Escolaridad</th><th className="border-0" style={{ width: '120px' }}>Ingreso</th><th className="px-3 border-0" style={{ width: '140px' }}>Ocupación</th></tr></thead>
            <tbody className="border-top-0">
              {grupoFamiliar.map((miembro, index) => (
                <tr key={index}>
                  <td className="px-3"><input className="form-control-minimal w-100" placeholder="Nombre completo" value={miembro.nombre} onChange={(e) => handleFamiliarChange(index, 'nombre', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100 fw-bold" placeholder="RUT" maxLength={12} value={miembro.rut} onChange={(e) => handleFamiliarChange(index, 'rut', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="E. Civil" value={miembro.estadoCivil} onChange={(e) => handleFamiliarChange(index, 'estadoCivil', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100 text-muted" type="date" value={miembro.fechaNac} onChange={(e) => handleFamiliarChange(index, 'fechaNac', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="Parentesco" value={miembro.parentesco} onChange={(e) => handleFamiliarChange(index, 'parentesco', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="Escolaridad" value={miembro.escolaridad} onChange={(e) => handleFamiliarChange(index, 'escolaridad', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="$" type="number" value={miembro.ingreso} onChange={(e) => handleFamiliarChange(index, 'ingreso', e.target.value)} /></td>
                  <td className="px-3"><input className="form-control-minimal w-100" placeholder="Ocupación" value={miembro.ocupacion} onChange={(e) => handleFamiliarChange(index, 'ocupacion', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* III. ANTECEDENTES HABITACIONALES */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0"><h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>III. Antecedentes Habitacionales</h6></Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}><Form.Label className="small fw-bold text-muted">Tipo Vivienda</Form.Label><Form.Control name="tipoVivienda" placeholder="Casa, Depto..." onChange={handleChange} /></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Tenencia</Form.Label><Form.Control name="tenencia" placeholder="Propia, Arrendada..." onChange={handleChange} /></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Estado Conservación</Form.Label><Form.Control name="estadoConservacion" placeholder="Bueno, Regular..." onChange={handleChange} /></Col>
              <Col md={3}><Form.Label className="small fw-bold text-muted">Material Principal</Form.Label><Form.Control name="material" placeholder="Sólido, Ligero..." onChange={handleChange} /></Col>
              
              <Col md={12} className="mt-4 p-3 bg-light rounded-3 border">
                <Form.Label className="small fw-bold text-muted d-block mb-3">Servicios Básicos Disponibles</Form.Label>
                <div className="d-flex flex-wrap gap-5">
                  <Form.Check type="switch" id="luz" name="luzElectrica" label="💡 Luz Eléctrica" onChange={handleChange} className="fw-medium" />
                  <Form.Check type="switch" id="agua" name="aguaPotable" label="🚰 Agua Potable" onChange={handleChange} className="fw-medium" />
                  <Form.Check type="switch" id="alcantarillado" name="alcantarillado" label="🚽 Alcantarillado" onChange={handleChange} className="fw-medium" />
                </div>
              </Col>
              
              <Col md={12} className="mt-3"><Form.Label className="small fw-bold text-muted">Centro Comunitario / Redes Cercanas</Form.Label><Form.Control name="centroComunitario" placeholder="Juntas de vecinos, consultorios..." onChange={handleChange} /></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* IV. SÍNTESIS DIAGNÓSTICA */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0"><h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>IV. Síntesis Diagnóstica</h6></Card.Header>
          <Card.Body>
            <Form.Label className="small fw-bold text-muted">Síntesis Diagnóstica</Form.Label>
            <Form.Control as="textarea" rows={4} name="sintesisDiagnostica" className="mb-3" placeholder="Redacte la síntesis del caso..." onChange={handleChange} />
            <Form.Label className="small fw-bold text-muted">Problema(s) Detectado(s)</Form.Label>
            <Form.Control as="textarea" rows={3} name="problemasDetectados" placeholder="Enumere o describa las problemáticas..." onChange={handleChange} />
          </Card.Body>
        </Card>

        {/* V. REDES DE APOYOS */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0"><h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>V. Redes de Apoyos</h6></Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}><Form.Label className="small fw-bold text-muted">Familiares</Form.Label><Form.Control as="textarea" rows={3} name="redFamiliar" placeholder="Apoyos dentro del núcleo o familia extendida..." onChange={handleChange} /></Col>
              <Col md={6}><Form.Label className="small fw-bold text-muted">Institucionales</Form.Label><Form.Control as="textarea" rows={3} name="redInstitucional" placeholder="Apoyos de instituciones, municipalidad, programas..." onChange={handleChange} /></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* IDENTIFICACIÓN FINAL DEL PROFESIONAL QUE ATIENDE */}
        <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body className="text-center py-4">
            <p className="text-muted small text-uppercase fw-bold mb-1">Identificación del Personal que Atiende</p>
            <h4 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{perfilActivo.nombre}</h4>
            <Badge bg="secondary" className="mt-2 text-capitalize px-3 py-2 fs-6">
              {perfilActivo.rol}
            </Badge>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate(rutaBase)}>Cancelar</Button>
          <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
            {saving ? 'Guardando BD...' : 'Guardar Ficha de Intervención'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default FichaIntervencion;