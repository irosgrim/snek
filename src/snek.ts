import { Coord, DirectionKeys } from "./types";
import { getRandomInt } from "./utils";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const img = new Image();
img.src = `./src/imgs/${getRandomInt(0, 10)}.png`;
const obstcl: Coord[] = [];

img.addEventListener("load", () => {
    const loadImageCanvas = document.getElementById("load-image-canvas") as HTMLCanvasElement;
    const ctx2 = loadImageCanvas && loadImageCanvas.getContext("2d");
    
    if (ctx2) {
        loadImageCanvas.width = img.width;
        loadImageCanvas.height = img.height;
        ctx2.drawImage(img, 0, 0);
        const imageData = ctx2.getImageData(0, 0, loadImageCanvas.width, loadImageCanvas.height);
    
        const pixels = imageData.data;
        const w = imageData.width;
        const h = imageData.height;
    
        const l = w * h;
        for (let i = 0; i < l; i++) {
            // get color of pixel
            const r = pixels[i*4]; // Red
            const g = pixels[i*4+1]; // Green
            const b = pixels[i*4+2]; // Blue
            // const a = pixels[i*4+3]; // Alpha
            if (r === 0 && g === 0 && b === 0) {
                const y = (i / w);
                const x = i - (y * w);
                obstcl.push({x, y});
            }
        }
    }
});


const score = document.getElementById("score");
const rockets = document.getElementById("rockets");
const fireBtn = document.getElementById("fire");
const speed = document.getElementById("speed");

if (fireBtn) {
    fireBtn.addEventListener("click", (e) => {
        console.log("clicked")
        window.dispatchEvent(new KeyboardEvent("keydown", {key: " "}))
    })
}
const distance = (pointA: {x: number, y: number}, pointB: {x: number, y: number}) => {
    return Math.floor(Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2));
}
const randomPosition = (rows = 30, columns = 26, blockSize = 10) => {
    const x = Math.floor(Math.random() * columns) * blockSize;
    const y = Math.floor(Math.random() * rows) * blockSize;
    return {x, y}
}

class Ui {
    blockSize = 10;
    constructor(blockSize?: number) {
        this.blockSize = blockSize || 10;
    }
    update() {
        this.blockSize = this.blockSize;
    }
    grid(context: CanvasRenderingContext2D) {
        context.lineWidth = 1;
        for (let x = 0; x < canvas!.width; x += this.blockSize) {
            context.beginPath();
            context.strokeStyle = "#d3d3d3"
            context.moveTo(x, 0);
            context.lineTo(x, canvas!.height);
            context.stroke();
        }
        for (let y = 0; y < canvas!.height; y += this.blockSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas!.width, y);
            context.stroke();
        }
    }
    draw(context: CanvasRenderingContext2D) {
        this.grid(context);
    }
}

class InputHandler {
    game : Game;
    constructor(game: Game) {
        this.game = game;
        window.addEventListener("keydown", e => {
            e.preventDefault();
            this.changeDirection(e.key as DirectionKeys);
            this.shoot(e.key);
        });
    }
    changeDirection(key: DirectionKeys) {
        const directions: {[key: string]: [number, number]} = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
        }
        if (directions[key]) {
            const [x, y] = this.game.direction;
            let allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
            // if snake already moves, it can't go back
            if (x) {
                allowedKeys = allowedKeys.filter(x => !["ArrowLeft", "ArrowRight"].includes(x))
            }
            if (y) {
                allowedKeys = allowedKeys.filter(x => !["ArrowUp", "ArrowDown"].includes(x))
            }
            if (allowedKeys.includes(key)) {
                this.game.direction = directions[key];
            }
        }
    }
    shoot(key: string) {
        if (key === " " && (this.game.direction[0] || this.game.direction[1])) {
            this.game.snek.shoot();
        }
    }
}

class Segment {
    x = 0;
    y = 0;
    height = 0;
    width = 0;
    constructor(x: number, y: number, height: number, width: number) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
}

class Bullet {
    x = 0;
    y = 0;
    height = 0;
    width = 0;
    game: {direction: [number, number], blockSize: number};
    constructor(x: number, y: number, game: {direction: [number, number], blockSize: number} ) {
        this.x = x;
        this.y = y;
        this.height = game.blockSize;
        this.width = game.blockSize;
        this.game = game;
    }
    update() {
        const [directionX, directionY] = this.game.direction!;
        this.x += (directionX * (this.game.blockSize + (this.game.blockSize / 4)));
        this.y += (directionY * (this.game.blockSize + (this.game.blockSize / 4)));
    }
    draw(context: CanvasRenderingContext2D) {
        context.fillStyle= "black";
        context.fillRect(this.x, this.y, this.height, this.width);
        context.strokeStyle = "white";
        context.lineWidth = 4;
        context.strokeRect(this.x, this.y, this.height, this.width);

    }
}

class Obstacle {
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
    randomPosition() {}
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
                this.game.score += 2;
                this.game.obstacles.splice(this.index, 1);
                this.game.bullets = [];
            }
        }
    }
}

class Snek {
    game: Game;
    speed = 0;
    head: Segment;
    segments: Segment[] = [];
    constructor(game: Game) {
        this.game = game;
        this.head = new Segment(5 * this.game.blockSize, 10 * this.game.blockSize, this.game.blockSize, this.game.blockSize);
    }

    update() {
        const [x, y] = this.game.direction;
        this.die();
        this.eat(this.game.food);
        const head = this.head;
        for (let i = 0;  i < this.segments.length;  i++) {
            if(this.segments.length === 1) {
                this.segments[i] = {...head};
            } else {
                this.segments[i] = {...this.segments[i + 1]};
            }
        }
        if (this.segments.length > 1) {
            this.segments[this.segments.length - 1] = new Segment(head.x, head.y, head.height, head.width)
        }
        head.x += (x * this.game.blockSize);
        head.y += (y * this.game.blockSize);

        if(head.x < 0) {
            head.x = this.game.width - this.game.blockSize;
        }
        if(head.x > this.game.width - this.game.blockSize) {
            head.x = 0;
        }
        if(head.y < 0) {
            head.y = this.game.height - this.game.blockSize;
        }
        if(head.y > this.game.height - this.game.blockSize) {
            head.y = 0;
        }
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = "#ffffff";
        context.strokeStyle = "#000000";
        for(let i = 0; i < this.segments.length; i++) {
            context.lineWidth = 4;
            context.fillRect(this.head.x, this.head.y, this.head.height, this.head.width);
            context.strokeRect(this.segments[i].x, this.segments[i].y, this.segments[i].height, this.segments[i].width);
        }
        context.lineWidth = 4;
        context.fillRect(this.head.x, this.head.y, this.head.height, this.head.width);
        context.strokeRect(this.head.x, this.head.y, this.head.height, this.head.width);
    }

    eat(food: Food) {
        const head = this.head;
        const d = distance({x: food.x, y: food.y}, {x: head.x, y: head.y});
        const foodType = food.type;
        // touched food
        if (d === 0) {
            this.segments.push(new Segment(food.x, food.y, head.height, head.width));
            this.game.score += 1;
            food.randomPosition();
            const s = +speed!.innerText;
            // check food type
            switch (foodType) {
                case "normal":
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                        speed!.innerText = (s + 1).toString();
                    }
                default:
                    break;
                case "decreaseSpeed":
                    if (this.game.stepInterval > 50) {
                        this.game.stepInterval += 2;
                        speed!.innerText = (s - 1).toString();
                    } else {
                        this.game.stepInterval += 10;
                        speed!.innerText = (s - 5).toString();
                    }
                    break;
                case "firePower":
                    this.game.availableBullets = 3;
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                        speed!.innerText = (s + 1).toString();
                    }
                    break;
            }
        }
    }

    die() {
        for (let i = 0; i < this.segments.length; i++) {
            const d = distance(this.head, this.segments[i]);
            if (d === 0) {
                this.game.reset();
            }
        }
    }
    shoot() {
        const {x, y} = this.head;
        if (this.game.bullets.length === 0) {
            const gameObj = {
                direction: this.game.direction,
                blockSize: this.game.blockSize,
            }
            if (this.game.availableBullets > 0) {
                this.game.bullets.push(new Bullet(x, y, gameObj));
                this.game.availableBullets -= 1;
            }
        }
    }
}
class Food {
    game: Game;
    x = 0;
    y = 0;
    type = "normal";
    constructor(game: Game) {
        this.game = game;
        this.randomPosition();
    }
    update () {
         // check bullet impact
        const bullets = this.game.bullets;
        for (const bullet of bullets) {
            const d = distance({x: this.x, y: this.y}, bullet);
            if (d <= 10) {
                this.randomPosition();
                this.game.bullets = [];
            }
        }
    }
    draw(context: CanvasRenderingContext2D) {
        switch (this.type) {
            case "normal":
            default:
                context.fillStyle= "black";
                context.rect(this.x, this.y, this.game.blockSize, this.game.blockSize)
                context.fill();
                break;
            case "decreaseSpeed":
                context.fillStyle = "green";
                context.rect(this.x, this.y, this.game.blockSize, this.game.blockSize)
                context.fill();
                break;
            case "firePower":
                // context.fillStyle = "red";
                context.strokeStyle = "red";
                context.strokeRect(this.x, this.y, this.game.blockSize, this.game.blockSize)
                // context.fill();
                break;
        }
    }
    randomPosition() {
        let {x, y} = randomPosition(this.game.rows, this.game.columns, this.game.blockSize);
        const snakeSegments = this.game.snek.segments;
        const food = ["normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "normal", "firePower", "decreaseSpeed"];
        this.type = food[Math.floor(Math.random() * ((food.length - 1) - 0 + 1)) + 0];
        // avoid spawning food on snake segments
        for (const segment of snakeSegments) {
            const d = distance({x, y}, segment);
            if (d === 0) {
                const newPosition = randomPosition(this.game.rows, this.game.columns, this.game.blockSize);
                x = newPosition.x;
                y = newPosition.y;
            }
        }
        // avoid spawning food on obstacles
        const obstacles = this.game.obstacles;
        for (const obstacle of obstacles) {
            const d = distance({x, y}, obstacle);
            if (d === 0) {
                const newPosition = randomPosition(this.game.rows, this.game.columns, this.game.blockSize);
                x = newPosition.x;
                y = newPosition.y;
            }
        }
        this.x = x;
        this.y = y;
    }
}

class Game {
    blockSize = 10;
    rows = 0;
    columns = 0;
    width = 0;
    height = 0;
    obstacles: Obstacle[] = [];
    bullets: Bullet[] = [];
    snek: Snek;
    food: Food;
    input: InputHandler;
    direction: [number, number] = [0, 0];
    availableBullets = 3;
    score = 0;
    timeToNextStep = 0;
    stepInterval = 200;
    lastTime = 0;
    constructor(rows: number, columns: number, width: number, height: number, blockSize: number) {
        this.blockSize = blockSize
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.height = height
        this.obstacles = this.createObstacles();
        this.snek = new Snek(this);
        this.food = new Food(this);
        this.input = new InputHandler(this);
    }
    update() {
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
            if(b.x > this.width || b.x < 0 || b.y < 0 || b.y > this.height) {
                return false
            }
            return true;
        })
    }
    draw(context: CanvasRenderingContext2D) {
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
    
    createObstacles() {
        const obs = [];
        for (const o of obstcl) {
            obs.push(new Obstacle(o.x * this.blockSize, o.y * this.blockSize, this))
        }
        return obs;
    }
    reset() {
        this.snek.segments = [];
        this.direction = [0, 0];
        this.score = 0;
        this.stepInterval = 100;
        this.availableBullets = 0;
        this.bullets = [];
        this.snek.head.x += 5*this.blockSize;
        this.snek.head.y += 3*this.blockSize;
        speed!.innerText = "0";
        this.createObstacles();
        this.update()
    }
}

window.addEventListener("load", function() {
    const blockSize = 12;
    const rows = 30;
    const columns = 26;
    const ctx = canvas.getContext("2d");
    canvas.style.width = `${blockSize*columns}px`;
    canvas.style.height = `${blockSize*rows}px`;
    const scale = window.devicePixelRatio;

    canvas.width = Math.floor((columns * blockSize) * scale);
    canvas.height = Math.floor((rows * blockSize) * scale);


    const ui = new Ui(blockSize);
    const game = new Game(rows, columns, canvas.width, canvas.height, blockSize);

    function gameLoop (timestamp = 0) {
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        let deltaTime = timestamp - game.lastTime;
        game.lastTime = timestamp;
        game.timeToNextStep += deltaTime;
        ui.draw(ctx!);
        game.draw(ctx!);
       
        if(game.timeToNextStep > game.stepInterval) {
            game.update();
            game.timeToNextStep = 0;
            score!.innerText = game.score.toString();
            rockets!.innerText = game.availableBullets.toString();
            if (game.availableBullets > 0 && (game.direction[0] || game.direction[1])) {
                fireBtn!.style.visibility = "visible";
            } else {
                fireBtn!.style.visibility = "hidden";
            }
            
        }
        window.requestAnimationFrame(gameLoop);
        
    }

    gameLoop();

})
