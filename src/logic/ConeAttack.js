// 부채꼴 공격 객체
export class ConeAttack {
    constructor(player, direction) {
        this.damage = 5; 
        this.duration = 100; // 지속 시간
        this.spawnTime = Date.now(); 

        this.player = player;
        this.hitEnemies = new Set(); // 한 번 공격에 한 좀비 당 한 번만 데미지

        // 부채꼴 공격의 크기 정의 (가상의 직사각형 충돌 박스)
        const CONE_SIZE = 150; // 부채꼴 공격의 크기
        const playerSize = player.width;
        
        // 방향 벡터 정규화
        const mag = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const normX = mag > 0 ? direction.x / mag : 0;
        const normY = mag > 0 ? direction.y / mag : 0;

        // 충돌 박스 크기
        this.width = CONE_SIZE;
        this.height = CONE_SIZE;
        
        // 부채꼴 충돌 박스 위치 계산
        // 플레이어 정중앙에서 이동 방향으로 CONE_SIZE/2만큼 떨어진 곳에 박스 중심이 오도록 배치
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        const offset = playerSize / 2 + CONE_SIZE / 2;

        // 충돌 박스의 좌측 상단 좌표
        this.x = playerCenterX + normX * offset - CONE_SIZE / 2;
        this.y = playerCenterY + normY * offset - CONE_SIZE / 2;

        // 부채꼴 그리기용 각도 (radian)
        this.startAngle = Math.atan2(normY, normX) - Math.PI / 4; // 중심 각도 - 45도 (90도 부채꼴)
        this.endAngle = Math.atan2(normY, normX) + Math.PI / 4;   // 중심 각도 + 45도
    }

    update(timestamp) {
        return timestamp - this.spawnTime >= this.duration; 
    }

    draw(ctx) {
        const timeElapsed = Date.now() - this.spawnTime;
        const fadeRatio = 1 - (timeElapsed / this.duration); // 페이드 아웃 효과

        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;

        ctx.save();
        ctx.beginPath();
        
        // 부채꼴 중심에서 시작
        ctx.moveTo(playerCenterX, playerCenterY);
        
        // 원호 그리기
        ctx.arc(
            playerCenterX, 
            playerCenterY, 
            1.5 * this.width, // 부채꼴 반지름 
            this.startAngle, 
            this.endAngle
        );
        
        // 중심점으로 다시 닫기
        ctx.closePath(); 
        
        ctx.fillStyle = `rgba(255, 100, 100, ${fadeRatio * 0.7})`; // 붉은색 공격 효과
        ctx.fill();
        
        ctx.restore();
    }
}