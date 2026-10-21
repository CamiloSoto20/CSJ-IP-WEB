import Hero from '../components/Hero';
import Services from '../components/Services';
import AboutUs from '../components/AboutUs';
import Informacion from '../components/Informacion';
import Talks from '../components/Talks.';
import CharlasPublicas from '../components/CharlasPublicas';
import InformacionPublica from '../components/InfomacionPublica';

const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <AboutUs />
      <InformacionPublica />
      <CharlasPublicas />
    </>
  );
};

export default Home;