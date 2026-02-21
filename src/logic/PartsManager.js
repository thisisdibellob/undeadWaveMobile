import { checkCollision } from './Utils.js'; 
import { Parts } from './Parts.js';
const parts = new Parts();

export class PartsManager {
    constructor() {

        this.partsArray = [];
        this.num = 0;

    }



    updateAndCollide(player) {

        // 플레이어랑 충돌 시 부품 얻기
        for(let i=0; i<this.partsArray.length; i++) {
            if(checkCollision(player, this.partsArray[i])) {
                this.partsArray.splice(i, 1); 
                this.num++; // 부품 추가
            }
        }
    }





    // 부품 생성
    spawnParts(x, y) {
        
        //70% 확률로 스폰
        if (Math.random() < 0.7) {
            const newParts = new Parts(x, y);
            this.partsArray.push(newParts);
        } 

    }




    draw(ctx) {
        
        for(let i=0; i<this.partsArray.length; i++) {
            this.partsArray[i].draw(ctx)
        }

    }



}