import { Vector2 } from "./utils";

export class Transform {
    position: Vector2 = { x: 0, y: 0 };
}

export class Movement {
    speed: number = 0;
}

export class Renderer {
    symbol: string = "";
}

export class InputController {
    axis: Vector2 = { x: 0, y: 0 };
}
