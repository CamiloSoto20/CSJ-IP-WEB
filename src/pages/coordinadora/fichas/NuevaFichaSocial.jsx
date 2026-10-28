import { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Accordion, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const NuevaFichaSocial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // ID de la ficha si estamos editando
  const { user } = useAuth();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id); // Cargando si hay ID en la URL
  
  // Perfil del creador original, estudiante activo y lista para co-atención
  const [perfilActivo, setPerfilActivo] = useState({ nombre: 'Cargando...', rol: '...' });
  const [estudiantes, setEstudiantes] = useState([]);
  const [coEstudianteId, setCoEstudianteId] = useState('');

  const rutaBase = location.pathname.includes('panel-estudiante') ? '/panel-estudiante/fichas' : '/dashboard/fichas';
  const fechaActual = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fecha: fechaActual, 
    nombre: '', apellido: '', rut: '', fechaNacimiento: '', edad: '', direccion: '', 
    sistemaSalud: '', sistemaPrevisional: '', correo: '', celular: '', 
    nacionalidad: '', etnia: '',
    lineaAtencion: '', viaDerivacion: '', materiaEspecifica: '', asesoramiento: '',
    creacionDocumento: '', otroMotivo: '', compromisoUsuario: '', compromisoProfesional: '', observacion: '',
    llamadasCantidad: '', llamadasFechas: '', llamadasResultado: '',
    visitasCantidad: '', visitasFechas: '', visitasResultado: '',
    teamsCantidad: '', teamsFechas: '', teamsResultado: '',
    lugarDerivacion: '', causaCierre: '', profesionalDeriva: '', fechaCierre: ''
  });

  // 1. Cargar el perfil del profesional activo y la lista de estudiantes
  useEffect(() => {
    const fetchDatosBase = async () => {
      if (user?.id) {
        const { data: perfilData } = await supabase.from('perfiles').select('nombre, rol').eq('id', user.id).single();
        if (perfilData) setPerfilActivo(perfilData);
      }
      
      try {
        const { data: estData } = await supabase.from('perfiles').select('id, nombre, rol').order('nombre');
        if (estData) setEstudiantes(estData);
      } catch (error) {
        console.error("Error al cargar lista de estudiantes:", error.message);
      }
    };
    fetchDatosBase();
  }, [user]);

  // 2. Cargar los datos de la ficha si estamos en modo edición
  useEffect(() => {
    const fetchFichaExistente = async () => {
      if (!id) return;
      try {
        const { data: fichaData, error: fichaError } = await supabase
          .from('social_records')
          .select('*, participants(*)')
          .eq('id', id)
          .single();

        if (fichaError) throw fichaError;

        if (fichaData) {
          const p = fichaData.participants || {};
          
          // Establecer el co-estudiante si existía
          if (fichaData.co_estudiante_id) {
            setCoEstudianteId(fichaData.co_estudiante_id);
          }

          setFormData({
            ...formData, 
            fecha: fichaData.fecha_creacion || fechaActual, 
            nombre: p.nombre || '',
            apellido: p.apellido || '',
            rut: p.rut || '',
            fechaNacimiento: p.fecha_nacimiento || '',
            direccion: p.direccion || '',
            correo: p.correo || '',
            celular: p.telefono || '',
            nacionalidad: p.nacionalidad || '',
            
            lineaAtencion: fichaData.linea_atencion || '',
            viaDerivacion: fichaData.via_derivacion || '',
            materiaEspecifica: fichaData.materia_especifica || '',
            asesoramiento: fichaData.asesoramiento || '',
            creacionDocumento: fichaData.creacion_documento || '',
            otroMotivo: fichaData.otro_motivo || '',
            compromisoUsuario: fichaData.compromiso_usuario || '',
            compromisoProfesional: fichaData.compromiso_profesional || '',
            observacion: fichaData.observacion || '',
            llamadasCantidad: fichaData.llamadas_cantidad || '',
            llamadasFechas: fichaData.llamadas_fechas || '',
            llamadasResultado: fichaData.llamadas_resultado || '',
            visitasCantidad: fichaData.visitas_cantidad || '',
            visitasFechas: fichaData.visitas_fechas || '',
            visitasResultado: fichaData.visitas_resultado || '',
            teamsCantidad: fichaData.teams_cantidad || '',
            teamsFechas: fichaData.teams_fechas || '',
            teamsResultado: fichaData.teams_resultado || '',
            lugarDerivacion: fichaData.lugar_derivacion || '',
            causaCierre: fichaData.causa_cierre || '',
            profesionalDeriva: fichaData.profesional_deriva || '',
            fechaCierre: fichaData.fecha_cierre || ''
          });
        }
      } catch (error) {
        console.error("Error al cargar la ficha:", error.message);
        alert("No se pudo cargar la información de la ficha para editar.");
        navigate(rutaBase);
      } finally {
        setLoading(false);
      }
    };

    fetchFichaExistente();
  }, [id]);

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
      let { data: participante } = await supabase
        .from('participants')
        .select('id')
        .eq('rut', formData.rut)
        .maybeSingle();

      if (!participante) {
        const { data: nuevoPart, error: errPart } = await supabase
          .from('participants')
          .insert([{ 
            rut: formData.rut, nombre: formData.nombre, apellido: formData.apellido,
            fecha_nacimiento: formData.fechaNacimiento || null, direccion: formData.direccion, 
            correo: formData.correo, telefono: formData.celular, nacionalidad: formData.nacionalidad 
          }])
          .select().single();
        if (errPart) throw errPart;
        participante = nuevoPart;
      } else {
          await supabase.from('participants').update({
              nombre: formData.nombre, apellido: formData.apellido,
              fecha_nacimiento: formData.fechaNacimiento || null, direccion: formData.direccion, 
              correo: formData.correo, telefono: formData.celular, nacionalidad: formData.nacionalidad 
          }).eq('id', participante.id);
      }

      const payloadFicha = {
        participant_id: participante.id,
        co_estudiante_id: coEstudianteId || null, // <--- NUEVO CAMPO DE CO-ATENCIÓN AÑADIDO
        linea_atencion: formData.lineaAtencion, via_derivacion: formData.viaDerivacion,
        materia_especifica: formData.materiaEspecifica, asesoramiento: formData.asesoramiento,
        creacion_documento: formData.creacionDocumento, otro_motivo: formData.otroMotivo,
        compromiso_usuario: formData.compromisoUsuario, compromiso_profesional: formData.compromisoProfesional,
        observacion: formData.observacion, llamadas_cantidad: formData.llamadasCantidad,
        llamadas_fechas: formData.llamadasFechas, llamadas_resultado: formData.llamadasResultado,
        visitas_cantidad: formData.visitasCantidad, visitas_fechas: formData.visitasFechas,
        visitas_resultado: formData.visitasResultado, teams_cantidad: formData.teamsCantidad,
        teams_fechas: formData.teamsFechas, teams_resultado: formData.teamsResultado,
        lugar_derivacion: formData.lugarDerivacion, causa_cierre: formData.causaCierre,
        profesional_deriva: formData.profesionalDeriva, fecha_cierre: formData.fechaCierre || null
      };

      if (id) {
          const { error: errUpdate } = await supabase
            .from('social_records')
            .update(payloadFicha)
            .eq('id', id);
          if (errUpdate) throw errUpdate;
          alert('Ficha Social actualizada exitosamente.');
      } else {
          payloadFicha.professional_id = user?.id || null; 
          const { error: errInsert } = await supabase
            .from('social_records')
            .insert([payloadFicha]);
          if (errInsert) throw errInsert;
          alert('Ficha Social guardada exitosamente.');
      }

      navigate(rutaBase);
      
    } catch (error) {
      console.error(error);
      alert('Error al procesar la ficha: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="success" />
        <span className="ms-3 fw-bold text-muted">Cargando datos de la ficha...</span>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>
             {id ? 'Editar Ficha Social' : 'Ficha de Atención Social'}
          </h3>
          <p className="text-muted mb-0">{id ? 'Actualice la información del caso' : 'Formulario oficial de atención, seguimiento y cierre'}</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(rutaBase)}>
          &larr; Volver
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* I. Identificación del Usuario */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>I. Identificación del Usuario</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Nombres</Form.Label>
                <Form.Control name="nombre" placeholder="Nombres del usuario" value={formData.nombre} onChange={handleChange} required />
              </Col>
              <Col md={5}>
                <Form.Label className="small fw-bold text-muted">Apellidos</Form.Label>
                <Form.Control name="apellido" placeholder="Apellidos del usuario" value={formData.apellido} onChange={handleChange} required />
              </Col>
              
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Fecha de Atención</Form.Label>
                <Form.Control type="date" name="fecha" value={formData.fecha} readOnly className="fw-bold bg-light" />
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Cédula de Identidad</Form.Label>
                <Form.Control name="rut" value={formData.rut} placeholder="12.345.678-9" onChange={handleChange} required maxLength={12} className="fw-bold" disabled={!!id} title={id ? "El RUT no se puede modificar" : ""}/>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Fecha Nacimiento</Form.Label>
                <Form.Control type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
              </Col>
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Edad</Form.Label>
                <Form.Control type="number" name="edad" placeholder="Años" value={formData.edad} onChange={handleChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Dirección Completa</Form.Label>
                <Form.Control name="direccion" placeholder="Calle, Número, Comuna..." value={formData.direccion} onChange={handleChange} />
              </Col>

              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Sistema de Salud</Form.Label>
                <Form.Select name="sistemaSalud" value={formData.sistemaSalud} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  <option value="Fonasa">Fonasa</option>
                  <option value="Isapre">Isapre</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Sistema Previsional</Form.Label>
                <Form.Select name="sistemaPrevisional" value={formData.sistemaPrevisional} onChange={handleChange}>
                  <option value="">Seleccione...</option>
                  <option value="AFP">AFP</option>
                  <option value="INP">INP / IPS</option>
                  <option value="Ninguno">Ninguno</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Correo Electrónico (@gmail/@hotmail)</Form.Label>
                <Form.Control type="email" name="correo" placeholder="ejemplo@gmail.com" value={formData.correo} onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">N° Celular</Form.Label>
                <Form.Control name="celular" placeholder="+56 9..." value={formData.celular} onChange={handleChange} />
              </Col>

              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Nacionalidad</Form.Label>
                <Form.Control name="nacionalidad" placeholder="Nacionalidad" value={formData.nacionalidad} onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Etnia (Opcional)</Form.Label>
                <Form.Control name="etnia" placeholder="Etnia" value={formData.etnia} onChange={handleChange} />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* II. Motivo de la Atención */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
            <h6 className="fw-bold text-uppercase" style={{ color: 'var(--color-principal, #006A38)' }}>II. Motivo de la Atención</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={4}><Form.Label className="small fw-bold text-muted">Línea de Atención</Form.Label><Form.Control name="lineaAtencion" placeholder="Especifique" value={formData.lineaAtencion} onChange={handleChange} /></Col>
              <Col md={4}><Form.Label className="small fw-bold text-muted">Vía de Derivación a la CSJ</Form.Label><Form.Control name="viaDerivacion" placeholder="Especifique" value={formData.viaDerivacion} onChange={handleChange} /></Col>
              <Col md={4}><Form.Label className="small fw-bold text-muted">Materia Específica</Form.Label><Form.Control name="materiaEspecifica" placeholder="Especifique" value={formData.materiaEspecifica} onChange={handleChange} /></Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col md={4}><Form.Label className="small fw-bold text-muted">Asesoramiento</Form.Label><Form.Control name="asesoramiento" placeholder="Detalle" value={formData.asesoramiento} onChange={handleChange} /></Col>
              <Col md={4}><Form.Label className="small fw-bold text-muted">Creación de Documento</Form.Label><Form.Control name="creacionDocumento" placeholder="Detalle" value={formData.creacionDocumento} onChange={handleChange} /></Col>
              <Col md={4}><Form.Label className="small fw-bold text-muted">Otro Motivo</Form.Label><Form.Control name="otroMotivo" placeholder="Detalle" value={formData.otroMotivo} onChange={handleChange} /></Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col md={6}><Form.Label className="small fw-bold text-muted">Compromiso del Usuario</Form.Label><Form.Control as="textarea" rows={3} name="compromisoUsuario" placeholder="Acuerdos..." value={formData.compromisoUsuario} onChange={handleChange} /></Col>
              <Col md={6}><Form.Label className="small fw-bold text-muted">Compromiso del Profesional</Form.Label><Form.Control as="textarea" rows={3} name="compromisoProfesional" placeholder="Acuerdos..." value={formData.compromisoProfesional} onChange={handleChange} /></Col>
            </Row>
            <Form.Label className="small fw-bold text-muted">Observación General</Form.Label>
            <Form.Control as="textarea" rows={3} name="observacion" placeholder="Comentarios adicionales del profesional" value={formData.observacion} onChange={handleChange} />
          </Card.Body>
        </Card>

        {/* III y IV - Seguimientos y Cierres */}
        <Accordion className="mb-4 shadow-sm" alwaysOpen defaultActiveKey={id ? ['0', '1'] : []}>
          <Accordion.Item eventKey="0" className="border-0 rounded-4 mb-3">
            <Accordion.Header><h6 className="fw-bold text-uppercase mb-0" style={{ color: 'var(--color-principal, #006A38)' }}>III. Seguimiento y Gestiones (Opcional)</h6></Accordion.Header>
            <Accordion.Body className="bg-white">
              <div className="mb-3 p-3 bg-light rounded border"><Form.Label className="small fw-bold text-muted">Llamado Telefónico</Form.Label><Row className="g-2"><Col md={2}><Form.Control name="llamadasCantidad" placeholder="Cantidad" value={formData.llamadasCantidad} onChange={handleChange} /></Col><Col md={3}><Form.Control name="llamadasFechas" placeholder="Fechas (ej. 10/10)" value={formData.llamadasFechas} onChange={handleChange} /></Col><Col md={7}><Form.Control name="llamadasResultado" placeholder="Resultado obtenido" value={formData.llamadasResultado} onChange={handleChange} /></Col></Row></div>
              <div className="mb-3 p-3 bg-light rounded border"><Form.Label className="small fw-bold text-muted">Visita Domiciliaria</Form.Label><Row className="g-2"><Col md={2}><Form.Control name="visitasCantidad" placeholder="Cantidad" value={formData.visitasCantidad} onChange={handleChange} /></Col><Col md={3}><Form.Control name="visitasFechas" placeholder="Fechas" value={formData.visitasFechas} onChange={handleChange} /></Col><Col md={7}><Form.Control name="visitasResultado" placeholder="Resultado obtenido" value={formData.visitasResultado} onChange={handleChange} /></Col></Row></div>
              <div className="p-3 bg-light rounded border"><Form.Label className="small fw-bold text-muted">Reunión por Teams</Form.Label><Row className="g-2"><Col md={2}><Form.Control name="teamsCantidad" placeholder="Cantidad" value={formData.teamsCantidad} onChange={handleChange} /></Col><Col md={3}><Form.Control name="teamsFechas" placeholder="Fechas" value={formData.teamsFechas} onChange={handleChange} /></Col><Col md={7}><Form.Control name="teamsResultado" placeholder="Resultado obtenido" value={formData.teamsResultado} onChange={handleChange} /></Col></Row></div>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className="border-0 rounded-4">
            <Accordion.Header><h6 className="fw-bold text-uppercase mb-0" style={{ color: 'var(--color-principal, #006A38)' }}>IV. Cierre y/o Derivación (Solo al finalizar caso)</h6></Accordion.Header>
            <Accordion.Body className="bg-white">
              <Row className="g-3">
                <Col md={6}><Form.Label className="small fw-bold text-muted">Lugar de Derivación</Form.Label><Form.Control name="lugarDerivacion" placeholder="Especifique institución o lugar" value={formData.lugarDerivacion} onChange={handleChange} /></Col>
                <Col md={6}><Form.Label className="small fw-bold text-muted">Profesional que Deriva</Form.Label><Form.Control name="profesionalDeriva" placeholder="Nombre del profesional" value={formData.profesionalDeriva} onChange={handleChange} /></Col>
                <Col md={8}><Form.Label className="small fw-bold text-muted">Causa de Cierre</Form.Label><Form.Control name="causaCierre" placeholder="Motivo y/o causa del cierre de la intervención" value={formData.causaCierre} onChange={handleChange} /></Col>
                <Col md={4}><Form.Label className="small fw-bold text-muted">Fecha de Cierre</Form.Label><Form.Control type="date" name="fechaCierre" title="Fecha cierre de atención" value={formData.fechaCierre} onChange={handleChange} /></Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* IDENTIFICACIÓN FINAL DEL PROFESIONAL Y CO-ATENCIÓN */}
        <Card className="border-0 shadow-sm mb-4 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
          <Card.Body className="text-center py-4">
            <p className="text-muted small text-uppercase fw-bold mb-1">
              {id ? 'Última modificación por' : 'Identificación del Personal que Atiende'}
            </p>
            <h4 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>{perfilActivo.nombre}</h4>
            <Badge bg="secondary" className="mt-2 text-capitalize px-3 py-2 fs-6 mb-4">
              {perfilActivo.rol}
            </Badge>

            {/* SELECCIÓN DE CO-ATENCIÓN */}
            <div className="mx-auto text-start" style={{ maxWidth: '400px' }}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted text-uppercase">Atendido con (Opcional)</Form.Label>
                <Form.Select 
                  value={coEstudianteId} 
                  onChange={(e) => setCoEstudianteId(e.target.value)}
                  className="shadow-sm border-0"
                >
                  <option value="">Nadie (Atención individual)</option>
                  {estudiantes.filter(e => e.id !== user?.id).map(est => (
                    <option key={est.id} value={est.id}>{est.nombre} - {est.rol}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </Card.Body>
        </Card>

        {/* CONTROLES */}
        <div className="d-flex justify-content-end gap-3 pb-5">
          <Button variant="outline-secondary" size="lg" onClick={() => navigate(rutaBase)}>Cancelar</Button>
          <Button type="submit" size="lg" style={{ backgroundColor: 'var(--color-principal, #006A38)', border: 'none' }} disabled={saving}>
            {saving ? 'Guardando BD...' : (id ? 'Actualizar Ficha Social' : 'Guardar Ficha Social')}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default NuevaFichaSocial;