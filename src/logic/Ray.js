//import { checkCollision } from './Utils.js';

// 광선 스킬 객체
export class Ray {
    constructor(player, direction) {
        // 광선 스탯
        this.damage = 10; // 강력한 한방 데미지
        this.duration = 1000; // 광선 지속 시간
        this.spawnTime = Date.now(); // 생성 시간

        // 광선의 크기 및 위치
        this.player = player;
        this.direction = direction;

        // 광선의 기본 크기
        const baseLength = 500; // 광선의 길이
        const baseThickness = 50; // 광선의 두께

        // 방향 벡터 정규화
        const mag = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const normX = mag > 0 ? direction.x / mag : 0;
        const normY = mag > 0 ? direction.y / mag : 0;

        // 위치 및 크기 계산
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;

        if (normX === 0 && normY === 0) {
            // 정지 상태일 경우 기본은 아래 방향
            this.width = baseThickness;
            this.height = baseLength;
            this.x = centerX - this.width / 2;
            this.y = centerY;
        } 
        else if (Math.abs(normX) > Math.abs(normY)) {
            // 수평 방향이 더 강한 경우
            this.width = baseLength;
            this.height = baseThickness;
            
            // X 위치 조정: 플레이어 중앙에서 광선 길이의 절반만큼 이동
            this.x = centerX + (normX > 0 ? 0 : -baseLength) - (normX > 0 ? 0 : this.width) * (1 - Math.abs(normX));
            this.y = centerY - this.height / 2;
            
            // 광선이 플레이어 바로 옆에서 시작하도록 조정
            this.x = centerX + (normX * (player.width / 2));
            this.y = centerY - baseThickness / 2;
            this.x -= (normX < 0 ? baseLength : 0); // 좌측 방향일 때 X 보정
            
        } 
        else {
            // 수직 방향이 더 강한 경우
            this.width = baseThickness;
            this.height = baseLength;

            // Y 위치 조정
            this.x = centerX - this.width / 2;
            this.y = centerY + (normY > 0 ? 0 : -baseLength) - (normY > 0 ? 0 : this.height) * (1 - Math.abs(normY));
            
            // 광선이 플레이어 바로 옆에서 시작하도록 조정
            this.x = centerX - baseThickness / 2;
            this.y = centerY + (normY * (player.height / 2));
            this.y -= (normY < 0 ? baseLength : 0); // 상단 방향일 때 Y 보정
        }

        // 광선이 좀비에게 한 번만 피해를 주도록 충돌 기록
        this.hitZombies = new Set();
    }

    update(timestamp) {
        return timestamp - this.spawnTime >= this.duration;
    }

    draw(ctx) {
        const timeElapsed = Date.now() - this.spawnTime;
        const fadeRatio = 1 - (timeElapsed / this.duration);

        // 광선 색상 설정
        ctx.fillStyle = `rgba(255, 255, 100, ${fadeRatio})`;
        
        // 광선 그리기
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 중심점에 밝은 효과 추가
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        const glowRadius = this.player.width / 2;
        
        ctx.save();
        ctx.beginPath();
        
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, glowRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${fadeRatio * 0.8})`); // 중앙
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // 외곽
        
        ctx.fillStyle = gradient;
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}