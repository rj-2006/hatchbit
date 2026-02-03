import { Pokeball } from './App.jsx'
import { POKEMON } from './constants/themes'

export default function PokemonSelector({ isDark, ownedPokemon, onSelect }) {
  return (
    <div className="flex flex-col items-center px-5 py-6">
      {/* Big Pokeball icon */}
      <div className="pokeball-hover cursor-pointer">
        <Pokeball size={64} color={isDark ? "#374151" : "#E5E7EB"} shadow={isDark ? "#4B5563" : "#D1D5DB"} />
      </div>

      <h2 className="text-base font-bold mt-3 mb-0.5" style={{ color: isDark ? "#fff" : "#1F2937" }}>
        Choose Your Partner
      </h2>
      <p className="text-xs text-center mb-5" style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}>
        Pick a Pokemon to focus with
      </p>

      {/* Grid of owned Pokemon */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {ownedPokemon.map(id => {
          const p = POKEMON[id]
          if (!p) return null
          const c = p.colors[isDark ? "dark" : "light"]

          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="pokeball-hover relative rounded-xl overflow-hidden p-4 flex flex-col items-center gap-1.5 transition-transform hover:scale-105 shadow-md"
              style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` }}
            >
              <Pokeball size={40} color="#fff" shadow={c[2]} />
              <span className="text-sm font-bold text-white drop-shadow">{p.name}</span>
              <span className="text-xs text-white opacity-75">{p.type}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}