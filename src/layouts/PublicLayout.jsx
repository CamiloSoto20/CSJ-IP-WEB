import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#fcfcfc' }}>
      {/* Estilos globales para el rediseño público */}
      <style>
        {`
          .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .hover-lift:hover { transform: translateY(-7px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          .btn-custom { border-radius: 50rem; font-weight: 600; padding: 0.6rem 1.5rem; transition: all 0.3s ease; }
          .btn-custom:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.15); }
          .card-modern { border-radius: 1.2rem; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
          .section-title { position: relative; padding-bottom: 15px; margin-bottom: 2rem; color: var(--color-principal); font-weight: 800; }
          .section-title::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 60px; height: 4px; background-color: var(--color-secundario, #78BE20); border-radius: 2px; }
          .section-title-left::after { left: 0; transform: none; }
          .icon-box { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background-color: rgba(120, 190, 32, 0.1); border-radius: 50%; margin-bottom: 1.5rem; }
        `}
      </style>
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;