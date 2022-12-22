import "./style.css";
import VirtualJoyStick from "./joystick";
import { Game } from "./game/game";

const joy = new VirtualJoyStick();
joy.init();

window.addEventListener("v-joystick", (e: any) => {
    const { x, y } = e.detail.move;
    if (y < 0) {
        window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}))
    }
    if (y > 0) {
        window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}))
    }
    if (x < 0) {
        window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}))
    }
    if (x > 0) {
        window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}))
    }
})

const fireBtn = document.getElementById("fire");

if (fireBtn) {
    fireBtn.addEventListener("click", () => {
        window.dispatchEvent(new KeyboardEvent("keydown", {key: " "}))
    })
}

const loadGame = () => {
    const blockSize = 12;
    const rows = 30;
    const columns = 26;
    
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.style.width = `${blockSize*columns}px`;
    canvas.style.height = `${blockSize*rows}px`;
    
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio;

    canvas.width = Math.floor((columns * blockSize) * scale);
    canvas.height = Math.floor((rows * blockSize) * scale);
    const game = new Game(rows, columns, blockSize, canvas);

    const gameLoop = (timestamp = 0) => {
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        let deltaTime = timestamp - game.lastTime;
        game.lastTime = timestamp;
        game.timeToNextStep += deltaTime;
        game.draw(ctx!);
       
        if(game.timeToNextStep > game.stepInterval) {
            game.update();
            game.timeToNextStep = 0;
            if (game.availableBullets > 0 && (game.direction[0] || game.direction[1])) {
                fireBtn!.style.visibility = "visible";
            } else {
                fireBtn!.style.visibility = "hidden";
            }
        }
        window.requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

window.addEventListener("load", loadGame);
