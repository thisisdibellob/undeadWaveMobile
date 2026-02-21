export class Bomb {
    
    constructor(mouseX,mouseY,speed, spawntime, player){

        this.width = 200;
        this.height = 200;

        this.damage = 0.1;
    
        this.color = 'pink';
        this.spawnTime = spawntime;
        this.speed = speed;



         // 방향 계산
        const dx = (mouseX - window.innerWidth/2);
        const dy = (mouseY - window.innerHeight/2);

        // 거리 계산
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance > 0){ 
            // 방향 / 거리 * 속도 (해당 방향으로 속도만큼 이동)
            this.x = player.x + (dx / distance) * 350 - 100;
            this.y = player.y + (dy / distance) * 350 - 100;
        }
    }

    update(player) {

        // 방향 계산
        const dx = this.targetX;
        const dy = this.targetY;

        // 거리 계산
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance > 0){ 
            // 방향 / 거리 * 속도 (해당 방향으로 속도만큼 이동)
            this.x = (dx / distance) * 10 - 50;
            this.y = (dy / distance) * 10 - 50;
        }
    }

    draw(ctx) {
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);

        const img = new Image();
        img.src = "/assets/resource/bullet_image/explode.png";
        ctx.drawImage(img, this.x-50, this.y-30, this.width + 100, this.height + 100);
    }

    static spawnBomb(mouseX, mouseY, bombs, speed, spawntime, player) {


        const newBomb = new Bomb(mouseX, mouseY, speed, spawntime, player);

        bombs.push(newBomb);
    }


}