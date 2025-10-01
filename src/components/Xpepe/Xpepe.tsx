import React, { useEffect, useRef, useState } from 'react';
import '../../styles/xPEPEstyle.css';
import DinoGame from '../../logic/XpepeGameEngine';
import { CHARACTERS, CharacterId } from './characters';
import { useGetAccount, useGetLoginInfo, useGetNetworkConfig } from "lib";

export type XpepeProps = { 
  onGameOver?: (finalScore: number) => void; 
  onScoreChange?: (score: number) => void; 
};

// 🔹 mapping NFT -> sprite
const NFT_TO_CHARACTER: Record<string, CharacterId> = {
  "XPEPE-937414-01": "xpepeRed",
  "XPEPE-937414-02": "xpepeYellow"
};

const DinoGameComponent: React.FC<XpepeProps> = ({ onGameOver, onScoreChange }) => {
  const gameRef = useRef<any>(null);
  const [character, setCharacter] = useState<CharacterId>(
    (localStorage.getItem("character") as CharacterId) || "xpepe"
  );

  // 🔹 NFT support
  const { address } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const { network } = useGetNetworkConfig();
  const [nftSprites, setNftSprites] = useState<any[]>([]);

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

  // 🔹 fetch NFTs din colecția XPEPE-937414
  useEffect(() => {
    const loadNfts = async () => {
      if (!isLoggedIn || !address) return;
      try {
        const res = await fetch(`${network.apiAddress}/accounts/${address}/nfts?collections=XPEPE-937414`);
        const data = await res.json();
        setNftSprites(data);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
      }
    };
    loadNfts();
  }, [isLoggedIn, address, network]);

  const handleChangeCharacter = (id: CharacterId) => {
    setCharacter(id);
    localStorage.setItem("character", id);
  };

  // 🔹 când selectăm NFT → verificăm mapping, fallback la galben
  const handleSelectNft = (nft: any) => {
    console.log("NFT selectat:", nft.identifier);
    const mappedChar = NFT_TO_CHARACTER[nft.identifier] || "xpepeYellow";
    setCharacter(mappedChar);
    localStorage.setItem("character", mappedChar);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* 🔹 UI selecție caractere built-in */}
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

      {/* 🔹 NFT Characters */}
      {nftSprites.length > 0 && (
        <div className="flex gap-4 mt-2">
          {nftSprites.map((nft) => (
            <button
              key={nft.identifier}
              onClick={() => handleSelectNft(nft)}
              className={`p-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition ${
                character === (NFT_TO_CHARACTER[nft.identifier] || "xpepeYellow")
                  ? 'ring-2 ring-yellow-500'
                  : ''
              }`}
            >
              <img
                src={nft.media?.[0]?.url}
                alt={nft.name}
                className="w-12 h-12 object-contain"
              />
              <span className="text-xs mt-1">{nft.name}</span>
            </button>
          ))}
        </div>
      )}

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
