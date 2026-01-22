const init_data = {
    activePokemon: "Pikachu",
    stats: {
        level: 1,
        xp: 0,
        xpToNextLevel: 50
    }
};

// 1. Setup on Install
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ pokedata: init_data });
    console.log("Initialized local storage for Pokebit.");
});

// 2. Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pomotimer") {
        handleTimerComplete();
    }
});

// 3. Message Listener (Communication from React)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "startTimer") {
        // Create the alarm
        chrome.alarms.create("pomotimer", { delayInMinutes: message.minutes });
        console.log(`Timer started for ${message.minutes} minutes.`);
        let time = message.minutes;
        
        // Let the React UI know we succeeded
        sendResponse({ status: "timer_start" });
    }
    if (message.command == "pauseTimer"){
        timeleft = time - message.minutes;
        // kept track of time left
    }
    if (message.command == "resumeTimer"){
        // start the timer with timeleft
        chrome.alarms.create("pomotimer", {delayInMinutes: timeleft.minutes });
        console.log(`Timer resumed for ${timeleft.minutes} minutes.`);
    }
    if (message.command == "cancelTimer"){
        // cancel timer logic
    }
    // Required for async sendResponse
    return true; 
});

// 4. The Logic Engine
async function handleTimerComplete() {
    const result = await chrome.storage.local.get(["pokedata"]);
    if (!result.pokedata) return;

    // Extracting nested data
    let { stats, activePokemon } = result.pokedata;

    // Add XP
    stats.xp += 50;

    // FIXED: Accessing property from stats object correctly
    if (stats.xp >= stats.xpToNextLevel) {
        stats.level += 1;
        stats.xp = 0;
        // Increase difficulty for next level
        stats.xpToNextLevel = Math.floor(stats.xpToNextLevel * 1.75);

        showNotification("Level Up!", `${activePokemon} reached level ${stats.level}!`);
    } else {
        // FIXED: Added title and message
        showNotification("Session Complete!", "Great job! You earned 50 XP.");
    }

    // FIXED: Corrected storage path
    await chrome.storage.local.set({ pokedata: { ...result.pokedata, stats } });
}

// 5. Helper Function
function showNotification(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "src/assets/icon.jpg", 
        title: title,
        message: message,
        priority: 2
    });
}