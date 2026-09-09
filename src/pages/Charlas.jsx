import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const Charlas = () => {
    const [charlas, setCharlas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '', descripcion: '', fecha: '', hora: '', ubicacion: '', cupos_totales: ''
    });

    const fetchCharlas = async () => {
        try {
            const { data, error } = await supabase
                .from('talks')
                .select('*')
                .order('fecha', { ascending: true });

            if (error) throw error;
            setCharlas(data || []);
        } catch (error) {
            console.error("Error al cargar charlas:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharlas();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setFormData({ titulo: '', descripcion: '', fecha: '', hora: '', ubicacion: '', cupos_totales: '' });
    };

    const handleShow = () => setShowModal(true);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // cupos_disponibles inicia igual que cupos_totales
            const { error } = await supabase.from('talks').insert([{
                ...formData,
                cupos_totales: parseInt(formData.cupos_totales),
                cupos_disponibles: parseInt(formData.cupos_totales)
            }]);

            if (error) throw error;

            alert('Charla creada exitosamente');
            fetchCharlas();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar la charla: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Gestión de Charlas</h2>
                <Button style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} onClick={handleShow}>
                    + Nueva Charla
                </Button>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border-0">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
                ) : (
                    <Table hover className="align-middle mb-0">
                        <thead className="text-muted small">
                            <tr>
                                <th>FECHA Y HORA</th>
                                <th>TÍTULO</th>
                                <th>CUPOS</th>
                                <th>ESTADO</th>
                                <th className="text-end">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charlas.map((charla) => (
                                <tr key={charla.id}>
                                    <td className="fw-bold text-secondary">
                                        {charla.fecha} <br />
                                        <span className="text-muted small">⏰ {charla.hora.substring(0, 5)} hrs</span>
                                    </td>
                                    <td>{charla.titulo}</td>
                                    <td>{charla.cupos_disponibles} / {charla.cupos_totales}</td>
                                    <td>
                                        <Badge bg={charla.estado === 'Disponible' ? 'success' : 'secondary'}>
                                            {charla.estado}
                                        </Badge>
                                    </td>
                                    <td className="text-end">
                                        <Button variant="outline-secondary" size="sm">Ver inscritos</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                {!loading && charlas.length === 0 && (
                    <div className="text-center text-muted py-4">
                        No hay charlas registradas actualmente.
                    </div>
                )}
            </div>

            {/* Modal para Nueva Charla */}
            <Modal show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Publicar Charla</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Título de la Charla</Form.Label>
                            <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Descripción</Form.Label>
                            <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} required />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Fecha</Form.Label>
                                    <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Hora</Form.Label>
                                    <Form.Control type="time" name="hora" value={formData.hora} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Ubicación / Enlace</Form.Label>
                                    <Form.Control name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej: Auditorio Sede Centro" required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Cupos Totales</Form.Label>
                                    <Form.Control type="number" min="1" name="cupos_totales" value={formData.cupos_totales} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
                            <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} disabled={saving}>
                                {saving ? <Spinner animation="border" size="sm" /> : 'Publicar Charla'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Charlas;