// export 클래스를 다른 파일에서 쓸 수 있도록 함
export class Player{
    // 생성자
    constructor(worldWidth, worldHeight){ 
        // 플레이어 크기
        this.width = 25; 
        this.height = 25;
        this.color = 'blue';

        // 플레이어 이미지
        this.playerImg1 = new Image();
        this.playerImg1.src = "/assets/resource/player_image/idleRight.gif";
        this.playerImg2 = new Image();
        this.playerImg2.src ="/assets/resource/player_image/idleLeft.png";
        this.playerImg3 = new Image();
        this.playerImg3.src = "/assets/resource/player_image/idleRight.gif";
        this.playerHurtImg = new Image();
        this.playerHurtImg.src = "/assets/resource/player_image/hurt.gif"
        // 월드 중앙에 플레이어 위치시키기
        this.setInitialPosition(worldWidth, worldHeight);

        //플레이어 스테이터스
        this.speed = 2;
        this.maxHp = 4;
        this.hp = this.maxHp;
        this.defense = 0;
        this.damageLv = 1;
        this.damage = this.damageLv * 0.5 + 0.5;

        // 일반 공격력 (백스텝 공격 데미지 계산용)
        this.lastAttackDamage = 1;

        // 무적 상태 관련 변수
        this.isInvincible = false; // 무적 상태 여부(피격 받았을 때)
        this.invincibilityDuration = 1000; // 무적 지속 시간(1초)
        this.invincibilityTimer = 0; // 무적 타이머

        // 구르기 스킬 관련 변수
        this.isRolling = false; // 현재 구르기 중인지 여부
        this.rollSpeed = 10; // 구르기 시 증가하는 속도 (기본 속도에 더해짐)
        this.rollDuration = 100; // 구르기 지속 시간
        this.rollCooldown = 500; // 구르기 쿨타임
        this.rollCooldownTimer = 0; // 구르기 쿨타임 타이머
        this.lastRollDirection = { x: 0, y: 0 }; // 마지막 이동 방향

        // 광선 스킬 관련 변수
        this.rayUnlocked = true; // 광선 스킬 잠금 해제 여부
        this.bossesKilled = 0;    // 처치한 보스 수 카운터
        this.lastMoveDirection = { x: 0, y: 0 }; // 마지막 이동 방향 벡터

        // 백스텝 스킬 관련 변수
        this.backstepUnlocked = true; // 백스텝 스킬 잠금 해제 여부
        this.backstepSpeed = 10; // 백스텝 시 증가하는 속도 (기본 속도에 더해짐)
        this.isBackstepping = false;   // 백스텝 중인지 여부
        this.backstepDuration = 200; // 백스텝 지속 시간
        this.backstepCooldown = 25000; // 백스텝 쿨타임
        this.backstepCooldownTimer = 0; // 백스텝 쿨타임 타이머
        this.lastBackstepDirection = { x: 0, y: 0 }; // 마지막 이동 방향

        // 회오리 스킬 관련 변수
        this.tornadoUnlocked = true; // 회오리 스킬 잠금 해제 여부

        // 경험치 및 레벨
        this.level = 1; // 현재 레벨
        this.exp = 0;   // 현재 경험치
        this.expToNextLevel = 10; // 다음 레벨에 필요한 경험치

        // 스코어
        this.score = 0;

        // 이동 입력 전 스킬(구르기/백스텝)을 써도 방향 계산이 깨지지 않도록 기본 방향을 둔다.
        this.lastMoveX = 0;
        this.lastMoveY = 1;
    }

    setInitialPosition(worldWidth, worldHeight) {
        this.x = worldWidth / 2 - this.width / 2;
        this.y = worldHeight / 2 - this.height / 2;
    }

    startRoll() {
        // 쿨타임이 지났는지, 이미 구르기 중인지 확인
        if (this.rollCooldownTimer > 0 || this.isRolling) {
            return false;
        }

        // 구르기 상태 시작
        this.isRolling = true;
        this.rollTimer = this.rollDuration;
        
        // 무적 상태 부여 (구르기 지속 시간만큼)
        this.isInvincible = true;
        this.invincibilityTimer = this.rollDuration;

        // 쿨타임 시작
        this.rollCooldownTimer = this.rollCooldown;

        // 이동 방향이 없으면 (가만히 서 있었으면) 기본값으로 설정
        // 방향값이 비정상(undefined/NaN) 이거나 정지 상태면 아래 방향을 기본값으로 사용한다.
        if (!Number.isFinite(this.lastMoveX) || !Number.isFinite(this.lastMoveY) ||
            (this.lastMoveX === 0 && this.lastMoveY === 0)) {
            this.lastMoveX = 0;
            this.lastMoveY = 1;
        }

        return true;
    }

    startbackstep() {
        if (!this.backstepUnlocked) {
            return false;
        }

        // 쿨타임이 지났는지, 이미 백스텝 중인지 확인
        if (this.backstepCooldownTimer > 0 || this.isBackstepping) {
            return false;
        }

        // 백스텝 상태 시작
        this.isBackstepping = true;
        this.backstepTimer = this.backstepDuration;

        // 쿨타임 시작
        this.backstepCooldownTimer = this.backstepCooldown;

        // 이동 방향이 없으면 (가만히 서 있었으면) 기본값으로 설정
        // 방향값이 비정상(undefined/NaN) 이거나 정지 상태면 아래 방향을 기본값으로 사용한다.
        if (!Number.isFinite(this.lastMoveX) || !Number.isFinite(this.lastMoveY) ||
            (this.lastMoveX === 0 && this.lastMoveY === 0)) {
            this.lastMoveX = 0;
            this.lastMoveY = 1;
        }

        return true;
    }

    // update 플레이어 위치
    update(keys, world, deltaTime, timestamp) {
        if (this.isInvincible) {
            const timeElapsed = timestamp - this.invincibilityTimer;
        
            // 무적 지속 시간을 초과했는지 확인
            if (timeElapsed >= this.invincibilityDuration) {
                this.isInvincible = false;
            }
        }

        this.rollCooldownTimer = Math.max(0, this.rollCooldownTimer - deltaTime);
        this.backstepCooldownTimer = Math.max(0, this.backstepCooldownTimer - deltaTime);

        let moveX = 0; 
        let moveY = 0;
        let currentSpeed = this.speed;

        if (this.isRolling) {
            // 구르기 타이머 업데이트
            this.rollTimer = Math.max(0, this.rollTimer - deltaTime);
            if (this.rollTimer === 0) {
                this.isRolling = false;
            }

            // 구르기 속도 적용 및 이동
            currentSpeed += this.rollSpeed;
            moveX = this.lastMoveX * currentSpeed;
            moveY = this.lastMoveY * currentSpeed;
            
        } 

        else if (this.isBackstepping) {
            // 백스텝 타이머 업데이트
            this.backstepTimer = Math.max(0, this.backstepTimer - deltaTime);
            if (this.backstepTimer === 0) {
                this.isBackstepping = false;
            }

            // 백스텝 속도 적용 및 이동
            currentSpeed += this.backstepSpeed;
            moveX = this.lastMoveX * currentSpeed * -1;
            moveY = this.lastMoveY * currentSpeed * -1;
            
        }
        
        else { // 일반 이동 로직 (구르기 또는 백스텝 중이 아닐 때만 키 입력 처리)
            if(keys.w) moveY -= currentSpeed; //위
            if(keys.s) moveY += currentSpeed; //아래
            if(keys.a) moveX -= currentSpeed; //왼쪽
            if(keys.d) moveX += currentSpeed; //오른쪽
            if(keys.ㅈ) moveY -= currentSpeed; //위
            if(keys.ㄴ) moveY += currentSpeed; //아래
            if(keys.ㅁ) moveX -= currentSpeed; //왼쪽
            if(keys.ㅇ) moveX += currentSpeed; //오른쪽
            
            // 마지막 이동 방향 저장 (광선 방향 업데이트)
            this.lastMoveDirection.x = moveX;
            this.lastMoveDirection.y = moveY;

            // 정규화 및 마지막 이동 방향 저장
            const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
            if (magnitude > 0) {
                // 대각선 이동 시 속도 정규화 (대각선 속도 일정하게)
                const normalizedMoveX = moveX / magnitude;
                const normalizedMoveY = moveY / magnitude;
                
                // 마지막 유효한 이동 방향 저장 (구르기 방향 결정용)
                this.lastMoveX = normalizedMoveX;
                this.lastMoveY = normalizedMoveY;
                
                // 실제 이동 벡터
                moveX = normalizedMoveX * currentSpeed;
                moveY = normalizedMoveY * currentSpeed;
            }
        }

        // 누적 연산 전에 좌표가 비정상이면 안전한 값으로 복구한다.
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) {
            this.x = world.width / 2 - this.width / 2;
            this.y = world.height / 2 - this.height / 2;
        }

        // 플레이어 위치 업데이트
        this.x += moveX;
        this.y += moveY;
        
        // 화면의 절반 너비와 높이 계산
        const halfScreenWidth = window.innerWidth / 2;
        const halfScreenHeight = window.innerHeight / 2;

        // 왼쪽 및 위쪽 경계 계산 (화면 절반만큼 안쪽으로)
        const minX = halfScreenWidth - this.width / 2;
        const minY = halfScreenHeight - this.height / 2;

        // 오른쪽 및 아래쪽 경계 계산 (월드 끝에서 화면 절반만큼 안쪽으로)
        const maxX = world.width - halfScreenWidth - this.width / 2;
        const maxY = world.height - halfScreenHeight - this.height / 2;

        // 이럼 이제 카메라 줌 지속 가능함
        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    // draw 플레이어 그리기
    draw(ctx, keys) {

        if (keys.d || keys.ㅇ) this.key = "d"
        if (keys.a || keys.ㅁ) this.key = "a"
        
        let img;

        //플레이어 캐릭터가 이동 방향 바라보게
        if (this.key == "d") img = this.playerImg1;
        else if (this.key == "a") img = this.playerImg2
        else img = this.playerImg3;

        if (this.isInvincible) {
            img = this.playerHurtImg;

            const timeElapsed = Date.now() - this.invincibilityTimer;
            // 무적일 때 잠깐 안 보이게 (깜빡임 효과)
            if (Math.floor(this.ianvincibilityTimer / 100) % 2 === 0)
                return;     
            
            if ((timeElapsed % (100 * 2)) < 100) {
            // 이 주기에 해당하면 그리지 않고 함수 종료 (투명 상태)
                return; 
            }   
        }

        // 히트박스 크기 (확인용이라 주석처리)
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
            
        // 캐릭터 이미지 그리기
        if (this.key == "d") ctx.drawImage(img, this.x, this.y-10, this.width+20, this.height+20);
        else if (this.key == "a") ctx.drawImage(img, this.x-15, this.y-10, this.width+20, this.height+20);
        else ctx.drawImage(img, this.x, this.y-10, this.width+20, this.height+20);

        // 체력바 크기 설정
        const barWidth = this.width + 10;
        const barHeight = 6;

        //체력바 위치 설정
        const hpBarX = this.x-2.5;
        const hpBarY = this.y+this.height+15;

        // 체력바 배경 그리기
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
        ctx.fillRect(hpBarX, hpBarY, barWidth, barHeight);

        // 남아있는 체력 그리기
        ctx.fillStyle = 'red'; 
        ctx.fillRect(hpBarX, hpBarY, barWidth * (this.hp/this.maxHp), barHeight);
        ctx.strokeStyle = 'black'; 
        
        // 체력바 테두리 그리기 
        ctx.lineWidth = 2;
        ctx.strokeRect(hpBarX, hpBarY, barWidth, barHeight);

    }

    // 데미지 입는 함수
    takeDamage(amount, timestamp) {
        // 1. 이미 무적 상태이면 데미지 적용을 무시
        if (this.isInvincible) {
            return; 
        }
        // 2. 방어력 계산
        let finalDamage = amount;
        if (this.defense > 0) {
            finalDamage = amount - this.defense;
            this.defense -= amount;
            if (this.defense < 0) this.defense = 0;
        }
        if (finalDamage < 0) finalDamage = 0;

        // 3. HP 감소
        this.hp -= finalDamage;

        // 4. 무적 상태 활성화 및 타이머 설정
        this.isInvincible = true;
        this.invincibilityTimer = timestamp; // 현재 시간을 타이머 시작 시점으로 기록

        // HP가 0 미만으로 내려가지 않도록 보정 (선택 사항)
        if (this.hp < 0) {
            this.hp = 0;
        }
    }

    // 좀비 처치 시 경험치 획득 함수
    getExp(amount) {
        let leveledUp = false;
        this.exp += amount;
        
        // 레벨업 체크 및 처리
        while (this.exp >= this.expToNextLevel) {
            this.levelUp();
            leveledUp = true;
        }

        return leveledUp;
    }

    // 경험치에 따른 레벨 증가 및 스택 획득 함수
    levelUp() {
        this.level++;
        this.exp -= this.expToNextLevel; // 남은 경험치만 유지
        
        // 다음 레벨에 필요한 경험치를 증가시키는 공식
        this.expToNextLevel = Math.floor(this.expToNextLevel * 1.5);
    }

    getAvailableUpgrades() {
        return [
            { 
                name: "체력 향상", 
                description: "최대 체력 +1", 
                effect: () => { 
                    this.maxHp += 1; 
                    this.hp = this.maxHp; 
                } 
            },
            { 
                name: "속도 향상", 
                description: "이동 속도 +1", 
                effect: () => { 
                    this.speed += 1; 
                } 
            },
            { 
                name: "공격력 향상", 
                description: "공격력 +1", 
                effect: () => { 
                    this.damageLv += 1; // 추후 공격력 변수 추가 시
                    this.damage = this.damageLv * 0.5 + 0.5;
                } 
            },
            { 
                name: "방어도 향상", 
                description: "방어도 +1", 
                effect: () => { 
                    this.defense += 1; 
                } 
            }
        ];
    }

    // 선택된 스탯 적용 및 랜덤 선택지 반환
    getUpgradeOptions(count = 3) {
        const upgrades = this.getAvailableUpgrades();
        // 배열을 무작위로 섞기
        for (let i = upgrades.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [upgrades[i], upgrades[j]] = [upgrades[j], upgrades[i]];
        }
        return upgrades.slice(0, count); // 랜덤하게 3개 선택
    }

    applyUpgrade(upgrade) {
        upgrade.effect();
    }

    // 광선 스킬 잠금 해제 확인
    checkRayUnlock() {
        if (!this.rayUnlocked && this.bossesKilled >= 2) {
            this.rayUnlocked = true;
            return true;
        }
        return false;
    }

    // 회오리 스킬 잠금 해제 확인
    checkTornadoUnlock() {
        if (!this.tornadoUnlocked && this.bossesKilled >= 5) {
            this.tornadoUnlocked = true;
            return true;
        }
        return false;
    }

    // 광선 스킬 발동 방향 반환
    startRay() {
        if (!this.rayUnlocked) {
            return null;
        }
        
        // 발사 방향 (마지막 이동 방향 사용)
        const dirX = this.lastMoveDirection.x;
        const dirY = this.lastMoveDirection.y;

        // 방향이 0, 0일 경우 (플레이어가 멈춰있을 경우) 기본 방향(아래) 설정
        if (dirX === 0 && dirY === 0) {
            return { x: 0, y: 1 }; // 아래 방향으로 광선 발사
        }

        // 방향 벡터 반환
        return { x: dirX, y: dirY };
    }

    // 부채꼴 공격 발동 방향 반환
    startCone() {
        if (!this.backstepUnlocked) {
            return null;
        }
        
        // 발사 방향 (마지막 이동 방향 사용)
        const dirX = this.lastMoveDirection.x;
        const dirY = this.lastMoveDirection.y;

        // 방향이 0, 0일 경우 (플레이어가 멈춰있을 경우) 기본 방향(아래) 설정
        if (dirX === 0 && dirY === 0) {
            return { x: 0, y: 1 }; // 아래 방향으로 광선 발사
        }

        // 방향 벡터 반환
        return { x: dirX, y: dirY };
    }

    // 회오리 스킬 발동 방향 반환
    startPullZone() {
        if (!this.tornadoUnlocked) {
            return null;
        }

        // 발동 방향 (마지막 이동 방향 사용)
        const dirX = this.lastMoveDirection.x;
        const dirY = this.lastMoveDirection.y;

        // 방향 벡터 정규화
        const mag = Math.sqrt(dirX * dirX + dirY * dirY);
        if (mag === 0) {
            // 정지 상태일 경우 기본 방향(아래) 설정
            return { x: 0, y: 1 };
        }
        
        return { x: dirX / mag, y: dirY / mag }; // 정규화된 방향 벡터 반환
    }

    // 백스텝 스킬 잠금 해제 확인 함수 (보스 3마리 처치 시)
    checkBackstepUnlock() {
        if (!this.backstepUnlocked && this.bossesKilled >= 3) { // 3마리 처치 조건
            this.backstepUnlocked = true;
            return true;
        }
        return false;
    }
}
