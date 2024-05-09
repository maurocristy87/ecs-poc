import { InputController, Movement, Renderer, Transform } from "./components";
import { System } from "./ecs";

export class RenderingSystem extends System {
    private matrix: string[][] = [];

    public onUpdate(): void {
        this.resetMatrix();

        this.entityManager.search(Renderer).forEach(({ component, entity }) => {
            const { position } = this.entityManager.getComponent(entity, Transform);
            this.matrix[15 - Math.floor(position.y)][Math.floor(position.x)] = component.symbol;
        });

        this.renderMatrix();
    }

    private resetMatrix(): void {
        for (let y = 0; y < 16; y++) {
            this.matrix[y] = [];
            for (let x = 0; x < 16; x++) {
                this.matrix[y][x] = ".";
            }
        }
    }

    private renderMatrix(): void {
        document.querySelector<HTMLDivElement>("#app").innerHTML = this.matrix.map((v) => v.join(" ")).join("<br />");
    }
}

export class InputControllerSystem extends System {
    private inputController: InputController;
    private keyMap: Map<string, boolean> = new Map<string, boolean>();

    public onCreate(): void {
        this.inputController = this.entityManager.search(InputController)[0].component;

        document.addEventListener("keydown", this.eventHandler);
        document.addEventListener("keyup", this.eventHandler);
    }

    private eventHandler = (event: KeyboardEvent) => {
        if (event.type === "keydown") this.keyMap.set(event.code, true);
        if (event.type === "keyup") this.keyMap.set(event.code, false);
    };

    public onUpdate(): void {
        this.inputController.axis.x = this.keyMap.get("KeyA") ? -1 : this.keyMap.get("KeyD") ? 1 : 0;
        this.inputController.axis.y = this.keyMap.get("KeyS") ? -1 : this.keyMap.get("KeyW") ? 1 : 0;
    }
}

export class TransformSystem extends System {
    public onUpdate(): void {
        this.entityManager.search(Transform).forEach(({ component: { position } }) => {
            position.x = Math.max(0, Math.min(15, position.x));
            position.y = Math.max(0, Math.min(15, position.y));
        });
    }
}

export class MovementSystem extends System {
    private inputController: InputController;
    private playerTransform: Transform;
    private playerMovement: Movement;

    public onCreate(): void {
        const playerMovement = this.entityManager.search(Movement)[0];

        this.playerMovement = playerMovement.component;
        this.playerTransform = this.entityManager.getComponent(playerMovement.entity, Transform);
        this.inputController = this.entityManager.search(InputController)[0].component;
    }

    public onUpdate(): void {
        this.playerTransform.position.x +=
            this.inputController.axis.x * this.playerMovement.speed * this.timeManager.deltaTime;
        this.playerTransform.position.y +=
            this.inputController.axis.y * this.playerMovement.speed * this.timeManager.deltaTime;
    }
}
