export type CanvasToolID = 'PENCIL' | 'ERASER' | 'BUCKET';

/**
 * @param id - id
 * @param icon - string with icon name
 * @param callback - method to call on tool press
 */
export interface CanvasTool {
    id?: CanvasToolID;

    icon: string;

    callback: () => void;
}
