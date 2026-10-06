import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Nav, Button, Badge, Modal } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import logo from '../assets/LOGO_CSJ.png'; 

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [perfil, setPerfil] = useState({ nombre: 'Cargando perfil...', rol: 'Coordinadora', correo: '', rut: '' });
  const [showPerfil, setShowPerfil] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data } = await supabase
            .from('perfiles')
            .select('*')
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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-grow-1 m-0">
        {/* Sidebar */}
        <Col md={3} lg={2} className="p-3 d-flex flex-column shadow-sm z-1" style={{ backgroundColor: '#2b2d31', color: '#fff' }}>
          
          {/* TARJETA DE PERFIL DINÁMICA CON LOGO E INTERACTIVIDAD */}
          <div 
            className="mb-4 mt-2 text-center p-3 rounded" 
            style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'transform 0.2s ease' }}
            onClick={() => setShowPerfil(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Ver mi perfil"
          >
            <img 
              src="/assets/LOGO_CSJ.png" 
              alt="Logo CSJ" 
              className="img-fluid rounded-circle mb-3 shadow-sm bg-white p-1" 
              style={{ width: '70px', height: '70px', objectFit: 'contain' }}
              onError={(e) => e.target.style.display = 'none'}
            />
            <h6 className="fw-bold mb-2 text-white">{perfil.nombre}</h6>
            <Badge bg="success" className="mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {perfil.rol}
            </Badge>
            <p className="mb-0 text-secondary small fw-bold" style={{ letterSpacing: '1px' }}>CSJ - Ver Perfil</p>
          </div>

          <Nav className="flex-column mb-auto gap-1 mt-2">
            <Nav.Link as={Link} to="/dashboard" className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard') && location.pathname === '/dashboard' ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}>
              🏠 <span className="fw-medium">Inicio</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/fichas" className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/fichas') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}>
              📂 <span className="fw-medium">Fichas</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/estudiantes" className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/estudiantes') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}>
              👥 <span className="fw-medium">Estudiantes</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/citas" className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/citas') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}>
              📅 <span className="fw-medium">Citas</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/charlas" className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/charlas') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}>
              📢 <span className="fw-medium">Charlas</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/informacion" className={`px-3 py-2 rounded d-flex align-items-center gap-3 transition-all ${isActive('/dashboard/informacion') ? 'bg-success text-white' : 'text-light opacity-75 hover-opacity-100'}`}>
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

      {/* MODAL PERFIL COORDINADORA */}
      <Modal show={showPerfil} onHide={() => setShowPerfil(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-principal, #006A38)', color: 'white' }}>
          <Modal.Title className="fw-bold fs-5">Mi Perfil Institucional</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4 bg-light text-dark">
          <div className="mb-3 mx-auto bg-white rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm" style={{ width: '100px', height: '100px', border: '3px solid var(--color-principal, #006A38)' }}>
            <img src={logo} alt="CSJ" className="img-fluid rounded-circle" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=CSJ&background=006A38&color=fff'; }} />
          </div>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>{perfil.nombre}</h4>
          <p className="mb-1 text-muted fw-semibold">RUT: {perfil.rut || 'No registrado'}</p>
          <p className="mb-3 text-muted">{perfil.correo || 'correo@csj.cl'}</p>
          <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 mb-4 text-capitalize">{perfil.rol}</Badge>
          
          <Button variant="outline-danger" className="w-100 rounded-pill fw-bold py-2" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default DashboardLayout;