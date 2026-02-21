export class Bullet {
    
    constructor(x,y,mouseX,mouseY,speed){
        this.width = 20;
        this.height = 20;

        this.x = x;
        this.y = y;

        this.color = 'red';
        
        this.speed = speed;

        this.targetX = mouseX - window.innerWidth/2;
        this.targetY = mouseY - window.innerHeight/2;

        this.cos = this.targetX / Math.sqrt(this.targetX*this.targetX + this.targetY*this.targetY); //  밑변 / 빗변 = 코사인 값

        this.pistolDamage = 1;
        this.shotgunDamage = 1;
        this.rifleDamage = 0.5;
    }

    update(player) {

        // 방향 계산
        const dx = this.targetX * 10;
        const dy = this.targetY * 10;

        // 거리 계산
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance > 0){ 
            // 방향 / 거리 * 속도 (해당 방향으로 속도만큼 이동)
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx, bulletImg) {

        const img = new Image();

        // 1사분면
        if ((this.targetX>=0) && (this.targetY<=0)) {
            if ((this.cos <= 1) && (this.cos >= Math.sqrt(3)/2))
                img.src = bulletImg[1];
            if ((this.cos < Math.sqrt(3)/2) && (this.cos >= 1/2))
                img.src = bulletImg[2];
            if ((this.cos < 1/2) && (this.cos >= 0))
                img.src = bulletImg[3];
        }

        // 2사분면
        if ((this.targetX<0) && (this.targetY<0)) {
            if ((this.cos < 0) && (this.cos >= -1/2))
                img.src = bulletImg[3];
            if ((this.cos < -1/2) && (this.cos >= -Math.sqrt(3)/2))
                img.src = bulletImg[4];
            if ((this.cos < -Math.sqrt(3)/2) && (this.cos > -1))
                img.src = bulletImg[5];
        }
        
        // 3사분면
        if ((this.targetX<0) && (this.targetY>0)) {
            if ((this.cos < 0) && (this.cos >= -1/2))
                img.src =bulletImg[7];
            if ((this.cos < -1/2) && (this.cos >= -Math.sqrt(3)/2))
                img.src = bulletImg[6];
            if ((this.cos < -Math.sqrt(3)/2) && (this.cos > -1))
                img.src = bulletImg[5];
        }
        
        // 4사분면
        if ((this.targetX>0) && (this.targetY>0)) {
            if ((this.cos < 1) && (this.cos >= Math.sqrt(3)/2))
                img.src = bulletImg[1];
            if ((this.cos < Math.sqrt(3)/2) && (this.cos >= 1/2))
                img.src = bulletImg[8];
            if ((this.cos < 1/2) && (this.cos > 0))
                img.src = bulletImg[7];
        }

        
        ctx.drawImage(img, this.x, this.y, 25, 25);
    }

    static spawnBullet(mouseX, mouseY, x, y, bullets, speed) {

        //총알 처음 생성 위치 
        // this.x = player.x +10;
        // this.y = player.y +10;
        this.x = x;
        this.y = y;
        

        const newBullet = new Bullet(this.x, this.y, mouseX, mouseY, speed);

        bullets.push(newBullet);
    }


}