import { DirectionKeys } from "../types";
import { Game } from "./game";

export class InputHandler {
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
