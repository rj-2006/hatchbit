import { ArrowLeft, Lock, Check } from 'lucide-react'
import { Pokeball } from './App.jsx'
import { POKEMON, SHOP_IDS, TYPE_COLORS } from './constants/themes'

export default function Shop({ isDark, apricorns, ownedPokemon, onPurchase, onBack }) {
  return (
    <div className="flex flex-col px-5 py-4 gap-4">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Apricorn balance pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: isDark ? "#374151" : "#FEF3C7" }}>
          <span className="text-sm">🍎</span>
          <span className="text-sm font-bold" style={{ color: isDark ? "#FCD34D" : "#92400E" }}>{apricorns}</span>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="text-center">
        <h2 className="text-base font-bold" style={{ color: isDark ? "#fff" : "#1F2937" }}>Pokebit Shop</h2>
        <p className="text-xs" style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}>Catch new partners with Apricorns</p>
      </div>

      {/* ── Pokemon list ── */}
      <div className="flex flex-col gap-3">
        {SHOP_IDS.map(id => {
          const pokemon  = POKEMON[id]
          const isOwned  = ownedPokemon.includes(id)
          const canBuy   = !isOwned && apricorns >= pokemon.price
          const c        = pokemon.colors[isDark ? "dark" : "light"]

          return (
            <div
              key={id}
              className="relative rounded-xl overflow-hidden"
              style={{
                border: `2px solid ${isOwned ? "#22C55E" : isDark ? "#374151" : "#E5E7EB"}`,
                background: isDark ? "#1F2937" : "#fff",
              }}
            >
              {/* Owned badge */}
              {isOwned && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "#22C55E" }}>
                  <Check className="w-3 h-3" /> Owned
                </div>
              )}

              <div className="flex items-center gap-3 p-3">
                {/* Pokeball icon circle */}
                <div
                  className="flex-shrink-0 w-13 h-13 rounded-full flex items-center justify-center shadow-inner"
                  style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`, width: 52, height: 52 }}
                >
                  <Pokeball size={32} color="#fff" shadow={c[2]} />
                </div>

                {/* Name + type + price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: isDark ? "#fff" : "#1F2937" }}>{pokemon.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.25 rounded-full text-white" style={{ background: TYPE_COLORS[pokemon.type] }}>
                      {pokemon.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs">🍎</span>
                    <span className="text-xs font-bold" style={{ color: isDark ? "#FCD34D" : "#92400E" }}>{pokemon.price} Apricorns</span>
                  </div>
                </div>

                {/* Buy / Owned / Locked button */}
                {!isOwned && (
                  <button
                    onClick={() => canBuy && onPurchase(id)}
                    disabled={!canBuy}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity"
                    style={{
                      background: canBuy ? `linear-gradient(135deg, ${c[0]}, ${c[1]})` : isDark ? "#374151" : "#F3F4F6",
                      color:      canBuy ? "#fff" : isDark ? "#6B7280" : "#9CA3AF",
                      cursor:     canBuy ? "pointer" : "not-allowed",
                    }}
                  >
                    {canBuy ? (
                      "Catch!"
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Need more
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer tip ── */}
      <div className="rounded-lg p-3 text-center text-xs mt-1" style={{ background: isDark ? "#111827" : "#F9FAFB", color: isDark ? "#9CA3AF" : "#6B7280" }}>
        💡 Level up your Pokemon to earn <strong>50 Apricorns</strong> each time!
      </div>
    </div>
  )
}