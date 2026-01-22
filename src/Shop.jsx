import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Lock, Check } from 'lucide-react';
import { POKEMON_THEMES, SHOP_POKEMON } from './constants/themes';

function Shop({ onClose, isDarkMode, apricorns, ownedPokemon, onPurchase }) {
  const [selectedTab, setSelectedTab] = useState('pokemon');

  const handlePurchase = (pokemonId, price) => {
    if (apricorns >= price && !ownedPokemon.includes(pokemonId)) {
      onPurchase(pokemonId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <ShoppingBag className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Pokebit Shop
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Apricorn Balance */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-100'}`}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-orange-900'}`}>
                {apricorns}
              </span>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} px-6 gap-4`}>
          <button
            onClick={() => setSelectedTab('pokemon')}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
              selectedTab === 'pokemon'
                ? isDarkMode
                  ? 'border-blue-400 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : isDarkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-200'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pokemon
          </button>
          <button
            onClick={() => setSelectedTab('items')}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
              selectedTab === 'items'
                ? isDarkMode
                  ? 'border-blue-400 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : isDarkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-200'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Items
            <span className="ml-2 text-xs opacity-50">(Coming Soon)</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'pokemon' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHOP_POKEMON.map((pokemonId) => {
                const pokemon = POKEMON_THEMES[pokemonId];
                const Icon = pokemon.icon;
                const theme = isDarkMode ? pokemon.dark : pokemon.light;
                const isOwned = ownedPokemon.includes(pokemonId);
                const canPurchase = apricorns >= pokemon.price && !isOwned;

                return (
                  <div
                    key={pokemonId}
                    className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-2 ${
                      isOwned
                        ? 'border-green-500'
                        : isDarkMode
                          ? 'border-gray-600'
                          : 'border-gray-200'
                    }`}
                  >
                    {/* Pokemon Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {pokemon.name}
                          </h3>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {pokemon.type} Type
                          </p>
                        </div>
                      </div>
                      {isOwned && (
                        <div className="bg-green-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {pokemon.price}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePurchase(pokemonId, pokemon.price)}
                        disabled={!canPurchase}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          isOwned
                            ? isDarkMode
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : canPurchase
                              ? `bg-gradient-to-r ${theme.gradient} text-white hover:opacity-90`
                              : isDarkMode
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isOwned ? (
                          'Owned'
                        ) : canPurchase ? (
                          'Purchase'
                        ) : (
                          <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4" />
                            <span>Locked</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedTab === 'items' && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Items Coming Soon!</p>
              <p className="text-sm mt-2">Stay tuned for decorations and power-ups!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t`}>
          <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            💡 Earn {50} Apricorns every time you level up!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Shop;