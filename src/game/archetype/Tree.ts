import { Component } from "../../ecs/EntityManager";
import { Renderer } from "../component/Renderer";
import { Transform } from "../component/Transform";
import { Vector2 } from "../Utils";

export const treeArchetype = (position: Vector2): Component[] => [new Transform(position), new Renderer("&#8607;")];
