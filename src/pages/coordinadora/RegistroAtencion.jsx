import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Form, Card, Modal, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const RegistroAtencion = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Estados para guardar temporalmente lo que se escriba en los campos manuales
  const [datosManuales, setDatosManuales] = useState({});

  // Estados para el Modal de llenado manual
  const [showModal, setShowModal] = useState(false);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);

  useEffect(() => {
    fetchAtenciones();
  }, []);

  const fetchAtenciones = async () => {
    try {
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

  const handleManualChange = (campo, valor) => {
    if (!fichaSeleccionada) return;
    setDatosManuales(prev => ({
      ...prev,
      [fichaSeleccionada.id]: {
        ...prev[fichaSeleccionada.id],
        [campo]: valor
      }
    }));
  };

  const abrirModalCompletar = (ficha) => {
    setFichaSeleccionada(ficha);
    setShowModal(true);
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-CL');
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edad--;
    }
    return edad;
  };

  const obtenerTipoServicio = (ficha) => {
    let servicios = [];
    if (ficha.asesoramiento === 'X') servicios.push('Asesoramiento');
    if (ficha.creacion_documento === 'X') servicios.push('Creación de Documento');
    if (ficha.otro_motivo && ficha.otro_motivo.trim() !== '') servicios.push(`Otro: ${ficha.otro_motivo}`);
    return servicios.length > 0 ? servicios.join(', ') : '';
  };

  const verificadorDatosCompletos = (id) => {
    const d = datosManuales[id];
    if (!d) return false;
    return (d.sexo !== '' && d.tiempoPromedio !== '' && d.numeroVeces !== '');
  };

  // NUEVA FUNCIÓN DE EXPORTACIÓN CON EXCELJS PARA CONSERVAR ESTILOS
  const exportarExcelDesdePlantilla = async () => {
    if (registros.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    setExporting(true);
    try {
      // 1. Descargamos la plantilla original de Excel con sus estilos
      const response = await fetch('/PLANTILLA_ATENCIONES.xlsx');
      if (!response.ok) throw new Error("No se pudo encontrar el archivo PLANTILLA_ATENCIONES.xlsx en la carpeta public.");

      const arrayBuffer = await response.arrayBuffer();

      // 2. Cargamos el archivo en ExcelJS preservando todo su diseño
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      // Seleccionamos la hoja correspondiente
      const worksheet = workbook.getWorksheet('REGISTRO DE ATENCIÓN') || workbook.worksheets[0];

      // Helper para autocompletar con "x" si está vacío
      const checkEmpty = (val) => {
        if (val === null || val === undefined || String(val).trim() === '' || val === '-' || val === 'NaN') {
          return 'x';
        }
        return val;
      };

      // 3. Inyectamos los datos a partir de la fila 2 (asumiendo que la fila 1 son los encabezados)
      let filaActual = 2;
      registros.forEach(ficha => {
        const nombreCompleto = `${ficha.participants?.nombre || ''} ${ficha.participants?.apellido || ''}`.trim();
        const manual = datosManuales[ficha.id] || {};

        // Obtenemos la fila para inyectar datos directamente en sus celdas (preservando estilos de columna)
        const row = worksheet.getRow(filaActual);

        row.getCell(1).value = checkEmpty(nombreCompleto);
        row.getCell(2).value = checkEmpty(calcularEdad(ficha.participants?.fecha_nacimiento));
        row.getCell(3).value = checkEmpty(manual.sexo);
        row.getCell(4).value = checkEmpty(ficha.participants?.telefono);
        row.getCell(5).value = checkEmpty(ficha.participants?.nacionalidad);
        row.getCell(6).value = checkEmpty(ficha.materia_especifica);
        row.getCell(7).value = checkEmpty(ficha.linea_atencion);
        row.getCell(8).value = checkEmpty(obtenerTipoServicio(ficha));
        row.getCell(9).value = checkEmpty(ficha.via_derivacion);
        row.getCell(10).value = checkEmpty(formatearFecha(ficha.fecha_creacion));
        row.getCell(11).value = checkEmpty(manual.tiempoPromedio);
        row.getCell(12).value = checkEmpty(manual.numeroVeces);
        row.getCell(13).value = checkEmpty(ficha.perfiles?.nombre);
        row.getCell(14).value = checkEmpty(manual.cartaCierre);
        row.getCell(15).value = checkEmpty(ficha.causa_cierre);
        row.getCell(16).value = checkEmpty(formatearFecha(ficha.fecha_cierre));
        row.getCell(17).value = checkEmpty(manual.encuesta);

        row.commit(); // Confirmamos los cambios en la fila
        filaActual++;
      });

      // 4. Generamos el buffer final y lo descargamos manteniendo todos los colores, tablas y logos intactos
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Registro_Atenciones_Lleno_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
      console.error("Error al exportar plantilla Excel:", error);
      alert("Hubo un error al generar el archivo. Verifica que 'PLANTILLA_ATENCIONES.xlsx' exista en tu carpeta public.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Base de Datos: Atenciones</h3>
          <p className="text-muted mb-0">Gestión limpia de registros y preparación para exportación a Excel</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="fw-bold" onClick={() => navigate(-1)}>
            &larr; Volver
          </Button>
          <Button variant="success" className="fw-bold shadow-sm d-flex align-items-center gap-2" onClick={exportarExcelDesdePlantilla} disabled={exporting}>
            {exporting ? <Spinner size="sm" /> : <span className="fs-5">📊</span>}
            Generar Excel
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2">Cargando registros...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0 border-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-muted small border-0">FECHA</th>
                  <th className="py-3 text-muted small border-0">PACIENTE</th>
                  <th className="py-3 text-muted small border-0">MOTIVO / MATERIA</th>
                  <th className="py-3 text-muted small border-0">RESPONSABLE</th>
                  <th className="py-3 text-muted small border-0 text-center">ESTADO EXCEL</th>
                  <th className="px-4 py-3 text-muted small border-0 text-end">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No hay registros de atención disponibles.</td>
                  </tr>
                ) : (
                  registros.map((ficha) => (
                    <tr key={ficha.id}>
                      <td className="px-4 text-secondary fw-medium">
                        {formatearFecha(ficha.fecha_creacion)}
                      </td>
                      <td>
                        <span className="fw-bold text-dark d-block">
                          {ficha.participants?.nombre} {ficha.participants?.apellido}
                        </span>
                        <span className="text-muted small">
                          RUT: {ficha.participants?.rut || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="d-block fw-medium text-dark">{ficha.materia_especifica || 'x'}</span>
                        <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                          {ficha.linea_atencion || 'x'}
                        </span>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {ficha.perfiles?.nombre || 'Usuario Desconocido'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {verificadorDatosCompletos(ficha.id) ? (
                          <Badge bg="success" className="px-3 py-2 rounded-pill">Listo para exportar</Badge>
                        ) : (
                          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">Faltan Datos</Badge>
                        )}
                      </td>
                      <td className="px-4 text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="fw-bold px-3 rounded-pill"
                          onClick={() => abrirModalCompletar(ficha)}
                        >
                          Rellenar Datos
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL ELEGANTE PARA COMPLETAR DATOS MANUALES */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa' }}>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal, #006A38)' }}>
            Preparar Datos para Excel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {fichaSeleccionada && (
            <>
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="fw-bold text-muted mb-1">Paciente seleccionado:</h6>
                <h4 className="fw-bold text-dark mb-0">
                  {fichaSeleccionada.participants?.nombre} {fichaSeleccionada.participants?.apellido}
                </h4>
                <p className="text-muted small mb-0">Rellenar los siguientes campos es opcional. Si los dejas vacíos, se colocará automáticamente una "x" en el Excel.</p>
              </div>

              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Sexo</Form.Label>
                      <Form.Select
                        value={datosManuales[fichaSeleccionada.id]?.sexo || ''}
                        onChange={(e) => handleManualChange('sexo', e.target.value)}
                      >
                        <option value="">- Seleccionar -</option>
                        <option value="M">Masculino (M)</option>
                        <option value="F">Femenino (F)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Tiempo Promedio de Atención</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: 45 min"
                        value={datosManuales[fichaSeleccionada.id]?.tiempoPromedio || ''}
                        onChange={(e) => handleManualChange('tiempoPromedio', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">N° de Veces Atendido</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Ej: 2"
                        value={datosManuales[fichaSeleccionada.id]?.numeroVeces || ''}
                        onChange={(e) => handleManualChange('numeroVeces', e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Carta de Cierre/Egreso</Form.Label>
                      <Form.Select
                        value={datosManuales[fichaSeleccionada.id]?.cartaCierre || ''}
                        onChange={(e) => handleManualChange('cartaCierre', e.target.value)}
                      >
                        <option value="">- Seleccionar -</option>
                        <option value="Entregada">Entregada</option>
                        <option value="No entregada">No entregada</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Encuesta de Satisfacción</Form.Label>
                      <Form.Select
                        value={datosManuales[fichaSeleccionada.id]?.encuesta || ''}
                        onChange={(e) => handleManualChange('encuesta', e.target.value)}
                      >
                        <option value="">- Seleccionar -</option>
                        <option value="Realizada">Realizada</option>
                        <option value="No realizada">No realizada</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button variant="success" className="fw-bold px-4 rounded-pill" onClick={() => setShowModal(false)}>
            Guardar y Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RegistroAtencion;