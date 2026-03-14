import { useEffect, useRef } from 'react';

import { Player } from './logic/Player.js';
import { World } from './logic/World.js';
import { drawUI, drawGameOverScreen, drawUpgradeOptions, calculateUpgradeOptionBounds, statUI, drawMobileUI, getRestartButtonBounds, getInGameMenuButtonBounds, drawPauseMenu, getPauseMenuButtonBounds } from './logic/Ui.js';
import { EnemyManager } from './logic/EnemyManager.js';
import { WeaponManager } from './logic/WeaponManager.js';
import { PartsManager } from './logic/PartsManager.js';
import { SurvivorManager } from './logic/SurvivorManager.js';

function GameScene({ bgmRef, onMenu, onRestart }) {
  const canvasRef = useRef(null);
  const requestRef = useRef(null); // 애니메이션 프레임 취소용

  useEffect(() => {
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let viewportWidth = 0;
    let viewportHeight = 0;

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

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (trySelectPauseMenuOption(touch.clientX, touch.clientY)) {
          return;
        }
        if (tryOpenInGameMenu(touch.clientX, touch.clientY)) {
          return;
        }
      }

      if (currentState === GAME_STATE.GAMEOVER) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (tryRestartFromGameOver(touch.clientX, touch.clientY)) {
            break;
          }
        }
        return;
      }

      if (currentState === GAME_STATE.UPGRADING) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (beginUpgradePress(touch)) {
            break;
          }
        }
        return;
      }
      
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

        if (trySelectWeaponSlot(touch.clientX, touch.clientY)) {
          continue;
        }

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

      if (currentState === GAME_STATE.UPGRADING) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          updateUpgradePress(e.changedTouches[i]);
        }
        return;
      }
      
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
      if (currentState === GAME_STATE.UPGRADING) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          finalizeUpgradePress(e.changedTouches[i]);
        }
        return;
      }

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

    const handleTouchCancel = (e) => {
      if (currentState === GAME_STATE.UPGRADING) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === upgradePressTouchId) {
            clearUpgradePress();
            break;
          }
        }
      }
    };

    

    // ------------ 터치 이벤트 리스너 등록 ------------
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchCancel);

    // ------------ 오디오 설정 ------------
    const gameBGM = bgmRef?.current;
    if (gameBGM) {
      gameBGM.play().catch(() => {});
    }

    const resumeBgmOnFirstInput = () => {
      if (gameBGM && gameBGM.paused) {
        gameBGM.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', resumeBgmOnFirstInput);
      window.removeEventListener('touchstart', resumeBgmOnFirstInput);
      window.removeEventListener('keydown', resumeBgmOnFirstInput);
    };
    window.addEventListener('pointerdown', resumeBgmOnFirstInput, { once: true });
    window.addEventListener('touchstart', resumeBgmOnFirstInput, { once: true });
    window.addEventListener('keydown', resumeBgmOnFirstInput, { once: true });

    // ------------ 게임 상태 및 변수 ------------
    let lastFrameTime = 0;
    const GAME_STATE = { PLAYING: 'playing', UPGRADING: 'upgrading', GAMEOVER: 'gameover', PAUSED_MENU: 'paused_menu' };
    let currentState = GAME_STATE.PLAYING;
    let currentUpgradeOptions = [];
    let upgradePressedIndex = -1;
    let upgradePressTouchId = null;
    let upgradePressOutsideAt = 0;
    const UPGRADE_PRESS_CANCEL_DELAY = 180;

    const trySelectUpgradeOption = (x, y) => {
      if (currentState !== GAME_STATE.UPGRADING) return false;

      for (const option of currentUpgradeOptions) {
        if (!option.bounds) continue;
        const bounds = option.bounds;
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
          player.applyUpgrade(option);
          currentState = GAME_STATE.PLAYING;
          currentUpgradeOptions = [];
          return true;
        }
      }
      return false;
    };

    // 좌표가 어떤 업그레이드 카드 위인지 찾는다.
    const getUpgradeIndexAt = (x, y) => {
      for (let i = 0; i < currentUpgradeOptions.length; i++) {
        const option = currentUpgradeOptions[i];
        if (!option.bounds) continue;
        const b = option.bounds;
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
          return i;
        }
      }
      return -1;
    };

    const clearUpgradePress = () => {
      upgradePressedIndex = -1;
      upgradePressTouchId = null;
      upgradePressOutsideAt = 0;
    };

    // 터치 시작 시 눌림 상태만 만들고, 실제 선택은 touchend에서 확정한다.
    const beginUpgradePress = (touch) => {
      if (upgradePressTouchId !== null && touch.identifier !== upgradePressTouchId) {
        return false;
      }

      const index = getUpgradeIndexAt(touch.clientX, touch.clientY);
      if (index === -1) return false;
      upgradePressedIndex = index;
      upgradePressTouchId = touch.identifier;
      upgradePressOutsideAt = 0;
      return true;
    };

    // 버튼 밖으로 이동한 시간이 일정 기준을 넘으면 눌림 상태를 해제한다.
    const updateUpgradePress = (touch) => {
      if (touch.identifier !== upgradePressTouchId || upgradePressedIndex === -1) return;

      const option = currentUpgradeOptions[upgradePressedIndex];
      if (!option?.bounds) {
        clearUpgradePress();
        return;
      }

      const b = option.bounds;
      const isInside = touch.clientX >= b.x && touch.clientX <= b.x + b.width &&
        touch.clientY >= b.y && touch.clientY <= b.y + b.height;

      if (isInside) {
        upgradePressOutsideAt = 0;
        return;
      }

      if (upgradePressOutsideAt === 0) {
        upgradePressOutsideAt = Date.now();
        return;
      }

      if (Date.now() - upgradePressOutsideAt >= UPGRADE_PRESS_CANCEL_DELAY) {
        clearUpgradePress();
      }
    };

    const finalizeUpgradePress = (touch) => {
      if (touch.identifier !== upgradePressTouchId || upgradePressedIndex === -1) return;

      const option = currentUpgradeOptions[upgradePressedIndex];
      const b = option?.bounds;
      const isInside = b &&
        touch.clientX >= b.x && touch.clientX <= b.x + b.width &&
        touch.clientY >= b.y && touch.clientY <= b.y + b.height;

      if (isInside && upgradePressOutsideAt === 0 && option) {
        player.applyUpgrade(option);
        currentState = GAME_STATE.PLAYING;
        currentUpgradeOptions = [];
      }
      clearUpgradePress();
    };

    // 게임 오버 버튼 클릭/터치 시 새로고침으로 게임을 즉시 재시작한다.
    const tryRestartFromGameOver = (x, y) => {
      if (currentState !== GAME_STATE.GAMEOVER) return false;

      const button = getRestartButtonBounds({ width: viewportWidth, height: viewportHeight });
      const isInside = x >= button.x && x <= button.x + button.width &&
        y >= button.y && y <= button.y + button.height;

      if (isInside) {
        window.location.reload();
        return true;
      }
      return false;
    };

    // 우측 상단 메뉴 버튼 터치/클릭 시 메인 메뉴 화면으로 복귀한다.
    const tryOpenInGameMenu = (x, y) => {
      if (currentState === GAME_STATE.GAMEOVER || currentState === GAME_STATE.PAUSED_MENU) return false;
      const button = getInGameMenuButtonBounds({ width: viewportWidth, height: viewportHeight });
      const isInside = x >= button.x && x <= button.x + button.width &&
        y >= button.y && y <= button.y + button.height;
      if (!isInside) return false;
      currentState = GAME_STATE.PAUSED_MENU;
      return true;
    };

    const trySelectPauseMenuOption = (x, y) => {
      if (currentState !== GAME_STATE.PAUSED_MENU) return false;
      const buttons = getPauseMenuButtonBounds({ width: viewportWidth, height: viewportHeight });
      const selected = buttons.find((btn) =>
        x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height
      );
      if (!selected) return false;

      if (selected.id === 'resume') {
        currentState = GAME_STATE.PLAYING;
      }
      if (selected.id === 'restart') {
        onRestart?.();
      }
      if (selected.id === 'menu') {
        onMenu?.();
      }
      return true;
    };

    // 안드로이드 백버튼: 플레이 중이면 메뉴 오버레이, 메뉴 오버레이면 즉시 재개
    const handleGameBackAction = () => {
      if (currentState === GAME_STATE.PAUSED_MENU) {
        currentState = GAME_STATE.PLAYING;
        return true;
      }
      if (currentState === GAME_STATE.PLAYING || currentState === GAME_STATE.UPGRADING) {
        currentState = GAME_STATE.PAUSED_MENU;
        return true;
      }
      return false;
    };

    const handlePopState = (event) => {
      if (!handleGameBackAction()) return;
      event?.preventDefault?.();
      window.history.pushState({ gameBackTrap: true }, '');
    };

    const handleNativeBackButton = () => {
      if (!handleGameBackAction()) return;
      window.history.pushState({ gameBackTrap: true }, '');
    };

    const handleAppBackButton = () => {
      handleGameBackAction();
    };

    const trySelectWeaponSlot = (x, y) => {
      if (currentState !== GAME_STATE.PLAYING) return false;

      const baseX = 10;
      const baseY = 30;
      const slotWidth = 52.5;
      const slotHeight = 75;
      const slotGap = 10;
      const slotCount = 4;

      if (y < baseY || y > baseY + slotHeight) return false;

      for (let i = 0; i < slotCount; i++) {
        const slotX = baseX + i * (slotWidth + slotGap);
        if (x < slotX || x > slotX + slotWidth) continue;

        if (i === 0) weaponManager.setWeapon('pistol');
        if (i === 1 && partsManager.num >= 20) weaponManager.setWeapon('shotgun');
        if (i === 2 && partsManager.num >= 50) weaponManager.setWeapon('rifle');
        if (i === 3 && partsManager.num >= 100) weaponManager.setWeapon('bomb');
        return true;
      }

      return false;
    };

    // ------------ 캔버스 크기 ------------
    const resizeCanvas = () => {
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      canvas.width = Math.floor(viewportWidth * dpr);
      canvas.height = Math.floor(viewportHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      if (trySelectPauseMenuOption(event.clientX, event.clientY)) return;
      if (tryOpenInGameMenu(event.clientX, event.clientY)) return;
      if (tryRestartFromGameOver(event.clientX, event.clientY)) return;
      if (trySelectUpgradeOption(event.clientX, event.clientY)) {
        clearUpgradePress();
        return;
      }
      trySelectWeaponSlot(event.clientX, event.clientY);
    };

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    // 게임 화면에 들어오면 백버튼을 앱 종료 대신 인게임 상태 전환에 사용한다.
    let removeNativeBackListener = null;
    window.history.pushState({ gameBackTrap: true }, '');
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('appBackButton', handleAppBackButton);
    const capacitorAppPlugin = window?.Capacitor?.Plugins?.App;
    if (capacitorAppPlugin?.addListener) {
      const maybeHandle = capacitorAppPlugin.addListener('backButton', handleNativeBackButton);
      // Capacitor 버전에 따라 Promise 또는 핸들을 직접 반환하므로 둘 다 대응한다.
      if (maybeHandle && typeof maybeHandle.then === 'function') {
        maybeHandle.then((handle) => {
          removeNativeBackListener = () => handle?.remove?.();
        }).catch(() => {});
      } else if (maybeHandle && typeof maybeHandle.remove === 'function') {
        removeNativeBackListener = () => maybeHandle.remove();
      }
    } else {
      // 브리지가 없는 환경(웹 브라우저/일부 빌드)에서는 문서 이벤트를 보조로 사용한다.
      document.addEventListener('backbutton', handleNativeBackButton);
      removeNativeBackListener = () => {
        document.removeEventListener('backbutton', handleNativeBackButton);
      };
    }

    // ------------ 헬퍼 함수 ------------
    const clearCanvas = () => ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    const drawPausedGame = () => {
      let cameraX = Math.max(Math.min(-player.x + viewportWidth / 2, 0), viewportWidth - world.width);
      let cameraY = Math.max(Math.min(-player.y + viewportHeight / 2, 0), viewportHeight - world.height);
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
        drawGameOverScreen(ctx, { width: viewportWidth, height: viewportHeight }, player.score);
        return;
      }

      if (currentState === GAME_STATE.UPGRADING) {
        clearCanvas();
        drawPausedGame(); 
        drawUI(ctx, player, weaponManager.shootMod, partsManager.num, weaponManager, timestamp); 
        drawUpgradeOptions(
          ctx,
          { width: viewportWidth, height: viewportHeight },
          currentUpgradeOptions,
          upgradePressedIndex
        ); 
        requestRef.current = requestAnimationFrame(update); 
        return; 
      }

      if (currentState === GAME_STATE.PAUSED_MENU) {
        clearCanvas();
        drawPausedGame();
        drawUI(ctx, player, weaponManager.shootMod, partsManager.num, weaponManager, timestamp);
        drawPauseMenu(ctx, { width: viewportWidth, height: viewportHeight });
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
      if (collisionResults.playerDied) {
        currentState = GAME_STATE.GAMEOVER;
        const prev = parseInt(localStorage.getItem('bestScore') || '0', 10);
        if (player.score > prev) localStorage.setItem('bestScore', player.score);
      }
      if (collisionResults.didLevelUp) {
        currentState = GAME_STATE.UPGRADING;
        currentUpgradeOptions = player.getUpgradeOptions(3);
        calculateUpgradeOptionBounds({ width: viewportWidth, height: viewportHeight }, currentUpgradeOptions);
        clearUpgradePress();
      }

      let cameraX = Math.max(Math.min(-player.x + viewportWidth / 2, 0), viewportWidth - world.width);
      let cameraY = Math.max(Math.min(-player.y + viewportHeight / 2, 0), viewportHeight - world.height);

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
      statUI(ctx, player);
      drawMobileUI(ctx, joystick, rightJoystick, player, weaponManager)

      requestRef.current = requestAnimationFrame(update);
    };

    // 루프 시작
    requestRef.current = requestAnimationFrame(update);

    // ------------ 컴포넌트 언마운트 시 뒷정리 (매우 중요) ------------
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('appBackButton', handleAppBackButton);
      removeNativeBackListener?.();
      cancelAnimationFrame(requestRef.current);
      if (gameBGM) {
        gameBGM.pause(); // 화면 나가면 음악 끄기
        gameBGM.currentTime = 0;
      }
      window.removeEventListener('pointerdown', resumeBgmOnFirstInput);
      window.removeEventListener('touchstart', resumeBgmOnFirstInput);
      window.removeEventListener('keydown', resumeBgmOnFirstInput);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, []); // 빈 배열: 처음 렌더링될 때 한 번만 실행

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
    </div>
  );
}

export default GameScene;
