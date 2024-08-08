import { Player } from "../component/Player";
import { PlayerMovement } from "../component/PlayerMovements";
import { Renderer } from "../component/Renderer";
import { Transform } from "../component/Transform";
import { Vector2 } from "../Utils";

export const playerArchetype = (position: Vector2) => [
    new Transform(position),
    new Renderer(`<span style="color: #FF0000;">@</span>`),
    // new Renderer("@"),
    new PlayerMovement(6),
    Player,
];
