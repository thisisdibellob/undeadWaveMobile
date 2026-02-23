import { useEffect, useRef } from 'react';

import { Player } from './logic/Player.js';
import { World } from './logic/World.js';
import { drawUI, drawGameOverScreen, drawUpgradeOptions, calculateUpgradeOptionBounds, statUI, drawMobileUI } from './logic/Ui.js';
import { EnemyManager } from './logic/EnemyManager.js';
import { WeaponManager } from './logic/WeaponManager.js';
import { PartsManager } from './logic/PartsManager.js';
import { SurvivorManager } from './logic/SurvivorManager.js';

function GameScene() {
  const canvasRef = useRef(null);
  const requestRef = useRef(null); // 애니메이션 프레임 취소용

  useEffect(() => {
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 왼쪽 조이스틱 (이동) 
    const joystick = {
      active: false, touchId: null,
      startX: 0, startY: 0, currX: 0, currY: 0,
      radius: 50, handleRadius: 25
    };

    // 우측 조이스틱 (에임 및 사격)
    const rightJoystick = {
      active: false, touchId: null,
      startX: 0, startY: 0, currX: 0, currY: 0,
      radius: 50, handleRadius: 25
    };

    // 버튼 터치 거리 계산용 함수
    const getDist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    // ------------ 터치 이벤트 핸들러 ------------
    const handleTouchStart = (e) => {
      if (e.cancelable) e.preventDefault();
      
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 우측 하단 고정 조이스틱의 '중심점'
      const rJoyX = w - 120;
      const rJoyY = h - 80;
      const rJoyRadius = 80; // 이 반경 안을 터치해야 오른쪽 조이스틱이 반응함

      // 스킬 버튼들을 오른쪽 조이스틱 주변(부채꼴)으로 배치
      // 버튼 배치 설정 (중심에서 130px 떨어진 궤도)
      const dist = 130; 
      const buttons = [
        { id: 'roll',   x: rJoyX - dist, y: rJoyY + 30, r: 35 },                          // 9시 (180도)
        { id: 'skillQ', x: rJoyX - dist * 0.866 + 10, y: rJoyY - dist * 0.5 +20, r: 35 },     // 10시 (150도)
        { id: 'skillE', x: rJoyX - dist * 0.5 + 20, y: rJoyY - dist * 0.866 + 10, r: 35 },     // 11시 (120도)
        { id: 'skillR', x: rJoyX + 30, y: rJoyY - dist, r: 35 }                           // 12시 (90도)
      ];

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        let buttonTouched = false;

        // 1. 스킬 버튼을 먼저 확인 (터치 영역을 살짝 더 크게 잡아줌 * 1.5)
        for (const btn of buttons) {
          if (getDist(touch.clientX, touch.clientY, btn.x, btn.y) < btn.r * 1.5) {
            buttonTouched = true;
            if (btn.id === 'roll') player.startRoll();
            if (btn.id === 'skillQ') { if(player.startbackstep()) weaponManager.castCone(); }
            if (btn.id === 'skillE') weaponManager.castRay(Date.now());
            if (btn.id === 'skillR') weaponManager.castPullZone(Date.now());
            break;
          }
        }
        if (buttonTouched) continue; // 버튼을 눌렀으면 아래 조이스틱 로직은 무시

        // 2. 우측 고정 조이스틱 (공격/조준) 처리
        // 터치한 곳이 고정된 오른쪽 조이스틱 반경 안쪽이라면 활성화
        if (getDist(touch.clientX, touch.clientY, rJoyX, rJoyY) < rJoyRadius && !rightJoystick.active) {
          rightJoystick.active = true;
          rightJoystick.touchId = touch.identifier;
          rightJoystick.startX = rJoyX; // 시작점을 터치한 곳이 아니라 '고정된 중심점'으로 강제!
          rightJoystick.startY = rJoyY;
          rightJoystick.currX = touch.clientX;
          rightJoystick.currY = touch.clientY;
          continue;
        }

        // 3. 좌측 이동 조이스틱 (기존처럼 왼쪽 화면 아무 데나 누르면 생성되는 방식 유지)
        if (touch.clientX < w / 2 && !joystick.active) {
          joystick.active = true;
          joystick.touchId = touch.identifier;
          joystick.startX = touch.clientX; 
          joystick.startY = touch.clientY;
          joystick.currX = touch.clientX; 
          joystick.currY = touch.clientY;
        } 
      }
    };

    const handleTouchMove = (e) => {
      if (e.cancelable) e.preventDefault();
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // 이동 조이스틱 로직
        if (joystick.active && touch.identifier === joystick.touchId) {
          joystick.currX = touch.clientX; joystick.currY = touch.clientY;
          const dx = joystick.currX - joystick.startX;
          const dy = joystick.currY - joystick.startY;
          const threshold = 15;
          keys.w = dy < -threshold; keys.s = dy > threshold;
          keys.a = dx < -threshold; keys.d = dx > threshold;
        }
        
        // 조준 조이스틱 로직
        if (rightJoystick.active && touch.identifier === rightJoystick.touchId) {
          rightJoystick.currX = touch.clientX; rightJoystick.currY = touch.clientY;
          
          const dx = rightJoystick.currX - rightJoystick.startX;
          const dy = rightJoystick.currY - rightJoystick.startY;
          
          // 조이스틱을 당긴 방향으로 가짜 마우스 좌표(mouseX, mouseY)를 생성하여 에임 조절
          mouseX = (window.innerWidth / 2) + dx * 10;
          mouseY = (window.innerHeight / 2) + dy * 10;
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // 이동 종료
        if (joystick.active && touch.identifier === joystick.touchId) {
          joystick.active = false; joystick.touchId = null;
          keys.w = keys.a = keys.s = keys.d = false;
        }
        // 사격 종료
        if (rightJoystick.active && touch.identifier === rightJoystick.touchId) {
          rightJoystick.active = false; rightJoystick.touchId = null;
        }
      }
    };

    

    // ------------ 터치 이벤트 리스너 등록 ------------
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // ------------ 오디오 설정 ------------ 
    const audioPath = "/assets/resource/sound.mp3"; 
    const gameBGM = new Audio(audioPath);
    gameBGM.loop = true;

    function playBGM() {
      gameBGM.play().catch(error => console.error("자동 재생 차단됨.", error));
    }

    const bgmHandler = () => {
      playBGM();
      document.removeEventListener('keydown', bgmHandler);
    };
    document.addEventListener('keydown', bgmHandler, { once: true });

    // ------------ 게임 상태 및 변수 ------------
    let lastFrameTime = 0;
    const GAME_STATE = { PLAYING: 'playing', UPGRADING: 'upgrading', GAMEOVER: 'gameover' };
    let currentState = GAME_STATE.PLAYING;
    let currentUpgradeOptions = [];

    // ------------ 캔버스 크기 ------------
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ------------ 게임 객체 생성 ------------
    const world = new World(5000, 5000);
    const player = new Player(world.width, world.height);
    const enemyManager = new EnemyManager(world);
    const weaponManager = new WeaponManager(player);
    const partsManager = new PartsManager();
    const survivorManager = new SurvivorManager();

    // ------------ 이미지 로드 (경로 수정) ------------
    const bulletImg = [
      "",
      "/assets/resource/bullet_image/bullet1.png",
      "/assets/resource/bullet_image/bullet2.png",
      "/assets/resource/bullet_image/bullet3.png",
      "/assets/resource/bullet_image/bullet4.png",
      "/assets/resource/bullet_image/bullet5.png",
      "/assets/resource/bullet_image/bullet6.png",
      "/assets/resource/bullet_image/bullet7.png",
      "/assets/resource/bullet_image/bullet8.png"
    ];

    // ------------ 키보드 & 마우스 입력 ------------
    const keys = { w: false, a: false, s: false, d: false, ㅁ: false, ㄴ: false, ㅇ: false, ㅈ: false };
    let isSpace = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      
      if (key == "1") weaponManager.setWeapon("pistol");
      if (key == "2" && partsManager.num >= 20) weaponManager.setWeapon("shotgun");
      if (key == "3" && partsManager.num >= 50) weaponManager.setWeapon("rifle");
      if (key == "4" && partsManager.num >= 100) weaponManager.setWeapon("bomb");
      if (key === ' ' || key === 'space') isSpace = !isSpace;
      
      if (event.key === 'Shift') player.startRoll();
      if (event.key === 'e') weaponManager.castRay(Date.now());
      if (event.key === 'q') if (player.startbackstep()) weaponManager.castCone();
      if (event.key === 'r') weaponManager.castPullZone(Date.now());

      if (key in keys) keys[key] = true;
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key in keys) keys[key] = false;
    };

    const handleClick = (event) => {
      if (currentState === GAME_STATE.UPGRADING) {
        for (const option of currentUpgradeOptions) {
          if (!option.bounds) continue;
          const bounds = option.bounds;
          if (event.clientX >= bounds.x && event.clientX <= bounds.x + bounds.width &&
              event.clientY >= bounds.y && event.clientY <= bounds.y + bounds.height) {
            player.applyUpgrade(option); 
            currentState = GAME_STATE.PLAYING;
            currentUpgradeOptions = [];
            break; 
          }
        }
      }
    };

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    // ------------ 헬퍼 함수 ------------
    const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPausedGame = () => {
      let cameraX = Math.max(Math.min(-player.x + canvas.width / 2, 0), canvas.width - world.width);
      let cameraY = Math.max(Math.min(-player.y + canvas.height / 2, 0), canvas.height - world.height);
      ctx.save();
      ctx.translate(cameraX, cameraY);
      world.draw(ctx);
      player.draw(ctx, keys);
      enemyManager.draw(ctx, player);
      weaponManager.draw(ctx, bulletImg);
      ctx.restore();
    };

    // ------------ 메인 루프 ------------
    const update = (timestamp) => {
      if (!lastFrameTime) lastFrameTime = timestamp;
      const deltaTime = timestamp - lastFrameTime;
      lastFrameTime = timestamp;

      if (currentState === GAME_STATE.GAMEOVER) {
        drawGameOverScreen(ctx, canvas, player.score);
        return;
      }

      if (currentState === GAME_STATE.UPGRADING) {
        clearCanvas();
        drawPausedGame(); 
        drawUI(ctx, player, weaponManager.shootMod, partsManager.num, weaponManager, timestamp); 
        drawUpgradeOptions(ctx, canvas, currentUpgradeOptions); 
        requestRef.current = requestAnimationFrame(update); 
        return; 
      }

      if (survivorManager.isSpawn == false && survivorManager.newSurvivor == null) {
        survivorManager.spawnSurvivor(player);
      }

      clearCanvas();

      player.update(keys, world, deltaTime, timestamp);
      enemyManager.updateSpawning(timestamp);
      weaponManager.update(timestamp, mouseX, mouseY, world);
      partsManager.updateAndCollide(player);
      survivorManager.updateAndCollide(player);

      const collisionResults = enemyManager.updateAndCollide(player, weaponManager, deltaTime, partsManager, timestamp);
      if (collisionResults.playerDied) currentState = GAME_STATE.GAMEOVER;
      if (collisionResults.didLevelUp) {
        currentState = GAME_STATE.UPGRADING;
        currentUpgradeOptions = player.getUpgradeOptions(3);
        calculateUpgradeOptionBounds(canvas, currentUpgradeOptions);
      }

      let cameraX = Math.max(Math.min(-player.x + canvas.width / 2, 0), canvas.width - world.width);
      let cameraY = Math.max(Math.min(-player.y + canvas.height / 2, 0), canvas.height - world.height);

      ctx.save();
      ctx.translate(cameraX, cameraY);

      world.draw(ctx);
      world.drawFence(ctx, player);
      player.draw(ctx, keys); 
      enemyManager.draw(ctx, player);
      weaponManager.draw(ctx, bulletImg);
      partsManager.draw(ctx);
      survivorManager.drawSuvivor(ctx);
      survivorManager.drawImage(ctx, deltaTime);

      ctx.restore();

      weaponManager.time = timestamp;
      drawUI(ctx, player, weaponManager.shootMod, partsManager.num, weaponManager, timestamp);
      statUI(isSpace, ctx, player);
      drawMobileUI(ctx, joystick, rightJoystick, player, weaponManager)

      requestRef.current = requestAnimationFrame(update);
    };

    // 루프 시작
    requestRef.current = requestAnimationFrame(update);

    // ------------ 컴포넌트 언마운트 시 뒷정리 (매우 중요) ------------
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', bgmHandler);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
      gameBGM.pause(); // 화면 나가면 음악 끄기
      gameBGM.currentTime = 0;
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []); // 빈 배열: 처음 렌더링될 때 한 번만 실행

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
    </div>
  );
}

export default GameScene;