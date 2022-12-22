import { Coord } from "../types";
import { distance, getRandomInt } from "../utils";
import { InputHandler } from "./inputHandler";
import { Bullet, Food, Snek } from "./snek";
import { Ui } from "./ui";

export class Game {
    blockSize = 10;
    rows = 0;
    columns = 0;
    obstacles: Obstacle[];
    bullets: Bullet[] = [];
    snek: Snek;
    food: Food;
    input: InputHandler;
    direction: [number, number] = [0, 0];
    availableBullets = 10;
    score = 0;
    timeToNextStep = 0;
    stepInterval = 150;
    lastTime = 0;
    canvas: HTMLCanvasElement;
    ui: Ui;

    constructor(rows: number, columns: number, blockSize: number, canvasElement: HTMLCanvasElement) {
        this.blockSize = blockSize
        this.rows = rows;
        this.columns = columns;
        this.obstacles = [];
        this.snek = new Snek(this);
        this.food = new Food(this);
        this.input = new InputHandler(this);
        this.canvas = canvasElement;
        this.ui = new Ui(canvasElement.width, canvasElement.height, this);
        this.createObstacles();
    }

    update() {
        this.ui.update();
        this.snek.update();
        this.food.update();
        for(const obstacle of this.obstacles) {
            obstacle.update();
        }
        for(let i=0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            bullet.update();
        }
       
        this.bullets = this.bullets.filter(b => {
            if(b.x > this.canvas.width || b.x < 0 || b.y < 0 || b.y > this.canvas.height) {
                return false
            }
            return true;
        })
    }
    draw(context: CanvasRenderingContext2D) {
        this.ui.draw(context);
        this.snek.draw(context);
        this.food.draw(context);
        for(const [index, obstacle] of this.obstacles.entries()) {
            obstacle.index = index;
            obstacle.draw(context);
        }
        for(let i=0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            bullet.draw(context); 
        }
    }
    
    getObstacleCoords() {
        const imgs = [
            new URL('../imgs/0.png', import.meta.url).href,
            new URL('../imgs/1.png', import.meta.url).href, 
            new URL('../imgs/2.png', import.meta.url).href,
            new URL('../imgs/3.png', import.meta.url).href,
            new URL('../imgs/4.png', import.meta.url).href,
            new URL('../imgs/5.png', import.meta.url).href,
            new URL('../imgs/6.png', import.meta.url).href,
        ]

        const img = new Image();
        img.src = imgs[getRandomInt(0, imgs.length - 1)];
        
        const loadImageCanvas = document.getElementById("load-image-canvas") as HTMLCanvasElement;
        const ctx2 = loadImageCanvas.getContext("2d");
        const obstcl: Coord[] = [];
        const coords: Promise<Coord[]> = new Promise(resolve => {
            img.addEventListener('load', () => {
                if (ctx2) {
                    loadImageCanvas.width = img.width;
                    loadImageCanvas.height = img.height;
                    ctx2.drawImage(img, 0, 0);
                    const imageData = ctx2.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                    const pixels = imageData.data;
                    const w = imageData.width;
                    const h = imageData.height;
                
                    const l = w * h;
                    for (let i = 0; i < l; i++) {
                        // get color of pixel
                        const r = pixels[i*4]; // Red
                        const g = pixels[i*4+1]; // Green
                        const b = pixels[i*4+2]; // Blue
                        const a = pixels[i*4+3]; // Alpha
                        // get black pixel coords
                        if (r === 0 && g === 0 && b === 0 && a === 255) {
                            const y = Math.trunc(i / w);
                            const x = i - (y * w);
                            obstcl.push({x, y});
                        }
                    }
                    resolve(obstcl);
                }
            });
        })
        return coords;
    }

    async createObstacles() {
        const obstcl = await this.getObstacleCoords();
        for (const o of obstcl) {
            this.obstacles.push(new Obstacle(o.x * this.blockSize, o.y * this.blockSize, this))
        }
    }
    
    reset() {
        this.snek.segments = [];
        this.direction = [0, 0];
        this.score = 0;
        this.stepInterval = 150;
        this.availableBullets = 10;
        this.bullets = [];
        this.snek.head.x += 5*this.blockSize;
        this.snek.head.y += 3*this.blockSize;
        this.ui.speed!.innerText = "0";
        this.obstacles = [];
        this.createObstacles();
        this.update()
    }
}

export class Obstacle {
    x = 0;
    y = 0;
    index = 0;
    game: Game;
    constructor(x: number, y: number, game: Game) {
        this.x = x;
        this.y = y;
        this.index = 0;
        this.game = game;
    }

    draw(context: CanvasRenderingContext2D) {
        context.lineWidth = 2;
        context.strokeStyle = "#000000";
        context.strokeRect(this.x, this.y, this.game.blockSize, this.game.blockSize);
    }

    update() {
        this.handleCollision();
    }

    handleCollision() {
        // snek head collision
        const d = distance(this.game.snek.head, this);
        if (d < this.game.blockSize) {
            this.game.reset();
        }
        // bullet collision
        for (const bullet of this.game.bullets) {
            const d2 = distance(bullet, this);
            if (d2 <= this.game.blockSize/2) {
                for (const [index, obs] of this.game.obstacles.entries()) {
                    const distanceToOtherObstacles = distance(this, obs);
                    if (distanceToOtherObstacles >= 0  && distanceToOtherObstacles <= this.game.blockSize * 2) {
                        this.game.obstacles.splice(index, 1);
                        this.game.score += 2;
                        this.game.bullets = [];
                    }
                } 
            }
        }
    }
}

