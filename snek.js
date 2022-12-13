const distance = (pointA, pointB) => {
    return Math.floor(Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2));
}
const randomPosition = (columns = 26, rows = 30, blockSize = 10) => {
    const x = Math.floor(Math.random() * columns) * blockSize;
    const y = Math.floor(Math.random() * rows) * blockSize;
    return {x, y}
}

class Ui {
    update() {}
    grid(context) {
        context.lineWidth = 1;
        for (let x = 0; x < canvas.width; x+=10) {
            context.beginPath();
            context.strokeStyle = "#d3d3d3"
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        for (let y = 0; y < canvas.height; y += 10) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.stroke();
        }
    }
    draw(context) {
        this.grid(context);
    }
}

class InputHandler {
    constructor(game) {
        this.game = game;
        window.addEventListener("keydown", e => {
            e.preventDefault();
            this.changeDirection(e.key);
            this.shoot(e.key);
        });
    }
    changeDirection(key) {
        const directions = {
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
    shoot(key) {
        if (key === " ") {
            this.game.snek.shoot();
        }
    }
}

class Segment {
    constructor(x, y, height, width) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
}

class Bullet {
    constructor(x, y, h, w, direction, ) {
        this.x = x;
        this.y = y;
        this.gameHeight = h;
        this.gameWidth = w;
        this.direction = direction  || [1, 0];
        this.height = 8;
        this.width = 8;
    }
    update() {
        const [directionX, directionY] = this.direction;
        this.x += directionX * 40;
        this.y += directionY * 40;
    }
    draw(context) {
        context.fillStyle= "black";  
        context.fillRect(this.x, this.y, this.height, this.width);
        
    }
}

class Snek {
    constructor(game) {
        this.game = game;
        this.head = new Segment(50, 100, this.game.blockSize, this.game.blockSize);
        this.segments = [];
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
        head.x += x * this.game.blockSize;
        head.y += y * this.game.blockSize;

        if(head.x < 0) {
            head.x = this.game.width - 10;
        }
        if(head.x > this.game.width - 10) {
            head.x = 0;
        }
        if(head.y < 0) {
            head.y = this.game.height - 10;
        }
        if(head.y > this.game.height - 10) {
            head.y = 0;
        }
    }

    draw(context) {
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

    eat(food) {
        const head = this.head;
        const d = distance(food, head)
        if (d === 0) {
            this.segments.push(new Segment(food.x, food.y, head.height, head.width));
            food.randomPosition();
        }
    }

    die() {
        for (let i = 0; i < this.segments.length; i++) {
            const d = distance(this.head, this.segments[i]);
            if (d === 0) {
                console.log("ded");
                this.segments = [];
                this.game.direction = [0, 0];
            }
        }
    }
    shoot() {
        const {x, y} = this.head;
        if (this.game.bullets.length === 0) {
            this.game.bullets.push(new Bullet(x, y, this.game.height, this.game.width, this.game.direction, this.game.bullets.length - 1));
        }
    }
}
class Food {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.randomPosition();
    }
    update () {
        
    }
    draw(context) {
        context.fillStyle= "black";  
        context.rect(this.x, this.y, this.game.blockSize, this.game.blockSize);
        context.fill();
    }
    randomPosition() {
        let {x, y} = randomPosition();
        const snakeSegments = this.game.snek.segments;
        for (const segment of snakeSegments) {
            const d = distance({x, y}, segment);
            if (d === 0) {
                const newPosition = randomPosition();
                x = newPosition.x;
                y = newPosition.y;
            }
        }
        this.x = x;
        this.y = y;
    }
}

class Game {
    constructor(width, height, blockSize) {
        this.blockSize = blockSize
        this.width = width;
        this.height = height
        this.snek = new Snek(this);
        this.food = new Food(this);
        this.input = new InputHandler(this);
        this.direction = [1, 0];
        this.bullets = [];
    }
    update() {
        this.snek.update();
        this.food.update();
    }
    draw(context) {
        this.snek.draw(context);
        this.food.draw(context);
    }
}

window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas");
    const blockSize = 10;
    const rows = 30;
    const columns = 26;
    const ctx = canvas.getContext("2d");
    canvas.style.width = `${blockSize*columns}px`;
    canvas.style.height = `${blockSize*rows}px`;
    const scale = window.devicePixelRatio;

    canvas.width = Math.floor((columns * blockSize) * scale);
    canvas.height = Math.floor((rows * blockSize) * scale);


    const ui = new Ui();
    const game = new Game(canvas.width, canvas.height, blockSize);
    function animate () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ui.draw(ctx);
        
        game.update();
        game.draw(ctx);

        for(let i=0; i < game.bullets.length; i++) {
            const bullet = game.bullets[i];
            bullet.draw(ctx);
            bullet.update();
            
        }
        game.bullets = game.bullets.filter(b => {
            if(b.x > game.width || b.x < 0 || b.y < 0 || b.y > game.height) {
                return false
            }
            return true;
        })
        
    }

    window.setInterval(animate, 1000/10)


})
