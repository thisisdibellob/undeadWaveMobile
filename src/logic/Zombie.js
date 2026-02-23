export class Zombie {
    constructor(x, y, hpMultiplier = 1.0, speedMultiplier = 1.0, damageMultiplier = 1.0) {
        // 좀비 크기
        this.width = 25;
        this.height = 25;
        this.color = 'green';

        //좀비 이미지
        this.zombieImg1 = new Image();
        this.zombieImg1.src = "/assets/resource/zombie_image/zombieRight.png"

        this.zombieImg2 = new Image();
        this.zombieImg2.src =  "/assets/resource/zombie_image/zombieLeft.png"

        // 스폰 위치
        this.x = x;
        this.y = y;

        // 좀비 스테이터스
        this.speed = 1 * speedMultiplier;
        this.hp = 3 * hpMultiplier;
        this.currentHp = this.hp;
        this.damage = 1 * damageMultiplier;
        this.expValue = 1; 

        // hp바 위치 정보
        this.hpPosL = this.x+3;
        this.hpPosR = this.width-3*2;
        this.hpBar = this.hpPosR;
    }

    // 좀비 위치 업데이트(플레이어를 따라다녀야함)
    update(player, deltaTime, zombies){
        // 방향 계산
        const dx = player.x - this.x;
        const dy = player.y - this.y;

        // 거리 계산(sqrt는 제곱근 , 피타고라스 정리를 이용하여 대각선 거리 구함)
        const distance = Math.sqrt(dx * dx + dy * dy);

        let moveX = 0; 
        let moveY = 0;

        if(distance > 0){ 
            // 방향 / 거리 * 속도 (해당 방향으로 속도만큼 이동)
            moveX += (dx / distance) * this.speed;
            moveY += (dy / distance) * this.speed;
        }

        // 다른 좀비로부터 분리
        const separationForce = 0.5; //분리 강도
        const separationRadius = this.width * 1.5; //좀비 크기의 1.5배 크기 반경

        //분리 로직
        zombies.forEach(otherZombie => {
            if(otherZombie === this) return;

            const dxToOther = this.x - otherZombie.x;
            const dyToOther = this.y - otherZombie.y;
            const distanceToOther = Math.sqrt(dxToOther * dxToOther + dyToOther * dyToOther);

            if(distanceToOther < separationRadius && distanceToOther > 0) {
                const pushStrength = (separationRadius - distanceToOther) / separationForce;

                moveX += (dxToOther / distanceToOther) * separationForce * pushStrength;
                moveY += (dyToOther / distanceToOther) * separationForce * pushStrength;
            }
        })

        this.x += moveX;
        this.y += moveY;

        // 좀비 체력바 위치 업데이트
        this.hpPosL = this.x+3;
    }

    draw(ctx, player) {
        // 좀비 몸체 그리기
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        let img;

        //좀비가 플레이어 바라보게 설정
        if ((player.x-this.x)>=0) img = this.zombieImg1;
        else img = this.zombieImg2;

        //ctx.drawImage(img, this.x-10, this.y-10, this.width+25, this.height+25);
        if ((player.x-this.x)>=0) ctx.drawImage(img, this.x-10+2, this.y-10, this.width+25, this.height+25);
        else ctx.drawImage(img, this.x-10-5, this.y-10, this.width+25, this.height+25);


        // 좀비 체력바 그리기
        this.hpPosL = this.x+3;
        this.hpPosR = this.hpBar/this.hp*this.currentHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.hpPosL, this.y-15, this.hpPosR, 3);
    }


    // 좀비 데미지 받기
    takeDamage(amount) {
        this.currentHp -= amount;
    }


    static spawnZombie(world, zombies, hpMultiplier = 1.0, speedMultiplier = 1.0, damageMultiplier = 1.0) {
        let x, y;

        // 50% 확률로 좌우에서 스폰, 50% 확률로 상하에서 스폰
        if (Math.random() < 0.5) {
            x = Math.random() * world.width; 
            y = Math.random() < 0.5 ? -30 : world.height + 30; 
        } else {
            x = Math.random() < 0.5 ? -30 : world.width + 30; 
            y = Math.random() * world.height; 
        }

        const newZombie = new Zombie(x, y, hpMultiplier, speedMultiplier, damageMultiplier);

        zombies.push(newZombie);
    }
}