import Hero from '../components/Hero';
import Services from '../components/Services';
import AboutUs from '../components/AboutUs';
import Informacion from '../components/Informacion';
import Talks from '../components/Talks.';
import CharlasPublicas from '../components/CharlasPublicas';

const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <AboutUs />
      <Informacion />
      <Talks />
      <CharlasPublicas />
    </>
  );
};

export default Home;