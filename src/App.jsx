import { useEffect, useRef, useState } from 'react';
import { useGameScale } from './hooks/useGameScale';
import StartMenu from './StartMenu';
import GameScene from './GameScene';

const BASE_WIDTH = 844;
const BASE_HEIGHT = 390;

function App() {
  const [gameState, setGameState] = useState('menu');
  const [playSession, setPlaySession] = useState(0);
  const { scale } = useGameScale();
  const bgmRef = useRef(null);
  const shouldResumeBgmRef = useRef(false);
  const isMenu = gameState === 'menu';

  useEffect(() => {
    const pauseBgm = () => {
      const bgm = bgmRef.current;
      if (!bgm) return;
      shouldResumeBgmRef.current = gameState === 'play' && !bgm.paused;
      bgm.pause();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseBgm();
        return;
      }

      const bgm = bgmRef.current;
      if (!bgm) return;
      if (gameState === 'play' && shouldResumeBgmRef.current) {
        bgm.play().catch(() => {});
      } else if (gameState !== 'play') {
        bgm.pause();
        bgm.currentTime = 0;
      }
    };

    window.addEventListener('pagehide', pauseBgm);
    window.addEventListener('beforeunload', pauseBgm);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', pauseBgm);
      window.removeEventListener('beforeunload', pauseBgm);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState]);

  const getOrCreateBgm = () => {
    if (!bgmRef.current) {
      const audio = new Audio('/assets/resource/sound.mp3');
      audio.loop = true;
      audio.preload = 'auto';
      audio.playsInline = true;
      bgmRef.current = audio;
    }
    return bgmRef.current;
  };

  const handleStart = async () => {
    const audio = getOrCreateBgm();

    // iOS/Safari에서 초기 재생 실패를 줄이기 위해 사용자 제스처 시점에 오디오를 먼저 언락한다.
    try {
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {
      // 언락 실패해도 아래에서 실제 재생을 다시 시도한다.
    } finally {
      audio.muted = false;
    }

    audio.play().catch(() => {});
    setPlaySession((prev) => prev + 1);
    setGameState('play');
  };

  // 인게임 메뉴 버튼으로 나갈 때 BGM을 정리하고 메인 메뉴로 복귀한다.
  const handleBackToMenu = () => {
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }
    setGameState('menu');
  };

  const handleRestartGame = () => {
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
    }
    setPlaySession((prev) => prev + 1);
    setGameState('play');
  };

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
        width: isMenu ? BASE_WIDTH : '100vw',
        height: isMenu ? BASE_HEIGHT : '100vh',
        transform: isMenu ? `scale(${scale})` : 'none',
        transformOrigin: isMenu ? 'center center' : 'initial',
        // 메뉴에서는 소개 섹션을 아래로 스크롤할 수 있어야 한다.
        overflow: isMenu ? 'auto' : 'hidden',
        position: 'relative',
      }}>
        {isMenu ? (
          <StartMenu onStart={handleStart} />
        ) : (
          <GameScene
            key={playSession}
            bgmRef={bgmRef}
            onMenu={handleBackToMenu}
            onRestart={handleRestartGame}
          />
        )}
      </div>
    </div>
  );
}

export default App;
