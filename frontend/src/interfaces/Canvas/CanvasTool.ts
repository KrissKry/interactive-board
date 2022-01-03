export type CanvasToolMode = 'PENCIL' | 'ERASER' | 'BUCKET' | 'RESET' | 'SAVE' | 'DOWNLOAD';

/**
 * @param id - id
 * @param icon - string with icon name
 * @param callback - method to call on tool press
 */
export interface CanvasTool {
    id?: CanvasToolMode;

    customId?: string;

    icon: string;

    // eslint-disable-next-line no-unused-vars
    callback: (e?: any) => void;

    customClass?: string;
}
