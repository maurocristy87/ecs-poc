export interface ITimeManager {
    deltaTime: number;
    update(time: number): void;
}

export class TimeManager implements ITimeManager {
    public deltaTime: number = 0;

    private then: number = 0;

    public update(time: number): void {
        this.deltaTime = Math.min(Math.max(0, time * 0.001 - this.then), 0.033);
        this.then = time * 0.001;
    }
}
