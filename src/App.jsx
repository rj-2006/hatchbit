import React, { useState, useEffect } from 'react'
import { PKMN_THEMES } from './constants/themes'
import PokemonSelector from './PokemonSelector'
import './App.css'

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getPokemonIcon(pokemonName) {
  const icons = {
    'Pikachu': '⚡',
    'Bulbasaur': '🌿',
    'Charmander': '🔥',
    'Squirtle': '💧'
  };
  return icons[pokemonName] || '⚡';
}

function App() {
  const [pokeData, setPokeData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    // Initial fetch from chrome storage
    chrome.storage.local.get(["pokedata"], (result) => {
      if (result.pokedata) setPokeData(result.pokedata);
    });

    // Listener for real-time updates (like when background.js levels up your PKMN)
    const listener = (changes) => {
      if (changes.pokedata) {
        setPokeData(changes.pokedata.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    // Timer countdown logic
    const timerInterval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 0) {
          clearInterval(timerInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const startPomo = () => {
    chrome.runtime.sendMessage({ command: "startTimer", minutes: 25 }, (response) => {
      console.log(response?.status);
    });
  };

  const handlePokemonSelect = (pokemonName) => {
    const updatedData = {
      ...pokeData,
      activePokemon: pokemonName
    };
    setPokeData(updatedData);
    chrome.storage.local.set({ pokedata: updatedData });
    setShowSelector(false);
  };

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      // Timer completed, you could trigger background.js logic here
      // For now, just reset to 25 minutes
      setTimeLeft(25 * 60);
    }
  }, [timeLeft]);

  // Guard clause to wait for storage
  if (!pokeData) return <div className="p-10 text-center font-mono">Loading...</div>;

  // FIXED: Changed pokedata to pokeData to match your useState
  const currentTheme = PKMN_THEMES[pokeData.activePokemon.toLowerCase()];

return (
<main
  className={`w-[350px] min-h-[500px] p-6 flex flex-col items-center transition-all duration-700 bg-gradient-to-br ${currentTheme.gradient}`}
>
  {showSelector ? (
    <PokemonSelector
      onSelectPokemon={handlePokemonSelect}
      onClose={() => setShowSelector(false)}
    />
  ) : (
    <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-3xl p-5 border border-white/30 shadow-2xl flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase drop-shadow-md leading-none">
            {pokeData.activePokemon}
          </h1>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Level {pokeData.stats.level}</p>
        </div>
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-lg border border-white/20">
          <span className="text-xl">💰 500</span> {/* Money Placeholder */}
        </div>
      </div>

      {/* Animation Placeholder */}
      <div className="relative group cursor-pointer mb-6" onClick={() => setShowSelector(true)}>
        <div className="absolute -inset-1 bg-gradient-to-r from-white/50 to-transparent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative w-40 h-40 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/40 shadow-inner overflow-hidden pulse-glow">
          <span className="text-6xl animate-bounce-slow">{getPokemonIcon(pokeData.activePokemon)}</span>
        </div>
      </div>

      {/* XP Bar Rework */}
      <div className="w-full mb-8">
        <div className="h-3 w-full bg-black/20 rounded-full p-[2px] overflow-hidden">
          <div
            className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-1000"
            style={{ width: `${(pokeData.stats.xp / pokeData.stats.xpToNextLevel) * 100}%` }}
          />
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-6xl font-black text-white mb-8 tracking-tighter drop-shadow-lg timer-text">
        {formatTime(timeLeft)}
      </div>

      <button
        onClick={startPomo}
        className="w-full py-4 bg-white text-poke-secondary font-black rounded-2xl shadow-xl btn-hover uppercase"
      >
        Start Focus
      </button>
    </div>
  )}
</main>
);
}

export default App;