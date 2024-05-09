import { InputController, Movement, Renderer, Transform } from "./components";
import { entityManager, systemManager, timeManager } from "./ecs";
import { InputControllerSystem, MovementSystem, RenderingSystem, TransformSystem } from "./systems";
import { Vector2 } from "./utils";

// creating entities and setting components
entityManager.createEntity([InputController]);

const createHouse = (position: Vector2): void => {
    const tree = entityManager.createEntity([Transform, Renderer]);
    entityManager.getComponent(tree, Renderer).symbol = "⌂";
    entityManager.getComponent(tree, Transform).position = position;
};

createHouse({ x: 5, y: 5 });
createHouse({ x: 10, y: 5 });
createHouse({ x: 5, y: 10 });
createHouse({ x: 10, y: 10 });

const player = entityManager.createEntity([Transform, Renderer, Movement]);
entityManager.getComponent(player, Renderer).symbol = "@";
entityManager.getComponent(player, Transform).position = { x: 1, y: 3 };
entityManager.getComponent(player, Movement).speed = 6; // dots per second

// creating systems
systemManager.createSystem(InputControllerSystem);
systemManager.createSystem(MovementSystem);
systemManager.createSystem(TransformSystem);
systemManager.createSystem(RenderingSystem);

const gameLoop = (time: number) => {
    timeManager.update(time);
    systemManager.update();

    requestAnimationFrame(gameLoop);
};

gameLoop(window.performance.now());
