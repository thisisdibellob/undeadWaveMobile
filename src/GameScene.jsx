import { useEffect, useRef } from 'react';

import { Player } from './logic/Player.js';
import { World } from './logic/World.js';
import { drawUI, drawGameOverScreen, drawUpgradeOptions, calculateUpgradeOptionBounds, statUI } from './logic/Ui.js';
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
    };
  }, []); // 빈 배열: 처음 렌더링될 때 한 번만 실행

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
    </div>
  );
}

export default GameScene;