import { useState } from 'react';
import { useGameScale } from './hooks/useGameScale';
import StartMenu from './StartMenu';
import GameScene from './GameScene';

const BASE_WIDTH = 844;
const BASE_HEIGHT = 390;

function App() {
  const [gameState, setGameState] = useState('menu');
  const { scale } = useGameScale();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#000',
    }}>
      <div style={{
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        overflow: 'auto',
        position: 'relative',
      }}>
        {gameState === 'menu' ? (
          <StartMenu onStart={() => setGameState('play')} />
        ) : (
          <GameScene />
        )}
      </div>
    </div>
  );
}

export default App;