import { distance, randomPosition } from "../utils";
import { Game } from "./game";

export class Segment {
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

export class Bullet {
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


export class Snek {
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
            head.x = this.game.canvas.width - this.game.blockSize;
        }
        if(head.x > this.game.canvas.width - this.game.blockSize) {
            head.x = 0;
        }
        if(head.y < 0) {
            head.y = this.game.canvas.height - this.game.blockSize;
        }
        if(head.y > this.game.canvas.height - this.game.blockSize) {
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
            const s = +this.game.ui.speed!.innerText;
            // check food type
            switch (foodType) {
                case "normal":
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                        this.game.ui.speed!.innerText = (s + 1).toString();
                    }
                default:
                    break;
                case "decreaseSpeed":
                    if (this.game.stepInterval > 50) {
                        this.game.stepInterval += 2;
                        this.game.ui.speed!.innerText = (s - 1).toString();
                    } else {
                        this.game.stepInterval += 10;
                        this.game.ui.speed!.innerText = (s - 5).toString();
                    }
                    break;
                case "firePower":
                    this.game.availableBullets += 5;
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                        this.game.ui.speed!.innerText = (s + 1).toString();
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

export class Food {
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
                context.strokeStyle = "red";
                context.strokeRect(this.x, this.y, this.game.blockSize, this.game.blockSize)
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
