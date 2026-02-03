import './App.css'
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Sun, Moon, ShoppingBag } from 'lucide-react'
import PokemonSelector from './PokemonSelector'
import Shop            from './Shop'
import {
  POKEMON,
  STARTER_IDS,
  POMODORO_SECONDS,
  XP_PER_SESSION,
  calcXPForLevel,
} from './constants/themes'

// ─── Pokeball SVG (exported so Selector & Shop can reuse) ─
export function Pokeball({ size = 64, color = "#fff", shadow = "#ccc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill={color} stroke={shadow} strokeWidth="4" />
      <path d="M2 50 h96" stroke={shadow} strokeWidth="4" fill="none" />
      <path d="M50 2 a48 48 0 0 1 0 96" fill={shadow} opacity="0.15" />
      <circle cx="50" cy="50" r="12" fill="#fff" stroke={shadow} strokeWidth="3" />
      <circle cx="50" cy="50" r="5"  fill={shadow} />
      <rect x="38" y="48" width="24" height="4" rx="2" fill={shadow} />
    </svg>
  )
}

// ─── Faint pokeballs floating in the gradient banner ──────
function BgPokeballs({ colors }) {
  const balls = [
    { top: "-18%", left: "-6%",  size: 110 },
    { top: "-8%",  right: "-8%", size: 80  },
    { bottom: "-20%", right: "8%", size: 95  },
  ]
  return balls.map((b, i) => (
    <div key={i} className="absolute pointer-events-none" style={{ ...b, opacity: 0.08 }}>
      <Pokeball size={b.size} color={colors[1]} shadow={colors[2]} />
    </div>
  ))
}

// ─── Circular progress timer ──────────────────────────────
function CircularTimer({ timeRemaining, timerState, colors }) {
  const R      = 68
  const CIRC   = 2 * Math.PI * R
  const pct    = timeRemaining / POMODORO_SECONDS
  const offset = CIRC * (1 - pct)
  const mm     = String(Math.floor(timeRemaining / 60)).padStart(2, "0")
  const ss     = String(timeRemaining % 60).padStart(2, "0")

  return (
    <div className="relative flex items-center justify-center" style={{ width: 164, height: 164 }}>
      <svg width="164" height="164" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="82" cy="82" r={R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="9" />
        <circle cx="82" cy="82" r={R} fill="none" stroke={colors[1]} strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          className="timer-glow"
          style={{ transition: "stroke-dashoffset 0.6s ease", color: colors[1] }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight" style={{ color: colors[2] }}>{mm}:{ss}</span>
        <span className="text-xs font-semibold uppercase tracking-widest opacity-55 mt-0.5" style={{ color: colors[2] }}>
          {timerState === "idle"    && "Ready"}
          {timerState === "running" && "Focus"}
          {timerState === "paused"  && "Paused"}
        </span>
      </div>
    </div>
  )
}

// ─── XP progress bar ──────────────────────────────────────
function XPBar({ xp, xpNeeded, level, colors, isDark }) {
  const pct = Math.min((xp % xpNeeded) / xpNeeded * 100, 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}>
        <span>⭐ Lv.{level}</span>
        <span>{xp % xpNeeded} / {xpNeeded} XP</span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: isDark ? "#374151" : "#E5E7EB" }}>
        <div
          className="h-full rounded-full xp-shimmer transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundImage: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[0]}, ${colors[1]})`,
          }}
        />
      </div>
    </div>
  )
}

// ─── Small stat card ──────────────────────────────────────
function StatCard({ label, value, color, isDark }) {
  return (
    <div className="flex-1 rounded-xl p-2.5 text-center shadow-sm"
      style={{ background: isDark ? "#111827" : "#F9FAFB", border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}` }}>
      <p className="text-base font-bold" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}>{label}</p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// APP – popup shell.  All state lives in background.js.
//       This file only READS state and SENDS commands.
// ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]             = useState("select")
  const [selected, setSelected]         = useState(null)
  const [timerState, setTimerState]     = useState("idle")
  const [timeLeft, setTimeLeft]         = useState(POMODORO_SECONDS)
  const [level, setLevel]               = useState(1)
  const [xp, setXp]                     = useState(0)
  const [apricorns, setApricorns]       = useState(0)
  const [ownedPokemon, setOwnedPokemon] = useState(STARTER_IDS)
  const [isDark, setIsDark]             = useState(false)

  // ── 1. On mount: ask background for the full state ─────
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "getState" }, (res) => {
      if (!res) return
      applyState(res)
    })
  }, [])

  // ── 2. While popup is open: listen for live ticks ──────
  useEffect(() => {
    const listener = (msg) => {
      if (msg.type === "stateUpdate") applyState(msg)
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  // ── 3. isDark is local-only (no background needed) ─────
  useEffect(() => {
    const saved = localStorage.getItem("isDark")
    if (saved !== null) setIsDark(JSON.parse(saved))
  }, [])
  useEffect(() => {
    localStorage.setItem("isDark", JSON.stringify(isDark))
  }, [isDark])

  // ── hydrate UI from a state blob (from bg or tick) ─────
  function applyState(s) {
    setSelected(s.selected)
    setScreen(s.selected ? "timer" : "select")
    setTimerState(s.timerState  ?? "idle")
    setTimeLeft(s.timeLeft      ?? POMODORO_SECONDS)
    setLevel(s.level            ?? 1)
    setXp(s.xp                  ?? 0)
    setApricorns(s.apricorns    ?? 0)
    setOwnedPokemon(s.ownedPokemon ?? STARTER_IDS)
  }

  // ── commands → background ───────────────────────────────
  const start  = () => chrome.runtime.sendMessage({ type: "start" },  () => {})
  const pause  = () => chrome.runtime.sendMessage({ type: "pause" },  () => {})
  const cancel = () => chrome.runtime.sendMessage({ type: "cancel" }, () => {})

  const selectPokemon = (id) => {
    chrome.runtime.sendMessage({ type: "selectPokemon", id })
    setSelected(id)
    setScreen("timer")
  }

  const purchasePokemon = (id) => {
    chrome.runtime.sendMessage({ type: "purchase", id }, (res) => {
      if (res?.ok) {
        // optimistic local update; next tick will confirm from bg
        setApricorns(a => a - POKEMON[id].price)
        setOwnedPokemon(o => [...o, id])
      }
    })
  }

  // ── derived ─────────────────────────────────────────────
  const theme    = selected ? POKEMON[selected] : null
  const colors   = theme ? theme.colors[isDark ? "dark" : "light"] : ["#A78BFA", "#7C3AED", "#5B21B6"]
  const xpNeeded = calcXPForLevel(level + 1)

  // ── render ──────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: isDark ? "#111827" : "#F3F4F6" }}>
      <div className="relative w-96 rounded-3xl overflow-hidden shadow-2xl" style={{ background: isDark ? "#1F2937" : "#fff" }}>

        {/* ════════ GRADIENT BANNER ════════ */}
        <div className="relative h-32 flex items-end px-5 pb-3" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})` }}>
          <BgPokeballs colors={colors} />

          {/* top bar icons */}
          <div className="absolute top-3 left-0 right-0 flex justify-between px-5 z-10">
            <button onClick={() => setIsDark(d => !d)} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
              {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
            </button>
            {screen === "timer" && (
              <button onClick={() => setScreen("shop")} className="p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
                <ShoppingBag className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* banner label */}
          <div className="relative z-10 flex items-center gap-3">
            {screen === "timer" && theme ? (
              <>
                <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white border-opacity-40" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Pokeball size={28} color="#fff" shadow={colors[2]} />
                </div>
                <div>
                  <h1 className="text-white font-bold text-base drop-shadow">{theme.name}</h1>
                  <span className="text-xs text-white opacity-75">⭐ Lv.{level} · 🍎 {apricorns}</span>
                </div>
              </>
            ) : (
              <h1 className="text-white font-bold text-base drop-shadow">
                {screen === "shop" ? "🛍️ Pokebit Shop" : "🎮 Pokebit"}
              </h1>
            )}
          </div>
        </div>

        {/* ════════ BODY ════════ */}
        <div>
          {/* ─── TIMER ─── */}
          {screen === "timer" && theme && (
            <div className="flex flex-col items-center gap-4 px-5 py-5">
              <div className="w-full">
                <XPBar xp={xp} xpNeeded={xpNeeded} level={level} colors={colors} isDark={isDark} />
              </div>

              <CircularTimer timeRemaining={timeLeft} timerState={timerState} colors={colors} />

              {/* controls */}
              <div className="flex items-center gap-3">
                {timerState === "idle" && (
                  <button onClick={start} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold shadow-lg transition-transform hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${colors[1]}, ${colors[2]})` }}>
                    <Play className="w-4 h-4" /> Start
                  </button>
                )}
                {timerState === "running" && (
                  <>
                    <button onClick={pause} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold shadow-lg"
                      style={{ background: isDark ? "#374151" : "#4B5563" }}>
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                    <button onClick={cancel} className="p-2.5 rounded-full text-white shadow-lg" style={{ background: "#EF4444" }}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
                {timerState === "paused" && (
                  <>
                    <button onClick={start} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${colors[1]}, ${colors[2]})` }}>
                      <Play className="w-4 h-4" /> Resume
                    </button>
                    <button onClick={cancel} className="p-2.5 rounded-full text-white shadow-lg" style={{ background: "#EF4444" }}>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* stats */}
              <div className="w-full flex gap-2.5 mt-1">
                <StatCard label="Sessions"  value={Math.floor(xp / XP_PER_SESSION)} color={colors[2]} isDark={isDark} />
                <StatCard label="Level"     value={level}                           color={colors[2]} isDark={isDark} />
                <StatCard label="Apricorns" value={apricorns}                       color={colors[2]} isDark={isDark} />
              </div>

              <button onClick={() => setScreen("select")} className="text-xs underline underline-offset-2 mt-0.5" style={{ color: isDark ? "#6B7280" : "#9CA3AF" }}>
                Change Partner
              </button>
            </div>
          )}

          {/* ─── SELECTOR ─── */}
          {screen === "select" && (
            <PokemonSelector isDark={isDark} ownedPokemon={ownedPokemon} onSelect={selectPokemon} />
          )}

          {/* ─── SHOP ─── */}
          {screen === "shop" && (
            <Shop isDark={isDark} apricorns={apricorns} ownedPokemon={ownedPokemon} onPurchase={purchasePokemon} onBack={() => setScreen("timer")} />
          )}
        </div>
      </div>
    </div>
  )
}