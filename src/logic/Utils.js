//충돌 감지 함수
export function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export function roundRect(ctx, x, y, width, height, radius) {
    // 둥근 정도가 너비나 높이의 절반을 초과하지 않도록 제한
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;

    ctx.beginPath(); // 새로운 경로 시작
    
    // 왼쪽 상단 모서리에서 시작
    ctx.moveTo(x + radius, y);
    
    // 1. 위쪽 선을 따라 오른쪽으로 이동
    ctx.lineTo(x + width - radius, y);
    // 2. 오른쪽 상단 모서리 (arcTo)
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    
    // 3. 오른쪽 선을 따라 아래로 이동
    ctx.lineTo(x + width, y + height - radius);
    // 4. 오른쪽 하단 모서리 (arcTo)
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    
    // 5. 아래쪽 선을 따라 왼쪽으로 이동
    ctx.lineTo(x + radius, y + height);
    // 6. 왼쪽 하단 모서리 (arcTo)
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    
    // 7. 왼쪽 선을 따라 위로 이동
    ctx.lineTo(x, y + radius);
    // 8. 왼쪽 상단 모서리 연결 (arcTo)
    ctx.arcTo(x, y, x + radius, y, radius);
    
    ctx.closePath(); // 경로 닫기
}