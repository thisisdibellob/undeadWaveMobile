import { Zombie } from './Zombie.js';
import { checkCollision } from './Utils.js'; 
import { BossZombie } from './BossZombie.js';
//import { PartsManager } from './PartsManager.js';


export class EnemyManager {
    constructor(world) {
        this.world = world;
        this.zombies = []; // 일반 좀비 목록

        this.bossZombie = null; 
        this.BOSS_SPAWN_TIME = 30000; // 보스 스폰 시간 (30초) 테스트용
        this.bossSpawned = false;
        this.gameElapsedTime = 0; // 게임 경과 시간 (보스 타이머용)
        this.lastFrameTime = 0; // 보스 타이머의 deltaTime 계산용

        // 스폰 설정
        this.SPAWN_INTERVAL = 2000;
        this.lastSpawn = 0;

        //난이도 밸런싱
        this.difficultyLevel = 1;
        this.zombieHpMultiplier = 1.0;
        this.zombieSpeedMultiplier = 1.0;
        this.zombieDamageMultiplier = 1.0;

        this.bossHpMultiplier = 1.0;
        this.bossSpeedMultiplier = 1.0;
        this.bossDamageMultiplier = 1.0;
    }

    /**
     * 난이도 조정(보스가 죽었을 때)
     */

    increaseDifficulty() {
        this.difficultyLevel++;

        this.SPAWN_INTERVAL = Math.max(500, this.SPAWN_INTERVAL - 100); // 최소 0.5초 간격

        this.zombieHpMultiplier += 1.0;
        this.zombieSpeedMultiplier += 0.5;
        this.zombieDamageMultiplier += 1.0;

        this.bossHpMultiplier += 1.0;
        this.bossSpeedMultiplier += 0.5;
        this.bossDamageMultiplier += 1.0;
    }

    /**
     * @param {number} timestamp - 현재 시간
     */
    
    updateSpawning(timestamp) {
        
        //일반 좀비 스폰
        if (!this.lastSpawn) this.lastSpawn = timestamp;
        if (timestamp - this.lastSpawn >= this.SPAWN_INTERVAL) {
            Zombie.spawnZombie(this.world,
                this.zombies,
                this.zombieHpMultiplier, 
                this.zombieSpeedMultiplier, 
                this.zombieDamageMultiplier);
            this.lastSpawn = timestamp;
        }

         // 보스 좀비 스폰 타이머 업데이트
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        this.gameElapsedTime += (timestamp - this.lastFrameTime);
        this.lastFrameTime = timestamp;

        // 보스 좀비 스폰
        if (!this.bossSpawned && this.gameElapsedTime >= this.BOSS_SPAWN_TIME) {
            let bossX, bossY;
            // 월드 밖 랜덤 위치
            if (Math.random() < 0.5) {
                bossX = Math.random() * this.world.width;
                bossY = Math.random() < 0.5 ? -100 : this.world.height + 100;
            } else {
                bossX = Math.random() < 0.5 ? -100 : this.world.width + 100;
                bossY = Math.random() * this.world.height;
            }
            this.bossZombie = new BossZombie(bossX, 
                bossY, 
                this.bossHpMultiplier, 
                this.bossSpeedMultiplier, 
                this.bossDamageMultiplier); 
            this.bossSpawned = true; // 스폰됨
            console.log("보스 좀비 스폰!");
        }
    }


    /**
     * @param {Player} player - 플레이어 객체
     * @param {WeaponManager} weaponManager - 무기 관리자
     * @param {number} deltaTime - 프레임 간 시간 차이
     * @returns {object} - { playerDied: boolean, didLevelUp: boolean } 게임 상태 변경 여부
     */

    updateAndCollide(player, weaponManager, deltaTime, partsManager, timestamp) {
        let playerDied = false;
        let didLevelUp = false;

        const allZombies = [...this.zombies];
        if (this.bossZombie) {
            allZombies.push(this.bossZombie);
        }

        const pullZones = weaponManager.pullZones;
        if (pullZones.length > 0) {
            this.zombies.forEach(zombie => {
                for (const zone of pullZones) {
                    // 좀비의 중심과 장판의 중심 사이의 거리 계산
                    const zombieCenterX = zombie.x + zombie.width / 2;
                    const zombieCenterY = zombie.y + zombie.height / 2;

                    const dx = zone.centerX - zombieCenterX;
                    const dy = zone.centerY - zombieCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // 1-1. 장판 반경 내에 좀비가 있는지 확인
                    if (distance < zone.radius) {
                        // 1-2. 중앙으로 끌어당기기 (정규화된 방향 벡터 사용)
                        if (distance > 0) {
                            const normX = dx / distance;
                            const normY = dy / distance;
                            
                            // 장판의 힘을 곱하여 이동
                            // deltaTime을 곱하여 프레임 속도에 독립적으로 만듭니다. 
                            const pullSpeed = zone.pullStrength * deltaTime * 60; 
                            zombie.x += normX * pullSpeed; 
                            zombie.y += normY * pullSpeed; 
                        }
                    }
                }
            });
        }

        // 일반 좀비 업데이트 및 충돌
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            
            zombie.update(player, deltaTime, allZombies); 

            // 충돌 A: 플레이어 vs 좀비
            if (checkCollision(player, zombie)) {
                if (!player.isInvincible) player.takeDamage(zombie.damage, timestamp); // 원본 코드에서는 데미지 1 고정
                if (player.hp <= 0) playerDied = true;
                break;
            }

            // 충돌 B: 총알 vs 좀비
            for (const bullet of weaponManager.bullets) {
                if(checkCollision(bullet, zombie)) {
                    let damage = 0;
                    const shootMod = weaponManager.shootMod; // 현재 무기 모드
                    
                    if (shootMod === "pistol") damage = player.damage * bullet.pistolDamage;
                    else if (shootMod === "shotgun") damage = player.damage * bullet.shotgunDamage;
                    else if (shootMod === "rifle") damage = player.damage * bullet.rifleDamage;

                    zombie.takeDamage(damage); 
                    
                    if (zombie.currentHp <= 0) {
                        // 좀비 사망 처리
                        const levelUp = player.getExp(zombie.expValue); // 경험치 획득
                        if (levelUp) didLevelUp = true; // 레벨업 발생
                        
                        player.score++; // 점수 획득
                        partsManager.spawnParts(this.zombies[i].x, this.zombies[i].y); //부품 생성
                        this.zombies.splice(i, 1); // 좀비 제거
                    }
                    
                    weaponManager.removeBullet(bullet); // 총알 제거
                    break; 
                }
            }     
            
            // 충돌 C: 폭탄 vs 좀비
            for (const bomb of weaponManager.bombs) {
                if(checkCollision(bomb, zombie)) {
                    zombie.takeDamage(bomb.damage); 
                    if (zombie.currentHp <= 0) {
                        // (폭탄에 죽었을 때도 경험치/점수 처리)
                        const levelUp = player.getExp(zombie.expValue);
                        if (levelUp) didLevelUp = true;
                        
                        player.score++;
                        partsManager.spawnParts(this.zombies[i].x, this.zombies[i].y); //부품 생성
                        this.zombies.splice(i, 1); // 좀비 제거
                        break; 
                    }
                }
            }

            // 충돌 D: 광선 vs 일반 좀비
            if (weaponManager.checkRayHit(zombie)) {
                if (zombie.currentHp <= 0) {
                    // 좀비 사망 처리
                    const levelUp = player.getExp(zombie.expValue); // 경험치 획득
                    if (levelUp) didLevelUp = true; // 레벨업 발생
                    
                    player.score++; // 점수 획득
                    this.zombies.splice(i, 1); // 좀비 제거
                    break;
                }
            }

            // 충돌 E: 부채꼴 공격 vs 좀비
            if (weaponManager.checkConeAttackHit(zombie)) {
                if (zombie.currentHp <= 0) {
                    // 좀비 사망 처리
                    const levelUp = player.getExp(zombie.expValue); // 경험치 획득
                    if (levelUp) didLevelUp = true; // 레벨업 발생
                    
                    player.score++; // 점수 획득
                    this.zombies.splice(i, 1); // 좀비 제거
                    break;
                }
            }
        }

        if (this.bossZombie) { // 보스가 존재할 경우에만 실행
            this.bossZombie.update(player, deltaTime, allZombies); 

            // 충돌 A: 플레이어 vs 보스
            if (checkCollision(player, this.bossZombie)) {
                if (!player.isInvincible) player.takeDamage(this.bossZombie.damage, timestamp); 
                if (player.hp <= 0) playerDied = true;
                return { playerDied, didLevelUp };
            }

            // 충돌 B: 총알 vs 보스
            for (const bullet of weaponManager.bullets) {
                if(checkCollision(bullet, this.bossZombie)) {
                    let damage = 0;
                    const shootMod = weaponManager.shootMod;
                    
                    if (shootMod === "pistol") damage = bullet.pistolDamage;
                    else if (shootMod === "shotgun") damage = bullet.shotgunDamage;
                    else if (shootMod === "rifle") damage = bullet.rifleDamage;

                    this.bossZombie.takeDamage(damage); 
                    
                    if (this.bossZombie.currentHp <= 0) {
                        // 스킬 잠금 해제 카운트
                        player.bossesKilled++; 
                        player.checkRayUnlock();
                        player.checkBackstepUnlock();

                        // 보스 사망 처리
                        const expGained = this.bossZombie.expValue; // 보스 경험치
                        const levelUp = player.getExp(expGained);
                        if (levelUp) didLevelUp = true;
                        
                        player.score += 100; // 보스 처치 점수
                        this.bossZombie = null; 
                        this.bossSpawned = false; 
                        this.gameElapsedTime = 0;

                        this.increaseDifficulty();
                    }
                    
                    weaponManager.removeBullet(bullet); // 총알 제거
                    break; 
                }
            }

            // 충돌 C: 폭탄 vs 보스
            for (const bomb of weaponManager.bombs) {
                if(checkCollision(bomb, this.bossZombie)) {
                    this.bossZombie.takeDamage(bomb.damage); 
                    if (this.bossZombie.currentHp <= 0) {
                        // 스킬 잠금 해제 카운트
                        player.bossesKilled++; 
                        player.checkRayUnlock();
                        player.checkBackstepUnlock();
                       
                        const expGained = this.bossZombie.expValue || 10;
                        const levelUp = player.getExp(expGained);
                        if (levelUp) didLevelUp = true;
                        
                        player.score += 100;
                        this.bossZombie = null;
                        this.bossSpawned = false;
                        this.gameElapsedTime = 0;
                        
                        this.increaseDifficulty();
                        break; // 보스가 죽었으므로 루프 중단
                    }
                }
            }

            // 충돌 D: 광선 vs 보스 좀비
            if (weaponManager.checkRayHit(this.bossZombie)) {
                if (this.bossZombie.currentHp <= 0) {
                    // 스킬 잠금 해제 카운트
                    player.bossesKilled++; 
                    player.checkRayUnlock();
                    player.checkBackstepUnlock();

                    const expGained = this.bossZombie.expValue || 10;
                    const levelUp = player.getExp(expGained);
                    if (levelUp) didLevelUp = true;
                    
                    player.score += 100;
                    this.bossZombie = null;
                    this.bossSpawned = false;
                    this.gameElapsedTime = 0;
                    
                    this.increaseDifficulty();
                }
            }

            // 충돌 E: 부채꼴 공격 vs 보스 좀비
            if (weaponManager.checkConeAttackHit(this.bossZombie)) {
                if (this.bossZombie.currentHp <= 0) {
                    // 스킬 잠금 해제 카운트
                    player.bossesKilled++; 
                    player.checkRayUnlock();
                    player.checkBackstepUnlock();
                    
                    const expGained = this.bossZombie.expValue || 10;
                    const levelUp = player.getExp(expGained);
                    if (levelUp) didLevelUp = true;
                    
                    player.score += 100;
                    this.bossZombie = null;
                    this.bossSpawned = false;
                    this.gameElapsedTime = 0;
                    
                    this.increaseDifficulty();
                }
            }
        }

        // 최종 결과 반환
        return { playerDied, didLevelUp };
    }

    draw(ctx, player) {
        this.zombies.forEach(zombie => zombie.draw(ctx, player));

        if (this.bossZombie) {
            this.bossZombie.draw(ctx, player);
        }
    }
}