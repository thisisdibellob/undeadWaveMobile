import { roundRect } from './Utils.js'; 
/**
 * 메인 게임 UI (HP, 방어력, 경험치 바, 레벨, 무기 슬롯)를 그립니다.
 * @param {CanvasRenderingContext2D} ctx - 2D 그리기 도구
 * @param {Player} player - 플레이어 객체 (정보 표시용)
 * @param {string} shootMod - 현재 선택된 무기 모드
 */

const pistolImg = new Image();
pistolImg.src = "/assets/resource/weapon_image/pistol.png";

const shotgunImg = new Image();
shotgunImg.src = "/assets/resource/weapon_image/shotgun.png";

const rifleImg = new Image();
rifleImg.src = "/assets/resource/weapon_image/rifle.png";

const boomImg = new Image();
boomImg.src = "/assets/resource/weapon_image/Bomb.png";

const keyShift = new Image();
keyShift.src = "/assets/startMenu/shift.gif";
const keyE = new Image();
keyE.src = "/assets/startMenu/E.gif";
const keyQ = new Image();
keyQ.src = "/assets/startMenu/Q.gif";
const keyR = new Image();
keyR.src = "/assets/startMenu/R.gif";


const partsImg = new Image();
partsImg.src =  "/assets/resource/weapon_image/parts.png";

export function drawUI(ctx, player, shootMod, partsNum, weaponManager, timestamp) {

    // --- 2. 경험치 바 ---
    const barWidth = window.innerWidth-2;
    const barHeight = 20;
    const barX = 1;
    const barY = 1;
    const expRatio = player.exp / player.expToNextLevel; // 현재 경험치 비율 (0.0 ~ 1.0)
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // 바 배경
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = 'gold'; // 채워진 경험치
    ctx.fillRect(barX, barY, barWidth * expRatio, barHeight);
    ctx.strokeStyle = 'black'; // 테두리
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // --- 3. 레벨 및 경험치 텍스트 ---
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px Arial';
    ctx.fillText(`LV ${player.level}`, window.innerWidth-40, 11);

    // --- 4. 무기 선택창 ---
    let weaponX = 10;
    let weaponY = 30;
    let weaponWidth = 52.5;
    let weaponHeight = 75;
    ctx.lineWidth = 2;

    // - 권총
    drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "권총", pistolImg, shootMod === "pistol", {x:10, y:10, w:35, h:35});
    
    // - 샷건
    weaponX += weaponWidth + 10;
    if (partsNum>=20)
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "샷건", shotgunImg, shootMod === "shotgun", {x:10, y:0, w:35, h:60});
    else
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "20X", partsImg, shootMod === "shotgun", {x:5, y:0, w:45, h:60});

    // - 라이플
    weaponX += weaponWidth + 10;
    if (partsNum>=50)
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "라이플", rifleImg, shootMod === "rifle", {x:10, y:-10, w:35, h:75});
    else
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "50X", partsImg, shootMod === "rifle", {x:5, y:0, w:45, h:60});

    // - 폭탄
    weaponX += weaponWidth + 10;
    if (partsNum>=100)
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "폭탄", boomImg, shootMod === "bomb", {x:10, y:10, w:35, h:35});
    else 
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "100X", partsImg, shootMod === "bomb", {x:5, y:0, w:45, h:60});
    


    // --- 5. 부품 정보 ---
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`: ${partsNum}`, weaponX+weaponWidth+50, 45);
    ctx.drawImage(partsImg, weaponX+weaponWidth+10, 25, 40, 40);


    /* 모바일 버젼은 이거 삭제 

    // 스킬 쿨타임
    let skillX = window.innerWidth-80;
    let skillY = 30;
    let skillWidth = 70;
    let skillHeight = 100;

    //R
    let tornadoCoolTime = (weaponManager.PULLZONE_COOLDOWN - (weaponManager.time - weaponManager.lastPullZoneTime))
    if (tornadoCoolTime <0 ) tornadoCoolTime = 0;
    if (player.tornadoUnlocked) ctx.fillStyle = 'rgba(70, 70, 70, 0.5)';
    else ctx.fillStyle = 'rgba(30, 30, 30, 1)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight * tornadoCoolTime / weaponManager.PULLZONE_COOLDOWN);
    ctx.drawImage(keyR, skillX+10, skillY+20, 50, 50);

    //Q
    skillX -= skillWidth + 10;
    if (player.backstepUnlocked) ctx.fillStyle = 'rgba(70, 70, 70, 0.5)';
    else ctx.fillStyle = 'rgba(30, 30, 30, 1)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight * player.backstepCooldownTimer  / player.backstepCooldown);
    ctx.drawImage(keyQ, skillX+10, skillY+20, 50, 50);

    //E
    let layCoolTime = (weaponManager.RAY_COOLDOWN - (weaponManager.time - weaponManager.lastRayTime))
    if (layCoolTime <0 ) layCoolTime = 0;
    skillX -= skillWidth + 10;
    if (player.rayUnlocked) ctx.fillStyle = 'rgba(70, 70, 70, 0.5)';
    else ctx.fillStyle = 'rgba(30, 30, 30, 1)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight * layCoolTime / weaponManager.RAY_COOLDOWN);
    ctx.drawImage(keyE, skillX+10, skillY+20, 50, 50);


    //shift
    skillX -= skillWidth + 10;
    ctx.fillStyle = 'rgba(70, 70, 70, 0.5)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight);
    ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctx.fillRect(skillX, skillY, skillWidth, skillHeight * player.rollCooldownTimer / player.rollCooldown);
    ctx.drawImage(keyShift, skillX+10, skillY+20, 50, 50);
    */

    // ctx.font = 'bold 20px Arial';
    // ctx.fillStyle = 'black';
    // ctx.fillText(`${Math.floor(player.rollCooldownTimer/400)}`, skillX+20, skillY+50);
}

/**
 * (헬퍼 함수) 무기 슬롯 1개를 그립니다.
 */
function drawWeaponSlot(ctx, x, y, w, h, name, weaponImg, isSelected, imgParams) {
    ctx.fillStyle = 'rgba(70, 70, 70, 0.5)';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = isSelected ? 'white' : 'rgba(200, 200, 200, 1)';
    ctx.textAlign = 'center';
    ctx.font = '10px Arial';
    ctx.fillText(name, x + w / 2, y + 60);

    // 선택된 무기일 경우 테두리 표시
    ctx.strokeStyle = isSelected ? 'white' : 'transparent';
    ctx.strokeRect(x, y, w, h);

   ;let img
    img = weaponImg;
    ctx.drawImage(img, x + imgParams.x, y + imgParams.y, imgParams.w, imgParams.h);
}


/**
 * 'GAME OVER' 화면을 그립니다.
 * @param {CanvasRenderingContext2D} ctx - 2D 그리기 도구
 * @param {HTMLCanvasElement} canvas - 캔버스 (중앙 정렬용)
 * @param {number} score - 플레이어의 최종 점수
 */
export function drawGameOverScreen(ctx, canvas, score) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 반투명 검은색 배경
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 -60);
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);

    // 게임 오버 시 재시작 버튼 렌더링
    const button = getRestartButtonBounds(canvas);
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(button.x, button.y, button.width, button.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.width, button.height);
    ctx.fillStyle = '#1c1c1c';
    ctx.font = 'bold 24px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText('재시작', canvas.width / 2, button.y + button.height / 2);
    ctx.textBaseline = 'alphabetic';
}

// 게임 오버 버튼의 클릭/터치 판정용 영역을 반환한다.
export function getRestartButtonBounds(canvas) {
    const width = 220;
    const height = 56;
    const x = canvas.width / 2 - width / 2;
    const y = canvas.height / 2 + 35;
    return { x, y, width, height };
}

/**
 * 레벨업 선택지 박스의 화면상 좌표(bounds)를 미리 계산하여
 * 'options' 배열의 각 객체에 저장합니다. (클릭 감지 및 그리기용)
 * @param {HTMLCanvasElement} canvas - 캔버스 (크기 참조용)
 * @param {Array<object>} options - 업그레이드 선택지 배열
 */
export function calculateUpgradeOptionBounds(canvas, options) {
    const { boxWidth, boxHeight, padding, columns, startX, startY } = getUpgradeLayout(canvas, options.length);

    for (let i = 0; i < options.length; i++) {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const x = startX + col * (boxWidth + padding);
        const y = startY + row * (boxHeight + padding);
        // 'bounds' 속성에 계산된 좌표와 크기를 저장
        options[i].bounds = { x: x, y: y, width: boxWidth, height: boxHeight };
    }
}

/**
 * '레벨업 스킬 선택' 화면을 그립니다.
 * @param {CanvasRenderingContext2D} ctx - 2D 그리기 도구
 * @param {HTMLCanvasElement} canvas - 캔버스 (중앙 정렬용)
 * @param {Array<object>} options - 표시할 업그레이드 선택지 객체 배열
 */
export function drawUpgradeOptions(ctx, canvas, options, pressedIndex = -1) {
    const layout = getUpgradeLayout(canvas, options.length);
    const isNarrow = canvas.width < 760;
    const titleSize = Math.max(26, Math.min(40, canvas.width * 0.065));
    const nameSize = Math.max(18, Math.min(24, canvas.width * 0.04));
    const descSize = Math.max(14, Math.min(18, canvas.width * 0.032));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // 반투명 검은색 배경
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'yellow';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${titleSize}px Arial`;
    const titleY = Math.max(titleSize + 24, layout.startY - 30);
    ctx.fillText('스킬 선택', canvas.width / 2, titleY);

    // 각 선택지 박스를 순회하며 그립니다.
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (!option.bounds) continue; // 좌표가 계산되지 않았으면 건너뜀
        
        const { x, y, width, height } = option.bounds;
        const isPressed = i === pressedIndex;
        const drawY = isPressed ? y + 3 : y;

        // 1. 박스 배경 및 테두리
        ctx.fillStyle = isPressed ? '#2f4255' : '#34495e';
        ctx.fillRect(x, drawY, width, height);
        ctx.strokeStyle = isPressed ? '#f7dc6f' : 'gold';
        ctx.lineWidth = 5;
        ctx.strokeRect(x, drawY, width, height);

        // 2. 업그레이드 이름 (제목)
        ctx.fillStyle = 'white';
        ctx.font = `bold ${nameSize}px Arial`;
        ctx.fillText(option.name, x + width / 2, drawY + 36);
        
        // 3. 업그레이드 설명
        ctx.font = `${descSize}px Arial`;
        ctx.fillStyle = '#bdc3c7';
        drawWrappedCenterText(ctx, option.description, x + width / 2, drawY + 92, width - 28, descSize * 1.35, 3);
    }

    ctx.textBaseline = 'alphabetic';
}

function getUpgradeLayout(canvas, optionCount) {
    const isNarrow = canvas.width < 760;

    if (isNarrow) {
        const columns = 1;
        const padding = Math.max(8, Math.min(18, canvas.height * 0.012));
        const topSpace = Math.max(60, Math.min(90, canvas.height * 0.12));
        const dropOffset = Math.max(20, Math.min(48, canvas.height * 0.06));
        const sideMargin = Math.max(14, Math.min(24, canvas.width * 0.05));
        const boxWidth = canvas.width - sideMargin * 2;
        const availableHeight = canvas.height - topSpace - padding * (optionCount - 1) - 12;
        const boxHeight = Math.max(80, availableHeight / optionCount);
        const totalHeight = boxHeight * optionCount + padding * (optionCount - 1);
        const maxStartY = Math.max(8, canvas.height - totalHeight - 8);
        const startY = Math.min(topSpace + dropOffset, maxStartY);
        return {
            boxWidth,
            boxHeight,
            padding,
            columns,
            startX: sideMargin,
            startY
        };
    }

    const columns = Math.min(optionCount, 3);
    const padding = Math.max(18, Math.min(30, canvas.width * 0.025));
    const boxWidth = Math.max(180, Math.min(250, (canvas.width - padding * (columns + 1)) / columns));
    const boxHeight = Math.max(220, Math.min(350, canvas.height * 0.55));
    const rows = Math.ceil(optionCount / columns);
    const totalWidth = boxWidth * columns + padding * (columns - 1);
    const totalHeight = boxHeight * rows + padding * (rows - 1);
    const startX = (canvas.width - totalWidth) / 2;
    const dropOffset = Math.max(16, Math.min(42, canvas.height * 0.05));
    const startY = Math.min((canvas.height - totalHeight) / 2 + dropOffset, canvas.height - totalHeight - 8);

    return { boxWidth, boxHeight, padding, columns, startX, startY };
}

function drawWrappedCenterText(ctx, text, centerX, startY, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text).split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
            continue;
        }
        if (current) lines.push(current);
        current = word;
        if (lines.length === maxLines - 1) break;
    }

    if (current && lines.length < maxLines) {
        lines.push(current);
    }

    lines.forEach((line, i) => {
        ctx.fillText(line, centerX, startY + i * lineHeight);
    });
}





export function statUI(isSpace, ctx, player) {

    const barWidth = window.innerWidth * 1/3;
    const barHeight = window.innerHeight * 1/2;
    const barX = window.innerWidth/3;
    const barY = window.innerHeight * 1/4; 

    const imgHp = new Image();
    const imgAtk = new Image();
    const imgDef = new Image();
    const imgLv = new Image();
    const imgExp = new Image();
    const imgSpeed = new Image();
    imgHp.src = "/assets/resource/stat_image/hp.png";
    imgAtk.src = "/assets/resource/stat_image/atk.png";
    imgDef.src = "/assets/resource/stat_image/def.png";
    imgLv.src = "/assets/resource/stat_image/lv.png";
    imgExp.src = "/assets/resource/stat_image/exp.png";
    imgSpeed.src = "/assets/resource/stat_image/speed.png";

    if (isSpace) 
    {   
        // 배경
        // ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
        // ctx.fillRect(barX, barY, barWidth, barHeight);
        roundRect(ctx, barX, barY, barWidth, barHeight, 20);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
        ctx.fill();

        // 이미지 
        ctx.drawImage(imgHp, barX+180, barY+50, 55, 55); 
        ctx.drawImage(imgAtk, barX+175, barY+100, 65, 65); 
        ctx.drawImage(imgDef, barX+180, barY+157, 55, 50);     
        ctx.drawImage(imgLv, barX+182, barY+215, 50, 50);
        ctx.drawImage(imgExp, barX+182, barY+270, 50, 50);
        ctx.drawImage(imgSpeed, barX+170, barY+312, 65, 65); 
 
        // 텍스트
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${player.hp} / ${player.maxHp}`, barX+250, barY+80);
        ctx.fillText(`${player.damageLv}`, barX+250, barY+136);
        ctx.fillText(`${player.defense}`, barX+250, barY+190);
        ctx.fillText(`Lv ${player.level}`, barX+250, barY+245);
        ctx.fillText(`${player.exp} / ${player.expToNextLevel}`, barX+250, barY+300);
        ctx.fillText(`${player.speed}`, barX+250, barY+353);
    }
}

export function drawMobileUI (ctx, joystick, rightJoystick, player, weaponManager) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // --- 쿨타임 계산 로직 ---
    // R (Pull Zone)
    let tornadoRatio = (weaponManager.PULLZONE_COOLDOWN - (weaponManager.time - weaponManager.lastPullZoneTime)) / weaponManager.PULLZONE_COOLDOWN;
    tornadoRatio = Math.max(0, Math.min(1, tornadoRatio));
    // Q (Backstep)
    let qRatio = player.backstepCooldownTimer / player.backstepCooldown;
    qRatio = Math.max(0, Math.min(1, qRatio));
    // E (Ray)
    let rayRatio = (weaponManager.RAY_COOLDOWN - (weaponManager.time - weaponManager.lastRayTime)) / weaponManager.RAY_COOLDOWN;
    rayRatio = Math.max(0, Math.min(1, rayRatio));
    // Shift (Roll)
    let rollRatio = player.rollCooldownTimer / player.rollCooldown;
    rollRatio = Math.max(0, Math.min(1, rollRatio));

    // 우측 고정 조이스틱 좌표
    const rJoyX = w - 120;
    const rJoyY = h - 80;

    // 1. 왼쪽 동적 조이스틱 그리기 (누를 때만 보임)
    if (joystick.active) {
        ctx.beginPath();
        ctx.arc(joystick.startX, joystick.startY, 50, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        const dx = joystick.currX - joystick.startX;
        const dy = joystick.currY - joystick.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const moveX = dist > 50 ? (dx / dist) * 50 : dx;
        const moveY = dist > 50 ? (dy / dist) * 50 : dy;

        ctx.beginPath();
        ctx.arc(joystick.startX + moveX, joystick.startY + moveY, 25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fill();
    }

    // 2. 오른쪽 고정 조이스틱 그리기 (항상 보임)
    ctx.beginPath();
    ctx.arc(rJoyX, rJoyY, 60, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // 공격 느낌이 나게 살짝 붉은 톤
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.stroke();

    // 오른쪽 조이스틱 손잡이 위치 계산 (안 누르고 있을 땐 정중앙)
    let rMoveX = 0, rMoveY = 0;
    if (rightJoystick.active) {
        const dx = rightJoystick.currX - rJoyX;
        const dy = rightJoystick.currY - rJoyY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        rMoveX = dist > 60 ? (dx / dist) * 60 : dx;
        rMoveY = dist > 60 ? (dy / dist) * 60 : dy;
    }

    ctx.beginPath();
    ctx.arc(rJoyX + rMoveX, rJoyY + rMoveY, 30, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();

    // 3. 부채꼴 스킬 버튼들 그리기
    const drawButton = (x, y, r, text, color, ratio, unlocked = true) => {
        // 1. 기본 버튼 배경
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = unlocked ? color : 'rgba(30, 30, 30, 1)'; // 미해금 시 어둡게
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2. 쿨타임 오버레이 (남은 시간에 비례해서 부채꼴로 그리기)
        if (ratio > 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            // -Math.PI/2는 12시 방향부터 시작하게 함
            ctx.arc(x, y, r, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * ratio));
            ctx.lineTo(x, y);
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // 쿨타임 그림자
            ctx.fill();
        }

        // 3. 텍스트 표시
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
    };

    

    const dist = 130;
    drawButton(rJoyX - dist, rJoyY + 30, 35, "Shift", "rgba(80, 80, 80, 0.5)", rollRatio);          // 9시
    drawButton(rJoyX - dist * 0.866 + 10, rJoyY - dist * 0.5 + 20, 35, "Q", "rgba(80, 80, 80, 0.5)", qRatio);   // 10시
    drawButton(rJoyX - dist * 0.5 + 20, rJoyY - dist * 0.866 + 10, 35, "E", "rgba(80, 80, 80, 0.5)", rayRatio);   // 11시
    drawButton(rJoyX + 30, rJoyY - dist, 35, "R", "rgba(80, 80, 80, 0.5)", tornadoRatio);
    
};
