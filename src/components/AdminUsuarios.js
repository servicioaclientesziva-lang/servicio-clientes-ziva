import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function AdminUsuarios({ onRegresar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);

  useEffect(() => {
    const activo = JSON.parse(localStorage.getItem('usuarioActivo'));
    setUsuarioActivo(activo);
    if (activo?.puedeEliminar) {
      cargarUsuarios();
    }
  }, []);

  const cargarUsuarios = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsuarios(lista);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleEliminar = async (id) => {
    if (!usuarioActivo?.puedeEliminar) return;
    if (window.confirm('¿Deseas eliminar este usuario?')) {
      try {
        await deleteDoc(doc(db, 'usuarios', id));
        alert('Usuario eliminado correctamente.');
        cargarUsuarios();
      } catch (error) {
        console.error('Error eliminando usuario:', error);
      }
    }
  };

  const handleTogglePermiso = async (id, actual) => {
    if (!usuarioActivo?.puedeEliminar) return;
    try {
      await updateDoc(doc(db, 'usuarios', id), { puedeEliminar: !actual });
      cargarUsuarios();
    } catch (error) {
      console.error('Error actualizando permiso:', error);
    }
  };

  const handleCambioNombre = async (id, nuevoNombre) => {
    try {
      await updateDoc(doc(db, 'usuarios', id), { nombre: nuevoNombre });
      cargarUsuarios();
    } catch (error) {
      console.error('Error actualizando nombre:', error);
    }
  };

  const inputStyle = { padding: '6px', margin: '2px', borderRadius: '4px', border: '1px solid #ccc' };
  const buttonStyle = { padding: '6px 12px', margin: '2px', borderRadius: '5px', cursor: 'pointer' };

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', textAlign: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
      <h2>Administrar Usuarios</h2>

      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados en Firestore.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Eliminar</th>
              <th>Permiso Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>
                  <input
                    style={inputStyle}
                    value={u.nombre}
                    onChange={e => handleCambioNombre(u.id, e.target.value)}
                  />
                </td>
                <td>{u.email}</td>
                <td>
                  {usuarioActivo?.puedeEliminar && (
                    <button
                      style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: 'white' }}
                      onClick={() => handleEliminar(u.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
                <td>
                  {usuarioActivo?.puedeEliminar && (
                    <input
                      type="checkbox"
                      checked={u.puedeEliminar || false}
                      onChange={() => handleTogglePermiso(u.id, u.puedeEliminar)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        style={{ ...buttonStyle, marginTop: '20px', backgroundColor: '#4caf50', color: 'white' }}
        onClick={onRegresar}
      >
        Regresar al Menú
      </button>
    </div>
  );
}

export default AdminUsuarios;
