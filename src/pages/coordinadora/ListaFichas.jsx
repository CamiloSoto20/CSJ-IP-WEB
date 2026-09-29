import { Table, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ListaFichas = () => {
  return (
    <Container fluid className="py-4">
      {/* CABECERA Y BOTONES SEPARADOS */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--color-principal)' }}>Gestión de Fichas</h2>
          <p className="text-muted mb-0">Panel de administración exclusivo de la Coordinadora</p>
        </div>
        <div className="d-flex gap-2">
          {/* Botón temporalmente inactivo hasta que hagamos la vista de Nueva Ficha */}
          <Button 
            as={Link} 
            to="/dashboard/coordinadora/fichas/nueva"
            style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} 
            className="fw-bold text-white shadow-sm"
          >
            + Nueva Ficha Social
          </Button>
        </div>
      </div>

      {/* TABLA LIMPIA Y ESTRUCTURADA */}
      <div className="bg-white p-4 rounded-4 shadow-sm border-0">
        <Table responsive hover className="align-middle mb-0">
          <thead className="text-muted small bg-light">
            <tr>
              <th className="py-3">FECHA</th>
              <th className="py-3">RUT</th>
              <th className="py-3">PARTICIPANTE</th>
              <th className="py-3">TIPO</th>
              <th className="py-3">ESTADO</th>
              <th className="py-3 text-end">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="text-center text-muted py-5">
                Módulo limpio y reiniciado. (Próximo paso: Conectar los datos aquí).
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default ListaFichas;