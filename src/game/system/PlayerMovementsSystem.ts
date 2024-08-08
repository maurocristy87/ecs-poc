import { EntityManager } from "../../ecs/EntityManager";
import { System } from "../../ecs/SystemManager";
import { Input } from "../component/Input";
import { PlayerMovement } from "../component/PlayerMovements";
import { Transform } from "../component/Transform";
import { TimeManager } from "../TimeManager";

export class PlayerMovementSystem implements System {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly timeManager: TimeManager,
    ) {}

    public onCreate(): void {}
    public onEnabled(): void {}
    public onDisabled(): void {}
    public onDestroy(): void {}

    public onUpdate(): void {
        this.entityManager.search(PlayerMovement).forEach(({ entity, component: playerMovement }) => {
            const transform = this.entityManager.getComponent(entity, Transform);
            const input = this.entityManager.search(Input)[0].component;

            playerMovement.direction.x = input.axis.x;
            playerMovement.direction.y = input.axis.y;

            transform.position.x += playerMovement.direction.x * playerMovement.speed * this.timeManager.deltaTime;
            transform.position.y += playerMovement.direction.y * playerMovement.speed * this.timeManager.deltaTime;
        });
    }
}
