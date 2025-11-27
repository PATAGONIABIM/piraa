// src/components/SignUp.tsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';

interface SignUpProps {
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState(''); // Estado para el nombre
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerificationSent, setVerificationSent] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationSent(false);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!name.trim()) {
        setError("Por favor, introduce tu nombre o apodo.");
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // --- MODIFICACIÓN ---
      // Actualiza el perfil del usuario con el nombre proporcionado
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      await sendEmailVerification(userCredential.user);
      setVerificationSent(true);

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("Este correo electrónico ya está en uso.");
      } else {
        setError("Error al crear la cuenta. Por favor, inténtalo de nuevo.");
      }
      console.error("Error during sign-up:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">Crear Cuenta</h1>
        {isVerificationSent ? (
          <p className="text-green-400 mb-4">
            ¡Correo de verificación enviado! Por favor, revisa tu bandeja de entrada para activar tu cuenta.
          </p>
        ) : (
          <p className="text-slate-300 mb-8">Crea una cuenta para empezar a organizar partidos.</p>
        )}
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          {/* Campo de Nombre añadido */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre o Apodo"
            className="bg-slate-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
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
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Crear Cuenta
          </button>
        </form>
        <p className="mt-6 text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onSwitchToLogin} className="text-teal-400 hover:underline">
            Inicia Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;