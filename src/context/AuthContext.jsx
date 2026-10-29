import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado global para la lista de usuarios conectados
  const [usuariosOnline, setUsuariosOnline] = useState([]);

  useEffect(() => {
    let presenceChannel = null;
    let inactivityTimer = null;

    // 1. CIERRE DE SESIÓN POR INACTIVIDAD (1 Hora = 3,600,000 milisegundos)
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          alert("El tiempo expiró por inactividad. Debes volver a iniciar sesión.");
          await supabase.auth.signOut();
        }
      }, 3600000); 
    };

    // Escuchamos cualquier movimiento para reiniciar el reloj
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    resetInactivityTimer(); // Iniciar temporizador desde el segundo cero

    // 2. CIERRE DE SESIÓN AL CERRAR LA VENTANA O PESTAÑA
    const handleTabClose = () => {
       // Obligamos a Supabase a matar la sesión antes de que el navegador corte el proceso
       supabase.auth.signOut();
    };
    window.addEventListener('beforeunload', handleTabClose);

    const conectarPresenciaGlobal = async (userId) => {
      if (presenceChannel) {
        await supabase.removeChannel(presenceChannel);
      }
      
      presenceChannel = supabase.channel('online-users', {
        config: { presence: { key: userId } },
      });

      presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setUsuariosOnline(Object.keys(state));
      });

      presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ 
            user: userId, 
            online_at: new Date().toISOString() 
          });
        }
      });
    };

    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', currentUser.id)
          .single();
        setRole(data?.rol ?? null);
        
        conectarPresenciaGlobal(currentUser.id);
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', currentUser.id)
          .single();
        setRole(data?.rol ?? null);
        conectarPresenciaGlobal(currentUser.id);
      } else {
        setRole(null);
        setUsuariosOnline([]);
        if (presenceChannel) {
          supabase.removeChannel(presenceChannel);
          presenceChannel = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (presenceChannel) supabase.removeChannel(presenceChannel);
      
      // Limpiamos la basura de los listeners cuando se desmonte
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, usuariosOnline }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);