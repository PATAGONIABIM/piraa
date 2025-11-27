// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Match, User } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import CreateMatchForm from './components/CreateMatchForm';
import EditProfileModal from './components/EditProfileModal';
import StatsModal from './components/StatsModal';
import ScoreModal from './components/ScoreModal';
import BottomNav from './components/BottomNav';
import ShareMatchModal from './components/ShareMatchModal';
import EditMatchModal from './components/EditMatchModal';
// Importamos Login
import Login from './components/Login'; 

// --- FIREBASE IMPORTS ---
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  deleteField
} from "firebase/firestore";

const App: React.FC = () => {
  // Estados de datos
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estados de Modales
  const [isCreateMatchModalOpen, setCreateMatchModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [isStatsModalOpen, setStatsModalOpen] = useState(false);
  const [isScoreModalOpen, setScoreModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isEditMatchModalOpen, setEditMatchModalOpen] = useState(false);
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchToShare, setMatchToShare] = useState<Match | null>(null);
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const [shareModalType, setShareModalType] = useState<'created' | 'status'>('status');
  const [view, setView] = useState<'all' | 'my'>('all');

  // --- 1. AUTHENTICATION LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Permitimos acceso si tiene email verificado o es proveedor (Google, etc)
        if (user.emailVerified || user.providerData.some(p => p.providerId !== 'password')) {
            setIsAuthenticated(true);
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
              setCurrentUser({ ...docSnap.data(), id: docSnap.id } as User);
            } else {
              // Crear usuario si es la primera vez
              const newUser: User = {
                id: user.uid,
                name: user.displayName || 'Jugador Piraña',
                email: user.email || '',
                avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
              };
              await setDoc(userRef, newUser);
              setCurrentUser(newUser);
            }
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. USERS LISTENER ---
  useEffect(() => {
    if (!isAuthenticated) {
        setUsers([]);
        return;
    }
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[];
        setUsers(usersData);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // --- 3. MATCHES LISTENER & CLEANUP ---
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const unsubscribe = onSnapshot(collection(db, "matches"), (snapshot) => {
      const matchesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Convertimos Timestamp de Firestore a Date de JS si es necesario para lógica interna
          matchTimestamp: data.matchTimestamp?.toDate ? data.matchTimestamp.toDate() : undefined
        } as Match;
      });

      setMatches(matchesData);

      // Lógica de limpieza automática
      const now = new Date();
      matchesData.forEach(match => {
        if (match.matchTimestamp && match.matchTimestamp instanceof Date) {
          // Eliminar 5 minutos después de la hora
          const deletionTime = new Date(match.matchTimestamp.getTime() + 5 * 60 * 1000);
          
          if (now > deletionTime && match.createdBy.id === currentUser.id) {
             deleteDoc(doc(db, "matches", match.id)).catch(err => console.error("Error limpieza:", err));
          }
        }
      });
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser]);

  // --- LOGIC HANDLERS (Connected to Firebase) ---

  const handleUpdateUser = async (updatedUser: User) => {
    if (!currentUser) return;
    
    // Actualizar en Firestore
    const userRef = doc(db, "users", updatedUser.id);
    await updateDoc(userRef, {
        name: updatedUser.name,
        phone: updatedUser.phone || '',
        dob: updatedUser.dob || '',
    });

    setCurrentUser(updatedUser);
    setEditProfileModalOpen(false);
  };

  const handleCreateMatch = async (date: string, time: string, court: string) => {
    if (!currentUser) return;
    
    const matchDateTime = new Date(`${date}T${time}`);
    
    const newMatchData = {
      date,
      time,
      court,
      matchTimestamp: matchDateTime,
      players: [currentUser],
      waitingList: [],
      createdBy: currentUser,
    };

    try {
        const docRef = await addDoc(collection(db, "matches"), newMatchData);
        const newMatch: Match = { ...newMatchData, id: docRef.id } as Match;
        
        setCreateMatchModalOpen(false);
        setMatchToShare(newMatch);
        setShareModalType('created');
        setShareModalOpen(true);
    } catch (error) {
        console.error("Error creando partido:", error);
    }
  };

  const handleShareMatch = (match: Match) => {
    setMatchToShare(match);
    setShareModalType('status');
    setShareModalOpen(true);
  };
  
  const handleEditMatch = (match: Match) => {
    setMatchToEdit(match);
    setEditMatchModalOpen(true);
  };

  const handleUpdateMatchDetails = async (matchId: string, date: string, time: string, court: string) => {
     const matchRef = doc(db, "matches", matchId);
     const matchDateTime = new Date(`${date}T${time}`);
     
     await updateDoc(matchRef, {
         date,
         time,
         court,
         matchTimestamp: matchDateTime
     });

     setEditMatchModalOpen(false);
     setMatchToEdit(null);
  };

  const handleSetScore = async (matchId: string, score: { team1: number[], team2: number[] }) => {
    const cleanedScore = {
      team1: score.team1.filter(s => s !== null && s !== undefined && s.toString().trim() !== ''),
      team2: score.team2.filter(s => s !== null && s !== undefined && s.toString().trim() !== ''),
    };
    
    if (cleanedScore.team1.length !== cleanedScore.team2.length) return;

    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, { 
        score: cleanedScore.team1.length > 0 ? cleanedScore : deleteField() 
    });
    
    handleCloseScoreModal();
  };
  
  const handleOpenScoreModal = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setScoreModalOpen(true);
    }
  };

  const handleCloseScoreModal = () => {
    setScoreModalOpen(false);
    setSelectedMatch(null);
  };
  
  const handleJoinMatch = async (matchId: string) => {
    if (!currentUser) return;
    const matchRef = doc(db, "matches", matchId);
    
    // Unir al usuario
    await updateDoc(matchRef, {
        players: arrayUnion(currentUser)
    });

    // Verificar si se completaron los 4 para crear equipos automáticamente
    const updatedMatchSnap = await getDoc(matchRef);
    if (updatedMatchSnap.exists()) {
        const data = updatedMatchSnap.data();
        if (data.players.length === 4 && !data.teams) {
             const sortedPlayers = [...data.players].sort((a: User, b: User) => a.id.localeCompare(b.id));
             const [p1, p2, p3, p4] = sortedPlayers;
             await updateDoc(matchRef, { 
                 teams: { teamA: [p1, p2], teamB: [p3, p4] } 
             });
        }
    }
  };

  const handleLeaveMatch = async (matchId: string) => {
    if (!currentUser) return;
    const matchRef = doc(db, "matches", matchId);

    try {
        const matchSnap = await getDoc(matchRef);
        if (matchSnap.exists()) {
            const data = matchSnap.data();
            let newPlayers = data.players.filter((p: User) => p.id !== currentUser.id);
            const newWaitingList = [...data.waitingList];

            // Promover de lista de espera si es necesario
            if (newPlayers.length < 4 && newWaitingList.length > 0) {
                const nextPlayer = newWaitingList.shift();
                if(nextPlayer) newPlayers.push(nextPlayer);
            }

            // Al salir, limpiamos equipos y score para evitar inconsistencias
            await updateDoc(matchRef, {
                players: newPlayers,
                waitingList: newWaitingList,
                score: deleteField(),
                teams: deleteField()
            });
        }
    } catch (e) {
        console.error("Error saliendo del partido:", e);
    }
  };
  
  const handleJoinWaitingList = async (matchId: string) => {
    if (!currentUser) return;
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, { waitingList: arrayUnion(currentUser) });
  };

  const handleLeaveWaitingList = async (matchId: string) => {
    if (!currentUser) return;
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, { waitingList: arrayRemove(currentUser) });
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // --- RENDERING ---

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-950 flex justify-center items-center">
            <div className="animate-pulse-slow text-orange-500 text-xl font-bold">Cargando Pirañas Padel...</div>
        </div>
      );
  }

  if (!isAuthenticated) {
      return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative selection:bg-orange-500 selection:text-white">
       {/* Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[130px] animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        <Header
            onOpenStatsModal={() => setStatsModalOpen(true)}
            onOpenProfileModal={() => {
                if (currentUser) {
                    setEditProfileModalOpen(true);
                }
            }}
            onLogout={handleLogout}
            userAvatar={currentUser?.avatar}
        />
        <main className="pb-24 pt-4">
            <Dashboard 
                matches={matches} 
                currentUser={currentUser}
                view={view}
                onJoinMatch={handleJoinMatch}
                onLeaveMatch={handleLeaveMatch}
                onJoinWaitingList={handleJoinWaitingList}
                onLeaveWaitingList={handleLeaveWaitingList}
                onOpenScoreModal={handleOpenScoreModal}
                onShareMatch={handleShareMatch}
                onEditMatch={handleEditMatch}
            />
        </main>

        <BottomNav
            activeView={view}
            onViewChange={setView}
            onOpenCreateMatchModal={() => setCreateMatchModalOpen(true)}
        />

        <Modal
            isOpen={isCreateMatchModalOpen}
            onClose={() => setCreateMatchModalOpen(false)}
            title="Crear Partido"
        >
            <CreateMatchForm
            onCreateMatch={handleCreateMatch}
            onClose={() => setCreateMatchModalOpen(false)}
            />
        </Modal>

        {currentUser && (
            <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={() => setEditProfileModalOpen(false)}
            user={currentUser}
            onSave={handleUpdateUser}
            />
        )}

        <StatsModal
            isOpen={isStatsModalOpen}
            onClose={() => setStatsModalOpen(false)}
            users={users}
            matches={matches}
        />

        {selectedMatch && (
            <ScoreModal
                isOpen={isScoreModalOpen}
                onClose={handleCloseScoreModal}
                match={selectedMatch}
                onSaveScore={handleSetScore}
            />
        )}

        <ShareMatchModal
            isOpen={isShareModalOpen}
            onClose={() => {
                setShareModalOpen(false);
                setMatchToShare(null);
            }}
            match={matchToShare}
            type={shareModalType}
        />

        <EditMatchModal
            isOpen={isEditMatchModalOpen}
            onClose={() => {
                setEditMatchModalOpen(false);
                setMatchToEdit(null);
            }}
            match={matchToEdit}
            onSave={handleUpdateMatchDetails}
        />
      </div>
    </div>
  );
};

export default App;