import React from 'react';
import { PlusIcon, UsersGroupIcon, ListBulletIcon } from './icons';

interface BottomNavProps {
  activeView: 'all' | 'my';
  onViewChange: (view: 'all' | 'my') => void;
  onOpenCreateMatchModal: () => void;
}

const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button 
            onClick={onClick} 
            className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-bold absolute bottom-2 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {label}
            </span>
        </button>
    )
}


const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange, onOpenCreateMatchModal }) => {
  return (
    <div className="fixed bottom-6 left-4 right-4 h-16 bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl z-40 flex items-center justify-around overflow-visible ring-1 ring-white/5">
        <NavButton
            icon={<UsersGroupIcon className="w-6 h-6" />}
            label="Mis Partidos"
            isActive={activeView === 'my'}
            onClick={() => onViewChange('my')}
        />

        <div className="relative -top-6">
            <button
            onClick={onOpenCreateMatchModal}
            className="group w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transition-transform transform hover:scale-105 active:scale-95 border-4 border-slate-950"
            >
                <PlusIcon className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </div>

        <NavButton
            icon={<ListBulletIcon className="w-6 h-6" />}
            label="Todos"
            isActive={activeView === 'all'}
            onClick={() => onViewChange('all')}
        />
    </div>
  );
};

export default BottomNav;