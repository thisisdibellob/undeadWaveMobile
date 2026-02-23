export class Parts {
    constructor(x, y) {
        // 크기
        this.width = 15;
        this.height = 15;
        this.color = 'green';

        // 스폰 위치
        this.x = x;
        this.y = y;

    }


    draw(ctx) {
        
        // 히트박스 (확인용이라 주석 처리)
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        
        const img = new Image();
        img.src =  "/assets/resource/weapon_image/parts.png";
        ctx.drawImage(img, this.x-13, this.y-14, this.width+25, this.height+25);

    }



    
}