import React, { useState } from 'react';
import { Match, User } from '../types';
import { LocationIcon, ClockIcon, ShareIcon, XIcon, PencilIcon } from './icons';

interface MatchCardProps {
  match: Match;
  currentUser: User | null;
  onJoinMatch: (matchId: string) => void;
  onLeaveMatch: (matchId: string) => void;
  onJoinWaitingList: (matchId: string) => void;
  onLeaveWaitingList: (matchId: string) => void;
  onOpenScoreModal: (matchId: string) => void;
  onShareMatch: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

interface PlayerChipProps {
    user: User | 'Libre';
    onClick?: (user: User) => void;
}

const PlayerChip: React.FC<PlayerChipProps> = ({ user, onClick }) => {
    if (user === 'Libre') {
        return (
            <div className="flex items-center justify-center gap-2 bg-slate-900/50 border border-dashed border-slate-800 text-slate-600 text-xs px-2 py-1.5 rounded-lg cursor-default select-none">
                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                Libre
            </div>
        );
    }
    
    return (
        <button 
            onClick={(e) => {
                if (onClick) {
                    e.stopPropagation();
                    onClick(user);
                }
            }}
            className="flex items-center gap-2 bg-slate-800 border border-white/5 text-slate-200 text-xs px-2 py-1.5 rounded-lg shadow-sm group hover:border-cyan-500/30 transition-colors w-full text-left"
        >
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-cyan-500/50" />
            <span className="truncate group-hover:text-cyan-100 transition-colors">{user.name.split(' ')[0]}</span>
        </button>
    );
}


const MatchCard: React.FC<MatchCardProps> = ({ match, currentUser, onJoinMatch, onLeaveMatch, onJoinWaitingList, onLeaveWaitingList, onOpenScoreModal, onShareMatch, onEditMatch }) => {
  const [quickViewUser, setQuickViewUser] = useState<User | null>(null);
  
  const isPlayer = currentUser ? match.players.some(p => p.id === currentUser.id) : false;
  const isOrganizer = currentUser ? match.createdBy.id === currentUser.id : false;
  const isOnWaitingList = currentUser ? match.waitingList.some(p => p.id === currentUser.id) : false;
  const isFull = match.players.length >= 4;
  
  const ActionButton = () => {
    if (!currentUser) return null;

    if (isPlayer) {
      return (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onLeaveMatch(match.id);
            }} 
            className="w-full bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
        >
            Salir del partido
        </button>
      );
    }
    if (isOnWaitingList) {
      return (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onLeaveWaitingList(match.id);
            }} 
            className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 group relative overflow-hidden"
        >
            <span className="relative z-10 group-hover:hidden">En lista de espera</span>
            <span className="relative z-10 hidden group-hover:inline">Salir de espera</span>
        </button>
      );
    }
    if (isFull) {
      return (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onJoinWaitingList(match.id);
            }} 
            className="w-full bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-900/10 font-bold py-2.5 px-4 rounded-xl transition-all duration-200"
        >
            Entrar a espera
        </button>
      );
    }
    return (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onJoinMatch(match.id);
            }} 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 font-bold py-2.5 px-4 rounded-xl transition-all duration-200 transform active:scale-[0.98] border border-transparent"
        >
            ¡Me apunto!
        </button>
    );
  };

  const StatusTag = () => {
    if (isFull) {
         return <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md border border-orange-400/20">Completo</span>;
    }
    const spotsLeft = 4 - match.players.length;
    const colorClass = spotsLeft === 1 ? 'text-orange-300 bg-orange-400/10 border-orange-400/20' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${colorClass}`}>{spotsLeft} cupos</span>;
  }

  const date = new Date(match.date + 'T00:00:00');
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' });
  const day = date.getDate();

  // Dynamic border based on status
  const borderClass = isPlayer 
    ? 'border-cyan-500/50 shadow-cyan-500/10' 
    : isOrganizer 
    ? 'border-orange-500/50 shadow-orange-500/10' 
    : 'border-white/5';

  return (
    <div 
      className={`group relative bg-slate-900/40 backdrop-blur-xl rounded-2xl border ${borderClass} shadow-xl flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-2xl hover:-translate-y-1`}
      onClick={(e) => {
        if (isFull) {
             onOpenScoreModal(match.id);
        }
      }}
    >
      {/* Header stripe */}
      <div className={`h-1 w-full bg-gradient-to-r ${isPlayer ? 'from-cyan-400 to-blue-500' : isOrganizer ? 'from-orange-400 to-orange-600' : 'from-slate-700 to-slate-600'}`}></div>
      
      <div className="p-5 flex-grow flex flex-col gap-4 relative z-10">
        
        {/* Top Row: Date & Status */}
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="bg-slate-800 rounded-xl p-2 flex flex-col items-center justify-center w-12 h-12 border border-white/10 shadow-inner ring-1 ring-white/5 group-hover:ring-cyan-500/20 transition-all">
                    <span className="text-[10px] uppercase text-slate-400 font-bold leading-none">{weekday}</span>
                    <span className="text-lg font-black text-white leading-tight">{day}</span>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 text-yellow-400 font-black text-2xl tracking-tight drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">
                        {match.time}
                        <span className="text-xs font-normal text-slate-500 mt-1">hrs</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <LocationIcon className="w-3 h-3 text-cyan-500" />
                        <span className="truncate max-w-[120px]">{match.court}</span>
                    </div>
                </div>
            </div>
            <StatusTag />
        </div>

        {/* Players Grid */}
        <div className="bg-slate-950/30 rounded-xl p-3 border border-white/5">
          <div className="flex justify-between items-end mb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alineación</h4>
            {isOrganizer && <span className="text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-500/20">Admin</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {match.players.map(p => <PlayerChip key={p.id} user={p} onClick={setQuickViewUser} />)}
            {[...Array(4 - match.players.length)].map((_, i) => <PlayerChip key={`placeholder-${i}`} user="Libre" />)}
          </div>
        </div>
      </div>
      
      {/* Waiting List - Visible by default if exists */}
      {match.waitingList.length > 0 && (
          <div className="px-5 py-2 bg-orange-500/5 border-t border-orange-500/10 flex items-center gap-3 relative z-10">
            <span className="text-[10px] font-bold uppercase text-orange-400 tracking-wide">Espera:</span>
            <div className="flex -space-x-2">
              {match.waitingList.map(user => (
                <button
                    key={user.id} 
                    onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewUser(user);
                    }}
                    className="relative focus:outline-none transition-transform hover:scale-110 hover:z-20"
                >
                    <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-6 h-6 rounded-full border-2 border-slate-900 ring-1 ring-orange-500/30" 
                        title={user.name}
                    />
                </button>
              ))}
              {match.waitingList.length > 3 && (
                 <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 text-[10px] flex items-center justify-center text-orange-400 ring-1 ring-orange-500/30">
                    +{match.waitingList.length - 3}
                 </div>
              )}
            </div>
          </div>
        )}

      {/* Action Footer */}
      <div className="p-4 bg-slate-950/50 border-t border-white/5 flex gap-3 relative z-10">
        <button 
             onClick={(e) => {
                 e.stopPropagation();
                 onShareMatch(match);
             }}
             className="flex items-center justify-center w-12 aspect-square bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200 shadow-sm"
             title="Compartir partido"
        >
            <ShareIcon className="w-5 h-5" />
        </button>
        
        {isOrganizer && (
           <button 
             onClick={(e) => {
                 e.stopPropagation();
                 onEditMatch(match);
             }}
             className="flex items-center justify-center w-12 aspect-square bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/30 rounded-xl transition-all duration-200 shadow-sm"
             title="Editar partido"
           >
              <PencilIcon className="w-5 h-5" />
           </button>
        )}

        <div className="flex-1">
            <ActionButton />
        </div>
      </div>

      {/* User Quick View Overlay */}
      {quickViewUser && (
          <div 
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
            onClick={(e) => {
                e.stopPropagation();
                setQuickViewUser(null);
            }}
          >
            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="relative mb-4 group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                     <img 
                        src={quickViewUser.avatar} 
                        alt={quickViewUser.name} 
                        className="relative w-24 h-24 rounded-full object-cover border-4 border-slate-900 ring-2 ring-cyan-500/50 shadow-2xl"
                     />
                </div>
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-200 mb-1">
                    {quickViewUser.name}
                </h3>
                {quickViewUser.email && (
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{quickViewUser.email}</p>
                )}
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewUser(null);
                    }}
                    className="mt-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors border border-white/10"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default MatchCard;