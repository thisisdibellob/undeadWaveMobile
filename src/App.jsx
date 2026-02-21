import { useState } from 'react';
import StartMenu from './StartMenu';
import GameScene from './GameScene';

function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu' 또는 'play'

  return (
    <div className="App">
      {gameState === 'menu' ? (
        <StartMenu onStart={() => setGameState('play')} />
      ) : (
        <GameScene />
      )}
    </div>
  );
}

export default App;