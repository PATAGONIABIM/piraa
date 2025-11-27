// src/components/Login.tsx
import React, { useState, useEffect } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, applyActionCode } from 'firebase/auth';
import SignUp from './SignUp';

const Login = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // --- NUEVO ESTADO ---
  // Para manejar el mensaje de verificación de correo
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // --- NUEVO useEffect ---
  // Este hook se ejecuta cuando el componente se carga y revisa la URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const actionCode = params.get('oobCode');

    if (mode === 'verifyEmail' && actionCode) {
      handleVerifyEmail(actionCode);
    } else {
      setIsVerifying(false); // Si no hay código, no estamos verificando
    }
  }, []);

  // --- NUEVA FUNCIÓN ---
  // Llama a Firebase para aplicar el código de verificación
  const handleVerifyEmail = async (actionCode: string) => {
    try {
      await applyActionCode(auth, actionCode);
      setVerificationMessage('✅ ¡Tu correo ha sido verificado con éxito! Ya puedes iniciar sesión.');
      // Limpiamos la URL para que no se vuelva a ejecutar al recargar
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error al verificar correo:", error);
      setVerificationMessage('❌ Error: El enlace de verificación no es válido o ha expirado. Por favor, intenta registrarte de nuevo.');
    } finally {
        setIsVerifying(false);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError("Por favor, verifica tu correo electrónico antes de iniciar sesión.");
          await auth.signOut(); // Cierra la sesión si el correo no está verificado
        }
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError("Correo o contraseña incorrectos.");
        } else {
            setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
        }
        console.error("Error during email sign-in:", error);
      }
  };

  // Si estamos en proceso de verificar, mostramos un mensaje de carga
  if (isVerifying) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
            <h1 className="text-2xl font-bold">Verificando tu correo...</h1>
        </div>
    );
  }

  // Si ya tenemos un mensaje de verificación (éxito o error), lo mostramos
  if (verificationMessage) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white text-center p-4">
        <h1 className="text-4xl font-bold mb-4">PirañasPadel</h1>
        <p className="text-slate-300 text-lg mb-8 max-w-md">{verificationMessage}</p>
        <button
          onClick={() => setVerificationMessage(null)} // Permite al usuario volver al login
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  if (showSignUp) {
    return <SignUp onSwitchToLogin={() => setShowSignUp(false)} />;
  }

  // Renderizado normal del formulario de Login
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">PirañasPadel</h1>
        <p className="text-slate-300 mb-8">Inicia sesión para organizar y unirte a partidos.</p>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo Electrónico"
                className="bg-slate-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="bg-slate-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
                Iniciar Sesión con Correo
            </button>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-400">O</span>
            <div className="flex-grow border-t border-slate-700"></div>
        </div>


        <button
          onClick={handleGoogleLogin}
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 w-full"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.03,16.21 5.03,12.5C5.03,8.79 8.36,5.73 12.19,5.73C14.43,5.73 16.09,6.81 16.8,7.68L18.83,5.64C16.93,3.79 14.8,2.77 12.19,2.77C7.03,2.77 3,7.22 3,12.5C3,17.78 7.03,22.23 12.19,22.23C17.76,22.23 21.54,18.51 21.54,12.71C21.54,12.08 21.48,11.58 21.35,11.1Z"/>
          </svg>
          Continuar con Google
        </button>

         <p className="mt-6 text-slate-400">
          ¿No tienes una cuenta?{' '}
          <button onClick={() => setShowSignUp(true)} className="text-teal-400 hover:underline">
            Crea una
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;