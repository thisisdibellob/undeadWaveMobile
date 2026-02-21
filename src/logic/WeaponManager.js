import { Bullet } from './Bullet.js';
import { Bomb } from './Bomb.js';
import { checkCollision } from './Utils.js'; // 충돌 체크 함수
import { Ray } from './Ray.js';
import { ConeAttack } from './ConeAttack.js';
import { PullZone } from './PullZone.js';

// 무기(총알, 폭탄)와 관련된 모든 것을 관리하는 클래스
export class WeaponManager {
    constructor(player) {
        this.player = player;
        this.bullets = []; // 현재 활성화된 모든 총알 목록
        this.bombs = [];   // 현재 활성화된 모든 폭탄 목록
        this.rays = [];    // 현재 활성화된 모든 광선 목록
        this.coneAttacks = []; // 현재 활성화된 부채꼴 공격 목록
        this.pullZones = []; // 현재 활성화된 회오리 장판 목록

        this.shootMod = "pistol"; // 현재 무기 모드
        this.shootTime = 0;       // 마지막 발사 시간 (쿨다운 계산용)

        this.time =0;

        // 광선 스킬 쿨다운
        this.RAY_COOLDOWN = 40000; // 광선 스킬 쿨다운 (40초)
        this.lastRayTime = 0;     // 마지막 광선 발사 시간

        // 회오리 스킬 쿨다운
        this.PULLZONE_COOLDOWN = 60000; // 60초 쿨다운
        this.lastPullZoneTime = 0; // 마지막 회오리 발사 시간
    }

    /**
     * 무기 모드를 변경합니다. (Game-Controll.js의 키 입력이 호출)
     * @param {string} mod - "pistol", "shotgun", "rifle", "bomb"
     */
    setWeapon(mod) {
        this.shootMod = mod;
    }

    // 광선 스킬 발동 요청 함수
    castRay(timestamp) {
        // 쿨다운 체크
        if (this.time - this.lastRayTime < this.RAY_COOLDOWN) {
            return;
        }

        // 플레이어에게 광선 발사 방향을 요청
        const direction = this.player.startRay();

        // 광선 생성 및 배열에 추가
        const newRay = new Ray(this.player, direction);
        this.rays.push(newRay);
        
        // 쿨다운 타이머 업데이트
        this.lastRayTime = this.time;
    }

    // 부채꼴 공격 발동 요청 함수
    castCone() {
        // 플레이어에게 부채꼴 공격 방향을 요청
        const direction = this.player.startCone();

        // 부채꼴 공격 생성 및 배열에 추가
        const newCone = new ConeAttack(this.player, direction);
        this.coneAttacks.push(newCone);
    }

    // 끌어당김 장판 생성
    castPullZone(timestamp) {
        if (this.time - this.lastPullZoneTime < this.PULLZONE_COOLDOWN) {
            return; // 쿨다운 중이면 생성하지 않음
        }
        
        // 플레이어에게 광선 발사 방향을 요청
        const direction = this.player.startPullZone();

        const newZone = new PullZone(this.player, direction);
        this.pullZones.push(newZone);

        this.lastPullZoneTime = this.time;
    }

    /**
     * 매 프레임 호출되어 무기 발사 및 업데이트를 처리합니다.
     * @param {number} timestamp - 현재 시간
     * @param {number} mouseX - 현재 마우스 x좌표
     * @param {number} mouseY - 현재 마우스 y좌표
     * @param {World} world - 월드 객체 (경계 체크용)
     */
    update(timestamp, mouseX, mouseY, world) {
        const now = Date.now();

        // --- 1. 무기 발사 (쿨다운 체크) ---
        let timer = 0;
        switch (this.shootMod) {
            case "pistol":  timer = 500; break;
            case "shotgun": timer = 1000; break;
            case "rifle":   timer = 100; break; 
            case "bomb":    timer = 1500; break;
        }

        if (!this.shootTime) this.shootTime = timestamp;
        if ((timestamp - this.shootTime) >= timer) {
            this.spawnWeapon(timestamp, mouseX, mouseY); // 쿨다운이 찼으면 발사
            this.shootTime = timestamp; // 마지막 발사 시간 갱신
        }

        // --- 2. 총알 업데이트 및 화면 밖 제거 ---
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(this.player); // 원본 코드의 update(player) 유지
            
            // 화면 밖(플레이어 기준 뷰포트)으로 나간 총알 제거
            if (bullet.x > (this.player.x + window.innerWidth / 2) ||
                bullet.x < (this.player.x - window.innerWidth / 2) || 
                bullet.y > (this.player.y + window.innerHeight / 2) ||
                bullet.y < (this.player.y - window.innerHeight / 2)) {
                this.bullets.splice(i, 1);
            }
        }

        // --- 3. 폭탄 업데이트 및 시간 초과 제거 ---
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            // bomb.update(player); // (원본 코드에 주석 처리되어 있었음)
            
            // 200ms 뒤 폭탄 제거
            if (!bomb.spawnTime) bomb.spawnTime = timestamp;
            if (timestamp - bomb.spawnTime >= 200) {
                this.bombs.splice(i, 1);
            }
        }

        // 4. 광선 업데이트 및 제거
        for (let i = this.rays.length - 1; i >= 0; i--) {
            const ray = this.rays[i];
            if (ray.update(now)) {
                this.rays.splice(i, 1);
            }
        }

        // 5. 부채꼴 공격 업데이트 및 제거
        for (let i = this.coneAttacks.length - 1; i >= 0; i--) {
            const cone = this.coneAttacks[i];
            const isFinished = cone.update(now);
            if (isFinished) {
                this.coneAttacks.splice(i, 1);
            }
        }

        // 6. 회오리 장판 업데이트 및 제거
        for (let i = this.pullZones.length - 1; i >= 0; i--) {
            const tornado = this.pullZones[i];
            const isFinished = tornado.update(now);
            if (isFinished) {
                this.pullZones.splice(i, 1);
            }
        }
    }

    /**
     * 현재 'shootMod'에 맞춰 무기를 스폰합니다.
     */
    spawnWeapon(timestamp, mouseX, mouseY) {
        const bulletSpawnX = this.player.x + 15;
        const bulletSpawnY = this.player.y + 15;

        // 권총
        if (this.shootMod === "pistol") {
            Bullet.spawnBullet(mouseX, mouseY, bulletSpawnX, bulletSpawnY, this.bullets, 10);
        }

        // 샷건
        if (this.shootMod === "shotgun") {
            // (원본 코드의 마우스 좌표계 로직)
            let coordinate;
            if ((mouseX <= window.innerWidth/2) && (mouseY <= window.innerHeight/2)) coordinate = "LeftUp";
            if ((mouseX < window.innerWidth/2) && (mouseY > window.innerHeight/2)) coordinate = "LeftDown";
            if ((mouseX > window.innerWidth/2) && (mouseY < window.innerHeight/2)) coordinate = "RightUp";
            if ((mouseX > window.innerWidth/2) && (mouseY > window.innerHeight/2)) coordinate = "RightDown";

            let mx, my, bX, bY;
            if ((coordinate === "RightUp") || (coordinate === "LeftDown")) {
                mx = mouseX + 30; my = mouseY + 30; bX = bulletSpawnX + 15; bY = bulletSpawnY + 15;
            } else {
                mx = mouseX - 30; my = mouseY + 30; bX = bulletSpawnX - 15; bY = bulletSpawnY + 15;
            }
                
            for (let i = 0; i < 5; i++) {
                if ((coordinate === "RightUp") || (coordinate === "LeftDown")) {
                    Bullet.spawnBullet(mx, my, bX, bY, this.bullets, 10);
                    mx -= 15; my -= 15; bX -= 7.5; bY -= 7.5;
                } else {
                    Bullet.spawnBullet(mx, my, bX, bY, this.bullets, 10);
                    mx += 15; my -= 15; bX += 7.5; bY -= 7.5;
                }
            }
        }

        // 라이플
        if (this.shootMod === "rifle") {
            Bullet.spawnBullet(mouseX, mouseY, bulletSpawnX, bulletSpawnY, this.bullets, 20);
        }

        // 폭탄
        if (this.shootMod === "bomb") {
            Bomb.spawnBomb(mouseX, mouseY, this.bombs, 10, timestamp, this.player);
        }
    }
    
    /**
     * 모든 총알과 폭탄을 캔버스에 그립니다.
     * @param {CanvasRenderingContext2D} ctx - 2D 그리기 도구
     */
    draw(ctx, bulletImg) {
        this.bullets.forEach(bullet => bullet.draw(ctx, bulletImg));
        this.bombs.forEach(bomb => bomb.draw(ctx));
        this.rays.forEach(ray => ray.draw(ctx));
        this.coneAttacks.forEach(cone => cone.draw(ctx));
        this.pullZones.forEach(zone => zone.draw(ctx));
    }
    
    /**
     * 충돌한 총알을 배열에서 제거합니다. (EnemyManager가 호출)
     */
    removeBullet(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index > -1) {
            this.bullets.splice(index, 1);
        }
    }
    
    /**
     * 충돌한 폭탄을 배열에서 제거합니다. (EnemyManager가 호출)
     */
    removeBomb(bomb) {
         const index = this.bombs.indexOf(bomb);
        if (index > -1) {
            this.bombs.splice(index, 1);
        }
    }

    // 광선과 좀비의 충돌 체크 및 데미지 적용 함수
    checkRayHit(entity) {
        let hit = false;
        
        for (const ray of this.rays) {
            // 이미 이 광선에 맞은 좀비는 건너뜁니다.
            if (ray.hitZombies.has(entity)) {
                continue;
            }

            if (checkCollision(ray, entity)) {
                // 충돌 발생: 데미지 적용
                entity.takeDamage(ray.damage); 
                
                // 광선에 맞았음을 기록하여 중복 데미지를 방지
                ray.hitZombies.add(entity);
                hit = true;
            }
        }
        return hit;
    }

    // 부채꼴 공격과 좀비/보스의 충돌 확인 및 데미지 적용
    checkConeAttackHit(entity) {
        let hit = false;

        this.coneAttacks.forEach(cone => {
            // ConeAttack은 1회성 공격이므로, 이미 맞은 적은 재공격하지 않습니다.
            if (checkCollision(cone, entity) && !cone.hitEnemies.has(entity)) {
                entity.takeDamage(cone.damage);
                cone.hitEnemies.add(entity); // 맞은 적 기록 (중복 히트 방지)
                hit = true;
            }
        });
        return hit; // 충돌 발생 여부 반환
    }
}