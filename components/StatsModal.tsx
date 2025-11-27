import React, { useMemo } from 'react';
import { Match, User } from '../types';
import Modal from './Modal';
import { TrophyIcon } from './icons';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  matches: Match[];
}

interface PlayerStat {
  user: User;
  played: number;
  organized: number;
  setsWon: number;
  gamesWon: number;
  score: number;
}

const StatBarChart: React.FC<{
  title: string;
  data: { user: User; count: number }[];
  colorClass: string;
  barGradient: string;
}> = ({ title, data, colorClass, barGradient }) => {
  
  // Get max value for scaling
  const maxVal = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
      <h3 className={`text-sm font-bold ${colorClass} uppercase tracking-wider mb-4 flex items-center gap-2`}>
        {title}
      </h3>
      
      <div className="space-y-4">
        {data.slice(0, 5).map((item, index) => {
          const percentage = (item.count / maxVal) * 100;
          const isTop = index === 0;
          
          return (
            <div key={item.user.id} className="relative">
              <div className="flex justify-between items-end mb-1 text-xs">
                 <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${isTop ? 'text-yellow-400' : 'text-slate-500'} w-4`}>
                        {index + 1}
                    </span>
                    <span className={`font-medium ${isTop ? 'text-white' : 'text-slate-300'}`}>
                        {item.user.name.split(' ')[0]}
                    </span>
                 </div>
                 <span className="font-bold text-white">{item.count}</span>
              </div>
              
              {/* Bar Track */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                {/* Filled Bar */}
                <div 
                    className={`h-full rounded-full ${barGradient} shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
        {data.length === 0 && <p className="text-xs text-slate-600 italic">No hay datos aún.</p>}
      </div>
    </div>
  );
}

const PodiumStep: React.FC<{ 
    stat: PlayerStat; 
    rank: 1 | 2 | 3; 
}> = ({ stat, rank }) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    
    // Colors based on rank
    const colors = isFirst 
        ? { border: 'border-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-400/20', ring: 'ring-yellow-400/50', glow: 'shadow-yellow-500/20' }
        : isSecond
        ? { border: 'border-slate-300', text: 'text-slate-300', bg: 'bg-slate-300/20', ring: 'ring-slate-300/50', glow: 'shadow-slate-400/20' }
        : { border: 'border-amber-700', text: 'text-amber-600', bg: 'bg-amber-700/20', ring: 'ring-amber-700/50', glow: 'shadow-amber-900/20' };

    const heightClass = isFirst ? 'h-32 w-32' : 'h-24 w-24';
    const translateClass = isFirst ? '-translate-y-4 z-20' : 'translate-y-0 z-10';

    return (
        <div className={`flex flex-col items-center ${translateClass}`}>
             {/* Crown for 1st place */}
             {isFirst && (
                <div className="mb-2 animate-bounce">
                    <TrophyIcon className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                </div>
            )}
            
            {/* Avatar Container */}
            <div className={`relative rounded-full p-1 border-2 ${colors.border} shadow-lg ${colors.glow} ${heightClass}`}>
                <img 
                    src={stat.user.avatar} 
                    alt={stat.user.name} 
                    className="w-full h-full rounded-full object-cover"
                />
                <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 ${colors.border} ${colors.text} font-black shadow-lg`}>
                    {rank}
                </div>
            </div>

            {/* Name & Score */}
            <div className="mt-5 text-center">
                <div className={`font-bold ${colors.text} leading-tight`}>
                    {stat.user.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {stat.score} pts
                </div>
            </div>
        </div>
    )
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, users, matches }) => {

  const stats = useMemo(() => {
    // 1. Calculate raw stats for every user
    const playerStats: PlayerStat[] = users.map(user => {
        let played = 0;
        let organized = 0;
        let setsWon = 0;
        let gamesWon = 0;

        matches.forEach(match => {
            // Organized
            if (match.createdBy.id === user.id) {
                organized++;
            }

            // Played & Performance
            const pIndex = match.players.findIndex(p => p.id === user.id);
            if (pIndex !== -1) {
                played++;

                if (match.score && match.score.team1 && match.score.team2) {
                    const { team1, team2 } = match.score;
                    // Team 1: index 0 & 1. Team 2: index 2 & 3
                    const isTeam1 = pIndex === 0 || pIndex === 1;

                    team1.forEach((s1, idx) => {
                        const s2 = team2[idx];
                        if (typeof s1 !== 'number' || typeof s2 !== 'number') return;

                        if (isTeam1) {
                            gamesWon += s1;
                            if (s1 > s2) setsWon++;
                        } else {
                            gamesWon += s2;
                            if (s2 > s1) setsWon++;
                        }
                    });
                }
            }
        });

        // Weighted Score Calculation
        // Played: 10pts, Organized: 5pts, Set Won: 20pts, Game Won: 1pt
        const score = (played * 10) + (organized * 5) + (setsWon * 20) + (gamesWon * 1);

        return { user, played, organized, setsWon, gamesWon, score };
    });

    // 2. Sort for Podium (by Score)
    const rankedByScore = [...playerStats].sort((a, b) => b.score - a.score);

    // 3. Sort lists for Bar Charts
    const listPlayed = [...playerStats].sort((a, b) => b.played - a.played).map(s => ({ user: s.user, count: s.played }));
    const listOrganized = [...playerStats].sort((a, b) => b.organized - a.organized).map(s => ({ user: s.user, count: s.organized }));
    const listSets = [...playerStats].sort((a, b) => b.setsWon - a.setsWon).map(s => ({ user: s.user, count: s.setsWon }));
    const listGames = [...playerStats].sort((a, b) => b.gamesWon - a.gamesWon).map(s => ({ user: s.user, count: s.gamesWon }));

    return { 
        podium: rankedByScore.slice(0, 3),
        matchesPlayed: listPlayed,
        matchesOrganized: listOrganized,
        setsWon: listSets,
        gamesWon: listGames
    };
  }, [users, matches]);
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Estadísticas">
      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-1 pb-4">
        
        {/* PODIUM SECTION */}
        {stats.podium.length > 0 && (
            <div className="mb-8 mt-4 relative">
                 <h3 className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Ranking MVP</h3>
                 
                 <div className="flex justify-center items-end gap-2 sm:gap-6 px-2">
                    {/* 2nd Place */}
                    {stats.podium[1] && <PodiumStep stat={stats.podium[1]} rank={2} />}
                    
                    {/* 1st Place */}
                    {stats.podium[0] && <PodiumStep stat={stats.podium[0]} rank={1} />}
                    
                    {/* 3rd Place */}
                    {stats.podium[2] && <PodiumStep stat={stats.podium[2]} rank={3} />}
                 </div>
                 
                 {/* Podium base decoration */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full blur-sm"></div>
            </div>
        )}

        <div className="space-y-6">
            <StatBarChart 
                title="Partidos Jugados" 
                data={stats.matchesPlayed} 
                colorClass="text-cyan-400"
                barGradient="bg-gradient-to-r from-cyan-600 to-cyan-400"
            />

            <StatBarChart 
                title="Partidos Organizados" 
                data={stats.matchesOrganized} 
                colorClass="text-orange-400"
                barGradient="bg-gradient-to-r from-orange-600 to-orange-400"
            />
            
            <StatBarChart 
                title="Sets Ganados" 
                data={stats.setsWon} 
                colorClass="text-indigo-400"
                barGradient="bg-gradient-to-r from-indigo-600 to-indigo-400"
            />

            <StatBarChart 
                title="Juegos Ganados" 
                data={stats.gamesWon} 
                colorClass="text-pink-400"
                barGradient="bg-gradient-to-r from-pink-600 to-pink-400"
            />
        </div>
      </div>
    </Modal>
  );
};

export default StatsModal;