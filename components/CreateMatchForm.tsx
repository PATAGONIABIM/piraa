import React, { useState } from 'react';

interface CreateMatchFormProps {
  onCreateMatch: (date: string, time: string, court: string) => void;
  onClose: () => void;
}

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ onCreateMatch, onClose }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [court, setCourt] = useState('AAA Cancha 1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && court.trim()) {
      onCreateMatch(date, time, court);
      onClose();
    }
  };

  const inputClasses = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-600 shadow-inner";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="date" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Fecha</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="time" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Hora</label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="court" className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">Lugar</label>
        <div className="relative">
            <select
            id="court"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            required
            className={`${inputClasses} appearance-none`}
            >
            <option value="AAA Cancha 1">AAA Cancha 1</option>
            <option value="AAA Cancha 2">AAA Cancha 2</option>
            <option value="Club Central">Club Central</option>
            <option value="Padel Pro">Padel Pro</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>
      <div className="pt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-400 font-semibold hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95">
          Crear Partido
        </button>
      </div>
    </form>
  );
};

export default CreateMatchForm;