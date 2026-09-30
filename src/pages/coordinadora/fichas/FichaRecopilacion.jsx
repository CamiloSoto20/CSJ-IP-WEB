import { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';

const FichaRecopilacion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

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

  const formatRUT = (rut) => {
    let value = rut.replace(/[^0-9kK]+/g, '').toUpperCase();
    if (value.length <= 1) return value;
    let result = value.slice(-1);
    value = value.slice(0, -1);
    while (value.length > 3) {
      result = '.' + value.slice(-3) + result;
      value = value.slice(0, -3);
    }
    return value + result.replace(/^/, value.length > 0 ? '.' : '').replace(/\.(?=[^.]*$)/, '-');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // 1. Verificar o crear el participante
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

      // 2. Limpiar el array de grupo familiar para no guardar filas vacías
      const familiaresLlenos = grupoFamiliar.filter(f => f.nombre.trim() !== '');

      // 3. Insertar la ficha en la nueva tabla segura
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
          grupo_familiar: familiaresLlenos, // Se guarda seguro como JSONB
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

      alert('Ficha de Recopilación guardada exitosamente en la Base de Datos.');
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
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Ficha de Recopilación de Información</h3>
          <p className="text-muted mb-0">Instrumento de recolección de datos socioeconómicos y familiares</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/dashboard/fichas')}>
          &larr; Volver a Fichas
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* I. IDENTIFICACIÓN DEL USUARIO */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>I. Identificación del Usuario</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={2}><Form.Control type="date" name="fecha" value={formData.fecha} readOnly title="Fecha Actual" className="bg-light fw-bold" /></Col>
              <Col md={3}><Form.Control name="rut" value={formData.rut} placeholder="RUT (Ej: 12.345.678-9)" onChange={handleChange} required maxLength={12}/></Col>
              <Col md={7}></Col>

              <Col md={4}><Form.Control name="nombre" placeholder="Nombres" onChange={handleChange} required /></Col>
              <Col md={4}><Form.Control name="apellido" placeholder="Apellidos" onChange={handleChange} required /></Col>
              <Col md={2}><Form.Control type="date" name="fechaNacimiento" onChange={handleChange} title="Fecha de Nacimiento" /></Col>
              <Col md={2}><Form.Control type="number" name="edad" placeholder="Edad" onChange={handleChange} /></Col>
              
              <Col md={3}>
                <Form.Select name="sistemaSalud" onChange={handleChange}>
                  <option value="">Sistema de Salud...</option>
                  <option value="Fonasa">Fonasa</option>
                  <option value="Isapre">Isapre</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select name="sistemaPrevisional" onChange={handleChange}>
                  <option value="">Sistema Previsional...</option>
                  <option value="AFP">AFP</option>
                  <option value="INP">INP / IPS</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>
              <Col md={3}><Form.Control type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="celular" placeholder="N° Celular" onChange={handleChange} /></Col>

              <Col md={3}><Form.Control name="nacionalidad" placeholder="Nacionalidad" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="etnia" placeholder="Etnia" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="escolaridad" placeholder="Escolaridad" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="salud" placeholder="Estado de Salud / Enfermedades" onChange={handleChange} /></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. IDENTIFICACIÓN DEL GRUPO FAMILIAR */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>II. Identificación del Grupo Familiar</h6>
          </Card.Header>
          <Card.Body className="p-0 mt-3">
            <Table responsive bordered hover className="mb-0 align-middle text-center small">
              <thead className="bg-light">
                <tr>
                  <th>Nombre y Apellidos</th>
                  <th style={{ width: '130px' }}>C. Identidad</th>
                  <th>E. Civil</th>
                  <th style={{ width: '130px' }}>Fecha Nac.</th>
                  <th>Parentesco</th>
                  <th>Escolaridad</th>
                  <th>Ingreso</th>
                  <th>Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {grupoFamiliar.map((miembro, index) => (
                  <tr key={index}>
                    <td><Form.Control size="sm" placeholder="Nombre" value={miembro.nombre} onChange={(e) => handleFamiliarChange(index, 'nombre', e.target.value)} /></td>
                    <td><Form.Control size="sm" placeholder="RUT" maxLength={12} value={miembro.rut} onChange={(e) => handleFamiliarChange(index, 'rut', e.target.value)} /></td>
                    <td><Form.Control size="sm" placeholder="E. Civil" value={miembro.estadoCivil} onChange={(e) => handleFamiliarChange(index, 'estadoCivil', e.target.value)} /></td>
                    <td><Form.Control size="sm" type="date" value={miembro.fechaNac} onChange={(e) => handleFamiliarChange(index, 'fechaNac', e.target.value)} /></td>
                    <td><Form.Control size="sm" placeholder="Parentesco" value={miembro.parentesco} onChange={(e) => handleFamiliarChange(index, 'parentesco', e.target.value)} /></td>
                    <td><Form.Control size="sm" placeholder="Escolaridad" value={miembro.escolaridad} onChange={(e) => handleFamiliarChange(index, 'escolaridad', e.target.value)} /></td>
                    <td><Form.Control size="sm" placeholder="$ Ingreso" type="number" value={miembro.ingreso} onChange={(e) => handleFamiliarChange(index, 'ingreso', e.target.value)} /></td>
                    <td><Form.Control size="sm" placeholder="Ocupación" value={miembro.ocupacion} onChange={(e) => handleFamiliarChange(index, 'ocupacion', e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* III. ANTECEDENTES HABITACIONALES */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal)' }}>III. Antecedentes Habitacionales</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}><Form.Control name="tipoVivienda" placeholder="Tipo de vivienda (Casa, Depto...)" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="tenencia" placeholder="Tenencia (Propia, Arrendada...)" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="estadoConservacion" placeholder="Estado de conservación (Bueno, Regular...)" onChange={handleChange} /></Col>
              <Col md={3}><Form.Control name="material" placeholder="Material principal" onChange={handleChange} /></Col>
              
              <Col md={12} className="mt-4">
                <Form.Label className="small fw-bold text-muted d-block mb-2">Servicios Básicos Disponibles:</Form.Label>
                <div className="d-flex gap-4">
                  <Form.Check type="switch" id="luz" name="luzElectrica" label="Luz Eléctrica" onChange={handleChange} />
                  <Form.Check type="switch" id="agua" name="aguaPotable" label="Agua Potable" onChange={handleChange} />
                  <Form.Check type="switch" id="alcantarillado" name="alcantarillado" label="Alcantarillado" onChange={handleChange} />
                </div>
              </Col>
              
              <Col md={6} className="mt-3">
                <Form.Control name="centroComunitario" placeholder="Centro Comunitario / Redes Cercanas" onChange={handleChange} />
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