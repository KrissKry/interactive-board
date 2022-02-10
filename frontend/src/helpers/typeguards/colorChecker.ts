import type { RGBColor } from '../../interfaces/Canvas';

/**
 * Verifies that color channel is supported
 * @param value representing channel value
 * @returns boolean if channel has pixel value between 0-255
 */
const verifyChannel = (value: number) : boolean => value >= 0 && value <= 255;

/**
 * Checks if color can exist
 * @param color RGB color object that needs verifying
 * @returns boolean representing color correctness
 */
export const colorChecker = (color: RGBColor) : boolean => {
    if (!verifyChannel(color.r)) return false;
    if (!verifyChannel(color.g)) return false;
    if (!verifyChannel(color.b)) return false;

    if (typeof color.a !== 'undefined') {
        if (!verifyChannel(color.a)) return false;
    }

    return true;
};
