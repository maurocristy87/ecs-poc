import { IEntityManager } from "../../ecs/EntityManager";
import { postGameLogicSystem, System } from "../../ecs/SystemManager";
import { Transform } from "../component/Transform";
import { matrixHeight, matrixWidth } from "./RenderSystem";

@postGameLogicSystem()
export class TransformSystem implements System {
    constructor(private readonly entityManager: IEntityManager) {}

    public onCreate(): void {}
    public onEnabled(): void {}
    public onDisabled(): void {}
    public onDestroy(): void {}

    public onUpdate(): void {
        this.entityManager.search(Transform).forEach(({ component: { position } }) => {
            position.x = Math.max(0, Math.min(matrixWidth - 1, position.x));
            position.y = Math.max(0, Math.min(matrixHeight - 1, position.y));
        });
    }
}
