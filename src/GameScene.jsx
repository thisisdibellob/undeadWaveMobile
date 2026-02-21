import { useEffect, useRef } from 'react';

function GameScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Game-Controll.js의 로직을 여기서 실행하거나, 
    // 해당 js 파일의 함수를 import 해서 호출합니다.
    console.log("게임 시작!");
    
    // 예: initGame(canvasRef.current);
  }, []);

  return (
    <div className="game-container">
      <canvas id="GameCanvas" ref={canvasRef}></canvas>
    </div>
  );
}

export default GameScene;