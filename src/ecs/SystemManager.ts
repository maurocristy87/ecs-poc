import "reflect-metadata";

export interface ISystemManager {
    addSystem(system: System): void;
    hasSystem(systemType: SystemType): boolean;
    getSystem<T extends System>(systemType: SystemType<T>): T;
    enableSystem(systemType: SystemType): void;
    disableSystem(systemType: SystemType): void;
    updatePosition(systemType: SystemType, position: number): void;
    removeSystem(systemType: SystemType): void;
    update(group: SystemGroup): void;
}

export class SystemManager implements ISystemManager {
    private enabled: Map<SystemGroup, System[]> = new Map();
    private systems: System[] = [];
    private created: Set<number> = new Set(); // set of indexes of systems already created

    public addSystem(system: System): void {
        if (this.systems.includes(system)) {
            throw new Error(`SystemManager already has an instance of ${system.constructor.name}.`);
        }

        this.systems.push(system);
    }

    public hasSystem(systemType: SystemType): boolean {
        return this.systems.some((system) => system instanceof systemType);
    }

    public getSystem<T extends System>(systemType: SystemType<T>): T {
        return this.systems.find((system) => system instanceof systemType) as T;
    }

    public enableSystem(systemType: SystemType): void {
        const system = this.getSystem(systemType);
        if (!system) throw new Error(`Cannot enable ${systemType.name} because it's not a system.`);

        const group = getGroup(systemType);
        if (!this.enabled.has(group)) this.enabled.set(group, []);
        else if (this.enabled.get(group).includes(system)) return;

        this.enabled.get(group).push(system);

        const index = this.systems.indexOf(system);
        if (!this.created.has(index)) {
            system.onCreate();
            this.created.add(index);
        }

        system.onEnabled();
    }

    public disableSystem(systemType: SystemType): void {
        const system = this.getSystem(systemType);
        if (!system) throw new Error(`Cannot enable ${systemType.name} because it's not a system.`);

        const group = getGroup(systemType);
        if (!this.enabled.get(group).includes(system)) return;

        this.enabled.get(group).splice(this.enabled.get(group).indexOf(system), 1);
        system.onDisabled();
    }

    public updatePosition(systemType: SystemType, position: number): void {
        const system = this.getSystem(systemType);
        if (!system) throw new Error(`Cannot update ${systemType.name} position because it's not a system.`);

        const group = getGroup(systemType);
        const groupSystems = this.enabled.get(group);

        if (groupSystems === undefined || !groupSystems.includes(system)) {
            throw new Error(`System ${systemType.name} needs to be enabled to update its position.`);
        }

        groupSystems.splice(position, 0, groupSystems.splice(groupSystems.indexOf(system), 1)[0]);
    }

    public removeSystem(systemType: SystemType): void {
        const system = this.getSystem(systemType);
        if (!system) throw new Error(`Cannot remove ${systemType.name} because it's not a system.`);

        const index = this.systems.indexOf(system);
        this.systems.splice(index, 1);

        const group = getGroup(systemType);

        if (this.enabled.has(group)) {
            const index = this.enabled.get(group).indexOf(system);
            if (index !== -1) this.enabled.get(group).splice(index, 1);
        }

        if (this.created.has(index)) this.created.delete(index);

        system.onDestroy();
    }

    public update(group: SystemGroup): void {
        this.enabled.get(group)?.forEach((system) => system.onUpdate());
    }
}

export interface System {
    onCreate(): void;
    onDestroy(): void;
    onDisabled(): void;
    onEnabled(): void;
    onUpdate(): void;
}

export type SystemType<T extends System = System> = { new (...args: any[]): T };

export enum SystemGroup {
    GameLogic,
    GamePhysics,
    GamePreRender,
    Physics,
    PostGameLogic,
    PreGameLogic,
    Render,
}

export function gameLogicSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.GameLogic);
    };
}

export function gamePhysicsSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.GamePhysics);
    };
}

export function gamePreRenderSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.GamePreRender);
    };
}

export function physicsSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.Physics);
    };
}

export function postGameLogicSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.PostGameLogic);
    };
}

export function preGameLogicSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.PreGameLogic);
    };
}

export function renderSystem() {
    return function (target: SystemType) {
        addGroup(target, SystemGroup.Render);
    };
}

const addGroup = (target: SystemType, group: SystemGroup): void => {
    if (!Reflect.hasMetadata("group", target)) Reflect.defineMetadata("group", group, target);
};

const getGroup = (target: SystemType): SystemGroup => Reflect.getMetadata("group", target) ?? SystemGroup.GameLogic;
