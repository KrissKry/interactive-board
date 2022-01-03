import type { PixelColor } from './PixelChanges';

export type CanvasEventType = 'RESET' | 'FILL' | 'SAVED';

export interface CanvasSaveEvent {
    timestamp: number;

    username: string;

    id?: string;
}

export interface CanvasFillEvent {
    timestamp: number;

    color: PixelColor;
}

export interface CanvasEventMessage {
    type: CanvasEventType;

    data: CanvasFillEvent | CanvasSaveEvent | undefined;
}
