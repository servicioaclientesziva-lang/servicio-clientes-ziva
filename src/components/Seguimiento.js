import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

function Seguimiento({ onRegresar }) {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState('');
  const [nuevoEstatus, setNuevoEstatus] = useState('');

  // Cargar registros desde Firestore
  const cargarRegistros = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes")); // misma colección que Clientes.js
      const registrosData = querySnapshot.docs.map(doc => ({
        id: doc.id,          // necesario para actualizar
        ...doc.data()
      }));
      setRegistros(registrosData);
    } catch (error) {
      console.error("Error al cargar los registros desde la nube:", error);
      alert("Error al cargar los registros desde la nube");
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  // Guardar seguimiento en Firestore
  const guardarSeguimiento = async () => {
    if (!nuevoSeguimiento.trim()) return;

    const fecha = new Date().toLocaleString();

    const actualizado = registros.map(r =>
      r.id === registroSeleccionado.id
        ? {
            ...r,
            seguimientos: [...(r.seguimientos || []), { fecha, texto: nuevoSeguimiento }],
            estatus: nuevoEstatus || r.estatus
          }
        : r
    );

    setRegistros(actualizado);
    setRegistroSeleccionado(null);
    setNuevoSeguimiento('');
    setNuevoEstatus('');

    try {
      const docRef = doc(db, "clientes", registroSeleccionado.id);
      await updateDoc(docRef, {
        seguimientos: [...(registroSeleccionado.seguimientos || []), { fecha, texto: nuevoSeguimiento }],
        estatus: nuevoEstatus
      });
    } catch (error) {
      console.error("Error al guardar el seguimiento en la nube:", error);
      alert("Error al guardar el seguimiento en la nube");
    }
  };

  const registrosFiltrados = registros.filter(r => {
    const cumpleFiltro = filtro === 'Todos' || r.estatus === filtro;
    const cumpleBusqueda =
      r.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.nombreContacto.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div style={{ padding: '20px', width: '90%', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Bienvenido</h1>
      <h2 style={{ textAlign: 'center', color: '#34495e' }}>Seguimiento a Clientes</h2>

      <div style={{ marginBottom: '10px' }}>
        <label>Buscar por Empresa o Contacto: </label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Escribe aquí..."
          style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', width: '250px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setFiltro('Todos')} style={{ marginRight: '5px', padding: '5px 10px' }}>Todos</button>
        <button onClick={() => setFiltro('Pendiente')} style={{ marginRight: '5px', padding: '5px 10px' }}>Pendientes</button>
        <button onClick={() => setFiltro('Cerrado')} style={{ padding: '5px 10px' }}>Cerrados</button>
      </div>

      {registrosFiltrados.length === 0 ? (
        <p>No hay registros</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f4f6f7' }}>
            <tr>
              <th>Empresa</th>
              <th>Giro</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Comentario</th>
              <th>Seguimientos</th>
              <th>Estatus</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r) => (
              <tr key={r.id}>
                <td>{r.empresa}</td>
                <td>{r.giro}</td>
                <td>{r.nombreContacto}</td>
                <td>{r.telefono}</td>
                <td>{r.correo}</td>
                <td>{r.comentario}</td>
                <td style={{ minWidth: '200px' }}>
                  {r.seguimientos && r.seguimientos.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '15px' }}>
                      {r.seguimientos.map((s, index) => (
                        <li key={index}>
                          <strong>{s.fecha}:</strong> {s.texto}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: '#999' }}>Sin seguimientos</span>
                  )}
                </td>
                <td style={{ fontWeight: 'bold', color: r.estatus === 'Pendiente' ? 'red' : 'green' }}>{r.estatus}</td>
                <td>
                  <button
                    onClick={() => {
                      setRegistroSeleccionado(r);
                      setNuevoEstatus(r.estatus);
                    }}
                    style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
                  >
                    Seguimiento
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={onRegresar}
        style={{ marginTop: '15px', padding: '8px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#95a5a6', color: 'white' }}
      >
        Regresar al Menú
      </button>

      {registroSeleccionado && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '400px', textAlign: 'center' }}>
            <h3>Agregar Seguimiento</h3>
            <p><strong>Fecha actual:</strong> {new Date().toLocaleString()}</p>
            <textarea
              value={nuevoSeguimiento}
              onChange={(e) => setNuevoSeguimiento(e.target.value)}
              placeholder="Escribe el seguimiento..."
              style={{ width: '100%', height: '100px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', padding: '5px' }}
            />
            <div style={{ marginBottom: '10px' }}>
              <label>Estatus: </label>
              <select value={nuevoEstatus} onChange={(e) => setNuevoEstatus(e.target.value)} style={{ padding: '5px', borderRadius: '5px' }}>
                <option>Pendiente</option>
                <option>Cerrado</option>
              </select>
            </div>
            <div>
              <button
                onClick={guardarSeguimiento}
                style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 12px', marginRight: '10px', borderRadius: '5px' }}
              >
                Guardar
              </button>
              <button
                onClick={() => setRegistroSeleccionado(null)}
                style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Seguimiento;
