import React from 'react';
import { Zap, Leaf, Flame, Droplet } from 'lucide-react';

// Import themes from constants
const POKEMON_THEMES = {
  pikachu: {
    name: 'Pikachu',
    light: {
      gradient: 'from-yellow-300 via-yellow-400 to-amber-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      accent: 'bg-yellow-400'
    },
    dark: {
      gradient: 'from-yellow-600 via-amber-700 to-yellow-800',
      bg: 'bg-gray-900',
      text: 'text-yellow-100',
      accent: 'bg-yellow-600'
    },
    icon: Zap
  },
  bulbasaur: {
    name: 'Bulbasaur',
    light: {
      gradient: 'from-green-300 via-teal-400 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-900',
      accent: 'bg-green-400'
    },
    dark: {
      gradient: 'from-green-700 via-teal-800 to-emerald-900',
      bg: 'bg-gray-900',
      text: 'text-green-100',
      accent: 'bg-green-600'
    },
    icon: Leaf
  },
  charmander: {
    name: 'Charmander',
    light: {
      gradient: 'from-orange-300 via-red-400 to-rose-500',
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      accent: 'bg-orange-400'
    },
    dark: {
      gradient: 'from-orange-700 via-red-800 to-rose-900',
      bg: 'bg-gray-900',
      text: 'text-orange-100',
      accent: 'bg-orange-600'
    },
    icon: Flame
  },
  squirtle: {
    name: 'Squirtle',
    light: {
      gradient: 'from-blue-300 via-cyan-400 to-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      accent: 'bg-blue-400'
    },
    dark: {
      gradient: 'from-blue-700 via-cyan-800 to-blue-900',
      bg: 'bg-gray-900',
      text: 'text-blue-100',
      accent: 'bg-blue-600'
    },
    icon: Droplet
  }
};

function PokemonSelector({ onSelect, isDarkMode }) {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-400'} flex items-center justify-center p-4`}>
      <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full`}>
        <h1 className={`text-3xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Welcome to Pokebit!
        </h1>
        <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Choose your Pokemon partner to begin your focus journey
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(POKEMON_THEMES).map(([key, pokemon]) => {
            const Icon = pokemon.icon;
            const theme = isDarkMode ? pokemon.dark : pokemon.light;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`p-6 rounded-xl bg-gradient-to-br ${theme.gradient} hover:scale-105 transition-transform shadow-lg`}
              >
                <Icon className="w-12 h-12 text-white mb-2 mx-auto" />
                <p className="text-white font-semibold text-center">{pokemon.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PokemonSelector;