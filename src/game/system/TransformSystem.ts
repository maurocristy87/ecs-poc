import { EntityManager } from "../../ecs/EntityManager";
import { System } from "../../ecs/SystemManager";
import { Transform } from "../component/Transform";
import { matrixHeight, matrixWidth } from "./RenderSystem";

export class TransformSystem implements System {
    constructor(private readonly entityManager: EntityManager) {}

    public onUpdate(): void {
        this.entityManager.search(Transform).forEach(({ component: { position } }) => {
            position.x = Math.max(0, Math.min(matrixWidth - 1, position.x));
            position.y = Math.max(0, Math.min(matrixHeight - 1, position.y));
        });
    }
}
