import React, { useEffect, useRef, useState } from 'react';
import '../../styles/xPEPEstyle.css';
import DinoGame from '../../logic/XpepeGameEngine';
import { CHARACTERS, CharacterId } from './characters';

export type XpepeProps = { 
  onGameOver?: (finalScore: number) => void; 
  onScoreChange?: (score: number) => void; 
};

const DinoGameComponent: React.FC<XpepeProps> = ({ onGameOver, onScoreChange }) => {
  const gameRef = useRef<any>(null);
  const [character, setCharacter] = useState<CharacterId>(
    (localStorage.getItem("character") as CharacterId) || "xpepe"
  );

  useEffect(() => {
    gameRef.current = new DinoGame({ onGameOver, onScoreChange, autoStart: true });
    return () => { 
      try { 
        gameRef.current?.pauseGame?.(); 
        gameRef.current?.destroy?.(); 
      } catch {} 
      gameRef.current = null; 
    };
  }, [onGameOver, onScoreChange]);

  const handleChangeCharacter = (id: CharacterId) => {
    console.log("switch to", id);
    setCharacter(id);
    localStorage.setItem("character", id);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* 🔹 UI de selecție caractere */}
      <div className="flex gap-4">
        {Object.entries(CHARACTERS).map(([id, Svg]) => (
          <button
            key={id}
            onClick={() => handleChangeCharacter(id as CharacterId)}
            className={`p-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition ${
              character === id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="w-12 h-12">{Svg}</div>
            <span className="text-xs mt-1">{id}</span>
          </button>
        ))}
      </div>

      {/* 🔹 Jocul */}
      <div className="game-container" id="gameContainer">
        <div className="ground" id="ground"></div>
        <div className="cloud" id="cloud1" style={{ right: '100px' }}></div>
        <div className="cloud" id="cloud2" style={{ right: '300px' }}></div>
        <div className="cloud" id="cloud3" style={{ right: '500px' }}></div>

        <div className="dino" id="dino">
          {CHARACTERS[character]}
        </div>

        <div className="score" id="score">00000</div>
        <div className="game-over" id="gameOver" style={{ display: 'none' }}>
          <h2>G A M E &nbsp; O V E R</h2>
          <p>Press SPACE to restart</p>
        </div>
      </div>
    </div>
  );
};

export default DinoGameComponent;
