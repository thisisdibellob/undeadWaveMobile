import { Zombie } from './Zombie.js';

export class BossZombie extends Zombie {
    
    constructor(x, y, hpMultiplier = 1.0, speedMultiplier = 1.0, damageMultiplier = 1.0) {
        // 부모 클래스 생성자 호출
        super(x, y, hpMultiplier, speedMultiplier, damageMultiplier);

        // 보스 이미지
        this.BossZombieimg1 = new Image();
        this.BossZombieimg1.src = "/assets/resource/boss_image/bossRight.png";
        this.BossZombieimg2 = new Image();
        this.BossZombieimg2.src = "/assets/resource/boss_image/bossLeft.gif";

        // 보스 스탯으로 덮어쓰기
 
        // 외형
        this.width = 100; 
        this.height = 100;
        this.color = 'purple'; 

        // 스탯
        this.speed = 1.5 * speedMultiplier;      
        this.hp = 30 * hpMultiplier;        
        this.currentHp = this.hp;
        this.damage = 2 * damageMultiplier; 
        this.expValue = 20; 

        // hp바 위치 정보
        this.hpPosL = this.x + 3;
        this.hpPosR = this.width - 3 * 2; // 더 넓은 HP 바
        this.hpBar = this.hpPosR; // HP바의 '최대 너비'를 갱신
    }

    draw(ctx, player) {
        // 좀비 몸체 그리기
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        let img;
        //좀비가 플레이어 바라보게 설정
        if ((player.x-this.x)>=0) img = this.BossZombieimg1;
        else img = this.BossZombieimg2;
        ctx.drawImage(img, this.x-10, this.y-10, this.width+25, this.height+25);

        // 좀비 체력바 그리기
        this.hpPosL = this.x+3;
        this.hpPosR = this.hpBar/this.hp*this.currentHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.hpPosL, this.y-15, this.hpPosR, 3);
    }

}