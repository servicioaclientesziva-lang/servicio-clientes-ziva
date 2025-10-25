import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from './firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrarse, setRegistrarse] = useState(false);
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');

  const PIN_MAESTRO = '202500';
  const ADMIN_EMAIL = 'jasesor@hotmail.com';

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const esAdmin = user.email === ADMIN_EMAIL;

      // 🔹 Obtener nombre del usuario desde Firestore
      const docSnap = await getDoc(doc(db, "usuarios", user.uid));
      const nombreUsuario = docSnap.exists() ? docSnap.data().nombre : user.displayName || '';

      // Guardar en localStorage
      localStorage.setItem('usuarioActivo', JSON.stringify({ email: user.email, nombre: nombreUsuario, puedeEliminar: esAdmin }));

      // Llamar al onLogin enviando email y nombre
      onLogin(user.email, nombreUsuario);
    } catch (error) {
      alert('Correo o contraseña incorrectos');
      console.error(error);
    }
  };

  const handleRegistro = async () => {
    if (pin !== PIN_MAESTRO) {
      alert('Acceso solo para personal autorizado de Ziva Group');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: nombre });
      const esAdmin = user.email === ADMIN_EMAIL;

      // Guardar en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre,
        email: email,
        puedeEliminar: esAdmin
      });

      // Guardar en localStorage y pasar nombre al onLogin
      localStorage.setItem('usuarioActivo', JSON.stringify({ email: user.email, nombre, puedeEliminar: esAdmin }));
      onLogin(user.email, nombre);

      alert('Registro exitoso, ya puedes iniciar sesión');
      setRegistrarse(false);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este correo ya está registrado');
      } else {
        alert('Error al registrar: ' + error.message);
      }
      console.error(error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f4f7',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        width: '350px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '10px', fontSize: '32px', color: '#333' }}>ZIVA GROUP</h1>
        <h2 style={{ marginBottom: '30px', fontSize: '16px', color: '#555', textTransform: 'uppercase' }}>Seguimiento a Marcas</h2>

        {!registrarse ? (
          <>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleLogin}
              style={{ width: '100%', padding: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }}
            >
              Ingresar
            </button>
            <p style={{ color: '#555' }}>¿Eres nuevo? <span onClick={() => setRegistrarse(true)} style={{ color: '#1976d2', cursor: 'pointer' }}>Regístrate aquí</span></p>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="Pin Maestro"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleRegistro}
              style={{ width: '100%', padding: '10px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }}
            >
              Registrarse
            </button>
            <p style={{ color: '#555' }}>¿Ya tienes cuenta? <span onClick={() => setRegistrarse(false)} style={{ color: '#4caf50', cursor: 'pointer' }}>Inicia sesión aquí</span></p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
