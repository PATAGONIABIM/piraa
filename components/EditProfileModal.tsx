import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import Modal from './Modal';
import { CameraIcon } from './icons';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [isProcessing, setIsProcessing] = useState(false); // Nuevo estado para indicar carga
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar);
    }
  }, [user]);

  /**
   * Función para redimensionar y comprimir la imagen
   * Reduce la imagen a un máximo de 300px de ancho/alto y baja la calidad a 0.7
   */
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300; // Reducimos tamaño para asegurar que entre en Firestore
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones manteniendo el aspecto
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convertir a JPEG con calidad 0.7 para reducir peso
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
          } else {
            reject(new Error("No se pudo obtener el contexto del canvas"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        setIsProcessing(true);
        // Procesamos la imagen antes de guardarla en el estado
        const compressedImage = await processImage(file);
        setAvatar(compressedImage);
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        alert("Hubo un error al procesar la imagen. Intenta con otra.");
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      email,
      phone,
      avatar,
    });
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-600 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className={`w-28 h-28 rounded-full p-1 border-2 border-dashed border-cyan-500/50 group-hover:border-cyan-400 transition-colors ${isProcessing ? 'animate-pulse' : ''}`}>
                <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            
            <button
              type="button"
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              disabled={isProcessing}
              className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-2.5 hover:bg-cyan-400 shadow-lg text-white transition-transform transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CameraIcon className="w-5 h-5" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
        
        {isProcessing && (
          <div className="text-center text-xs text-cyan-400 mb-2">
            Optimizando imagen...
          </div>
        )}
        
        <div className="space-y-4">
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            required
            className={inputClasses}
            />
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (opcional)"
            className={inputClasses}
            />
            <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono (opcional)"
            className={inputClasses}
            />
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isProcessing}
            className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Procesando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;