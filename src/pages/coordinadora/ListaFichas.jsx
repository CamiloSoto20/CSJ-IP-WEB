import { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card, Modal, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

const ListaFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [fichasFiltradas, setFichasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showTiposFicha, setShowTiposFicha] = useState(false);
  
  // Estados para Filtros
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [ordenFecha, setOrdenFecha] = useState('desc'); // 'desc' o 'asc'
  
  const navigate = useNavigate();

  const fetchFichas = async () => {
    try {
      const [socialesRes, juridicasRes, recopilacionRes, visitasRes, intervencionRes] = await Promise.all([
        supabase.from('social_records').select('id, fecha_creacion, fecha_cierre, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('legal_records').select('id, created_at, fecha_cierre, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('recopilacion_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('visitas_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)'),
        supabase.from('intervencion_records').select('id, created_at, participants(rut, nombre, apellido), perfiles(nombre, rol)')
      ]);

      if (socialesRes.error) console.error('Error sociales:', socialesRes.error.message);
      if (juridicasRes.error) console.error('Error jurídicas:', juridicasRes.error.message);
      if (recopilacionRes.error) console.error('Error recopilación:', recopilacionRes.error.message);
      if (visitasRes.error) console.error('Error visitas:', visitasRes.error.message);
      if (intervencionRes.error) console.error('Error intervención:', intervencionRes.error.message);

      const formatearData = (data, area, tipoEspecifico, campoFecha) => {
        return (data || []).map(item => ({
          ...item,
          area,
          tipoEspecifico,
          fecha_registro: item[campoFecha], 
          timestamp: new Date(item[campoFecha] || 0).getTime()
        }));
      };

      const combinadas = [
        ...formatearData(socialesRes.data, 'Social', 'Atención Social', 'fecha_creacion'),
        ...formatearData(juridicasRes.data, 'Jurídica', 'Caso Jurídico', 'created_at'),
        ...formatearData(recopilacionRes.data, 'Social', 'Recopilación Info.', 'created_at'),
        ...formatearData(visitasRes.data, 'Social', 'Visita Domiciliaria', 'created_at'),
        ...formatearData(intervencionRes.data, 'Social', 'Intervención', 'created_at')
      ].sort((a, b) => b.timestamp - a.timestamp);

      setFichas(combinadas);
      setFichasFiltradas(combinadas); // Inicializamos el estado filtrado
    } catch (error) {
      console.error('Error general al obtener fichas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFichas();

    const channel = supabase.channel('fichas-coordinadora-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_records' }, () => fetchFichas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'legal_records' }, () => fetchFichas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recopilacion_records' }, () => fetchFichas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitas_records' }, () => fetchFichas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intervencion_records' }, () => fetchFichas())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Lógica de Filtrado y Ordenamiento
  useEffect(() => {
    let result = [...fichas];

    // 1. Filtrar por Paciente
    if (filtroPaciente.trim() !== '') {
      const searchTerm = filtroPaciente.toLowerCase();
      result = result.filter(ficha => {
        const nombreCompleto = `${ficha.participants?.nombre || ''} ${ficha.participants?.apellido || ''}`.toLowerCase();
        return nombreCompleto.includes(searchTerm);
      });
    }

    // 2. Filtrar por Tipo de Ficha
    if (filtroTipo !== '') {
      result = result.filter(ficha => ficha.tipoEspecifico === filtroTipo);
    }

    // 3. Ordenar por Fecha
    if (ordenFecha === 'asc') {
      result.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      result.sort((a, b) => b.timestamp - a.timestamp);
    }

    setFichasFiltradas(result);
  }, [fichas, filtroPaciente, filtroTipo, ordenFecha]);

  const exportarAExcel = () => {
    if (fichasFiltradas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const dataAExportar = fichasFiltradas.map(ficha => {
      // Determinar estado textual
      let estadoTxt = 'Activo';
      if (ficha.tipoEspecifico === 'Recopilación Info.' || ficha.tipoEspecifico === 'Visita Domiciliaria') {
        estadoTxt = 'Registrada';
      } else if (ficha.fecha_cierre) {
        estadoTxt = 'Cerrado';
      }

      return {
        'Fecha Registro': ficha.fecha_registro ? new Date(ficha.fecha_registro).toLocaleDateString('es-CL') : 'N/A',
        'Área': ficha.area,
        'Tipo de Ficha': ficha.tipoEspecifico,
        'RUT Paciente': ficha.participants?.rut || 'N/A',
        'Nombre Paciente': `${ficha.participants?.nombre || ''} ${ficha.participants?.apellido || ''}`.trim(),
        'Elaborado Por': ficha.perfiles?.nombre || 'Sistema',
        'Rol Creador': ficha.perfiles?.rol || 'N/A',
        'Estado': estadoTxt,
        'Fecha Cierre': ficha.fecha_cierre ? new Date(ficha.fecha_cierre).toLocaleDateString('es-CL') : 'N/A',
        'ID Documento': ficha.id
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataAExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registro de Fichas");
    
    // Auto-ajustar ancho de columnas básico
    const wscols = [
      {wch: 15}, {wch: 10}, {wch: 25}, {wch: 15}, {wch: 30}, 
      {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 40}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Registro_Fichas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleVerDetalles = (ficha) => {
    setFichaSeleccionada(ficha);
    setShowDetalles(true);
  };

  const renderEstado = (ficha) => {
    if (ficha.tipoEspecifico === 'Recopilación Info.' || ficha.tipoEspecifico === 'Visita Domiciliaria') {
      return <Badge bg="success" className="px-3 py-2">Registrada</Badge>; 
    }
    if (ficha.fecha_cierre) {
      return <Badge bg="secondary" className="px-3 py-2">Cerrado</Badge>;
    }
    return <Badge bg="primary" className="px-3 py-2">Activo</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Gestión de Fichas</h3>
          <p className="text-muted mb-0">Monitorización en vivo, filtrado y exportación de atenciones</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-success"
            className="fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={exportarAExcel}
            disabled={fichasFiltradas.length === 0}
          >
             <span>📊</span> Descargar Excel
          </Button>

          <Button 
            style={{ backgroundColor: '#0dcaf0', border: 'none', color: '#000' }}
            className="fw-bold shadow-sm ms-2"
            onClick={() => navigate('/dashboard/fichas/nueva-juridica')}
          >
            + Ficha Jurídica
          </Button>
          
          <Button 
            style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
            className="fw-bold shadow-sm"
            onClick={() => setShowTiposFicha(true)}
          >
            + Fichas Sociales
          </Button>
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      <Card className="border-0 shadow-sm mb-4 bg-light">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col md={5}>
               <InputGroup>
                 <InputGroup.Text className="bg-white border-end-0">🔍</InputGroup.Text>
                 <Form.Control 
                   type="text" 
                   placeholder="Buscar paciente por nombre o apellido..." 
                   value={filtroPaciente}
                   onChange={(e) => setFiltroPaciente(e.target.value)}
                   className="border-start-0 ps-0"
                 />
               </InputGroup>
            </Col>
            
            <Col md={4}>
              <Form.Select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="fw-medium"
              >
                <option value="">Todas las áreas y tipos</option>
                <option value="Atención Social">Atención Social</option>
                <option value="Visita Domiciliaria">Visita Domiciliaria</option>
                <option value="Recopilación Info.">Recopilación de Información</option>
                <option value="Intervención">Intervención</option>
                <option value="Caso Jurídico">Caso Jurídico</option>
              </Form.Select>
            </Col>
            
            <Col md={3}>
               <Form.Select 
                 value={ordenFecha} 
                 onChange={(e) => setOrdenFecha(e.target.value)}
                 className="fw-medium"
               >
                 <option value="desc">Más recientes primero</option>
                 <option value="asc">Más antiguos primero</option>
               </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2 mb-0">Sincronizando registros en vivo...</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                <span className="small text-muted fw-bold">
                  Mostrando {fichasFiltradas.length} registro(s)
                </span>
              </div>
              <Table hover responsive className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-muted border-0 py-3 px-4">FECHA Y HORA</th>
                    <th className="text-muted border-0 py-3">PACIENTE</th>
                    <th className="text-muted border-0 py-3">ELABORADO POR</th>
                    <th className="text-muted border-0 py-3">ÁREA Y TIPO</th>
                    <th className="text-muted border-0 py-3">ESTADO</th>
                    <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {fichasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No se encontraron fichas que coincidan con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    fichasFiltradas.map((ficha) => (
                      <tr key={ficha.id}>
                        <td className="px-4 fw-medium text-secondary">
                          {formatearFecha(ficha.fecha_registro)}
                        </td>
                        <td>
                          <span className="fw-bold d-block text-dark">
                            {ficha.participants?.nombre} {ficha.participants?.apellido}
                          </span>
                          <span className="text-muted small">{ficha.participants?.rut || 'Sin RUT'}</span>
                        </td>
                        <td>
                          <span className="fw-medium d-block text-primary">{ficha.perfiles?.nombre || 'Sistema'}</span>
                          {ficha.perfiles?.rol && (
                            <Badge bg="light" text="dark" className="border mt-1 text-capitalize" style={{ fontSize: '0.65rem' }}>
                              {ficha.perfiles.rol}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <Badge 
                            bg={ficha.area === 'Social' ? 'info' : 'warning'} 
                            text="dark" 
                            className="text-uppercase mb-1"
                          >
                            {ficha.area}
                          </Badge>
                          <span className="d-block small fw-bold text-muted">
                            {ficha.tipoEspecifico}
                          </span>
                        </td>
                        <td>
                          {renderEstado(ficha)}
                        </td>
                        <td className="px-4 text-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="fw-bold"
                            onClick={() => handleVerDetalles(ficha)}
                          >
                            Ver Detalles &rarr;
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>

      {/* MODAL 1: CUADRO DE SELECCIÓN DE TIPO DE FICHA SOCIAL */}
      <Modal show={showTiposFicha} onHide={() => setShowTiposFicha(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5" style={{ color: 'var(--color-principal, #006A38)' }}>
            Seleccione el tipo de Ficha Social a crear
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/dashboard/fichas/nueva-social')} style={{ borderWidth: '2px' }}>
                <div className="d-flex align-items-center gap-2"><span className="fs-3">📝</span><span className="fs-5 text-dark">Atención Social</span></div>
                <span className="small text-muted fw-normal">Registro principal de ingreso y seguimiento de casos sociales.</span>
              </Button>
            </Col>
            <Col md={6}>
              <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/dashboard/fichas/visita')} style={{ borderWidth: '2px' }}>
                <div className="d-flex align-items-center gap-2"><span className="fs-3">🏠</span><span className="fs-5 text-dark">Visita Domiciliaria</span></div>
                <span className="small text-muted fw-normal">Reporte de terreno, evaluación in situ y verificación.</span>
              </Button>
            </Col>
            <Col md={6}>
              <Button variant="outline-primary" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/dashboard/fichas/recopilacion')} style={{ borderWidth: '2px' }}>
                <div className="d-flex align-items-center gap-2"><span className="fs-3">📂</span><span className="fs-5 text-dark">Recopilación Info.</span></div>
                <span className="small text-muted fw-normal">Instrumento de recolección de datos socioeconómicos detallados.</span>
              </Button>
            </Col>
            <Col md={6}>
              <Button variant="outline-success" className="w-100 h-100 p-3 text-start fw-bold shadow-sm d-flex flex-column gap-2" onClick={() => navigate('/dashboard/fichas/intervencion')} style={{ borderWidth: '2px' }}>
                <div className="d-flex align-items-center gap-2"><span className="fs-3">🤝</span><span className="fs-5 text-dark">Intervención</span></div>
                <span className="small text-muted fw-normal">Documento de intervención y tratamiento social.</span>
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* MODAL 2: DETALLES RÁPIDOS DE LA FICHA */}
      <Modal show={showDetalles} onHide={() => setShowDetalles(false)} centered size="lg">
        <Modal.Header closeButton className={fichaSeleccionada?.area === 'Social' ? 'bg-info bg-opacity-10' : 'bg-warning bg-opacity-10'}>
          <Modal.Title className="fw-bold fs-5 text-uppercase" style={{ color: 'var(--color-principal)' }}>
            📄 Resumen: {fichaSeleccionada?.tipoEspecifico}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-0">
          <div className="bg-light p-4 border-bottom">
            <Row className="g-4">
              <Col md={6} className="border-end-md">
                <h6 className="text-muted fw-bold small text-uppercase mb-2">👤 Datos del Paciente</h6>
                <h4 className="fw-bolder mb-1">
                  {fichaSeleccionada?.participants?.nombre} {fichaSeleccionada?.participants?.apellido}
                </h4>
                <p className="text-secondary fw-bold mb-0">RUT: {fichaSeleccionada?.participants?.rut || 'Sin registrar'}</p>
              </Col>
              
              <Col md={6}>
                <h6 className="text-muted fw-bold small text-uppercase mb-2">✍️ Elaborado Por</h6>
                <div className="d-flex align-items-center gap-3 mt-2">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '45px', height: '45px' }}>
                    {fichaSeleccionada?.perfiles?.nombre?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="fw-bolder d-block fs-5 text-primary">
                      {fichaSeleccionada?.perfiles?.nombre || 'Sistema'}
                    </span>
                    <Badge bg="success" className="text-capitalize mt-1 px-2 py-1">
                      {fichaSeleccionada?.perfiles?.rol || 'No asignado'}
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="p-4">
            <Row className="g-4">
              <Col xs={6}>
                <h6 className="text-muted fw-bold small text-uppercase mb-1">Fecha de Creación</h6>
                <p className="fw-medium fs-5 mb-0">{formatearFecha(fichaSeleccionada?.fecha_registro)}</p>
              </Col>
              <Col xs={6}>
                <h6 className="text-muted fw-bold small text-uppercase mb-2">Estado Actual</h6>
                {fichaSeleccionada && renderEstado(fichaSeleccionada)}
              </Col>
            </Row>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" className="fw-bold" onClick={() => setShowDetalles(false)}>
            Cerrar Resumen
          </Button>
          <Button 
            style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
            className="fw-bold px-4 shadow-sm"
            onClick={() => {
              let rutaTipo = '';
              if (fichaSeleccionada?.tipoEspecifico === 'Atención Social') rutaTipo = 'social';
              else if (fichaSeleccionada?.tipoEspecifico === 'Visita Domiciliaria') rutaTipo = 'visita';
              else if (fichaSeleccionada?.tipoEspecifico === 'Recopilación Info.') rutaTipo = 'recopilacion';
              else if (fichaSeleccionada?.tipoEspecifico === 'Intervención') rutaTipo = 'intervencion';
              else rutaTipo = 'juridica';

              navigate(`/dashboard/fichas/ver/${rutaTipo}/${fichaSeleccionada.id}`);
            }}
          >
            Abrir Ficha Completa
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          @media (min-width: 768px) {
            .border-end-md { border-right: 1px solid #dee2e6; }
          }
        `}
      </style>
    </Container>
  );
};

export default ListaFichas;