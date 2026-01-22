// Pokebit Background Service Worker
const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
const XP_PER_SESSION = 50;
const APRICORNS_PER_LEVEL = 50;

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    level: 1,
    xp: 0,
    apricorns: 0,
    timerState: 'idle',
    timeRemaining: POMODORO_DURATION,
    ownedPokemon: ['pikachu', 'bulbasaur', 'charmander', 'squirtle'], // Starters
    sessionsCompleted: 0
  });
});

// Calculate XP needed for next level
function calculateXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.75, level - 1));
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'startTimer':
      startTimer();
      break;
    case 'pauseTimer':
      pauseTimer();
      break;
    case 'resumeTimer':
      resumeTimer();
      break;
    case 'cancelTimer':
      cancelTimer();
      break;
    case 'getTimerState':
      getTimerState(sendResponse);
      return true; // Keep channel open for async response
    case 'purchasePokemon':
      purchasePokemon(message.pokemonId, sendResponse);
      return true;
  }
});

// Start timer
function startTimer() {
  chrome.storage.local.set({
    timerState: 'running',
    timeRemaining: POMODORO_DURATION,
    startTime: Date.now()
  });

  chrome.alarms.create('pomodoroTimer', {
    when: Date.now() + (POMODORO_DURATION * 1000)
  });

  // Update popup every second
  startTimerUpdates();
}

// Pause timer
function pauseTimer() {
  chrome.storage.local.get(['timeRemaining', 'startTime'], (data) => {
    const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
    const remaining = Math.max(0, data.timeRemaining - elapsed);

    chrome.storage.local.set({
      timerState: 'paused',
      timeRemaining: remaining
    });

    chrome.alarms.clear('pomodoroTimer');
    chrome.alarms.clear('timerUpdate');
  });
}

// Resume timer
function resumeTimer() {
  chrome.storage.local.get(['timeRemaining'], (data) => {
    chrome.storage.local.set({
      timerState: 'running',
      startTime: Date.now()
    });

    chrome.alarms.create('pomodoroTimer', {
      when: Date.now() + (data.timeRemaining * 1000)
    });

    startTimerUpdates();
  });
}

// Cancel timer
function cancelTimer() {
  chrome.storage.local.set({
    timerState: 'idle',
    timeRemaining: POMODORO_DURATION
  });

  chrome.alarms.clear('pomodoroTimer');
  chrome.alarms.clear('timerUpdate');

  updatePopup();
}

// Start timer update interval
function startTimerUpdates() {
  chrome.alarms.create('timerUpdate', {
    periodInMinutes: 1/60 // Update every second
  });
}

// Get current timer state
function getTimerState(sendResponse) {
  chrome.storage.local.get(['timerState', 'timeRemaining', 'startTime'], (data) => {
    let actualTimeRemaining = data.timeRemaining;

    if (data.timerState === 'running' && data.startTime) {
      const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
      actualTimeRemaining = Math.max(0, data.timeRemaining - elapsed);
    }

    sendResponse({
      timerState: data.timerState,
      timeRemaining: actualTimeRemaining
    });
  });
}

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    completeSession();
  } else if (alarm.name === 'timerUpdate') {
    updatePopup();
  }
});

// Complete a Pomodoro session
function completeSession() {
  chrome.storage.local.get(['xp', 'level', 'apricorns', 'sessionsCompleted'], (data) => {
    const newXP = (data.xp || 0) + XP_PER_SESSION;
    const currentLevel = data.level || 1;
    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    let newLevel = currentLevel;
    let newApricorns = data.apricorns || 0;

    // Check for level up
    if (newXP >= xpForNextLevel) {
      newLevel = currentLevel + 1;
      newApricorns += APRICORNS_PER_LEVEL;

      // Show level up notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'src/assets/icon.jpg',
        title: 'Level Up! 🎉',
        message: `Congratulations! You reached level ${newLevel} and earned ${APRICORNS_PER_LEVEL} Apricorns!`
      });
    } else {
      // Show session complete notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'src/assets/icon.jpg',
        title: 'Session Complete! ⚡',
        message: `Great work! You earned ${XP_PER_SESSION} XP!`
      });
    }

    // Update storage
    chrome.storage.local.set({
      xp: newXP,
      level: newLevel,
      apricorns: newApricorns,
      timerState: 'idle',
      timeRemaining: POMODORO_DURATION,
      sessionsCompleted: (data.sessionsCompleted || 0) + 1
    });

    chrome.alarms.clear('timerUpdate');
    updatePopup();
  });
}

// Purchase Pokemon with Apricorns
function purchasePokemon(pokemonId, sendResponse) {
  chrome.storage.local.get(['apricorns', 'ownedPokemon'], (data) => {
    const apricorns = data.apricorns || 0;
    const ownedPokemon = data.ownedPokemon || [];

    // Check if already owned
    if (ownedPokemon.includes(pokemonId)) {
      sendResponse({ success: false, error: 'Already owned' });
      return;
    }

    // Get Pokemon price (this should be imported from themes.js in real implementation)
    const pokemonPrices = {
      eevee: 500,
      jigglypuff: 750,
      psyduck: 1000
    };

    const price = pokemonPrices[pokemonId];
    if (!price) {
      sendResponse({ success: false, error: 'Invalid Pokemon' });
      return;
    }

    // Check if user has enough Apricorns
    if (apricorns < price) {
      sendResponse({ success: false, error: 'Not enough Apricorns' });
      return;
    }

    // Purchase Pokemon
    chrome.storage.local.set({
      apricorns: apricorns - price,
      ownedPokemon: [...ownedPokemon, pokemonId]
    });

    sendResponse({ success: true });
  });
}

// Update popup with current timer state
function updatePopup() {
  chrome.storage.local.get(['timerState', 'timeRemaining', 'startTime'], (data) => {
    let actualTimeRemaining = data.timeRemaining;

    if (data.timerState === 'running' && data.startTime) {
      const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
      actualTimeRemaining = Math.max(0, data.timeRemaining - elapsed);
    }

    // Send message to popup if it's open
    chrome.runtime.sendMessage({
      type: 'updateTimerDisplay',
      timeRemaining: actualTimeRemaining,
      timerState: data.timerState
    }).catch(() => {
      // Popup is not open, ignore error
    });
  });
}