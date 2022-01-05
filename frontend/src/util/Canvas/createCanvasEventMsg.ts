// eslint-disable-next-line object-curly-newline
import { RGBColor } from '../../interfaces/Canvas';
import { CanvasEventMessage } from '../../interfaces/Canvas/CanvasEvent';

export const createCanvasEventFillMsg = (color: RGBColor) : CanvasEventMessage => {
    const msg: CanvasEventMessage = {
        type: 'FILL',

        data: {
            timestamp: Date.now(),

            color: {
                red: color.r,
                green: color.g,
                blue: color.b,
            },
        },
    };
    return msg;
};

export const createCanvasEventSave = (username: string): CanvasEventMessage => {
    const msg: CanvasEventMessage = {
        type: 'SAVED',

        data: {
            timestamp: Date.now(),

            username,
        },
    };
    return msg;
};

export const createCanvasReset = (): CanvasEventMessage => {
    const msg: CanvasEventMessage = {
        type: 'RESET',

        data: undefined,
    };
    return msg;
};
