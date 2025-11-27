import React from 'react';
import { Match } from '../types';
import Modal from './Modal';
import { WhatsAppIcon } from './icons';

interface ShareMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  type?: 'created' | 'status';
}

const ShareMatchModal: React.FC<ShareMatchModalProps> = ({ isOpen, onClose, match, type = 'status' }) => {
  if (!isOpen || !match) return null;

  const date = new Date(match.date + 'T00:00:00');
  const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  let message = '';
  let title = '';
  let description = '';

  if (type === 'created') {
    title = '¡Partido Creado!';
    description = 'El partido está listo. Compártelo en el grupo de WhatsApp para que se apunten.';
    message = `¡Nuevo partido de pádel en Pirañas! 🎾\n\n🗓️ *Fecha:* ${capitalizedDate}\n⏰ *Hora:* ${match.time}\n📍 *Lugar:* ${match.court}\n\n¡Entra a la app y apúntate!`;
  } else {
    title = 'Compartir Partido';
    description = 'Comparte el estado actual del partido con los jugadores.';
    
    // Build Player List
    const playersList = match.players.map((p, i) => `${i + 1}. ${p.name.split(' ')[0]}`).join('\n');
    
    // Build Empty Spots
    const spotsLeft = 4 - match.players.length;
    const emptySpotsList = spotsLeft > 0 
        ? Array(spotsLeft).fill(0).map((_, i) => `${match.players.length + i + 1}. 🟢 Libre`).join('\n')
        : '';
    
    const fullPlayerList = [playersList, emptySpotsList].filter(Boolean).join('\n');

    // Build Waiting List
    const waitingListText = match.waitingList.length > 0 
        ? `\n\n⏳ *En Espera:*\n${match.waitingList.map((p, i) => `${i + 1}. ${p.name.split(' ')[0]}`).join('\n')}`
        : '';

    message = `🎾 *Pirañas Padel Group*\n\n🗓️ *${capitalizedDate}*\n⏰ *${match.time} hrs*\n📍 *${match.court}*\n\n👥 *Alineación:*\n${fullPlayerList}${waitingListText}\n\n📲 ¡Nos vemos en la cancha!`;
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <WhatsAppIcon className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-slate-300">{description}</p>
        
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 shadow-inner relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl"></div>

            <div className="flex justify-between border-b border-slate-800 pb-2 mb-2 relative z-10">
                <span className="text-slate-500 text-sm font-bold uppercase">Fecha</span>
                <span className="text-white font-medium capitalize">{formattedDate}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2 mb-2 relative z-10">
                <span className="text-slate-500 text-sm font-bold uppercase">Hora</span>
                <span className="text-white font-medium">{match.time}</span>
            </div>
            <div className="flex justify-between relative z-10 mb-2 border-b border-slate-800 pb-2">
                <span className="text-slate-500 text-sm font-bold uppercase">Lugar</span>
                <span className="text-cyan-400 font-medium">{match.court}</span>
            </div>
            
            {type === 'status' && (
                 <div className="pt-1 relative z-10">
                    <span className="text-slate-500 text-sm font-bold uppercase block mb-2">Jugadores</span>
                    <div className="grid grid-cols-2 gap-2">
                        {match.players.map(p => (
                            <div key={p.id} className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                {p.name.split(' ')[0]}
                            </div>
                        ))}
                         {[...Array(4 - match.players.length)].map((_, i) => (
                             <div key={`free-${i}`} className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                                Libre
                            </div>
                         ))}
                    </div>
                    {match.waitingList.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 border-dashed">
                             <span className="text-orange-400/70 text-[10px] font-bold uppercase block mb-1">En Espera ({match.waitingList.length})</span>
                             <div className="flex flex-wrap gap-2">
                                {match.waitingList.map(p => (
                                    <span key={p.id} className="text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{p.name.split(' ')[0]}</span>
                                ))}
                             </div>
                        </div>
                    )}
                 </div>
            )}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-green-900/20"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Compartir en WhatsApp
        </a>
      </div>
    </Modal>
  );
};

export default ShareMatchModal;