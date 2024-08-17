import { EntityManager } from "../../ecs/EntityManager";
import { System } from "../../ecs/SystemManager";
import { Player } from "../component/Player";
import { PlayerMovement } from "../component/PlayerMovements";
import { Transform } from "../component/Transform";
import { Tree } from "../component/Tree";

export class PlayerTreeCollisionSystem implements System {
    constructor(private readonly entityManager: EntityManager) {}

    public onUpdate(): void {
        this.entityManager.search(Player).forEach(({ entity }) => {
            const { position } = this.entityManager.getComponent(entity, Transform);

            for (const { entity: tree } of this.entityManager.search(Tree)) {
                const treePosition = this.entityManager.getComponent(tree, Transform).position;

                if (
                    position.x >= treePosition.x &&
                    position.x < treePosition.x + 1 &&
                    position.y >= treePosition.y &&
                    position.y < treePosition.y + 1
                ) {
                    const { direction } = this.entityManager.getComponent(entity, PlayerMovement);
                    position.x = treePosition.x - direction.x;
                    position.y = treePosition.y - direction.y;
                    break;
                }
            }
        });
    }
}
