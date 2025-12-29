import React,  { useState, useEffect } from 'react'
import { PKMN_THEMES } from './constants/themes'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [pokeData, setPokeData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); 

  useEffect(() => {
    chrome.storage.local.get(["pokedata"], (result) => {
      if (result.pokedata) setPokeData(result.pokedata);
    });

    const listener = (changes) => {
      if (changes.pokedata) {
        setPokeData(changes.pokedata.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const startPomo = () =>{
    chrome.runtime.sendMessage({command: "startTimer", minutes: 25}, (response) => {
      console.log(response.status);
    });
  };

  if (!pokeData) return <div>Loading...</div>;

  const currentTheme = PKMN_THEMES[pokedata.activePokemon];

  return (
    <>

    </>
  )
  }


export default App;