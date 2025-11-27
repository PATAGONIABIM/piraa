import React from 'react';
import { ChartBarIcon, UserCircleIcon, LogoutIcon } from './icons';

interface HeaderProps {
  onOpenStatsModal: () => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenStatsModal, onOpenProfileModal, onLogout }) => {
  
  return (
    <header className="bg-slate-950/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-30 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
            {/* Logo representation */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
                <span className="text-white font-black text-lg">P</span>
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200 leading-none">
                Pirañas
                </h1>
                <span className="text-[10px] font-bold text-cyan-500 tracking-widest uppercase">Padel Group</span>
            </div>
        </div>
        
        <div className="flex items-center bg-slate-900/80 rounded-full p-1 border border-white/10 shadow-sm">
            <button 
                onClick={onOpenStatsModal} 
                className="p-2.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-white/5" 
                title="Estadísticas"
            >
                <ChartBarIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5"></div>
            <button 
                onClick={onOpenProfileModal} 
                className="p-2.5 text-slate-400 hover:text-orange-400 transition-colors rounded-full hover:bg-white/5" 
                title="Editar Perfil"
            >
                <UserCircleIcon className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5"></div>
            <button 
                onClick={onLogout} 
                className="p-2.5 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/5" 
                title="Salir"
            >
                <LogoutIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;