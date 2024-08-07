import { EntityManager } from "../ecs/EntityManager";
import { ISystemManager, SystemGroup, SystemManager } from "../ecs/SystemManager";
import { playerArchetype } from "./archetype/Player";
import { treeArchetype } from "./archetype/Tree";
import { Input } from "./component/Input";
import { InputSystem } from "./system/InputSystem";
import { PlayerMovementSystem } from "./system/PlayerMovementsSystem";
import { matrixHeight, matrixWidth, RenderSystem } from "./system/RenderSystem";
import { TransformSystem } from "./system/TransformSystem";
import { ITimeManager, TimeManager } from "./TimeManager";
import { randomInt } from "./Utils";

export class Game {
    private readonly systemManager: ISystemManager;
    private readonly timeManager: ITimeManager;

    constructor() {
        this.systemManager = new SystemManager();
        this.timeManager = new TimeManager();
        const entityManager = new EntityManager();

        this.systemManager.addSystem(new InputSystem(entityManager));
        this.systemManager.addSystem(new TransformSystem(entityManager));
        this.systemManager.addSystem(new RenderSystem(entityManager));
        this.systemManager.addSystem(new PlayerMovementSystem(entityManager, this.timeManager));

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

        this.gameLoop(window.performance.now());
    }

    private gameLoop(time: number) {
        this.timeManager.update(time);

        this.systemManager.update(SystemGroup.PreGameLogic);
        this.systemManager.update(SystemGroup.GameLogic);
        this.systemManager.update(SystemGroup.PostGameLogic);
        this.systemManager.update(SystemGroup.GamePhysics);
        this.systemManager.update(SystemGroup.Physics);
        this.systemManager.update(SystemGroup.GamePreRender);
        this.systemManager.update(SystemGroup.Render);

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}
