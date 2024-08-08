import { EntityManager } from "../../ecs/EntityManager";
import { System } from "../../ecs/SystemManager";
import { Input } from "../component/Input";

export class InputSystem implements System {
    private keyMap: Map<string, boolean> = new Map<string, boolean>();

    constructor(private readonly entityManager: EntityManager) {}

    public onEnabled(): void {}
    public onDisabled(): void {}
    public onDestroy(): void {}

    public onCreate(): void {
        document.addEventListener("keydown", this.eventHandler);
        document.addEventListener("keyup", this.eventHandler);
    }

    private eventHandler = (event: KeyboardEvent) => {
        if (event.type === "keydown") this.keyMap.set(event.code, true);
        if (event.type === "keyup") this.keyMap.set(event.code, false);
    };

    public onUpdate(): void {
        this.entityManager.search(Input).forEach(({ component: input }) => {
            input.axis.x = this.keyMap.get("KeyA") ? -1 : this.keyMap.get("KeyD") ? 1 : 0;
            input.axis.y = this.keyMap.get("KeyS") ? -1 : this.keyMap.get("KeyW") ? 1 : 0;
        });
    }
}
