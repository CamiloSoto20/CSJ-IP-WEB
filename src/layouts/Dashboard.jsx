import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Button, Badge } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [perfil, setPerfil] = useState({ nombre: 'Cargando perfil...', rol: 'Coordinadora' });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data } = await supabase
            .from('perfiles')
            .select('nombre, rol')
            .eq('id', authData.user.id)
            .single();
          
          if (data) {
            setPerfil(data);
          }
        }
      } catch (error) {
        console.error("Error al cargar el perfil de la coordinadora:", error);
      }
    };

    fetchPerfil();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Función para determinar si la ruta está activa
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-grow-1 m-0">
        {/* Sidebar */}
        <Col md={3} lg={2} className="p-3 d-flex flex-column shadow-sm z-1" style={{ backgroundColor: '#2b2d31', color: '#fff' }}>
          
          {/* TARJETA DE PERFIL DINÁMICA */}
          <div className="mb-4 mt-2 text-center p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h6 className="fw-bold mb-2 text-white">{perfil.nombre}</h6>
            <Badge bg="success" className="mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {perfil.rol}
            </Badge>
            <p className="mb-0 text-secondary small fw-bold" style={{ letterSpacing: '1px' }}>CSJ</p>
          </div>

          <Nav className="flex-column mb-auto gap-1 mt-2">
            <Nav.Link 
              as={Link} 
              to="/dashboard" 
              className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}
            >
              🏠 <span className="fw-medium">Inicio</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/dashboard/fichas" 
              className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/fichas') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}
            >
            
              📂 <span className="fw-medium">Fichas</span>
            </Nav.Link>

            <Nav.Link 
              as={Link} 
              to="/dashboard/estudiantes" 
              className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/estudiantes') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}
            >
              👥 <span className="fw-medium">Estudiantes</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/dashboard/citas" 
              className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/citas') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}
            >
              📅 <span className="fw-medium">Citas</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/dashboard/charlas" 
              className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/charlas') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}
            >
              📢 <span className="fw-medium">Charlas</span>
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/dashboard/informacion" 
              className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/informacion') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}
            >
              📰 <span className="fw-medium">Información</span>
            </Nav.Link>
          </Nav>

          <hr className="border-secondary opacity-25" />
          <Button 
            variant="dark" 
            onClick={handleLogout} 
            className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2 border-secondary text-secondary hover-text-white"
          >
            🚪 Cerrar sesión
          </Button>
        </Col>

        {/* Content Area */}
        <Col md={9} lg={10} className="p-0 h-100 d-flex flex-column" style={{ backgroundColor: '#f4f6f8' }}>
          <div className="flex-grow-1 overflow-auto px-4 py-3">
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardLayout;