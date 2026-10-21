import pie from '../assets/sellos-ipcft-color-fb.jpg'; /* Ajusta al nombre exacto de tu imagen en public/images/ o public/assets/ */

const Footer = () => {
  return (
    <footer className="w-100 bg-white border-top py-4 mt-auto d-flex justify-content-center align-items-center">
      <img
        src={pie} /* Asegúrate de poner aquí el nombre y ruta exacta de tu imagen */
        alt="Acreditación Santo Tomás"
        style={{
          width: '100%',
          maxWidth: '1100px', /* Mantiene una proporción elegante en pantallas grandes */
          maxHeight: '140px', /* Evita que se vea gigante */
          height: 'auto',
          objectFit: 'contain', /* Clave para que se vea completa de lado a lado sin cortarse */
          padding: '0 20px'
        }}
      />
    </footer>
  );
};

export default Footer;