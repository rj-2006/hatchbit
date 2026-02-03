// ─── Pokemon master data ──────────────────────────────────
// price: 0 = starter (free). Anything above = Apricorn cost.
// colors: [highlight, primary, deep] used for gradients, rings, badges.

export const POKEMON = {
  pikachu: {
    name: "Pikachu",
    type: "Electric",
    price: 0,
    colors: {
      light: ["#FEF08A", "#FACC15", "#CA8A04"],
      dark:  ["#78350F", "#B45309", "#FCD34D"],
    },
  },
  bulbasaur: {
    name: "Bulbasaur",
    type: "Grass",
    price: 0,
    colors: {
      light: ["#BBF7D0", "#34D399", "#059669"],
      dark:  ["#14532D", "#15803D", "#6EE7B7"],
    },
  },
  charmander: {
    name: "Charmander",
    type: "Fire",
    price: 0,
    colors: {
      light: ["#FED7AA", "#F97316", "#DC2626"],
      dark:  ["#7C2D12", "#C2410C", "#FB923C"],
    },
  },
  squirtle: {
    name: "Squirtle",
    type: "Water",
    price: 0,
    colors: {
      light: ["#BFDBFE", "#38BDF8", "#2563EB"],
      dark:  ["#1E3A5F", "#1D4ED8", "#7DD3FC"],
    },
  },

  // ── Shop Pokemon ──────────────────────────────────────
  eevee: {
    name: "Eevee",
    type: "Normal",
    price: 500,
    colors: {
      light: ["#FDE9C9", "#FDBA74", "#B45309"],
      dark:  ["#451A03", "#92400E", "#FCD34D"],
    },
  },
  jigglypuff: {
    name: "Jigglypuff",
    type: "Normal",
    price: 750,
    colors: {
      light: ["#FBCFE8", "#F472B6", "#BE185D"],
      dark:  ["#500724", "#BE123C", "#F9A8D4"],
    },
  },
  psyduck: {
    name: "Psyduck",
    type: "Water",
    price: 1000,
    colors: {
      light: ["#FEF08A", "#A3E635", "#4D7C0F"],
      dark:  ["#1A2E05", "#4D7C0F", "#BEF264"],
    },
  },
}

// ─── Derived lists ────────────────────────────────────────
export const STARTER_IDS = Object.keys(POKEMON).filter(id => POKEMON[id].price === 0)
export const SHOP_IDS    = Object.keys(POKEMON).filter(id => POKEMON[id].price > 0)

// ─── Type → badge color ───────────────────────────────────
export const TYPE_COLORS = {
  Electric: "#FACC15",
  Grass:    "#34D399",
  Fire:     "#F97316",
  Water:    "#38BDF8",
  Normal:   "#A3A3A3",
}

// ─── Reward constants ─────────────────────────────────────
export const XP_PER_SESSION        = 50
export const APRICORNS_PER_LEVELUP = 50
export const POMODORO_SECONDS      = 25 * 60   // 25 min

export function calcXPForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.75, lvl - 1))
}