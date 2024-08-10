export type Entity = number;
export type Component = { [key: string]: any };
export type ComponentType<T extends Component = Component> = { new (...args: any[]): T };
export type SearchResult<T extends Component> = { entity: Entity; component: T };

export class EntityManager {
    private lastEntityId: number = 0;
    private components: [Entity, Component, boolean][] = []; // [entity, component, enabled]
    private disabledEntities: Set<Entity> = new Set();

    public createEntity(): Entity;
    public createEntity(components: Array<ComponentType | Component>): Entity;
    public createEntity(components?: Array<ComponentType | Component>): Entity {
        this.lastEntityId++;
        if (components) components.forEach((component) => this.addComponent(this.lastEntityId, component));
        return this.lastEntityId;
    }

    public removeEntity(entity: Entity): void {
        this.components.forEach((record, index) => {
            if (record[0] === entity) this.components.splice(index, 1);
        });
    }

    public removeAllEntities(): void {
        this.components = [];
        this.lastEntityId = 0;
    }

    public isEntityEnabled(entity: Entity): boolean {
        return !this.disabledEntities.has(entity);
    }

    public enableEntity(entity: Entity): void {
        if (!this.isEntityEnabled(entity)) this.disabledEntities.delete(entity);
    }

    public disableEntity(entity: Entity): void {
        this.disabledEntities.add(entity);
    }

    public disableEntitiesByComponent(componentType: ComponentType): void {
        this.components
            .filter((record) => record[1] instanceof componentType)
            .forEach((record) => this.disableEntity(record[0]));
    }

    public enableEntitiesByComponent(componentType: ComponentType): void {
        this.components
            .filter((record) => record[1] instanceof componentType)
            .forEach((record) => this.enableEntity(record[0]));
    }

    public addComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T;
    public addComponent<T extends Component>(entity: Entity, component: T): T;
    public addComponent<T extends Component>(entity: Entity, component: ComponentType<T> | T): T {
        const instance = typeof component === "object" ? component : new component();

        if (this.components.some((record) => record[0] === entity && record[1].constructor === instance.constructor)) {
            throw new Error(`Entity ${entity} already has a component of type ${instance.constructor.name}`);
        }

        this.components.push([entity, instance, true]);

        return instance as T;
    }

    public getComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T {
        return this.components.find((record) => record[0] === entity && record[1] instanceof componentType)[1] as T;
    }

    public hasComponent(entity: Entity, componentType: ComponentType): boolean {
        return this.components.some((record) => record[0] === entity && record[1] instanceof componentType);
    }

    public getEntityForComponent(component: Component): Entity {
        for (const [e, c] of this.components) {
            if (c === component) return e;
        }
        return undefined;
    }

    public removeComponent(component: Component): void;
    public removeComponent(entity: Entity, componentType: ComponentType): void;
    public removeComponent(arg1: Entity | Component, arg2?: ComponentType): void {
        const index =
            typeof arg1 === "object"
                ? this.components.findIndex((record) => record[1] === arg1)
                : this.components.findIndex((record) => record[0] === arg1 && record[1] instanceof arg2);

        if (index >= 0) this.components.splice(index, 1);
    }

    public isComponentEnabled(component: Component): boolean;
    public isComponentEnabled<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    public isComponentEnabled<T extends Component>(arg1: Entity | T, arg2?: ComponentType<T>): boolean {
        return typeof arg1 === "object"
            ? this.components.some((record) => record[1] === arg1 && record[2] === true)
            : this.components.some((record) => record[0] === arg1 && record[1] instanceof arg2 && record[2] === true);
    }

    public disableComponent(component: Component): void;
    public disableComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    public disableComponent<T extends Component>(arg1: Entity | T, arg2?: ComponentType<T>): void {
        const index =
            typeof arg1 === "object"
                ? this.components.findIndex((record) => record[1] === arg1)
                : this.components.findIndex((record) => record[0] === arg1 && record[1] instanceof arg2);

        if (index >= 0) this.components[index][2] = false;
    }

    public enableComponent(component: Component): void;
    public enableComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    public enableComponent<T extends Component>(arg1: Entity | T, arg2?: ComponentType<T>): void {
        const index =
            typeof arg1 === "object"
                ? this.components.findIndex((record) => record[1] === arg1)
                : this.components.findIndex((record) => record[0] === arg1 && record[1] instanceof arg2);

        if (index >= 0) this.components[index][2] = true;
    }

    public search<T extends Component>(
        componentType: ComponentType<T>,
        includeDisabled: boolean = false,
    ): SearchResult<T>[] {
        const result: SearchResult<T>[] = [];
        this.components
            .filter(
                (record) =>
                    record[1] instanceof componentType &&
                    (includeDisabled || (this.isEntityEnabled(record[0]) && record[2] === true)),
            )
            .forEach((record) => result.push({ entity: record[0], component: record[1] as T }));

        return result;
    }

    public searchEntitiesByComponents(componentTypes: ComponentType[]): Entity[] {
        const entities: Entity[] = [];
        let first = true;

        for (const componentType of componentTypes) {
            if (first) {
                entities.push(
                    ...this.components
                        .filter((record) => record[1] instanceof componentType)
                        .map((record) => record[0]),
                );
                first = false;
                continue;
            }

            const toCompare = this.components
                .filter((record) => record[1] instanceof componentType)
                .map((record) => record[0]);

            entities.forEach((e, i) => {
                if (!toCompare.includes(e)) entities.splice(i, 1);
            });
        }

        return entities;
    }
}
