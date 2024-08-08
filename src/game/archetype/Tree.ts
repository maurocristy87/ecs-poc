import { Renderer } from "../component/Renderer";
import { Transform } from "../component/Transform";
import { Tree } from "../component/Tree";
import { Vector2 } from "../Utils";

export const treeArchetype = (position: Vector2) => [new Transform(position), new Renderer("&#8607;"), Tree];
