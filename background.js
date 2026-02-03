// ──────────────────────────────────────────────────────────
// Pokebit – background service worker
// THIS owns the timer. The popup just reads from here.
// ──────────────────────────────────────────────────────────

const POMODORO_SECONDS      = 25 * 60
const XP_PER_SESSION        = 50
const APRICORNS_PER_LEVELUP = 50

function calcXPForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.75, lvl - 1))
}

// ── defaults written once on install ────────────────────
const DEFAULTS = {
  selected:     null,
  level:        1,
  xp:           0,
  apricorns:    0,
  timerState:   "idle",       // "idle" | "running" | "paused"
  timeLeft:     POMODORO_SECONDS,
  startedAt:    null,         // Date.now() when the current run started
  ownedPokemon: ["pikachu", "bulbasaur", "charmander", "squirtle"],
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.set(DEFAULTS)
  }
})

// ── calculate real seconds left RIGHT NOW ──────────────
// When state is "running" we only stored (timeLeft, startedAt).
// Actual remaining = timeLeft - (now - startedAt).
function calcTimeLeft(data) {
  if (data.timerState !== "running" || !data.startedAt) return data.timeLeft
  const elapsed = Math.floor((Date.now() - data.startedAt) / 1000)
  return Math.max(0, data.timeLeft - elapsed)
}

// ── push current state to popup (if open, silently fail otherwise) ──
function pushState(data, timeLeftOverride) {
  const payload = {
    type:       "stateUpdate",
    timerState: data.timerState,
    timeLeft:   timeLeftOverride !== undefined ? timeLeftOverride : calcTimeLeft(data),
    level:      data.level,
    xp:         data.xp,
    apricorns:  data.apricorns,
    selected:   data.selected,
    ownedPokemon: data.ownedPokemon,
  }
  chrome.runtime.sendMessage(payload).catch(() => {}) // popup closed → ignore
}

// ──────────────────────────────────────────────────────────
// MESSAGE HANDLER – popup sends commands here
// ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {

  // ── popup just opened, wants full state ──────────────
  if (msg.type === "getState") {
    chrome.storage.local.get(null, (data) => {
      reply({ ...data, timeLeft: calcTimeLeft(data) })
    })
    return true // keep port open for async callback
  }

  // ── START (from idle or resume from paused) ──────────
  if (msg.type === "start") {
    chrome.storage.local.get(null, (data) => {
      const timeLeft = data.timerState === "paused" ? data.timeLeft : POMODORO_SECONDS

      chrome.storage.local.set({
        timerState: "running",
        timeLeft,
        startedAt: Date.now(),
      })

      chrome.alarms.create("pomodoroEnd", { when: Date.now() + timeLeft * 1000 })
      chrome.alarms.create("tick", { periodInMinutes: 1 / 60 })

      pushState({ ...data, timerState: "running", timeLeft }, timeLeft)
      reply({ ok: true })
    })
    return true  // async — keep channel open
  }

  // ── PAUSE ─────────────────────────────────────────────
  if (msg.type === "pause") {
    chrome.storage.local.get(null, (data) => {
      const remaining = calcTimeLeft(data)

      chrome.storage.local.set({
        timerState: "paused",
        timeLeft:   remaining,
        startedAt:  null,
      })

      chrome.alarms.clear("pomodoroEnd")
      chrome.alarms.clear("tick")

      pushState({ ...data, timerState: "paused" }, remaining)
      reply({ ok: true })
    })
    return true  // async — keep channel open
  }

  // ── CANCEL ────────────────────────────────────────────
  if (msg.type === "cancel") {
    chrome.storage.local.set({
      timerState: "idle",
      timeLeft:   POMODORO_SECONDS,
      startedAt:  null,
    })

    chrome.alarms.clear("pomodoroEnd")
    chrome.alarms.clear("tick")

    chrome.storage.local.get(null, (data) => {
      pushState({ ...data, timerState: "idle", timeLeft: POMODORO_SECONDS }, POMODORO_SECONDS)
      reply({ ok: true })
    })
    return true  // async — keep channel open
  }

  // ── SELECT POKEMON ────────────────────────────────────
  if (msg.type === "selectPokemon") {
    chrome.storage.local.set({ selected: msg.id })
    reply({ ok: true })
    return true
  }

  // ── PURCHASE ──────────────────────────────────────────
  if (msg.type === "purchase") {
    chrome.storage.local.get(["apricorns", "ownedPokemon"], (data) => {
      const prices = { eevee: 500, jigglypuff: 750, psyduck: 1000 }
      const price  = prices[msg.id]

      if (!price)                              return reply({ ok: false, reason: "unknown" })
      if (data.ownedPokemon.includes(msg.id))  return reply({ ok: false, reason: "owned" })
      if (data.apricorns < price)              return reply({ ok: false, reason: "funds" })

      chrome.storage.local.set({
        apricorns:    data.apricorns - price,
        ownedPokemon: [...data.ownedPokemon, msg.id],
      })
      reply({ ok: true })
    })
    return true
  }
})

// ──────────────────────────────────────────────────────────
// ALARM HANDLER
// ──────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {

  // ── every-second tick → push updated timeLeft to popup ─
  if (alarm.name === "tick") {
    chrome.storage.local.get(null, (data) => {
      pushState(data)
    })
  }

  // ── timer finished ────────────────────────────────────
  if (alarm.name === "pomodoroEnd") {
    chrome.alarms.clear("pomodoroEnd")
    chrome.alarms.clear("tick")

    chrome.storage.local.get(null, (data) => {
      const newXP      = (data.xp || 0) + XP_PER_SESSION
      const xpNeeded   = calcXPForLevel((data.level || 1) + 1)
      let   newLevel   = data.level || 1
      let   newApricorns = data.apricorns || 0
      let   remainderXP  = newXP

      if (newXP >= xpNeeded) {
        newLevel     += 1
        newApricorns += APRICORNS_PER_LEVELUP
        remainderXP   = newXP - xpNeeded

        chrome.notifications.create("levelUp", {
          type:    "basic",
          iconUrl: "icon.jpg",
          title:   "🎉 Level Up!",
          message: `Your Pokemon reached Level ${newLevel}! +${APRICORNS_PER_LEVELUP} Apricorns`,
        })
      } else {
        chrome.notifications.create("sessionDone", {
          type:    "basic",
          iconUrl: "icon.jpg",
          title:   "⚡ Session Complete!",
          message: `Nice work! +${XP_PER_SESSION} XP`,
        })
      }

      chrome.storage.local.set({
        timerState: "idle",
        timeLeft:   POMODORO_SECONDS,
        startedAt:  null,
        xp:         remainderXP,
        level:      newLevel,
        apricorns:  newApricorns,
      })

      // push final state so popup updates if open
      pushState({
        ...data,
        timerState: "idle",
        timeLeft:   POMODORO_SECONDS,
        xp:         remainderXP,
        level:      newLevel,
        apricorns:  newApricorns,
      }, POMODORO_SECONDS)
    })
  }
})