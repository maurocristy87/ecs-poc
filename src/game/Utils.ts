export type Vector2 = { x: number; y: number };

export const randomInt = (min: number, max: number): number => Math.round(Math.random() * (max - min)) + min;
