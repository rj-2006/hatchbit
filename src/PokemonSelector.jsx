import React from 'react';
import { PKMN_THEMES } from './constants/themes';

function PokemonSelector({ onSelectPokemon, onClose }) {
  const pokemonList = [
    { name: 'Pikachu', icon: '⚡', theme: PKMN_THEMES.pikachu },
    { name: 'Bulbasaur', icon: '🌿', theme: PKMN_THEMES.bulbasaur },
    { name: 'Charmander', icon: '🔥', theme: PKMN_THEMES.charmander },
    { name: 'Squirtle', icon: '💧', theme: PKMN_THEMES.squirtle }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase">Choose Your Partner</h2>
        <button 
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Pokemon Grid */}
      <div className="grid grid-cols-2 gap-4">
        {pokemonList.map((pokemon) => (
          <div
            key={pokemon.name}
            onClick={() => onSelectPokemon(pokemon.name)}
            className="group cursor-pointer bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-4 border border-white/30 hover:border-white/60 transition-all duration-300 hover:scale-105"
          >
            <div className="text-4xl mb-2 text-center group-hover:scale-110 transition-transform">
              {pokemon.icon}
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{pokemon.name}</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">Partner</div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-white/70 text-sm">
        Select a Pokémon to start your journey!
      </div>
    </div>
  );
}

export default PokemonSelector;