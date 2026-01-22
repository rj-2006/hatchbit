import { Zap, Leaf, Flame, Droplet } from 'lucide-react';

export const POKEMON_THEMES = {
  pikachu: {
    name: 'Pikachu',
    price: 0, // Starter Pokemon (free)
    light: {
      gradient: 'from-yellow-300 via-yellow-400 to-amber-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      accent: 'bg-yellow-400',
      border: 'border-yellow-400'
    },
    dark: {
      gradient: 'from-yellow-600 via-amber-700 to-yellow-800',
      bg: 'bg-gray-900',
      text: 'text-yellow-100',
      accent: 'bg-yellow-600',
      border: 'border-yellow-600'
    },
    icon: Zap,
    type: 'Electric'
  },
  bulbasaur: {
    name: 'Bulbasaur',
    price: 0, // Starter Pokemon (free)
    light: {
      gradient: 'from-green-300 via-teal-400 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-900',
      accent: 'bg-green-400',
      border: 'border-green-400'
    },
    dark: {
      gradient: 'from-green-700 via-teal-800 to-emerald-900',
      bg: 'bg-gray-900',
      text: 'text-green-100',
      accent: 'bg-green-600',
      border: 'border-green-600'
    },
    icon: Leaf,
    type: 'Grass'
  },
  charmander: {
    name: 'Charmander',
    price: 0, // Starter Pokemon (free)
    light: {
      gradient: 'from-orange-300 via-red-400 to-rose-500',
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      accent: 'bg-orange-400',
      border: 'border-orange-400'
    },
    dark: {
      gradient: 'from-orange-700 via-red-800 to-rose-900',
      bg: 'bg-gray-900',
      text: 'text-orange-100',
      accent: 'bg-orange-600',
      border: 'border-orange-600'
    },
    icon: Flame,
    type: 'Fire'
  },
  squirtle: {
    name: 'Squirtle',
    price: 0, // Starter Pokemon (free)
    light: {
      gradient: 'from-blue-300 via-cyan-400 to-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      accent: 'bg-blue-400',
      border: 'border-blue-400'
    },
    dark: {
      gradient: 'from-blue-700 via-cyan-800 to-blue-900',
      bg: 'bg-gray-900',
      text: 'text-blue-100',
      accent: 'bg-blue-600',
      border: 'border-blue-600'
    },
    icon: Droplet,
    type: 'Water'
  },
  // Shop Pokemon - Can be purchased with Apricorns
  eevee: {
    name: 'Eevee',
    price: 500, // 500 Apricorns
    light: {
      gradient: 'from-amber-300 via-orange-400 to-yellow-500',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      accent: 'bg-amber-400',
      border: 'border-amber-400'
    },
    dark: {
      gradient: 'from-amber-700 via-orange-800 to-yellow-900',
      bg: 'bg-gray-900',
      text: 'text-amber-100',
      accent: 'bg-amber-600',
      border: 'border-amber-600'
    },
    icon: Zap,
    type: 'Normal'
  },
  jigglypuff: {
    name: 'Jigglypuff',
    price: 750, // 750 Apricorns
    light: {
      gradient: 'from-pink-300 via-pink-400 to-rose-500',
      bg: 'bg-pink-50',
      text: 'text-pink-900',
      accent: 'bg-pink-400',
      border: 'border-pink-400'
    },
    dark: {
      gradient: 'from-pink-700 via-pink-800 to-rose-900',
      bg: 'bg-gray-900',
      text: 'text-pink-100',
      accent: 'bg-pink-600',
      border: 'border-pink-600'
    },
    icon: Zap,
    type: 'Normal'
  },
  psyduck: {
    name: 'Psyduck',
    price: 1000, // 1000 Apricorns
    light: {
      gradient: 'from-yellow-300 via-amber-400 to-orange-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      accent: 'bg-yellow-400',
      border: 'border-yellow-400'
    },
    dark: {
      gradient: 'from-yellow-700 via-amber-800 to-orange-900',
      bg: 'bg-gray-900',
      text: 'text-yellow-100',
      accent: 'bg-yellow-600',
      border: 'border-yellow-600'
    },
    icon: Droplet,
    type: 'Water'
  }
};

// Starter Pokemon (free to choose)
export const STARTER_POKEMON = ['pikachu', 'bulbasaur', 'charmander', 'squirtle'];

// Shop Pokemon (can be purchased)
export const SHOP_POKEMON = ['eevee', 'jigglypuff', 'psyduck'];

// Apricorn reward per level up
export const APRICORNS_PER_LEVEL = 50;