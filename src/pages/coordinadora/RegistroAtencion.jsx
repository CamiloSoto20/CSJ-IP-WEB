import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Form, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

const RegistroAtencion = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para guardar temporalmente lo que se escriba en los campos manuales
  const [datosManuales, setDatosManuales] = useState({});

  useEffect(() => {
    fetchAtenciones();
  }, []);

  const fetchAtenciones = async () => {
    try {
      // 1. Extraemos los datos exactos de la Ficha Social, el Paciente y el Profesional
      const { data, error } = await supabase
        .from('social_records')
        .select(`
          id, 
          fecha_creacion, 
          linea_atencion, 
          asesoramiento, 
          creacion_documento, 
          otro_motivo, 
          via_derivacion, 
          materia_especifica, 
          causa_cierre, 
          fecha_cierre,
          participants (nombre, apellido, rut, fecha_nacimiento, telefono, nacionalidad),
          perfiles!professional_id (nombre)
        `)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      // 2. Preparamos las casillas manuales para cada fila encontrada
      const manualesInit = {};
      data.forEach(item => {
        manualesInit[item.id] = {
          sexo: '',
          tiempoPromedio: '',
          numeroVeces: '',
          cartaCierre: '',
          encuesta: ''
        };
      });
      setDatosManuales(manualesInit);
      setRegistros(data || []);

    } catch (error) {
      console.error("Error al obtener registros de atención:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar lo que el usuario escribe en las cajitas manuales
  const handleManualChange = (id, campo, valor) => {
    setDatosManuales(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }));
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-CL');
  };

  // Calcula la edad automáticamente usando la fecha de nacimiento de la ficha
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad;
  };

  // Detecta cuál fue el servicio prestado basado en si tiene la 'X' o texto
  const obtenerTipoServicio = (ficha) => {
    let servicios = [];
    if (ficha.asesoramiento === 'X') servicios.push('Asesoramiento');
    if (ficha.creacion_documento === 'X') servicios.push('Creación de Documento');
    if (ficha.otro_motivo && ficha.otro_motivo.trim() !== '') servicios.push(`Otro: ${ficha.otro_motivo}`);
    return servicios.length > 0 ? servicios.join(', ') : 'No especificado';
  };

  const exportarAExcel = () => {
    if (registros.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // 3. Cruzamos los datos automáticos con los manuales para armar el Excel
    const dataAExportar = registros.map(ficha => ({
      'NOMBRES Y APELLIDOS DEL USUARIO/A': `${ficha.participants?.nombre || ''} ${ficha.participants?.apellido || ''}`.trim(),
      'EDAD': calcularEdad(ficha.participants?.fecha_nacimiento),
      'SEXO': datosManuales[ficha.id]?.sexo || '-',
      'TELEFONO': ficha.participants?.telefono || '',
      'NACIONALIDAD': ficha.participants?.nacionalidad || '',
      'MATERIA DE ATENCIÓN': ficha.materia_especifica || '',
      'MOTIVO DE LA ATENCIÓN': ficha.linea_atencion || '',
      'TIPO DE SERVICIO PRESTADO': obtenerTipoServicio(ficha),
      'LUGAR DE DERIVACIÓN': ficha.via_derivacion || '',
      'FECHA DE ATENCIÓN': formatearFecha(ficha.fecha_creacion),
      'TIEMPO PROMEDIO DE ATENCIÓN': datosManuales[ficha.id]?.tiempoPromedio || '',
      'NÚMERO DE VECES QUE FUE ATENDIDO': datosManuales[ficha.id]?.numeroVeces || '',
      'RESPONSABLE DE LA ATENCIÓN': ficha.perfiles?.nombre || '',
      'CARTA DE CIERRE/EGRESO': datosManuales[ficha.id]?.cartaCierre || '',
      'MOTIVO DE CIERRE/EGRESO': ficha.causa_cierre || '',
      'FECHA DE CIERRE/EGRESO': formatearFecha(ficha.fecha_cierre),
      'ENCUESTA DE SATISFACCIÓN': datosManuales[ficha.id]?.encuesta || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataAExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "REGISTRO DE ATENCIÓN");
    XLSX.writeFile(workbook, `Registro_Atencion_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Registro de Atención</h3>
          <p className="text-muted mb-0">Base de datos de Atenciones Sociales con rellenado automático</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-success" className="fw-bold shadow-sm" onClick={exportarAExcel}>
            <span>📊</span> Exportar a Excel
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            &larr; Volver
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Table bordered hover className="align-middle mb-0" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                <thead className="bg-light sticky-top">
                  <tr>
                    <th className="bg-light">NOMBRES Y APELLIDOS</th>
                    <th className="bg-light">EDAD</th>
                    <th className="bg-light" style={{ minWidth: '100px' }}>SEXO (Man.)</th>
                    <th className="bg-light">TELEFONO</th>
                    <th className="bg-light">NACIONALIDAD</th>
                    <th className="bg-light">MATERIA DE ATENCIÓN</th>
                    <th className="bg-light">MOTIVO DE ATENCIÓN</th>
                    <th className="bg-light">TIPO DE SERVICIO</th>
                    <th className="bg-light">LUGAR DERIVACIÓN</th>
                    <th className="bg-light">FECHA ATENCIÓN</th>
                    <th className="bg-light" style={{ minWidth: '150px' }}>TIEMPO PROMEDIO (Man.)</th>
                    <th className="bg-light" style={{ minWidth: '150px' }}>N° VECES (Man.)</th>
                    <th className="bg-light">RESPONSABLE</th>
                    <th className="bg-light" style={{ minWidth: '150px' }}>CARTA CIERRE (Man.)</th>
                    <th className="bg-light">MOTIVO CIERRE</th>
                    <th className="bg-light">FECHA CIERRE</th>
                    <th className="bg-light" style={{ minWidth: '150px' }}>ENCUESTA (Man.)</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length === 0 ? (
                    <tr>
                      <td colSpan="17" className="text-center py-4 text-muted">No hay registros de atención disponibles.</td>
                    </tr>
                  ) : (
                    registros.map((ficha) => (
                      <tr key={ficha.id}>
                        {/* 1. AUTO-RELLENADO DESDE SUPABASE */}
                        <td className="fw-bold">{ficha.participants?.nombre} {ficha.participants?.apellido}</td>
                        <td>{calcularEdad(ficha.participants?.fecha_nacimiento)}</td>
                        
                        {/* MANUAL: Sexo */}
                        <td>
                          <Form.Select size="sm" 
                            value={datosManuales[ficha.id]?.sexo || ''} 
                            onChange={(e) => handleManualChange(ficha.id, 'sexo', e.target.value)}
                          >
                            <option value="">-</option>
                            <option value="M">M</option>
                            <option value="F">F</option>
                          </Form.Select>
                        </td>

                        {/* AUTO-RELLENADO */}
                        <td>{ficha.participants?.telefono || '-'}</td>
                        <td>{ficha.participants?.nacionalidad || '-'}</td>
                        <td>{ficha.materia_especifica || '-'}</td>
                        <td>{ficha.linea_atencion || '-'}</td>
                        <td className="fw-medium text-primary">{obtenerTipoServicio(ficha)}</td>
                        <td>{ficha.via_derivacion || '-'}</td>
                        <td>{formatearFecha(ficha.fecha_creacion)}</td>
                        
                        {/* MANUAL: Tiempo Promedio */}
                        <td>
                          <Form.Control size="sm" type="text" placeholder="Ej. 45 min" 
                            value={datosManuales[ficha.id]?.tiempoPromedio || ''} 
                            onChange={(e) => handleManualChange(ficha.id, 'tiempoPromedio', e.target.value)} 
                          />
                        </td>
                        
                        {/* MANUAL: N° de veces */}
                        <td>
                          <Form.Control size="sm" type="number" placeholder="Ej. 2" 
                            value={datosManuales[ficha.id]?.numeroVeces || ''} 
                            onChange={(e) => handleManualChange(ficha.id, 'numeroVeces', e.target.value)} 
                          />
                        </td>

                        {/* AUTO-RELLENADO */}
                        <td>{ficha.perfiles?.nombre || '-'}</td>

                        {/* MANUAL: Carta Cierre */}
                        <td>
                          <Form.Control size="sm" type="text" placeholder="null / entregada" 
                            value={datosManuales[ficha.id]?.cartaCierre || ''} 
                            onChange={(e) => handleManualChange(ficha.id, 'cartaCierre', e.target.value)} 
                          />
                        </td>

                        {/* AUTO-RELLENADO */}
                        <td>{ficha.causa_cierre || '-'}</td>
                        <td>{formatearFecha(ficha.fecha_cierre)}</td>

                        {/* MANUAL: Encuesta */}
                        <td>
                          <Form.Select size="sm" 
                            value={datosManuales[ficha.id]?.encuesta || ''} 
                            onChange={(e) => handleManualChange(ficha.id, 'encuesta', e.target.value)}
                          >
                            <option value="">Seleccione...</option>
                            <option value="Realizada">Realizada</option>
                            <option value="No realizada">No realizada</option>
                          </Form.Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegistroAtencion;