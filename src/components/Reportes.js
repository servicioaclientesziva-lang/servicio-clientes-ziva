import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Ajusta la ruta si tu firebaseConfig está en otra carpeta

function Reportes({ onRegresar }) {
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [fecha, setFecha] = useState('');

  // 🔹 Ahora obtenemos los registros desde Firestore (colección "clientes")
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'clientes'));
        const datos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRegistros(datos);
      } catch (error) {
        console.error('Error al obtener datos desde Firestore:', error);
      }
    };

    obtenerDatos();
  }, []);

  // 🔹 Filtrado por estatus y por fecha
  const registrosFiltrados = registros.filter((r) => {
    const cumpleFiltro = filtro === 'Todos' || r.estatus === filtro;
    const cumpleFecha = !fecha || (r.fecha && r.fecha.startsWith(fecha));
    return cumpleFiltro && cumpleFecha;
  });

  // 🔹 Prepara filas planas para exportar (concatena seguimientos)
  const prepararFilas = (arr) => {
    return arr.map(r => {
      const seguimientosText = (r.seguimientos || [])
        .map(s => `${s.fecha}: ${s.seguimiento || s.texto || ''}`)
        .join(' \n ');
      return {
        Empresa: r.empresa || '',
        Giro: r.giro || '',
        Contacto: r.nombreContacto || r.contacto || '',
        Telefono: r.telefono || '',
        Correo: r.correo || '',
        Comentario: r.comentario || '',
        Seguimientos: seguimientosText,
        Estatus: r.estatus || '',
        Fecha: r.fecha || ''
      };
    });
  };

  // 🔹 Exportar a Excel
  const exportExcel = () => {
    const filas = prepararFilas(registrosFiltrados);
    const ws = XLSX.utils.json_to_sheet(filas, { origin: 'A1' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registros');
    XLSX.writeFile(wb, `Registros_ZivaGroup_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // 🔹 Exportar a PDF
  const exportPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    const columns = [
      { header: 'Empresa', dataKey: 'Empresa' },
      { header: 'Giro', dataKey: 'Giro' },
      { header: 'Contacto', dataKey: 'Contacto' },
      { header: 'Teléfono', dataKey: 'Telefono' },
      { header: 'Correo', dataKey: 'Correo' },
      { header: 'Comentario', dataKey: 'Comentario' },
      { header: 'Seguimientos', dataKey: 'Seguimientos' },
      { header: 'Estatus', dataKey: 'Estatus' },
      { header: 'Fecha', dataKey: 'Fecha' },
    ];

    const filas = prepararFilas(registrosFiltrados).map(f => ({
      ...f,
      Seguimientos: (f.Seguimientos || '').replace(/\n/g, ' ')
    }));

    autoTable(doc, {
      head: [columns.map(c => c.header)],
      body: filas.map(row => columns.map(c => row[c.dataKey])),
      startY: 40,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [21, 101, 192], textColor: 255 },
      columnStyles: { 6: { cellWidth: 200 } },
      didDrawPage: (data) => {
        doc.setFontSize(14);
        doc.text('Registros Ziva Group', data.settings.margin.left, 22);
      }
    });

    doc.save(`Registros_ZivaGroup_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Reportes</h1>
      <p style={styles.subtitle}>Exporta y revisa los registros y sus seguimientos</p>

      <div style={styles.controls}>
        <div>
          <button
            onClick={() => setFiltro('Todos')}
            style={filtro === 'Todos' ? styles.controlActive : styles.control}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('Pendiente')}
            style={filtro === 'Pendiente' ? styles.controlActiveRed : styles.control}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('Cerrado')}
            style={filtro === 'Cerrado' ? styles.controlActiveGreen : styles.control}
          >
            Cerrados
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label>Filtrar por fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            style={styles.dateInput}
          />
          <button onClick={exportExcel} style={styles.exportBtn}>Exportar a Excel</button>
          <button onClick={exportPDF} style={{ ...styles.exportBtn, backgroundColor:'#ff7043' }}>Exportar a PDF</button>
        </div>
      </div>

      <div style={styles.card}>
        {registrosFiltrados.length === 0 ? (
          <p style={{ color:'#666' }}>No hay registros para mostrar</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th>Empresa</th>
                  <th>Giro</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Comentario</th>
                  <th>Seguimientos</th>
                  <th>Estatus</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((r, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: r.estatus === 'Pendiente' ? '#fff8f8' : '#f8fff8'
                    }}
                  >
                    <td>{r.empresa}</td>
                    <td>{r.giro}</td>
                    <td>{r.nombreContacto}</td>
                    <td>{r.telefono}</td>
                    <td>{r.correo}</td>
                    <td>{r.comentario}</td>
                    <td>
                      {r.seguimientos && r.seguimientos.length > 0 ? (
                        <ul style={styles.seguimientosList}>
                          {r.seguimientos.map((s, i) => (
                            <li key={i} style={styles.seguimientoItem}>
                              <div style={styles.seguimientoFecha}>{s.fecha}</div>
                              <div style={styles.seguimientoTexto}>{s.seguimiento || s.texto}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#999' }}>Sin seguimientos</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: r.estatus === 'Pendiente' ? '#e74c3c' : '#27ae60' }}>
                      {r.estatus}
                    </td>
                    <td>{r.fecha || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button onClick={onRegresar} style={styles.backBtn}>Regresar al Menú</button>
      </div>
    </div>
  );
}

/* estilos originales intactos */
const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: 24,
    background: 'linear-gradient(180deg,#eef7ff,#ffffff)',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  },
  title: { margin: 0, fontSize: 28, color: '#154c79' },
  subtitle: { marginTop: 6, marginBottom: 18, color: '#365b76' },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    maxWidth: 1100,
    margin: '12px auto'
  },
  control: {
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#ecf3fb',
    color: '#154c79',
    cursor: 'pointer'
  },
  controlActive: { padding: '8px 12px', borderRadius: 8, border: 'none', background: '#1976d2', color: 'white', cursor: 'pointer' },
  controlActiveRed: { padding: '8px 12px', borderRadius: 8, border: 'none', background: '#e53935', color: 'white', cursor: 'pointer' },
  controlActiveGreen: { padding: '8px 12px', borderRadius: 8, border: 'none', background: '#2e7d32', color: 'white', cursor: 'pointer' },
  dateInput: { padding: '6px 8px', borderRadius: 6, border: '1px solid #cfe6ff' },
  exportBtn: { padding: '8px 12px', borderRadius: 8, border: 'none', backgroundColor:'#2e86de', color:'white', cursor:'pointer' },
  card: {
    maxWidth: 1100,
    margin: '12px auto',
    background: 'white',
    borderRadius: 10,
    padding: 16,
    boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  thead: { background: '#eef6ff', color: '#154c79' },
  seguimientosList: { listStyle: 'none', margin: 0, paddingLeft: 0 },
  seguimientoItem: { padding: '6px 8px', borderBottom: '1px solid #eee', display: 'flex', gap: 12 },
  seguimientoFecha: { minWidth: 140, color: '#567', fontWeight: 700, fontSize: 12 },
  seguimientoTexto: { color: '#333', fontSize: 13 },
  backBtn: { padding: '10px 16px', borderRadius: 8, border: 'none', background: '#6c757d', color: 'white', cursor: 'pointer' }
};

export default Reportes;
