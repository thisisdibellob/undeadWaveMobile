import { Survivor } from "./Survivor.js";
import { checkCollision } from './Utils.js'; 

const imgHp = new Image();
const imgDef = new Image();
const imgExp = new Image();
imgHp.src =  "/assets/resource/stat_image/hp.png";
imgDef.src =  "/assets/resource/stat_image/def.png";
imgExp.src =  "/assets/resource/stat_image/exp.png";

export class SurvivorManager {

    constructor() {
        this.newSurvivor;
        this.isSpawn = false;
        this.isDraw = false;
        this.isBuffFinish = false;
        this.whatBuff = "hp";
    }



    updateAndCollide(player) {
    
        // 플레이어랑 충돌 시 
        if (this.newSurvivor != null) {
            if(checkCollision(player, this.newSurvivor)) {
                this.newSurvivor.gaze += 0.7;
                if (this.newSurvivor.gaze >= 100) {
                    this.giveBuff(player);
                    this.newSurvivor.isFading = true;
                    // 원래 여기에 삭제 함수 있어야 하는데
                    // 버그 때문에 이미지 생성 후 삭제로 변경
                }
            }
        }
    }



    giveBuff(player) {

        let rand = Math.random();

        if (this.isBuffFinish == true) {
            if (rand < 0.4) {  //체력 회복
                player.hp = player.maxHp;
                this.whatBuff = "hp";
            } else if (rand < 0.8) {  //방어도 +1
                player.defense++;
                this.whatBuff = "def";
            } else {  //경험치 30% 제공
                player.exp += player.expToNextLevel * 0.3;
                this.whatBuff = "exp";
            }
            this.isBuffFinish=false;
        }

        this.isDraw = true;
    }



    drawImage(ctx, deltaTime) {

        if (this.isDraw == true) {

            let x = this.newSurvivor.x
            let y = this.newSurvivor.y
            if (this.whatBuff == "hp") ctx.drawImage(imgHp, x-8, y-80, 55, 55);
            else if (this.whatBuff == "def") ctx.drawImage(imgDef, x-8, y-80, 55, 50);
            else if (this.whatBuff == "exp") ctx.drawImage(imgExp, x-10, y-80, 50, 50);
            

            // 페이드 아웃 시작
            if (this.newSurvivor.isFading) {
                // 투명도를 시간에 따라 감소
                this.newSurvivor.opacity -= this.newSurvivor.fadeSpeed * deltaTime;

                // 투명도가 0 이하가 되면
                if (this.newSurvivor.opacity <= 0) {
                    this.isDraw = false;
                    this.deleteSurvivor(); 
                    return; 
                }
            }
        }
    }



    spawnSurvivor(player) {
            
        let x, y;
        
        do {

            // 대충 플레이어와 먼 곳에 소환
            if (Math.random() < 0.5) x = player.x + 1000;
            else x = player.x - 1000;
            if (Math.random() < 0.5) y = player.y + 1000;
            else y = player.y - 1000;

        } while ((x<700) || (x>4000) || (y<700) || (y>4000)) //월드 범위 내에 소환될 때까지 반복
        
        this.isSpawn = true;
        this.isBuffFinish = true;
        this.newSurvivor = new Survivor(x, y);
    }



    deleteSurvivor() {
        this.newSurvivor = null;
        this.isSpawn = false;
    }



    drawSuvivor(ctx) {
        if (this.newSurvivor != null)
            this.newSurvivor.draw(ctx);
    }

}