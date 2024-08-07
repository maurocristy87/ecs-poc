import { PlayerMovement } from "../component/PlayerMovements";
import { Renderer } from "../component/Renderer";
import { Transform } from "../component/Transform";
import { Vector2 } from "../Utils";

export const playerArchetype = (position: Vector2) => [
    new Transform(position),
    new Renderer("@"),
    new PlayerMovement(6),
];
