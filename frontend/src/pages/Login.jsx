import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { setUsuario } = useAuth();
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [genero, setGenero] = useState('Masculino');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    setCargando(true);

    const endpoint = esRegistro ? '/api/auth/registro' : '/api/auth/login';
    const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
    const cuerpoPeticion = esRegistro ? { nombre, email, telefono, genero, password } : { email, password };

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpoPeticion)
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Ocurrió un error inesperado');

      if (esRegistro) {
        setMensaje({ texto: '¡Cuenta creada con éxito! Ya puedes acceder.', tipo: 'exito' });
        setEsRegistro(false);
        setNombre(''); setTelefono(''); setPassword('');
      } else {
        if (datos.token) localStorage.setItem('token', datos.token);
        if (datos.usuario) localStorage.setItem('usuario', JSON.stringify(datos.usuario));
        setUsuario(datos.usuario);
      }
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Peluquería Palencia</h2>
          <p className="mt-2 text-sm text-gray-600">{esRegistro ? 'Regístrate para solicitar tu cita' : 'Inicia sesión en tu cuenta'}</p>
        </div>
        {mensaje.texto && (
          <div className={`p-4 rounded-md text-sm border-l-4 ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border-green-500' : 'bg-red-50 text-red-800 border-red-500'}`}>{mensaje.texto}</div>
        )}
        <form className="space-y-4" onSubmit={manejarEnvio}>
          {esRegistro && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 sm:text-sm" placeholder="Carlos Pérez"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Móvil</label>
                <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 sm:text-sm" placeholder="600123456"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                <select value={genero} onChange={(e) => setGenero(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 sm:text-sm">
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 sm:text-sm" placeholder="correo@ejemplo.com"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 sm:text-sm" placeholder="••••••••"/>
          </div>
          <button type="submit" disabled={cargando} className="flex w-full justify-center rounded-md bg-gray-900 py-3 px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer">
            {cargando ? 'Conectando...' : esRegistro ? 'Registrarse' : 'Entrar'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => { setEsRegistro(!esRegistro); setMensaje({ texto: '', tipo: '' }); }} className="text-sm font-medium text-gray-600 hover:text-gray-900 underline cursor-pointer">
            {esRegistro ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
