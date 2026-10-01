import { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const FichaRecopilacion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Fecha actual fija
  const fechaActual = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha: fechaActual,
    nombre: '', apellido: '', rut: '', fechaNacimiento: '', edad: '',
    sistemaSalud: '', sistemaPrevisional: '', correo: '', celular: '',
    nacionalidad: '', etnia: '', escolaridad: '', salud: '',
    tipoVivienda: '', tenencia: '', estadoConservacion: '', material: '',
    luzElectrica: false, aguaPotable: false, alcantarillado: false, centroComunitario: ''
  });

  const [grupoFamiliar, setGrupoFamiliar] = useState(
    Array(6).fill({ nombre: '', rut: '', estadoCivil: '', fechaNac: '', parentesco: '', escolaridad: '', ingreso: '', ocupacion: '' })
  );

  // Formateador de RUT Corregido (Aplica puntos en miles y guion final correctamente)
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
    nuevosFamiliares[index] = { 
      ...nuevosFamiliares[index], 
      [campo]: campo === 'rut' ? formatRUT(valor) : valor 
    };
    setGrupoFamiliar(nuevosFamiliares);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación estricta de correo electrónico
    if (formData.correo && !formData.correo.includes('@')) {
      alert('Por favor, ingrese un correo electrónico válido que contenga "@"');
      return;
    }

    setSaving(true);
    
    try {
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
            apellido: formData.apellido,
            fecha_nacimiento: formData.fechaNacimiento || null,
            correo: formData.correo, 
            telefono: formData.celular,
            nacionalidad: formData.nacionalidad 
          }])
          .select().single();
          
        if (errPart) throw errPart;
        participante = nuevoPart;
      }

      const familiaresLlenos = grupoFamiliar.filter(f => f.nombre.trim() !== '');

      const { error: errFicha } = await supabase
        .from('recopilacion_records')
        .insert([{
          participant_id: participante.id,
          professional_id: user?.id || null,
          fecha: formData.fecha,
          edad: formData.edad ? parseInt(formData.edad) : null,
          sistema_salud: formData.sistemaSalud,
          sistema_previsional: formData.sistemaPrevisional,
          escolaridad: formData.escolaridad,
          salud: formData.salud,
          grupo_familiar: familiaresLlenos,
          tipo_vivienda: formData.tipoVivienda,
          tenencia: formData.tenencia,
          estado_conservacion: formData.estadoConservacion,
          material: formData.material,
          luz_electrica: formData.luzElectrica,
          agua_potable: formData.aguaPotable,
          alcantarillado: formData.alcantarillado,
          centro_comunitario: formData.centroComunitario
        }]);

      if (errFicha) throw errFicha;

      alert('Ficha de Recopilación guardada exitosamente.');
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
      <style>
        {`
          .form-control-minimal {
            border: none;
            border-radius: 0;
            border-bottom: 1px solid #dee2e6;
            background-color: transparent;
            padding: 0.35rem 0.5rem;
            font-size: 0.85rem;
          }
          .form-control-minimal:focus {
            box-shadow: none;
            border-bottom-color: var(--color-principal);
          }
          .table-grupo-familiar th {
            color: #495057;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Ficha de Recopilación</h3>
          <p className="text-muted mb-0">Instrumento de recolección de datos socioeconómicos y familiares</p>
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
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>I. Identificación del Usuario</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">RUT</Form.Label>
                <Form.Control name="rut" value={formData.rut} placeholder="12.345.678-9" onChange={handleChange} required maxLength={12} className="fw-bold"/>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Nombres</Form.Label>
                <Form.Control name="nombre" placeholder="Nombres del usuario" onChange={handleChange} required />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Apellidos</Form.Label>
                <Form.Control name="apellido" placeholder="Apellidos del usuario" onChange={handleChange} required />
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Fecha Nacimiento</Form.Label>
                <Form.Control type="date" name="fechaNacimiento" onChange={handleChange} />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Edad</Form.Label>
                <Form.Control type="number" name="edad" placeholder="Años" onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Sistema de Salud</Form.Label>
                <Form.Select name="sistemaSalud" onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  <option value="Fonasa">Fonasa</option>
                  <option value="Isapre">Isapre</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Sistema Previsional</Form.Label>
                <Form.Select name="sistemaPrevisional" onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  <option value="AFP">AFP</option>
                  <option value="INP">INP / IPS</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Correo Electrónico</Form.Label>
                <Form.Control type="email" name="correo" placeholder="ejemplo@correo.com" onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">N° Celular</Form.Label>
                <Form.Control name="celular" placeholder="+56 9..." onChange={handleChange} />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Estado de Salud</Form.Label>
                <Form.Control name="salud" placeholder="Enfermedades crónicas o relevantes" onChange={handleChange} />
              </Col>

              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Nacionalidad</Form.Label>
                <Form.Control name="nacionalidad" placeholder="Nacionalidad" onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Etnia</Form.Label>
                <Form.Control name="etnia" placeholder="Opcional" onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Escolaridad</Form.Label>
                <Form.Control name="escolaridad" placeholder="Nivel educacional" onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. IDENTIFICACIÓN DEL GRUPO FAMILIAR */}
        <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-3">
            <h6 className="fw-bold text-uppercase mb-0" style={{ color: 'var(--color-principal)' }}>II. Identificación del Grupo Familiar</h6>
          </Card.Header>
          <Table responsive hover className="mb-0 align-middle table-grupo-familiar">
            <thead className="bg-light">
              <tr>
                <th className="px-3 border-0">Nombre y Apellidos</th>
                <th className="border-0" style={{ width: '140px' }}>C. Identidad</th>
                <th className="border-0" style={{ width: '120px' }}>E. Civil</th>
                <th className="border-0" style={{ width: '140px' }}>Fecha Nac.</th>
                <th className="border-0" style={{ width: '130px' }}>Parentesco</th>
                <th className="border-0" style={{ width: '140px' }}>Escolaridad</th>
                <th className="border-0" style={{ width: '120px' }}>Ingreso</th>
                <th className="px-3 border-0" style={{ width: '140px' }}>Ocupación</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {grupoFamiliar.map((miembro, index) => (
                <tr key={index}>
                  <td className="px-3"><input className="form-control-minimal w-100" placeholder="Nombre completo" value={miembro.nombre} onChange={(e) => handleFamiliarChange(index, 'nombre', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100 fw-bold" placeholder="RUT" maxLength={12} value={miembro.rut} onChange={(e) => handleFamiliarChange(index, 'rut', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="Soltero/a..." value={miembro.estadoCivil} onChange={(e) => handleFamiliarChange(index, 'estadoCivil', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100 text-muted" type="date" value={miembro.fechaNac} onChange={(e) => handleFamiliarChange(index, 'fechaNac', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="Hijo/a..." value={miembro.parentesco} onChange={(e) => handleFamiliarChange(index, 'parentesco', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="Básica..." value={miembro.escolaridad} onChange={(e) => handleFamiliarChange(index, 'escolaridad', e.target.value)} /></td>
                  <td><input className="form-control-minimal w-100" placeholder="$" type="number" value={miembro.ingreso} onChange={(e) => handleFamiliarChange(index, 'ingreso', e.target.value)} /></td>
                  <td className="px-3"><input className="form-control-minimal w-100" placeholder="Estudiante..." value={miembro.ocupacion} onChange={(e) => handleFamiliarChange(index, 'ocupacion', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* III. ANTECEDENTES HABITACIONALES */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>III. Antecedentes Habitacionales</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Tipo de Vivienda</Form.Label>
                <Form.Control name="tipoVivienda" placeholder="Casa, Depto..." onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Tenencia</Form.Label>
                <Form.Control name="tenencia" placeholder="Propia, Arrendada..." onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Estado Conservación</Form.Label>
                <Form.Control name="estadoConservacion" placeholder="Bueno, Regular..." onChange={handleChange} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Material Principal</Form.Label>
                <Form.Control name="material" placeholder="Sólido, Ligero..." onChange={handleChange} />
              </Col>
              
              <Col md={12} className="mt-4 p-3 bg-light rounded-3 border">
                <Form.Label className="small fw-bold text-muted d-block mb-3">Servicios Básicos Disponibles</Form.Label>
                <div className="d-flex flex-wrap gap-5">
                  <Form.Check type="switch" id="luz" name="luzElectrica" label="💡 Luz Eléctrica" onChange={handleChange} className="fw-medium" />
                  <Form.Check type="switch" id="agua" name="aguaPotable" label="🚰 Agua Potable" onChange={handleChange} className="fw-medium" />
                  <Form.Check type="switch" id="alcantarillado" name="alcantarillado" label="🚽 Alcantarillado" onChange={handleChange} className="fw-medium" />
                </div>
              </Col>
              
              <Col md={12} className="mt-3">
                <Form.Label className="small fw-bold text-muted">Centro Comunitario / Redes Cercanas</Form.Label>
                <Form.Control name="centroComunitario" placeholder="Juntas de vecinos, consultorios..." onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* CONTROLES */}
        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate('/dashboard/fichas')}>Cancelar</Button>
          <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
            {saving ? 'Guardando BD...' : 'Guardar Ficha de Recopilación'}
          </Button>
        </div>

      </Form>
    </Container>
  );
};

export default FichaRecopilacion;