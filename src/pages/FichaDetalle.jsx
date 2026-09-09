import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Spinner, Dropdown, DropdownButton } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const FichaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ficha, setFicha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const { data, error } = await supabase
                    .from('legal_records')
                    .select(`
            *,
            participants (*),
            profiles (nombre, apellido)
          `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setFicha(data);
            } catch (error) {
                console.error("Error:", error.message);
                alert("Error al cargar la ficha");
            } finally {
                setLoading(false);
            }
        };
        fetchDetalle();
    }, [id]);

    // Función para actualizar el estado en Supabase
    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('legal_records')
                .update({ estado: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Actualizamos el estado local de React para ver el cambio instantáneo
            setFicha({ ...ficha, estado: newStatus });

        } catch (error) {
            console.error("Error:", error.message);
            alert("Error al actualizar el estado: " + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>;
    }

    if (!ficha) {
        return <div className="p-5 text-center text-muted">Ficha no encontrada</div>;
    }

    // Determinar el color de la etiqueta según el estado
    const getBadgeColor = (estado) => {
        if (estado === 'Pendiente') return 'warning';
        if (estado === 'En atención') return 'primary';
        if (estado === 'Cerrada') return 'success';
        return 'secondary';
    };

    return (
        <Container>
            <Button variant="link" className="text-decoration-none mb-3 px-0 text-secondary" onClick={() => navigate(-1)}>
                &larr; Volver al listado
            </Button>

            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white border-0 pt-4 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }} className="mb-0">
                            Detalle de Ficha
                        </h4>

                        <div className="d-flex align-items-center gap-3">
                            <Badge bg={getBadgeColor(ficha.estado)} text={ficha.estado === 'Pendiente' ? 'dark' : 'light'} className="fs-6">
                                {ficha.estado}
                            </Badge>

                            <DropdownButton
                                variant="outline-secondary"
                                size="sm"
                                title={updating ? 'Actualizando...' : 'Cambiar estado'}
                                disabled={updating}
                                onSelect={handleStatusChange}
                                align="end"
                            >
                                <Dropdown.Item eventKey="Pendiente" disabled={ficha.estado === 'Pendiente'}>Pendiente</Dropdown.Item>
                                <Dropdown.Item eventKey="En atención" disabled={ficha.estado === 'En atención'}>En atención</Dropdown.Item>
                                <Dropdown.Item eventKey="Cerrada" disabled={ficha.estado === 'Cerrada'}>Cerrada</Dropdown.Item>
                            </DropdownButton>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <h6 className="fw-bold text-muted mb-3">Datos del Participante</h6>
                    <p className="mb-1"><strong>RUT:</strong> {ficha.participants?.rut}</p>
                    <p className="mb-1"><strong>Nombre:</strong> {ficha.participants?.nombre} {ficha.participants?.apellido}</p>

                    <hr className="my-4 text-muted" style={{ opacity: 0.2 }} />

                    <h6 className="fw-bold text-muted mb-3">Información del Caso</h6>
                    <p className="mb-1"><strong>Tipo de Atención:</strong> {ficha.tipo_atencion}</p>
                    <p className="mb-1"><strong>Profesional a cargo:</strong> {ficha.profiles?.nombre} {ficha.profiles?.apellido}</p>
                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--color-fondo)' }}>
                        <strong className="text-muted small text-uppercase">Motivo de Consulta:</strong>
                        <p className="mb-0 mt-2">{ficha.motivo_consulta}</p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FichaDetalle;