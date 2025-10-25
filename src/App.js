import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Clientes from './components/Clientes';
import Seguimiento from './components/Seguimiento';
import Reportes from './components/Reportes';
import AdminUsuarios from './components/AdminUsuarios';

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    // Revisamos si ya hay usuario logueado en localStorage
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (usuario) {
      setUsuarioActual(usuario.email);
      setNombreUsuario(usuario.nombre || '');
    }
  }, []);

  const handleLogin = (email, nombre) => {
    // Guardamos también el nombre en localStorage
    const usuarioActivo = { email, nombre, puedeEliminar: email === 'jasesor@hotmail.com' };
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));

    setUsuarioActual(email);
    setNombreUsuario(nombre);
    setModuloActivo(null); // volvemos al menú principal
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioActivo');
    setUsuarioActual(null);
    setNombreUsuario('');
    setModuloActivo(null);
  };

  const esAdmin = usuarioActual === 'jasesor@hotmail.com';

  if (!usuarioActual) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f0f4f7' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1976d2', padding: '15px', color: 'white', textAlign: 'center' }}>
        <h1>ZIVA GROUP - Seguimiento a Marcas</h1>
        <p>Bienvenido, {nombreUsuario || 'Usuario'}</p>
      </header>

      {/* Menú */}
      {!moduloActivo && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            style={menuButtonStyle}
            onClick={() => setModuloActivo('clientes')}
          >
            Clientes
          </button>
          <button
            style={menuButtonStyle}
            onClick={() => setModuloActivo('seguimiento')}
          >
            Seguimiento
          </button>
          <button
            style={menuButtonStyle}
            onClick={() => setModuloActivo('reportes')}
          >
            Reportes
          </button>
          {esAdmin && (
            <button
              style={menuButtonStyle}
              onClick={() => setModuloActivo('adminUsuarios')}
            >
              Administrar Usuarios
            </button>
          )}
          <button
            style={{ ...menuButtonStyle, backgroundColor: '#f44336' }}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Módulos */}
      <div style={{ marginTop: '30px' }}>
        {moduloActivo === 'clientes' && <Clientes onRegresar={() => setModuloActivo(null)} usuarioActual={usuarioActual} />}
        {moduloActivo === 'seguimiento' && <Seguimiento onRegresar={() => setModuloActivo(null)} />}
        {moduloActivo === 'reportes' && <Reportes onRegresar={() => setModuloActivo(null)} />}
        {moduloActivo === 'adminUsuarios' && esAdmin && <AdminUsuarios onRegresar={() => setModuloActivo(null)} />}
      </div>
    </div>
  );
}

// Estilo común de botones del menú
const menuButtonStyle = {
  margin: '10px',
  padding: '15px 25px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#4caf50',
  color: 'white',
  transition: 'all 0.3s ease',
};

export default App;
