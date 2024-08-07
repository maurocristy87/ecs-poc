import { IEntityManager } from "../../ecs/EntityManager";
import { gameLogicSystem, System } from "../../ecs/SystemManager";
import { Input } from "../component/Input";
import { PlayerMovement } from "../component/PlayerMovements";
import { Transform } from "../component/Transform";
import { ITimeManager } from "../TimeManager";

@gameLogicSystem()
export class PlayerMovementSystem implements System {
    constructor(
        private readonly entityManager: IEntityManager,
        private readonly timeManager: ITimeManager,
    ) {}

    public onCreate(): void {}
    public onEnabled(): void {}
    public onDisabled(): void {}
    public onDestroy(): void {}

    public onUpdate(): void {
        this.entityManager.search(PlayerMovement).forEach(({ entity, component: playerMovement }) => {
            const transform = this.entityManager.getComponent(entity, Transform);
            const input = this.entityManager.search(Input)[0].component;

            transform.position.x += input.axis.x * playerMovement.speed * this.timeManager.deltaTime;
            transform.position.y += input.axis.y * playerMovement.speed * this.timeManager.deltaTime;
        });
    }
}
