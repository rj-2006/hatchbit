import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Star, Sun, Moon, ShoppingBag } from 'lucide-react';
import PokemonSelector from '../integration/PokemonSelector';
import Shop from './Shop';
import { POKEMON_THEMES } from './constants/themes';

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

function PomodoroTimer() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [timerState, setTimerState] = useState('idle');
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  const [apricorns, setApricorns] = useState(0);
  const [ownedPokemon, setOwnedPokemon] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Load saved data
  useEffect(() => {
    const savedPokemon = localStorage.getItem('selectedPokemon');
    const savedLevel = parseInt(localStorage.getItem('level') || '1');
    const savedXP = parseInt(localStorage.getItem('xp') || '0');
    const savedApricorns = parseInt(localStorage.getItem('apricorns') || '0');
    const savedOwnedPokemon = JSON.parse(localStorage.getItem('ownedPokemon') || '["pikachu","bulbasaur","charmander","squirtle"]');
    const savedTimerState = localStorage.getItem('timerState') || 'idle';
    const savedTimeRemaining = parseInt(localStorage.getItem('timeRemaining') || POMODORO_DURATION);
    const savedDarkMode = localStorage.getItem('isDarkMode') === 'true';

    if (savedPokemon && savedOwnedPokemon.includes(savedPokemon)) {
      setSelectedPokemon(savedPokemon);
    }
    setLevel(savedLevel);
    setXp(savedXP);
    setApricorns(savedApricorns);
    setOwnedPokemon(savedOwnedPokemon);
    setXpForNextLevel(calculateXPForLevel(savedLevel + 1));
    setTimerState(savedTimerState);
    setTimeRemaining(savedTimeRemaining);
    setIsDarkMode(savedDarkMode);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    
    if (timerState === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          localStorage.setItem('timeRemaining', newTime);
          
          if (newTime === 0) {
            handleSessionComplete();
            return POMODORO_DURATION;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerState, timeRemaining]);

  // Calculate XP needed for a level
  const calculateXPForLevel = (lvl) => {
    return Math.floor(100 * Math.pow(1.75, lvl - 1));
  };

  // Handle session completion
  const handleSessionComplete = () => {
    const newXP = xp + 50;
    let newLevel = level;
    let newXPForNextLevel = xpForNextLevel;
    let newApricorns = apricorns;

    // Check for level up
    if (newXP >= xpForNextLevel) {
      newLevel = level + 1;
      newXPForNextLevel = calculateXPForLevel(newLevel + 1);
      newApricorns = apricorns + 50; // Award 50 Apricorns per level up
      
      showNotification('Level Up!', `${POKEMON_THEMES[selectedPokemon].name} reached level ${newLevel}! You earned 50 Apricorns! 🎉`);
    } else {
      showNotification('Session Complete!', 'Great work! You earned 50 XP! ⚡');
    }

    setXp(newXP);
    setLevel(newLevel);
    setXpForNextLevel(newXPForNextLevel);
    setApricorns(newApricorns);
    setTimerState('idle');
    
    localStorage.setItem('xp', newXP);
    localStorage.setItem('level', newLevel);
    localStorage.setItem('apricorns', newApricorns);
    localStorage.setItem('timerState', 'idle');
  };

  // Show browser notification
  const showNotification = (title, message) => {
    console.log('Notification:', title, message);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else {
      alert(`${title}\n${message}`);
    }
  };

  // Timer controls
  const startTimer = () => {
    setTimerState('running');
    localStorage.setItem('timerState', 'running');
  };

  const pauseTimer = () => {
    setTimerState('paused');
    localStorage.setItem('timerState', 'paused');
  };

  const resumeTimer = () => {
    setTimerState('running');
    localStorage.setItem('timerState', 'running');
  };

  const cancelTimer = () => {
    setTimerState('idle');
    setTimeRemaining(POMODORO_DURATION);
    localStorage.setItem('timerState', 'idle');
    localStorage.setItem('timeRemaining', POMODORO_DURATION);
  };

  // Handle Pokemon selection
  const handlePokemonSelect = (pokemon) => {
    setSelectedPokemon(pokemon);
    localStorage.setItem('selectedPokemon', pokemon);
  };

  // Handle Pokemon purchase
  const handlePokemonPurchase = (pokemonId) => {
    const pokemon = POKEMON_THEMES[pokemonId];
    if (apricorns >= pokemon.price && !ownedPokemon.includes(pokemonId)) {
      const newApricorns = apricorns - pokemon.price;
      const newOwnedPokemon = [...ownedPokemon, pokemonId];
      
      setApricorns(newApricorns);
      setOwnedPokemon(newOwnedPokemon);
      
      localStorage.setItem('apricorns', newApricorns);
      localStorage.setItem('ownedPokemon', JSON.stringify(newOwnedPokemon));
      
      alert(`You purchased ${pokemon.name}! 🎉`);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', newMode);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate XP percentage
  const xpPercentage = ((xp % xpForNextLevel) / xpForNextLevel) * 100;

  if (!selectedPokemon) {
    return <PokemonSelector onSelect={handlePokemonSelect} isDarkMode={isDarkMode} ownedPokemon={ownedPokemon} />;
  }

  const theme = POKEMON_THEMES[selectedPokemon];
  const mode = isDarkMode ? theme.dark : theme.light;
  const Icon = theme.icon;

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br ${mode.gradient} flex items-center justify-center p-4`}>
        <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full relative`}>
          {/* Dark Mode & Shop Toggles */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setShowShop(true)}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Open shop"
            >
              <ShoppingBag className={`w-5 h-5 ${mode.text}`} />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className={`w-5 h-5 ${mode.text}`} />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className={`w-8 h-8 ${mode.text}`} />
              <h1 className={`text-2xl font-bold ${mode.text}`}>{theme.name}</h1>
            </div>
            <div className={`flex items-center justify-center gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">Level {level}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
                <span className="font-semibold">{apricorns}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-6">
            <div className={`flex justify-between text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>XP: {xp}</span>
              <span>Next: {xpForNextLevel}</span>
            </div>
            <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r ${mode.gradient} transition-all duration-500`}
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent`}>
              {formatTime(timeRemaining)}
            </div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {timerState === 'idle' && 'Ready to focus'}
              {timerState === 'running' && 'Stay focused!'}
              {timerState === 'paused' && 'Paused'}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            {timerState === 'idle' && (
              <button
                onClick={startTimer}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${mode.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg`}
              >
                <Play className="w-5 h-5" />
                Start Session
              </button>
            )}

            {timerState === 'running' && (
              <>
                <button
                  onClick={pauseTimer}
                  className={`flex items-center gap-2 px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg font-semibold transition-colors shadow-lg`}
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
                <button
                  onClick={cancelTimer}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}

            {timerState === 'paused' && (
              <>
                <button
                  onClick={resumeTimer}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${mode.gradient} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg`}
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
                <button
                  onClick={cancelTimer}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className={`mt-6 pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className={`text-2xl font-bold ${mode.text}`}>{Math.floor(xp / 50)}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${mode.text}`}>{level}</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level</p>
              </div>
            </div>
          </div>

          {/* Change Pokemon */}
          <button
            onClick={() => {
              setSelectedPokemon(null);
              localStorage.removeItem('selectedPokemon');
            }}
            className={`w-full mt-4 text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            Change Pokemon Partner
          </button>
        </div>
      </div>

      {/* Shop Modal */}
      {showShop && (
        <Shop
          onClose={() => setShowShop(false)}
          isDarkMode={isDarkMode}
          apricorns={apricorns}
          ownedPokemon={ownedPokemon}
          onPurchase={handlePokemonPurchase}
        />
      )}
    </>
  );
}

export default function App() {
  return <PomodoroTimer />;
}