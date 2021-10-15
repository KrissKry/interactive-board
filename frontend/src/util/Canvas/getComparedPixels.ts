import type { PixelChanges, RGBColor } from '../../interfaces/Canvas';

const compareChannel = (channel1: number, channel2: number) : boolean => channel1 === channel2;
const byteNormalizer = -128;

/**
 * Compare pixels between
 * @param previousPixels
 * @param nextPixels
 * @param color
 */
export const getComparedPixels = (
    previousPixels: number[],
    nextPixels: number[],
    canvasWidth: number,
    color: RGBColor,
) : PixelChanges => {
    const changes: PixelChanges = {
        color: {
            red: color.r + byteNormalizer,
            green: color.g + byteNormalizer,
            blue: color.b + byteNormalizer,
        },
        pixels: [],
    };

    // changes.color.red = color.r + byteNormalizer;
    // changes.color.green = color.g + byteNormalizer;
    // changes.color.blue = color.b + byteNormalizer;

    for (let index = 0; index < previousPixels.length; index += 4) {
        for (let channel = 0; channel < 3; channel += 1) {
            if (compareChannel(previousPixels[index + channel], nextPixels[index + channel])) {
                const y = Math.floor((index / 4) / canvasWidth);
                const x = (index / 4) % canvasWidth;
                changes.pixels.push({
                    x,
                    y,
                });
                break;
            }
        }
    }
    return changes;
};
