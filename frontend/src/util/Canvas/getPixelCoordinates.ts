interface CoordinatesReturn {
    startX: number,
    startY: number,
    deltaX: number,
    deltaY: number,
}

export const getPixelCoordinates = (
    currentX: number,
    currentY: number,
    previousX: number,
    previousY: number,
    brushWidth: number,
) : CoordinatesReturn => {
    const deltaX = Math.abs(currentX - previousX) + 5 * brushWidth;
    const deltaY = Math.abs(currentY - previousY) + 5 * brushWidth;

    const startX = Math.min(currentX, previousX) - 5 * brushWidth;
    const startY = Math.min(currentY, previousY) - 5 * brushWidth;

    // eslint-disable-next-line object-curly-newline
    return { startX, startY, deltaX, deltaY };
};
