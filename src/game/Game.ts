import { EntityManager } from "../ecs/EntityManager";
import { SystemManager } from "../ecs/SystemManager";
import { playerArchetype } from "./archetype/Player";
import { treeArchetype } from "./archetype/Tree";
import { Input } from "./component/Input";
import { InputSystem } from "./system/InputSystem";
import { PlayerMovementSystem } from "./system/PlayerMovementsSystem";
import { PlayerTreeCollisionSystem } from "./system/PlayerTreeCollisionSystem";
import { matrixHeight, matrixWidth, RenderSystem } from "./system/RenderSystem";
import { TransformSystem } from "./system/TransformSystem";
import { TimeManager } from "./TimeManager";
import { randomInt } from "./Utils";

enum SystemGroup {
    PreGameLogic,
    GameLogic,
    Physics,
    PreRender,
    Render,
}

export class Game {
    private readonly systemManager: SystemManager;
    private readonly timeManager: TimeManager;

    constructor() {
        this.systemManager = new SystemManager();
        this.timeManager = new TimeManager();
        const entityManager = new EntityManager();

        this.systemManager.addSystem(new InputSystem(entityManager), SystemGroup.PreGameLogic);
        this.systemManager.addSystem(new PlayerMovementSystem(entityManager, this.timeManager), SystemGroup.GameLogic);
        this.systemManager.addSystem(new PlayerTreeCollisionSystem(entityManager), SystemGroup.Physics);
        this.systemManager.addSystem(new TransformSystem(entityManager), SystemGroup.PreRender);
        this.systemManager.addSystem(new RenderSystem(entityManager), SystemGroup.Render);

        entityManager.createEntity([Input]);

        for (let i = 0; i < 10; i++) {
            entityManager.createEntity(treeArchetype({ x: randomInt(0, matrixWidth), y: randomInt(0, matrixHeight) }));
        }

        entityManager.createEntity(playerArchetype({ x: matrixWidth / 2, y: matrixHeight / 2 }));
    }

    public run() {
        this.systemManager.enableSystem(InputSystem);
        this.systemManager.enableSystem(TransformSystem);
        this.systemManager.enableSystem(RenderSystem);
        this.systemManager.enableSystem(PlayerMovementSystem);
        this.systemManager.enableSystem(PlayerTreeCollisionSystem);

        this.gameLoop(window.performance.now());
    }

    private gameLoop(time: number) {
        this.timeManager.update(time);

        this.systemManager.update(SystemGroup.PreGameLogic);
        this.systemManager.update(SystemGroup.GameLogic);
        this.systemManager.update(SystemGroup.Physics);
        this.systemManager.update(SystemGroup.PreRender);
        this.systemManager.update(SystemGroup.Render);

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
