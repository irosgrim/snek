const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const img = new Image();
img.src = `./src/imgs/${getRandomInt(0, 10)}.png`;
const obstcl = [];
img.addEventListener("load", () => {
    const loadImageCanvas = document.getElementById("load-image-canvas");
    const ctx2 = loadImageCanvas.getContext("2d");
    
    loadImageCanvas.width = img.width;
    loadImageCanvas.height = img.height;
    
    ctx2.drawImage(img, 0, 0);
    
    const imageData = ctx2.getImageData(0, 0, canvas.width, canvas.height);

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
            const y = parseInt(i / w, 10);
            const x = i - y * w;
            obstcl.push({x, y});
        }
        // get the position of pixel
    }
});


const score = document.getElementById("score");
const rockets = document.getElementById("rockets");
const fireBtn = document.getElementById("fire");
const speed = document.getElementById("speed");


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
        if (key === " " && (this.game.direction[0] || this.game.direction[1])) {
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
        this.height = gameObj.blockSize;
        this.width = gameObj.blockSize;
        this.game = gameObj;
    }
    update() {
        const [directionX, directionY] = this.game.direction;
        this.x += (directionX * (this.game.blockSize + (this.game.blockSize / 4)));
        this.y += (directionY * (this.game.blockSize + (this.game.blockSize / 4)));
    }
    draw(context) {
        context.fillStyle= "black";
        context.fillRect(this.x, this.y, this.height, this.width);
        context.strokeStyle = "white";
        context.lineWidth = 4;
        context.strokeRect(this.x, this.y, this.height, this.width);

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
            const s = +speed.innerText;
            // check food type
            switch (foodType) {
                case "normal":
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                        speed.innerText = s + 1;
                    }
                default:
                    break;
                case "decreaseSpeed":
                    if (this.game.stepInterval > 50) {
                        this.game.stepInterval += 2;
                        speed.innerText = s - 1;
                    } else {
                        this.game.stepInterval += 10;
                        speed.innerText = s - 5;
                    }
                    break;
                case "firePower":
                    this.game.availableBullets = 3;
                    // increase speed
                    if (this.game.stepInterval > 0) {
                        this.game.stepInterval -= 2;
                        speed.innerText = s + 1;
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
        this.bullets = [];
        this.snek = new Snek(this);
        this.food = new Food(this);
        this.input = new InputHandler(this);
        this.direction = [0, 0];
        this.availableBullets = 3;
        this.score = 0;
        this.timeToNextStep = 0;
        this.stepInterval = 200;
        this.lastTime = 0;
        
        
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
    draw(context) {
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
        speed.innerText = 0;
        this.createObstacles();
        this.update()
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
       
        if(game.timeToNextStep > game.stepInterval) {
            game.update();
            game.timeToNextStep = 0;
            score.innerText = game.score;
            rockets.innerText = game.availableBullets;
            if (game.availableBullets > 0 && (game.direction[0] || game.direction[1])) {
                fireBtn.style.visibility = "visible";
            } else {
                fireBtn.style.visibility = "hidden";
            }
            
        }
        window.requestAnimationFrame(gameLoop);
        
    }

    gameLoop();

})
