export type DirectionKeys = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";
export type Coord = {
  x: number;
  y: number;
}

export interface JoystickEvent extends CustomEvent {
    detail: {
        move: Coord;
    }
}