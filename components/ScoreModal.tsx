import React, { useState, useEffect, useMemo } from 'react';
import { Match, User } from '../types';
import Modal from './Modal';
import { ShuffleIcon } from './icons';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onSaveScore: (matchId: string, score: { team1: number[]; team2: number[] }) => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ isOpen, onClose, match, onSaveScore }) => {
  const [team1Scores, setTeam1Scores] = useState<(number | string)[]>(['', '', '']);
  const [team2Scores, setTeam2Scores] = useState<(number | string)[]>(['', '', '']);
  const [teams, setTeams] = useState<{ teamA: User[], teamB: User[] }>({ teamA: [], teamB: [] });
  
  useEffect(() => {
    if (match?.players.length === 4) {
        setTeams({
            teamA: [match.players[0], match.players[1]],
            teamB: [match.players[2], match.players[3]],
        });
    }

    if (match?.score) {
      const newTeam1Scores: (number | string)[] = [...match.score.team1];
      const newTeam2Scores: (number | string)[] = [...match.score.team2];
      while (newTeam1Scores.length < 3) newTeam1Scores.push('');
      while (newTeam2Scores.length < 3) newTeam2Scores.push('');
      setTeam1Scores(newTeam1Scores);
      setTeam2Scores(newTeam2Scores);
    } else {
      setTeam1Scores(['', '', '']);
      setTeam2Scores(['', '', '']);
    }
  }, [match]);

  const handleShuffleTeams = () => {
    const shuffledPlayers = [...match.players].sort(() => 0.5 - Math.random());
    setTeams({
        teamA: [shuffledPlayers[0], shuffledPlayers[1]],
        teamB: [shuffledPlayers[2], shuffledPlayers[3]],
    });
  }

  const handleScoreChange = (
    team: 'team1' | 'team2',
    setIndex: number,
    value: string
  ) => {
    const newScores = team === 'team1' ? [...team1Scores] : [...team2Scores];
    const numericValue = value === '' ? '' : Math.max(0, parseInt(value, 10));
    newScores[setIndex] = numericValue;
    if (team === 'team1') {
      setTeam1Scores(newScores);
    } else {
      setTeam2Scores(newScores);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalScores = {
      team1: team1Scores.map(s => parseInt(s as string, 10)).filter(s => !isNaN(s)),
      team2: team2Scores.map(s => parseInt(s as string, 10)).filter(s => !isNaN(s)),
    };
    onSaveScore(match.id, finalScores);
  };

  const PlayerChip: React.FC<{ user: User, colorClass: string }> = ({ user, colorClass }) => (
    <div className={`flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-950 border border-white/5 ${colorClass}`}>
        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
        <span className="text-sm font-medium text-white">{user.name.split(' ')[0]}</span>
    </div>
  )

  if (!isOpen || !match || match.players.length < 4) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resultado" titleAlign="center">
      <div className="text-center mb-6 -mt-2">
        <p className="text-cyan-400 font-medium">{match.court}</p>
        <p className="text-slate-500 text-sm">{match.time}</p>
      </div>
      
      <div className="mb-8 bg-slate-900/50 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between gap-2">
            {/* Team A */}
            <div className="flex flex-col gap-2 items-center flex-1">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Equipo A</h4>
                {teams.teamA.map(p => <PlayerChip key={p.id} user={p} colorClass="ring-1 ring-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]" />)}
            </div>
            
            {/* VS / Shuffle */}
            <div className="px-2 flex flex-col items-center">
                <button 
                    onClick={handleShuffleTeams} 
                    className="bg-slate-800 p-2.5 rounded-full hover:bg-slate-700 hover:text-cyan-400 text-slate-400 transition-colors border border-white/10 shadow-lg"
                    title="Mezclar equipos"
                >
                    <ShuffleIcon className="w-5 h-5"/>
                </button>
                <span className="text-[10px] text-slate-600 font-bold mt-1">VS</span>
            </div>

            {/* Team B */}
            <div className="flex flex-col gap-2 items-center flex-1">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Equipo B</h4>
                {teams.teamB.map(p => <PlayerChip key={p.id} user={p} colorClass="ring-1 ring-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]" />)}
            </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-2 gap-y-4 items-center px-2">
          <div className="text-xs text-slate-500 font-bold uppercase text-right pr-2">Set</div>
          <div className="text-center text-xs font-bold text-slate-400">1</div>
          <div className="text-center text-xs font-bold text-slate-400">2</div>
          <div className="text-center text-xs font-bold text-slate-400">3</div>

          <div className="text-cyan-400 font-bold text-sm text-right pr-2">EQ. A</div>
          {[0, 1, 2].map(setIndex => (
             <input
                key={`t1-${setIndex}`}
                type="number"
                min="0"
                value={team1Scores[setIndex]}
                onChange={(e) => handleScoreChange('team1', setIndex, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-800 shadow-inner"
                placeholder="-"
              />
          ))}

          <div className="text-orange-400 font-bold text-sm text-right pr-2">EQ. B</div>
           {[0, 1, 2].map(setIndex => (
             <input
                key={`t2-${setIndex}`}
                type="number"
                min="0"
                value={team2Scores[setIndex]}
                onChange={(e) => handleScoreChange('team2', setIndex, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-800 shadow-inner"
                placeholder="-"
              />
          ))}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-400 font-semibold hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95">
            Guardar Resultado
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScoreModal;