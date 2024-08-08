import { Vector2 } from "../Utils";

export class PlayerMovement {
    public direction: Vector2 = { x: 0, y: 0 };

    constructor(public speed: number = 0) {}
}
