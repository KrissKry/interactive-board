import type { PixelChanges, RGBColor } from '../../interfaces/Canvas';

const compareChannel = (channel1: number, channel2: number) : boolean => channel1 !== channel2;

/**
 * Compare pixels between
 * @param previousPixels
 * @param nextPixels
 * @param color
 */
export const getComparedPixels = (
    startX: number,
    startY: number,
    previousPixels: number[],
    nextPixels: number[],
    areaWidth: number,
    color: RGBColor,
) : PixelChanges => {
    const changes: PixelChanges = {
        color: {
            red: color.r,
            green: color.g,
            blue: color.b,
        },
        points: [],
    };

    for (let index = 0; index < previousPixels.length; index += 4) {
        for (let channel = 0; channel < 3; channel += 1) {
            if (compareChannel(previousPixels[index + channel], nextPixels[index + channel])) {
                const y = (Math.floor((index / 4) / areaWidth)) + startY;
                const x = ((index / 4) % areaWidth) + startX + 1;
                changes.points.push({
                    x,
                    y,
                });
                break;
            }
        }
    }
    return changes;
};
