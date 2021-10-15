import p5Types from 'p5';

/**
 * Get area of pixels that was covered by the brush in the instant moment
 * @param currentX mouseX
 * @param currentY mouseY
 * @param previousX pMouseX
 * @param previousY pMouseY
 * @param brushWidth literally brush width chosen by the user
 * @param p5 canvas instance
 * @returns array of pixels indexed by 4*n, with r,g,b,a values
 */
export const getPixelArea = (
    currentX: number,
    currentY: number,
    previousX: number,
    previousY: number,
    brushWidth: number,
    p5: p5Types,
) : number[] => {
    let deltaX = currentX - previousX;
    let deltaY = currentY - previousY;

    let startX = deltaX ? currentX : previousX;
    let startY = deltaY ? currentY : previousY;

    /* extend pixel area by brush radius */
    startX -= (brushWidth / 2);
    startY -= (brushWidth / 2);
    deltaX += brushWidth;
    deltaY += brushWidth;

    /* get area and populate it */
    const currentPixels = p5.get(startX, startY, Math.abs(deltaX), Math.abs(deltaY));
    currentPixels.loadPixels();

    return currentPixels.pixels;
};
