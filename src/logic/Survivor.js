const img = new Image();
img.src =  "/assets/resource/resident.gif";

export class Survivor {
    constructor(x, y) {
        // 크기
        this.width = 40;
        this.height = 60;
        this.color = 'green';

        // 스폰 위치
        this.x = x;
        this.y = y;

        this.gaze = 0;
        this.gazeRatio = 0;

        this.isFading = false;
        this.opacity = 1.0; // 투명도 (1.0 = 불투명, 0.0 = 투명)
        this.fadeSpeed = 0.001; // 초당 감소할 투명도 값 (예: 1.5면 1/1.5초만에 사라짐)
    }




    draw(ctx) {

        // 투명도 설정
        ctx.globalAlpha = this.opacity;

        console.log("시민 스폰" + this.x, this.y);

        // 히트박스 (확인용이라 주석 처리)
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.gaze<=100) 
            this.gazeRatio = this.width * this.gaze / 100; 

        //게이지 그리기
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y-20, this.gazeRatio, 10);

        ctx.strokeStyle = 'black'; // 테두리
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y-20, this.width, 10);
        

        // 시민 이미지 그리기
        ctx.drawImage(img, this.x-10, this.y-10, this.width+30, this.height+30);

    }



    


    
}