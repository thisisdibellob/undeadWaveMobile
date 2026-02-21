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

    // // --- 1. HP 및 방어력 텍스트 ---
    // ctx.fillStyle = 'white';
    // ctx.font = '20px Arial';
    // ctx.textAlign = 'left';

    // let hpText = `HP: ${player.hp} / ${player.maxHp}`;
    // if (player.defense >= 1) { // 방어력이 1 이상일 때만 표시
    //     hpText += ` | DEF: ${player.defense}`;
    // }

    // ctx.fillText(hpText, 10, 30);

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
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`LV ${player.level}`, window.innerWidth-60, 17);
    // ctx.fillText(
    //     `Lv. ${player.level} - EXP: ${player.exp} / ${player.expToNextLevel}`, 
    //     barX + barWidth + 10, barY + 15
    // );

    // --- 4. 무기 선택창 ---
    let weaponX = 10;
    let weaponY = 30;
    let weaponWidth = 70;
    let weaponHeight = 100;
    ctx.lineWidth = 2;

    // (이미지 로드는 비효율적이므로, 실제로는 이미지 객체를 미리 로드해두는 것이 좋음)

    // - 권총
    drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "권총", pistolImg, shootMod === "pistol", {x:10, y:10, w:50, h:50});
    
    // - 샷건
    weaponX += weaponWidth + 10;
    if (partsNum>=20)
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "샷건", shotgunImg, shootMod === "shotgun", {x:10, y:0, w:50, h:80});
    else
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "20X", partsImg, shootMod === "shotgun", {x:5, y:0, w:60, h:80});

    // - 라이플
    weaponX += weaponWidth + 10;
    if (partsNum>=50)
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "라이플", rifleImg, shootMod === "rifle", {x:10, y:-10, w:50, h:100});
    else
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "50X", partsImg, shootMod === "rifle", {x:5, y:0, w:60, h:80});

    // - 폭탄
    weaponX += weaponWidth + 10;
    if (partsNum>=100)
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "폭탄", boomImg, shootMod === "bomb", {x:10, y:10, w:50, h:50});
    else 
        drawWeaponSlot(ctx, weaponX, weaponY, weaponWidth, weaponHeight, "100X", partsImg, shootMod === "bomb", {x:5, y:0, w:60, h:80});
    


    // --- 5. 부품 정보 ---
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`: ${partsNum}`, 410, 66);

    ctx.drawImage(partsImg, 350, 30, 60, 60);


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
    ctx.font = '16px Arial';
    ctx.fillText(name, x + w / 2, y + 90);

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
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 60);
    ctx.font = '20px Arial';
    ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

/**
 * 레벨업 선택지 박스의 화면상 좌표(bounds)를 미리 계산하여
 * 'options' 배열의 각 객체에 저장합니다. (클릭 감지 및 그리기용)
 * @param {HTMLCanvasElement} canvas - 캔버스 (크기 참조용)
 * @param {Array<object>} options - 업그레이드 선택지 배열
 */
export function calculateUpgradeOptionBounds(canvas, options) {
    const boxWidth = 250;
    const boxHeight = 350;
    const padding = 30;
    const totalWidth = boxWidth * 3 + padding * 2; // 박스 3개 + 패딩 2개
    let startX = canvas.width / 2 - totalWidth / 2; // 중앙 정렬 시작 X좌표
    const startY = canvas.height / 2 - boxHeight / 2; // 중앙 정렬 시작 Y좌표

    for (let i = 0; i < options.length; i++) {
        const x = startX + i * (boxWidth + padding);
        const y = startY;
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
export function drawUpgradeOptions(ctx, canvas, options) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // 반투명 검은색 배경
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'yellow';
    ctx.font = '40px Arial';
    ctx.fillText('스킬 선택', canvas.width / 2, canvas.height / 2 - 200);

    // 각 선택지 박스를 순회하며 그립니다.
    for (const option of options) {
        if (!option.bounds) continue; // 좌표가 계산되지 않았으면 건너뜀
        
        const { x, y, width, height } = option.bounds;

        // 1. 박스 배경 및 테두리
        ctx.fillStyle = '#34495e';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, width, height);

        // 2. 업그레이드 이름 (제목)
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText(option.name, x + width / 2, y + 40);
        
        // 3. 업그레이드 설명
        ctx.font = '18px Arial';
        ctx.fillStyle = '#bdc3c7';
        ctx.fillText(option.description, x + width / 2, y + 100);
    }
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