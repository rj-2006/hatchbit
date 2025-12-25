const init_data = {
    activePokemon : "Pikachu",
    stats : {
        level : 1,
        xp : 0,
        xpToNextLevel: 50
    }
};

chrome.runtime.onInstalled.addListener( ()=> {
    chrome.storage.local.set({pokedata: init_data});
    console.log("Initialized local storage for Pokebit.")
})
// Creating the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pomotimer"){
        handleTimerComplete();
    }
});
//Starting the Pomodoro
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message.command === "startTimer"){
        chrome.alarms.create("pomotimer", {delayInMinutes: message.minutes});

        console.log(`Timer started for ${message.minutes} minutes.`);
        sendResponse({status: "timer_start"});
    }
});

async function handleTimerComplete() {
    const result = await chrome.storage.local.get(["pokedata"]);
    if(!result.pokedata) return;

    let { stats, activePokemon} = result.pokedata;

    stats.xp += 50;

    if (stats.xp >= xpToNextLevel){
        stats.level += 1;
        stats.xp = 0;
        stats.xpToNextLevel = Math.floor(stats.xpToNextLevel * 1.75);

        showNotification("Level Up!", `${activePokemon} reached level ${stats.level}`);
    }else{
        showNotification("Congrats on finishing the pomodoro session!");
    }

    await chrome.local.storage.local.set({pokedata : {...result.pokedata, stats}});
}

function showNotification(title,message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "src/assets/icon.jpg",
        title: title,
        message: message,
        priority: 2
    });
}