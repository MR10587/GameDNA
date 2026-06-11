import React, { useState, useEffect } from 'react';

export const ReactionTest = () => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'click' | 'result'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<number | null>(null);

  const startTest = () => {
    setGameState('waiting');
    const randomDelay = Math.random() * 3000 + 2000;
    const id = window.setTimeout(() => {
      setGameState('click');
      setStartTime(Date.now());
    }, randomDelay);
    setTimerId(id);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      if (timerId) window.clearTimeout(timerId);
      alert('Çox tez kliklədiniz! Yenidən yoxlayın.');
      setGameState('idle');
    } else if (gameState === 'click') {
      setReactionTime(Date.now() - startTime);
      setGameState('result');
    }
  };

  // cleanup timer on unmount or when timer changes
  useEffect(() => {
    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [timerId]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Refleks Testi</h3>
      {gameState === 'idle' && <button onClick={startTest} style={{ padding: '15px 30px', fontSize: '18px' }}>Testi Başlat</button>}
      {gameState === 'waiting' && <div onClick={handleClick} style={{ width: '300px', height: '200px', backgroundColor: 'red', margin: '0 auto', color: 'white', lineHeight: '200px', cursor: 'pointer' }}>GÖZLƏ...</div>}
      {gameState === 'click' && <div onClick={handleClick} style={{ width: '300px', height: '200px', backgroundColor: 'green', margin: '0 auto', color: 'white', lineHeight: '200px', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold' }}>KLİKLƏ!!!</div>}
      {gameState === 'result' && (
        <div>
          <p>Sizin reaksiya vaxtınız: <strong>{reactionTime} ms</strong></p>
          <button onClick={() => setGameState('idle')} style={{ padding: '10px 20px' }}>Yenidən Yoxla</button>
        </div>
      )}
    </div>
  );
};