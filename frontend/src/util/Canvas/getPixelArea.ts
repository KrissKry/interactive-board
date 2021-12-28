import p5Types from 'p5';

/**
 * Get area of pixels that was covered by the brush in the instant moment
 * @returns array of pixels indexed by 4*n, with r,g,b,a values
 */
export const getPixelArea = (
    startX: number,
    startY: number,
    deltaX: number,
    deltaY: number,
    p5: p5Types,
) : number[] => {
    // const deltaX = Math.abs(currentX - previousX) + 4 * brushWidth;
    // const deltaY = Math.abs(currentY - previousY) + 4 * brushWidth;

    // const startX = Math.min(currentX, previousX) - 4 * brushWidth;
    // const startY = Math.min(currentY, previousY) - 4 * brushWidth;

    // if (startX < 0 || startY < 0 || brushWidth < 1) return [];

    /* get area and populate it */
    const currentPixels = p5.get(startX, startY, deltaX, deltaY);
    currentPixels.loadPixels();

    return currentPixels.pixels;
};
