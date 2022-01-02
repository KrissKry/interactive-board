import { RGBColor } from '../../interfaces/Canvas';

export const getRGBFromHex = (
    color: string,
): RGBColor => {
    const regex = /[0-9a-fA-F]{2}/g;
    const hexdColor = color.match(regex); // #ECF0F1 -> ['EC', 'F0', 'F1']

    if (hexdColor && hexdColor.length === 3) {
        const [red, green, blue] = hexdColor;

        const rgbColor: RGBColor = {
            r: parseInt(red, 16),
            g: parseInt(green, 16),
            b: parseInt(blue, 16),
        };

        return rgbColor;
    }

    throw new TypeError('string not a hex color');
};
