import { Table, Button, Badge } from 'react-bootstrap';

// Datos de prueba simulando la base de datos
const mockFichas = [
  { id: '1', rut: '12345678-9', nombre: 'Juan Pérez', tipo: 'Asesoría', estado: 'Pendiente', fecha: '2026-10-15' },
  { id: '2', rut: '9876543-2', nombre: 'María González', tipo: 'Causa', estado: 'En atención', fecha: '2026-10-14' },
];

const Fichas = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Fichas Jurídicas</h2>
        <Button style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }}>
          + Nueva Ficha
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        <Table responsive hover className="align-middle mb-0">
          <thead className="text-muted small">
            <tr>
              <th>RUT</th>
              <th>PARTICIPANTE</th>
              <th>TIPO DE ATENCIÓN</th>
              <th>INGRESO</th>
              <th>ESTADO</th>
              <th className="text-end">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {mockFichas.map((ficha) => (
              <tr key={ficha.id}>
                <td className="fw-bold text-secondary">{ficha.rut}</td>
                <td>{ficha.nombre}</td>
                <td>{ficha.tipo}</td>
                <td>{ficha.fecha}</td>
                <td>
                  <Badge 
                    bg={ficha.estado === 'Pendiente' ? 'warning' : 'success'} 
                    text={ficha.estado === 'Pendiente' ? 'dark' : 'light'}
                  >
                    {ficha.estado}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button variant="outline-secondary" size="sm">Ver detalle</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {mockFichas.length === 0 && (
          <div className="text-center text-muted py-4">
            No hay fichas registradas actualmente.
          </div>
        )}
      </div>
    </div>
  );
};

export default Fichas;