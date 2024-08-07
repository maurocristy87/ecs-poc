import "reflect-metadata";

export interface IEntityManager {
    // entity
    createEntity(): Entity;
    createEntity(components: Array<ComponentType | Component>): Entity;
    removeEntity(entity: Entity): void;
    removeAllEntities(): void;

    // entity enable/disable
    isEntityEnabled(entity: Entity): boolean;
    disableEntity(entity: Entity): void;
    enableEntity(entity: Entity): void;
    disableEntitiesByComponent(componentType: ComponentType): void;
    enableEntitiesByComponent(componentType: ComponentType): void;

    // component
    addComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T;
    addComponent<T extends Component>(entity: Entity, component: T): T;
    getComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T;
    hasComponent(entity: Entity, componentType: ComponentType): boolean;
    removeComponent(component: Component): void;
    removeComponent(entity: Entity, componentType: ComponentType): void;

    // component enable/disable
    isComponentEnabled(component: Component): boolean;
    isComponentEnabled<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    disableComponent(component: Component): void;
    disableComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    enableComponent(component: Component): void;
    enableComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;

    // query
    search<T extends Component>(componentType: ComponentType<T>, includeDisabled?: boolean): SearchResult<T>[];
    searchEntitiesByComponents(componentTypes: ComponentType[]): Entity[];
    getEntityForComponent(component: Component): Entity;
}

export type Entity = number;
export type Component = { [key: string]: any };
export type ComponentType<T extends Component = Component> = { new (...args: any[]): T };
export type SearchResult<T extends Component> = { entity: Entity; component: T };

export class EntityManager implements IEntityManager {
    private lastEntityId: number = 0;
    private lastComponentTypeId: number = 0;
    private components: Map<number, Map<Entity, Component>> = new Map(); // [componenType id] -> [entity id] -> [component instance]
    private disabledEntities: Set<Entity> = new Set();
    private disabledComponents: Map<Entity, Set<number>> = new Map(); // [entity id] -> [set of componenType id]

    public createEntity(): Entity;
    public createEntity(components: Array<ComponentType | Component>): Entity;
    public createEntity(components?: Array<ComponentType | Component>): Entity {
        this.lastEntityId++;
        if (components) components.forEach((component) => this.addComponent(this.lastEntityId, component));
        return this.lastEntityId;
    }

    public removeEntity(entity: Entity): void {
        this.components.forEach((row) => {
            if (row.has(entity)) row.delete(entity);
        });
        this.disabledComponents.delete(entity);
        this.disabledEntities.delete(entity);
    }

    public removeAllEntities(): void {
        this.components.clear();
        this.disabledComponents.clear();
        this.disabledEntities.clear();
        this.lastEntityId = 0;
    }

    public isEntityEnabled(entity: Entity): boolean {
        return !this.disabledEntities.has(entity);
    }

    public enableEntity(entity: Entity): void {
        if (!this.isEntityEnabled(entity)) this.disabledEntities.delete(entity);
    }

    public disableEntity(entity: Entity): void {
        if (this.isEntityEnabled(entity)) this.disabledEntities.add(entity);
    }

    public disableEntitiesByComponent(componentType: ComponentType): void {
        for (const entity of this.components.get(this.getComponentTypeId(componentType))?.keys() ?? []) {
            this.disableEntity(entity);
        }
    }

    public enableEntitiesByComponent(componentType: ComponentType): void {
        for (const entity of this.components.get(this.getComponentTypeId(componentType))?.keys() ?? []) {
            this.enableEntity(entity);
        }
    }

    public addComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T;
    public addComponent<T extends Component>(entity: Entity, component: T): T;
    public addComponent<T extends Component>(entity: Entity, component: ComponentType<T> | T): T {
        const id = this.getComponentTypeId(component);
        const instance = typeof component === "object" ? component : new component();

        if (!this.components.has(id)) this.components.set(id, new Map());

        if (this.components.get(id).has(entity)) {
            throw new Error(`Entity ${entity} already has a component of type ${instance.constructor.name}`);
        }

        this.components.get(id).set(entity, instance);

        return instance as T;
    }

    public getComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): T {
        return this.components.get(this.getComponentTypeId(componentType))?.get(entity) as T;
    }

    public hasComponent(entity: Entity, componentType: ComponentType): boolean {
        return this.getComponent(entity, componentType) !== undefined;
    }

    public getEntityForComponent(component: Component): Entity {
        const id = this.getComponentTypeId(component);
        if (this.components.has(id)) {
            for (const [e, c] of this.components.get(id)) {
                if (c === component) return e;
            }
        }
        return undefined;
    }

    public removeComponent(component: Component): void;
    public removeComponent(entity: Entity, componentType: ComponentType): void;
    public removeComponent(arg1: Entity | Component, arg2?: ComponentType): void {
        const id = this.getComponentTypeId(typeof arg1 === "object" ? arg1 : arg2);
        const entity = typeof arg1 === "number" ? arg1 : this.getEntityForComponent(arg1);

        if (this.components.get(id)?.has(entity)) this.components.get(id).delete(entity);
    }

    public isComponentEnabled(component: Component): boolean;
    public isComponentEnabled<T extends Component>(entity: Entity, componentType: ComponentType<T>): boolean;
    public isComponentEnabled<T extends Component>(arg1: Entity | T, arg2?: ComponentType<T>): boolean {
        const id = this.getComponentTypeId(typeof arg1 === "object" ? arg1 : arg2);
        const entity = typeof arg1 === "number" ? arg1 : this.getEntityForComponent(arg1);

        return !this.disabledComponents.get(entity)?.has(id) ?? true;
    }

    public disableComponent(component: Component): void;
    public disableComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    public disableComponent<T extends Component>(arg1: Entity | T, arg2?: ComponentType<T>): void {
        const entity = typeof arg1 === "number" ? arg1 : this.getEntityForComponent(arg1);
        const id = this.getComponentTypeId(typeof arg1 === "object" ? arg1 : arg2);

        if (!this.disabledComponents.has(entity)) {
            this.disabledComponents.set(entity, new Set([id]));
        } else if (!this.disabledComponents.get(entity).has(id)) {
            this.disabledComponents.get(entity).add(id);
        }
    }

    public enableComponent(component: Component): void;
    public enableComponent<T extends Component>(entity: Entity, componentType: ComponentType<T>): void;
    public enableComponent<T extends Component>(arg1: Entity | T, arg2?: ComponentType<T>): void {
        const entity = typeof arg1 === "number" ? arg1 : this.getEntityForComponent(arg1);
        const id = this.getComponentTypeId(typeof arg1 === "object" ? arg1 : arg2);

        if (this.disabledComponents.get(entity)?.has(id)) {
            this.disabledComponents.get(entity).delete(id);
        }
    }

    public search<T extends Component>(
        componentType: ComponentType<T>,
        includeDisabled: boolean = false,
    ): SearchResult<T>[] {
        const result: SearchResult<T>[] = [];
        const id = this.getComponentTypeId(componentType);

        if (this.components.has(id)) {
            this.components.get(id).forEach((component, entity) => {
                if (includeDisabled || (this.isEntityEnabled(entity) && this.isComponentEnabled(entity, componentType)))
                    result.push({ entity, component: component as T });
            });
        }

        return result;
    }

    public searchEntitiesByComponents(componentTypes: ComponentType[]): Entity[] {
        const entities: Entity[] = [];
        let first = true;

        for (const componentType of componentTypes) {
            const id = this.getComponentTypeId(componentType);
            if (!id || !this.components.has(id)) return [];

            if (first) {
                entities.push(...this.components.get(id).keys());
                first = false;
                continue;
            }

            const toCompare = new Set(this.components.get(id).keys());

            entities.forEach((e, i) => {
                if (!toCompare.has(e)) entities.splice(i, 1);
            });
        }

        return entities;
    }

    private getComponentTypeId<T extends Component>(component: ComponentType<T> | T): number {
        const target = typeof component === "object" ? component.constructor : component;
        if (!Reflect.hasMetadata("typeId", target)) {
            Reflect.defineMetadata("typeId", ++this.lastComponentTypeId, target);
        }
        return Reflect.getMetadata("typeId", target);
    }
}
