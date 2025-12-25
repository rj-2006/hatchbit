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