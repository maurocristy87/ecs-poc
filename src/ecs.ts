export type Entity = number;

export type Component = object;

export type ComponentType<T extends Component = Component> = { new (): T };

export interface ISystem {
    onCreate(): void;
    onUpdate(): void;
    onDestroy(): void;
}

export type SystemType<T extends System = System> = {
    new (entityManager: IEntityManager, timeManager: ITimeManager): T;
};

export abstract class System implements ISystem {
    constructor(
        protected entityManager: IEntityManager,
        protected timeManager: ITimeManager,
    ) {}

    public onCreate(): void {}

    public onUpdate(): void {}

    public onDestroy(): void {}
}

export type EntityArchetype = ComponentType[];

export type SearchResult<T extends Component> = { entity: Entity; component: T };

export interface IEntityManager {
    createEntity(archetype: EntityArchetype): Entity;
    removeEntity(entity: Entity): void;
    removeAllEntities(): void;

    addComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T;
    getComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T;
    removeComponent(entity: Entity, componentType: ComponentType): void;

    search<T extends Component>(componentType: ComponentType<T>): SearchResult<T>[];
}

export interface ISystemManager {
    createSystem(systemType: SystemType): void;
    removeSystem(systemType: SystemType): void;
    update(): void;
}

export interface ITimeManager {
    deltaTime: number;
    update(time: number): void;
}

class EntityManager implements IEntityManager {
    private lastEntityId: number = 0;
    private components: Map<ComponentType, Map<Entity, Component>> = new Map();

    public createEntity(archetype: EntityArchetype): Entity {
        this.lastEntityId++;
        archetype.forEach((componentType) => this.addComponent(this.lastEntityId, componentType));
        return this.lastEntityId;
    }

    public removeEntity(entity: Entity): void {
        this.components.forEach((row) => (row.has(entity) ? row.delete(entity) : undefined));
    }

    public removeAllEntities(): void {
        this.components = new Map();
        this.lastEntityId = 0;
    }

    public addComponent<T extends Component>(entity: Entity, componentType: { new (): T }): T {
        const component = new componentType();

        if (!this.components.has(componentType)) this.components.set(componentType, new Map());
        this.components.get(componentType).set(entity, component);

        return component;
    }

    public getComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T {
        return this.components.get(componentType)?.get(entity) as T;
    }

    public removeComponent(entity: Entity, componentType: { new (): Component }): void {
        if (this.components.has(componentType) && this.components.get(componentType).has(entity)) {
            this.components.get(componentType).delete(entity);
        }
    }

    public search<T extends Component>(componentType: ComponentType<T>): SearchResult<T>[] {
        const result: SearchResult<T>[] = [];

        if (this.components.has(componentType)) {
            this.components.get(componentType).forEach((component, entity) => {
                result.push({
                    entity,
                    component: component as T,
                });
            });
        }

        return result;
    }
}

class SystemManager implements ISystemManager {
    private systems: Map<SystemType, ISystem> = new Map();

    constructor(
        private entityManager: IEntityManager,
        private timeManager: ITimeManager,
    ) {}

    public createSystem(systemType: SystemType): void {
        const system = new systemType(this.entityManager, this.timeManager);
        system.onCreate();

        this.systems.set(systemType, system);
    }

    public removeSystem(systemType: SystemType): void {
        if (this.systems.has(systemType)) {
            this.systems.get(systemType).onDestroy();
            this.systems.delete(systemType);
        }
    }

    public update(): void {
        this.systems.forEach((system) => system.onUpdate());
    }
}

class TimeManager implements ITimeManager {
    public deltaTime: number = 0;

    private then: number = 0;

    public update(time: number): void {
        this.deltaTime = Math.min(Math.max(0, time - this.then), 0.033);
    }
}

export const timeManager: ITimeManager = new TimeManager();
export const entityManager: IEntityManager = new EntityManager();
export const systemManager: ISystemManager = new SystemManager(entityManager, timeManager);
