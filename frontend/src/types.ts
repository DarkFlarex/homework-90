export interface DrawPoint {
    offsetX: number;
    offsetY: number;
}

export interface IncomingDraw {
    type: string;
    payload: DrawPoint[];
}