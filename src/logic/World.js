export class World {
    constructor(width, height){
        //맵 크기
        this.width = width;
        this.height = height;  

        //맵 이미지
        this.worldImg = new Image();
        this.worldImg.src = "/assets/startMenu/demo2_12.png"

        //꼬깔(플레이어 이동 범위)
        this.fenceImage = new Image();
        this.fenceImage.src = "/assets/resource/fence.png"
        this.fenceSize = 50;
    }

    draw(ctx) {
        //맵 배경 그리기
        if (!this.worldImg.complete) {
            // 아직 로딩되지 않았으면 아무것도 그리지 않고 반환
            return; 
        }
        ctx.drawImage(this.worldImg, 0, 0, this.width, this.height);
    }

    drawFence(ctx, player) {
        // 플레이어 이동 가능 경계 계산 (player.js랑 같음)
        const halfScreenWidth = window.innerWidth / 2;
        const halfScreenHeight = window.innerHeight / 2;
        const minX = halfScreenWidth - player.width / 2;
        const minY = halfScreenHeight - player.height / 2;
        const maxX = this.width - halfScreenWidth - player.width / 2;
        const maxY = this.height - halfScreenHeight - player.height / 2;

        if (!this.fenceImage.complete) return;

        // 상단 펜스
        for (let x = minX; x <= maxX + player.width; x += this.fenceSize) {
             ctx.drawImage(this.fenceImage, x, minY - this.fenceSize, this.fenceSize, this.fenceSize);
        }
        // 하단 펜스
        for (let x = minX; x <= maxX + player.width; x += this.fenceSize) {
             ctx.drawImage(this.fenceImage, x, maxY + player.height, this.fenceSize, this.fenceSize);
        }
        // 좌측 펜스
        for (let y = minY; y <= maxY + player.height; y += this.fenceSize) {
             ctx.drawImage(this.fenceImage, minX - this.fenceSize, y, this.fenceSize, this.fenceSize);
        }
        // 우측 펜스
        for (let y = minY; y <= maxY + player.height; y += this.fenceSize) {
             ctx.drawImage(this.fenceImage, maxX + player.width, y, this.fenceSize, this.fenceSize);
        }
    }
}