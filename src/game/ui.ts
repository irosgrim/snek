import { Game } from "./game";

export class Ui {
    canvasWidth = 0;
    canvasHeight = 0;
    speed: HTMLElement | null = null;
    score: HTMLElement | null = null;
    rockets: HTMLElement | null = null;
    game: Game;
    constructor(canvasWidth: number, canvasHeight: number, game: Game) {
        this.game = game;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.score = document.getElementById("score");
        this.speed = document.getElementById("speed");
        this.rockets = document.getElementById("rockets");
    }
    
    update() {
        this.score!.innerText = this.game.score.toString();
        this.rockets!.innerText = this.game.availableBullets.toString();
    }

    grid(context: CanvasRenderingContext2D) {
        context.lineWidth = 1;
        for (let x = 0; x < this.canvasWidth; x += this.game.blockSize) {
            context.beginPath();
            context.strokeStyle = "#d3d3d3"
            context.moveTo(x, 0);
            context.lineTo(x, this.canvasHeight);
            context.stroke();
        }
        for (let y = 0; y < this.canvasHeight; y += this.game.blockSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(this.canvasWidth, y);
            context.stroke();
        }
    }

    draw(context: CanvasRenderingContext2D) {
        this.grid(context);
    }
}
