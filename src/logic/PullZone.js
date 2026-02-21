export class PullZone {
    constructor(player, direction) {
        // 스탯 정의
        this.duration = 8000; // 장판 지속 시간 (예: 8초)
        this.radius = 300; // 장판의 원형 반경 (꽤 큰 원)
        this.pullStrength = 0.05; // 좀비를 끌어당기는 힘 (프레임당 이동 비율)
        this.spawnTime = Date.now();

        // 장판의 중앙 위치
        const distance = 400; // 플레이어로부터 장판이 생성될 거리
        const normX = direction.x;
        const normY = direction.y;

        // 플레이어 정중앙
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;

        // 플레이어 앞 일정 거리에 장판의 중앙 위치 설정
        this.centerX = playerCenterX + normX * distance;
        this.centerY = playerCenterY + normY * distance;
    }

    // 장판 지속 시간이 끝났는지 확인 (WeaponManager에서 호출)
    update(timestamp) {
        return timestamp - this.spawnTime >= this.duration;
    }

    draw(ctx, world) {
        const timeElapsed = Date.now() - this.spawnTime;
        const fadeRatio = 1 - (timeElapsed / this.duration);

        ctx.save();
        ctx.beginPath();
        
        // 원형 장판 그리기
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        
        // 장판의 색상과 투명도 설정
        ctx.fillStyle = `rgba(0, 191, 255, ${0.4 * fadeRatio})`; // 밝은 파란색
        ctx.fill();

        // 외곽선
        ctx.strokeStyle = `rgba(0, 191, 255, ${fadeRatio})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }
}