import { useEffect, useRef, useState } from 'react';
import './StartMenu.css'; // 기존 style.css 내용을 여기로

function StartMenu({ onStart }) {
  const [scrollValue, setScrollValue] = useState(0);
  const [isStartPressed, setIsStartPressed] = useState(false);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isStoryPressed, setIsStoryPressed] = useState(false);
  const [isPlayPressed, setIsPlayPressed] = useState(false);
  const startTriggeredRef = useRef(false);
  const startButtonRef = useRef(null);
  const activeTouchIdRef = useRef(null);
  const outsideCancelTimerRef = useRef(null);
  const homeLinkRef = useRef(null);
  const storyLinkRef = useRef(null);
  const playLinkRef = useRef(null);
  const homeTouchIdRef = useRef(null);
  const storyTouchIdRef = useRef(null);
  const playTouchIdRef = useRef(null);
  const homeCancelTimerRef = useRef(null);
  const storyCancelTimerRef = useRef(null);
  const playCancelTimerRef = useRef(null);
  const START_PRESS_CANCEL_DELAY = 180;

  // 시작 처리는 반드시 "떼는 순간"에만 실행해서 모바일 버튼 감각을 맞춘다.
  const handleStartTap = () => {
    if (startTriggeredRef.current) return;
    startTriggeredRef.current = true;
    onStart();
  };

  // 버튼 기준으로 터치 좌표가 내부인지 판단한다.
  const isInsideStartButton = (touch) => {
    const buttonEl = startButtonRef.current;
    if (!buttonEl) return false;
    const rect = buttonEl.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  };

  const clearOutsideCancelTimer = () => {
    if (!outsideCancelTimerRef.current) return;
    clearTimeout(outsideCancelTimerRef.current);
    outsideCancelTimerRef.current = null;
  };

  const clearPressedState = () => {
    clearOutsideCancelTimer();
    activeTouchIdRef.current = null;
    setIsStartPressed(false);
  };

  const navigateSection = (targetId) => {
    if (!targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isInsideElement = (touch, ref) => {
    const el = ref.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  };

  // 상단 메뉴 링크들에 시작 버튼과 동일한 "눌렀다 떼면 실행" 터치 패턴을 재사용한다.
  const createNavTouchHandlers = ({ ref, setPressed, touchIdRef, timerRef, onReleaseInside }) => {
    const clearTimer = () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const clearState = () => {
      clearTimer();
      touchIdRef.current = null;
      setPressed(false);
    };

    return {
      onTouchStart: (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        if (!touch) return;
        touchIdRef.current = touch.identifier;
        setPressed(true);
        clearTimer();
      },
      onTouchMove: (e) => {
        e.preventDefault();
        const touch = Array.from(e.changedTouches).find(
          (t) => t.identifier === touchIdRef.current
        );
        if (!touch) return;

        if (isInsideElement(touch, ref)) {
          clearTimer();
          setPressed(true);
          return;
        }

        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            clearState();
          }, START_PRESS_CANCEL_DELAY);
        }
      },
      onTouchEnd: (e) => {
        e.preventDefault();
        const touch = Array.from(e.changedTouches).find(
          (t) => t.identifier === touchIdRef.current
        );
        if (!touch) return;
        const shouldRun = isInsideElement(touch, ref);
        clearState();
        if (shouldRun) onReleaseInside();
      },
      onTouchCancel: () => {
        clearState();
      },
      clearState,
    };
  };

  const homeTouch = createNavTouchHandlers({
    ref: homeLinkRef,
    setPressed: setIsHomePressed,
    touchIdRef: homeTouchIdRef,
    timerRef: homeCancelTimerRef,
    onReleaseInside: () => navigateSection(''),
  });

  const storyTouch = createNavTouchHandlers({
    ref: storyLinkRef,
    setPressed: setIsStoryPressed,
    touchIdRef: storyTouchIdRef,
    timerRef: storyCancelTimerRef,
    onReleaseInside: () => navigateSection('sec'),
  });

  const playTouch = createNavTouchHandlers({
    ref: playLinkRef,
    setPressed: setIsPlayPressed,
    touchIdRef: playTouchIdRef,
    timerRef: playCancelTimerRef,
    onReleaseInside: () => navigateSection('play'),
  });

  useEffect(() => {
    return () => {
      clearOutsideCancelTimer();
      homeTouch.clearState();
      storyTouch.clearState();
      playTouch.clearState();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollValue(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="start-menu">
      <header style={{ top: scrollValue * 0.5 + 'px' }}>
        <a href="#" className="logo"></a>
        <ul>
          <li>
            <button
              type="button"
              ref={homeLinkRef}
              className={`active ${isHomePressed ? 'nav-pressed' : ''}`}
              onTouchStart={homeTouch.onTouchStart}
              onTouchMove={homeTouch.onTouchMove}
              onTouchEnd={homeTouch.onTouchEnd}
              onTouchCancel={homeTouch.onTouchCancel}
            >
              홈
            </button>
          </li>
          <li>
            <button
              type="button"
              ref={storyLinkRef}
              className={isStoryPressed ? 'nav-pressed' : ''}
              onTouchStart={storyTouch.onTouchStart}
              onTouchMove={storyTouch.onTouchMove}
              onTouchEnd={storyTouch.onTouchEnd}
              onTouchCancel={storyTouch.onTouchCancel}
            >
              스토리
            </button>
          </li>
          <li>
            <button
              type="button"
              ref={playLinkRef}
              className={isPlayPressed ? 'nav-pressed' : ''}
              onTouchStart={playTouch.onTouchStart}
              onTouchMove={playTouch.onTouchMove}
              onTouchEnd={playTouch.onTouchEnd}
              onTouchCancel={playTouch.onTouchCancel}
            >
              조작 방식
            </button>
          </li>
        </ul>
      </header>

      <section className="parallax-section">
        <img src="/assets/startMenu/stars.png" id="stars" style={{ left: scrollValue * 0.25 + 'px' }} />
        <img src="/assets/startMenu/moon.png" id="moon" style={{ top: scrollValue * 1.05 + 'px' }} />
        <img src="/assets/startMenu/mountains_behind.png" id="mountains_behind" style={{ top: scrollValue * 0.5 + 'px' }} />
        
        <h2 id="text" style={{left: '25%', marginTop: (scrollValue * 1.5 - 50) + 'px', zIndex: 100}}>
          Undead Wave
        </h2>
        
        <button
          ref={startButtonRef}
          onClick={handleStartTap}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            if (!touch) return;
            activeTouchIdRef.current = touch.identifier;
            setIsStartPressed(true);
            clearOutsideCancelTimer();
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = Array.from(e.changedTouches).find(
              (t) => t.identifier === activeTouchIdRef.current
            );
            if (!touch) return;

            if (isInsideStartButton(touch)) {
              clearOutsideCancelTimer();
              if (!isStartPressed) setIsStartPressed(true);
              return;
            }

            if (!outsideCancelTimerRef.current) {
              // 버튼 밖으로 빠져나간 뒤 일정 시간 유지되면 눌림 상태를 해제한다.
              outsideCancelTimerRef.current = setTimeout(() => {
                clearPressedState();
              }, START_PRESS_CANCEL_DELAY);
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const touch = Array.from(e.changedTouches).find(
              (t) => t.identifier === activeTouchIdRef.current
            );
            if (!touch) return;
            const shouldStart = isStartPressed && isInsideStartButton(touch);
            clearPressedState();
            if (shouldStart) handleStartTap();
          }}
          onTouchCancel={clearPressedState}
          id="btn"
          className={isStartPressed ? 'btn-pressed' : ''}
          style={{ marginTop: scrollValue * 1.5 + 'px', zIndex: 100 }}
        >
          게임시작
        </button>

        <img src="/assets/startMenu/mountains_front.png" id="mountains_front" />
        <img src="/assets/startMenu/zombie.png" id="zombie" style={{ left: (570 + scrollValue * 0.3) + 'px' }} />
      </section>

      {/* 스토리 및 조작 방식 섹션은 기존 HTML 내용을 그대로 넣어주세요 */}
      <div className="sec" id="sec">
        <h2>게임 스토리</h2>
        <p>좀비 아포칼립스 세상</p>
        <p>어느 날 갑자기 전 세계에 원인을 알 수 없는 바이러스가 퍼져 사람들이 좀비로 변했습니다.</p>
        <p>플레이어는 살아남은 생존자 중 한 명이 되어 끝없이 몰려오는 좀비 무리 속에서 버텨야 합니다.</p>
        <p>좀비를 해치우고 무기와 스킬을 얻어 생존하세요.</p>
        <img src="/assets/startMenu/story_image.jpeg" width="300" height="200"></img>
      </div>

      <div className="sec" id="play">
        <h2>조작 방식</h2>
        {/* 이동방식 */}
        <div id="mov">
        <div>
            <p>이동방식</p>
            <img src="/assets/startMenu/W.png" className="space" style={{ marginRight: '65px' }}></img>
            <br></br>
            <img src="/assets/startMenu/A_black.png"></img>
            <img src="/assets/startMenu/S.png"></img>
            <img src="/assets/startMenu/D_black.png"></img>
        </div>
        <div>
            <img src="/assets/startMenu/run.gif" width="100px"></img>
        </div>
        </div>
        
        {/* 공격 */}
        <div className="attack-section">
        <p>공격</p>
        <div>
            <img src="/assets/startMenu/shot.gif" style={{width:"100px"}}></img>
            <img src="/assets/startMenu/bullet1.png" style={{width:"30px"}}></img>
            <img src="/assets/startMenu/zombie-hurt.gif" style={{width:"100px"}}></img>
            <img src="/assets/startMenu/mouse.gif"></img>
            <img src="/assets/startMenu/Touch.png"></img>
        </div>
        </div>
        
        {/* 스킬 Shift */}
        <div className="pand">
        <p>스킬 Shift 구르기</p>
        <div>
            <img src="/assets/startMenu/shift.gif"></img>
            <img src="/assets/startMenu/roll.png" style={{width:"100px", height:"96px"}}></img>
        </div>
        </div>
        
        {/* 스킬 E */}
        <div className="pand">
        <p>스킬 E 광선 공격</p>
        <div>
            <img src="/assets/startMenu/E.gif"></img>
            <img src="/assets/startMenu/Ray.png" style={{width:"250px", height:"96px"}}></img>
        </div>
        </div>
        
        {/* 스킬 Q */}
        <div className="pand">
        <p>스킬 Q 백스탭 공격</p>
        <div>
            <img src="/assets/startMenu/Q.gif"></img>
            <img src="/assets/startMenu/Backstep.png" style={{width:"200px", height:"150px"}}></img>
        </div>
        </div>
        
        {/* 스킬 R */}
        <div className="pand">
        <p>스킬 R 회오리</p>
        <div>
            <img src="/assets/startMenu/R.gif"></img>
            <img src="/assets/startMenu/Tornado.png" style={{width:"400px", height:"350px"}}></img>
        </div>
        </div>
      </div>

    </div>
  );
}

export default StartMenu;
