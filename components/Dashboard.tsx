import React, { useMemo } from 'react';
import { Match, User } from '../types';
import MatchCard from './MatchCard';

interface DashboardProps {
  matches: Match[];
  currentUser: User | null;
  view: 'all' | 'my';
  onJoinMatch: (matchId: string) => void;
  onLeaveMatch: (matchId: string) => void;
  onJoinWaitingList: (matchId: string) => void;
  onLeaveWaitingList: (matchId: string) => void;
  onOpenScoreModal: (matchId: string) => void;
  onShareMatch: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}


const Dashboard: React.FC<DashboardProps> = ({ matches, currentUser, view, onJoinMatch, onLeaveMatch, onJoinWaitingList, onLeaveWaitingList, onOpenScoreModal, onShareMatch, onEditMatch }) => {
  
  const filteredAndSortedMatches = useMemo(() => {
    const now = new Date();
    
    let filteredMatches = matches.filter(match => {
      const matchDateTime = new Date(`${match.date}T${match.time}`);
      return matchDateTime >= now;
    });

    if (view === 'my' && currentUser) {
        filteredMatches = filteredMatches.filter(match => 
            match.players.some(p => p.id === currentUser.id) ||
            match.waitingList.some(p => p.id === currentUser.id) ||
            match.createdBy.id === currentUser.id
        );
    }
    
    return filteredMatches.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });
    
  }, [matches, view, currentUser]);
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedMatches.length > 0 ? (
          filteredAndSortedMatches.map(match => (
            <MatchCard 
              key={match.id}
              match={match}
              currentUser={currentUser}
              onJoinMatch={onJoinMatch}
              onLeaveMatch={onLeaveMatch}
              onJoinWaitingList={onJoinWaitingList}
              onLeaveWaitingList={onLeaveWaitingList}
              onOpenScoreModal={onOpenScoreModal}
              onShareMatch={onShareMatch}
              onEditMatch={onEditMatch}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <h2 className="text-2xl font-semibold text-slate-300">No hay partidos próximos.</h2>
            <p className="text-slate-400 mt-2">¡Crea un nuevo partido para empezar a jugar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;