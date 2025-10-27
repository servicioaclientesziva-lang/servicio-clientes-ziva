import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from './firebaseConfig';

function Clientes({ onRegresar, usuarioActual }) {
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [giro, setGiro] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [comentario, setComentario] = useState('');
  const [estatus, setEstatus] = useState('Pendiente');
  const [animar, setAnimar] = useState(false);
  const [usuarioActualData, setUsuarioActualData] = useState(null);

  useEffect(() => {
    setAnimar(true);

    // Suscripción en tiempo real a clientes
    const unsubscribe = onSnapshot(collection(db, "clientes"), (snapshot) => {
      const listaClientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(listaClientes);
    });

    // Cargar usuarios
    const storedUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    setUsuarios(storedUsuarios);
    const actual = storedUsuarios.find(u => u.email === usuarioActual);
    setUsuarioActualData(actual || null);

    return () => unsubscribe(); // Limpiar suscripción al salir del componente
  }, [usuarioActual]);

  const puedeEliminar = usuarioActualData?.puedeEliminar || false; // permisos desde usuario

  const handleAgregar = async () => {
    if (!empresa || !nombreContacto || !correo) {
      alert('Empresa, Contacto y Correo son obligatorios');
      return;
    }

    const nuevoCliente = {
      nombre,
      empresa,
      giro,
      nombreContacto,
      telefono,
      correo,
      comentario,
      estatus,
      fecha: new Date().toLocaleString(),
      creador: usuarioActual
    };

    try {
      await addDoc(collection(db, "clientes"), nuevoCliente);
      alert('Cliente registrado correctamente');

      setNombre('');
      setEmpresa('');
      setGiro('');
      setNombreContacto('');
      setTelefono('');
      setCorreo('');
      setComentario('');
      setEstatus('Pendiente');
    } catch (error) {
      alert('Error al registrar cliente: ' + error.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!puedeEliminar) return; // solo admin
    if (window.confirm('¿Deseas eliminar este registro?')) {
      try {
        await deleteDoc(doc(db, "clientes", id));
      } catch (error) {
        alert('Error al eliminar cliente: ' + error.message);
      }
    }
  };

  const menuBoxStyle = {
    maxWidth: '600px',
    width: '90%',
    margin: '50px auto',
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    opacity: animar ? 1 : 0,
    transform: animar ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.5s ease',
  };

  const inputStyle = {
    width: '90%',
    padding: '10px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const buttonStyle = {
    margin: '10px',
    padding: '12px 25px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={menuBoxStyle}>
      {/* 👇 Línea agregada para mostrar el mensaje */}
      <p style={{ color: 'green', fontWeight: 'bold' }}>Versión actualizada de clientes</p>

      <h2 style={{ marginBottom: '20px' }}>Agregar Registro</h2>

      <input style={inputStyle} placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input style={inputStyle} placeholder="Empresa o Marca*" value={empresa} onChange={e => setEmpresa(e.target.value)} />
      <input style={inputStyle} placeholder="Giro" value={giro} onChange={e => setGiro(e.target.value)} />
      <input style={inputStyle} placeholder="Contacto*" value={nombreContacto} onChange={e => setNombreContacto(e.target.value)} />
      <input style={inputStyle} placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
      <input style={inputStyle} placeholder="Correo*" value={correo} onChange={e => setCorreo(e.target.value)} />
      <input style={inputStyle} placeholder="Comentario" value={comentario} onChange={e => setComentario(e.target.value)} />

      <select style={{ ...inputStyle, width: '95%' }} value={estatus} onChange={e => setEstatus(e.target.value)}>
        <option>Pendiente</option>
        <option>Cerrado</option>
      </select>

      <div>
        <button
          style={{ ...buttonStyle, backgroundColor: '#4caf50', color: 'white' }}
          onClick={handleAgregar}
          onMouseEnter={e => e.target.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          Registrar
        </button>

        <button
          style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white' }}
          onClick={onRegresar}
          onMouseEnter={e => e.target.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          Regresar al Menú
        </button>
      </div>

      {puedeEliminar && clientes.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Eliminar Registros (solo usuarios con permiso)</h3>
          {clientes.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span>{c.empresa} - {c.nombreContacto}</span>
              <button
                style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => handleEliminar(c.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Clientes;
