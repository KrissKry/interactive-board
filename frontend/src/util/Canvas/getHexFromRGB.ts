import { RGBColor } from '../../interfaces/Canvas';

export const getHexFromRGB = (color: RGBColor) : string => {
    const hexCodes: string[] = ['#'];

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(color)) {
        if (key !== 'a') hexCodes.push((value as number).toString(16).padStart(2, '0'));
    }

    return hexCodes.join('');
};
