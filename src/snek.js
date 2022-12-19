const score = document.getElementById("score");
const rockets = document.getElementById("rockets");
const fireBtn = document.getElementById("fire");


fireBtn.addEventListener("click", (e) => {
    console.log("clicked")
    window.dispatchEvent(new KeyboardEvent("keydown", {key: " "}))
})
const distance = (pointA, pointB) => {
    return Math.floor(Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2));
}
const randomPosition = (rows = 30, columns = 26, blockSize = 10) => {
    const x = Math.floor(Math.random() * columns) * blockSize;
    const y = Math.floor(Math.random() * rows) * blockSize;
    return {x, y}
}

const obstacles = [
    [
        [15, 15],
        [15, 16],
        [15, 17],
        [15, 18],
        [15, 19],
        [15, 20],
    ],
    [
        [25, 15],
        [25, 16],
        [25, 17],
        [25, 18],
        [25, 19],
        [25, 20],
        [25, 21],
        [25, 22],
        [24, 22],
        [23, 22],
        [22, 22],
    ],
     [
        [15, 26],
        [16, 26],
        [17, 26],
        [18, 26],
        [19, 26],
        [20, 26],
        [21, 26],
        [22, 26],
        [23, 26],
        [24, 26],
        [25, 26],
    ],
    [
        [25, 26],
        [26, 26],
        [27, 26],
        [28, 26],
        [29, 26],
        [30, 26],
        [31, 26],
        [32, 26],
        [32, 27],
        [32, 28],
        [32, 29],
    ],
    [
        [2, 26],
        [3, 26],
        [4, 26],
        [5, 26],
        [6, 26],
        [7, 26],
        [8, 26],
        [9, 26],
        [10, 27],
        [11, 28],
        [12, 29],
    ]

];

class Ui {
    constructor(blockSize = 10) {
        this.blockSize = blockSize;
    }
    update() {
        this.blockSize = this.blockSize;
    }
    grid(context) {
        context.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += this.blockSize) {
            context.beginPath();
            context.strokeStyle = "#d3d3d3"
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();
        }
        for (let y = 0; y < canvas.height; y += this.blockSize) {
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
    constructor(x, y, gameObj ) {
        this.x = x;
        this.y = y;
        this.height = 8;
        this.width = 8;
        this.game = gameObj;
    }
    update(deltaTime, stepInterval) {
        const [directionX, directionY] = this.game.direction;
        console.log(this.game.blockSize);
        const syncStep = stepInterval/100;
        this.x += (directionX * ((syncStep * 20)/this.game.blockSize));
        this.y += (directionY * ((syncStep * 20)/this.game.blockSize));
    }
    draw(context) {
        context.fillStyle= "black";  
        context.fillRect(this.x, this.y, this.height, this.width);
    }
}

class Obstacle {
    constructor(x, y, gameObj) {
        this.x = x;
        this.y = y;
        this.index = 0;
        this.game = gameObj;
    }

    draw(context) {
        context.lineWidth = 2;
        context.strokeStyle = "#000000";
        context.strokeRect(this.x, this.y, this.game.blockSize, this.game.blockSize);
    }
    update() {
        this.handleCollision();
    }
    randomPosition() {}
    handleCollision() {
        const d = distance(this.game.snek.head, this);
        if (d <= 0) {
            this.game.reset();
        }
        for (const bullet of this.game.bullets) {
            const d2 = distance(bullet, this);
            if (d2 === 0) {
                this.game.obstacles.splice(this.index, 1);
                this.game.bullets = [];
            }
        }
    }
}

class Snek {
    constructor(game) {
        this.game = game;
        this.speed = 0;
        this.head = new Segment(5 * this.game.blockSize, 10 * this.game.blockSize, this.game.blockSize, this.game.blockSize);
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
        const d = distance(food, head);
        const foodType = food.type;
        // touched food
        if (d === 0) {
            this.segments.push(new Segment(food.x, food.y, head.height, head.width));
            this.game.score += 1;
            food.randomPosition();

            // check food type
            switch (foodType) {
                case "normal":
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                    }
                default:
                    break;
                case "decreaseSpeed":
                    if (this.game.stepInterval > 50) {
                        this.game.stepInterval += 1;
                    } else {
                        this.game.stepInterval += 2;
                    }
                    break;
                case "firePower":
                    this.game.availableBullets = 3;
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
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
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.type = "normal";
        this.randomPosition();
    }
    update () {
        
    }
    draw(context) {
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
    constructor(rows, columns, width, height, blockSize) {
        this.blockSize = blockSize
        this.rows = rows;
        this.columns = columns;
        this.width = width;
        this.height = height
        this.obstacles = this.createObstacles();
        this.snek = new Snek(this);
        this.food = new Food(this);
        this.input = new InputHandler(this);
        this.direction = [1, 0];
        this.availableBullets = 0;
        this.bullets = [];
        this.score = 0;
        this.timeToNextStep = 0;
        this.stepInterval = 100;
        this.lastTime = 0;
        
        
    }
    update() {
        this.snek.update();
    }
    draw(context) {
        this.snek.draw(context);
        this.food.draw(context);
    }
    createObstacles() {
        const firstObstacleIndex = Math.floor(Math.random() * ((obstacles.length - 1) - 0 + 1)) + 0;
        let secondObstacleIndex = Math.floor(Math.random() * ((obstacles.length - 1) - 0 + 1)) + 0;

        while (firstObstacleIndex === secondObstacleIndex) {
            secondObstacleIndex = Math.floor(Math.random() * ((obstacles.length - 1) - 0 + 1)) + 0;
        }
        return [...obstacles[firstObstacleIndex].map(o => new Obstacle(o[0] * this.blockSize, o[1] * this.blockSize, this)), ...obstacles[secondObstacleIndex].map(o => new Obstacle(o[0] * this.blockSize, o[1] * this.blockSize, this))]
    }
    reset() {
        this.snek.segments = [];
        this.direction = [0, 0];
        this.score = 0;
        this.stepInterval = 100;
        this.availableBullets = 0;
        this.bullets = [];
    }
}

window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas");
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let deltaTime = timestamp - game.lastTime;
        game.lastTime = timestamp;
        game.timeToNextStep += deltaTime;
        ui.draw(ctx);
        game.draw(ctx);
        for(const [index, obstacle] of game.obstacles.entries()) {
            obstacle.index = index;
            obstacle.draw(ctx);
        }
        if(game.timeToNextStep > game.stepInterval) {
            game.update();
            game.timeToNextStep = 0;
            score.innerText = game.score;
            rockets.innerText = game.availableBullets;
            if (game.availableBullets > 0) {
                fireBtn.style.visibility = "visible";
            } else {
                fireBtn.style.visibility = "hidden";
            }
            
        }
        for(let i=0; i < game.bullets.length; i++) {
            const bullet = game.bullets[i];
            bullet.update(game.timeToNextStep, game.stepInterval);
            bullet.draw(ctx); 
            
        }
        for(const obstacle of game.obstacles) {
            obstacle.update();
        }
        game.bullets = game.bullets.filter(b => {
            if(b.x > game.width || b.x < 0 || b.y < 0 || b.y > game.height) {
                return false
            }
            return true;
        })
        window.requestAnimationFrame(gameLoop);
        
    }

    gameLoop();

})
