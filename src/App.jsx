function App() {
  return (
    <div className="container mt-5">
      <h1 style={{ color: 'var(--color-principal)' }}>Clínica Socio Jurídica</h1>
      <p>Estructura de carpetas y colores configurados.</p>
      <button 
        style={{ 
          backgroundColor: 'var(--color-secundario)', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '5px' 
        }}
      >
        Botón de prueba
      </button>
    </div>
  );
}

export default App;