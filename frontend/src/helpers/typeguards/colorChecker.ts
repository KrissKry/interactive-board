import type { RGBColor } from '../../interfaces/Canvas';

const verifyChannel = (value: number) : boolean => value >= 0 && value <= 255;

export const colorChecker = (color: RGBColor) : boolean => {
    if (!verifyChannel(color.r)) return false;
    if (!verifyChannel(color.g)) return false;
    if (!verifyChannel(color.b)) return false;

    if (typeof color.a !== 'undefined') {
        if (!verifyChannel(color.a)) return false;
    }

    return true;
};
