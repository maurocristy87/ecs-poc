import { EntityManager } from "../../ecs/EntityManager";
import { System } from "../../ecs/SystemManager";
import { Renderer } from "../component/Renderer";
import { Transform } from "../component/Transform";

export const matrixWidth: number = 24;
export const matrixHeight: number = 24;

export class RenderSystem implements System {
    private matrix: string[][] = [];

    constructor(private readonly entityManager: EntityManager) {}

    public onUpdate(): void {
        this.resetMatrix();

        this.entityManager.search(Renderer).forEach(({ component, entity }) => {
            const { position } = this.entityManager.getComponent(entity, Transform);
            this.matrix[matrixHeight - 1 - Math.floor(position.y)][Math.floor(position.x)] = component.symbol;
        });

        this.renderMatrix();
    }

    private resetMatrix(): void {
        for (let y = 0; y < matrixHeight; y++) {
            this.matrix[y] = [];
            for (let x = 0; x < matrixWidth; x++) {
                this.matrix[y][x] = ".";
            }
        }
    }

    private renderMatrix(): void {
        document.querySelector<HTMLDivElement>("#app").innerHTML = this.matrix.map((v) => v.join(" ")).join("<br />");
    }
}
