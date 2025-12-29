import React, { useState, useEffect } from 'react'
import { PKMN_THEMES } from './constants/themes'
import './App.css'

function App() {
  const [pokeData, setPokeData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); 

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

  const startPomo = () => {
    chrome.runtime.sendMessage({ command: "startTimer", minutes: 25 }, (response) => {
      console.log(response?.status);
    });
  };

  // Guard clause to wait for storage
  if (!pokeData) return <div className="p-10 text-center font-mono">Loading...</div>;

  // FIXED: Changed pokedata to pokeData to match your useState
  const currentTheme = PKMN_THEMES[pokeData.activePokemon.toLowerCase()];

return (
  <main 
    className="w-[350px] min-h-[450px] p-6 flex flex-col items-center transition-colors duration-500 shadow-xl"
    style={{
      backgroundColor: 'var(--poke-bg)', // Using the dark BG you provided
      '--poke-primary': currentTheme.primary,
      '--poke-secondary': currentTheme.secondary,
      '--poke-bg': currentTheme.bg,
    }}
  >
    {/* Header */}
    <div className="w-full flex justify-between items-center mb-6">
      <h1 className="text-2xl font-black text-white uppercase italic drop-shadow-md">
        {pokeData.activePokemon}
      </h1>
      <span className="bg-poke-primary text-black px-3 py-1 rounded-full text-xs font-bold border-2 border-white/20">
        Lv. {pokeData.stats.level}
      </span>
    </div>

    {/* Pokemon Sprite Area */}
    <div className="w-40 h-40 bg-white/10 backdrop-blur-sm rounded-full border-4 border-poke-secondary flex items-center justify-center shadow-inner mb-6">
       <span className="text-5xl drop-shadow-lg">👾</span>
    </div>

    {/* XP Bar with light background for visibility against dark BG */}
    <div className="w-full space-y-1 mb-10">
      <div className="flex justify-between text-[10px] font-black text-white/80 uppercase">
        <span>Exp</span>
        <span>{pokeData.stats.xp} / {pokeData.stats.xpToNextLevel}</span>
      </div>
      <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden p-[2px] border border-white/10">
        <div 
          className="h-full bg-poke-primary rounded-full transition-all duration-700 shadow-[0_0_10px_var(--poke-primary)]"
          style={{ width: `${(pokeData.stats.xp / pokeData.stats.xpToNextLevel) * 100}%` }}
        />
      </div>
    </div>

    {/* Action Section */}
    <div className="mt-auto flex flex-col items-center w-full">
      <div className="text-6xl font-black text-white font-mono mb-6 drop-shadow-lg">
        25:00
      </div>
      <button 
        onClick={startPomo}
        className="w-full bg-poke-secondary text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,0.3)] hover:brightness-110 active:translate-y-1 transition-all uppercase tracking-widest border-t border-white/20"
      >
        Start Training
      </button>
    </div>
  </main>
);
}

export default App;