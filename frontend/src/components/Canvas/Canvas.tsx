/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from 'react';
import p5Types from 'p5';
import Sketch from 'react-p5';

import { initialFillColor } from '../../helpers/initial';
import { PixelChanges, RGBColor } from '../../interfaces/Canvas';
import { getComparedPixels, getPixelArea, getPixelCoordinates } from '../../util/Canvas';
import { PixelUpdate } from '../../interfaces/Canvas/PixelChanges';

interface CanvasProps {
    /**
     * Optional color of the brush
     */
    brushColor?: RGBColor;

    brushWidth: number;

    /**
     * Canvas updates queued
     */
    currentChanges: PixelChanges[];

    /**
     * At least 1 Canvas update is waiting to be applied
     */
    changesWaiting: boolean;

    /**
     * Canvas initial state (removed after update)
     */
    initialChanges: PixelUpdate[];

    /**
     * Called on finished canvas update on initial connection
     */
    cleanupInitialCallback: () => void;

    popChangeCallback:() => void;
    /**
     * Called every time pixel change is calculated
     */
    // eslint-disable-next-line no-unused-vars
    sendChangesCallback: (changes: PixelChanges) => void;

}

const Canvas = ({
    brushColor,
    brushWidth,
    currentChanges,
    changesWaiting,
    initialChanges,
    cleanupInitialCallback,
    popChangeCallback,
    sendChangesCallback,

} : CanvasProps) : JSX.Element => {
    const [p5Instance, setP5Instance] = useState<p5Types>();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const drawingColor = brushColor || initialFillColor;

    const canvasWidth = 500;
    const canvasHeight = 500;

    const mousePressed = () => { setIsDrawing(true); };
    const mouseReleased = () => { setIsDrawing(false); };

    /* create canvas and set background + copy p5 reference */
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
        p5.background('white');
        p5.strokeWeight(brushWidth);
        setP5Instance(p5);
    };

    /* draw on mouse drag if not updating */
    const mouseDragged = (p5: p5Types) => {
        if (!isUpdating && isDrawing) {
            // eslint-disable-next-line max-len
            const { startX, startY, deltaX, deltaY } = getPixelCoordinates(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY, brushWidth);

            const prevPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

            p5.stroke(drawingColor.r, drawingColor.g, drawingColor.b);
            p5.strokeWeight(brushWidth);
            p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

            const newPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

            // eslint-disable-next-line max-len
            const pixelsComparison = getComparedPixels(startX, startY, prevPixels, newPixels, deltaX, drawingColor);

            if (pixelsComparison.points && pixelsComparison.points.length) {
                sendChangesCallback(pixelsComparison);
            }
        }
    };

    useEffect(() => {
        /* won't update until drawing complete or if no changes are present */
        if (isDrawing || !changesWaiting || isUpdating) return;

        /* begin updating */
        setIsUpdating(true);
        // beginChangesCallback();
    }, [changesWaiting, isDrawing, isUpdating]);

    const renderPixelChange = () : void => {
        if (typeof p5Instance !== 'undefined') {
            const change = currentChanges[0];

            p5Instance.stroke(change.color.red, change.color.green, change.color.blue);
            p5Instance.strokeWeight(brushWidth);

            // eslint-disable-next-line no-restricted-syntax
            for (const changedPixel of change.points) {
                p5Instance.point(changedPixel.x, changedPixel.y);
            }

            popChangeCallback();
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        if (isUpdating) {
            renderPixelChange();
        }
    }, [isUpdating]);

    useEffect(() => {
        if (initialChanges.length && typeof p5Instance !== 'undefined') {
            p5Instance.strokeWeight(1);

            // eslint-disable-next-line no-restricted-syntax
            for (const pixel of initialChanges) {
                p5Instance.stroke(pixel.color.red, pixel.color.green, pixel.color.blue);
                p5Instance.point(pixel.point.x, pixel.point.y);
            }

            cleanupInitialCallback();
        }
    }, [initialChanges, p5Instance]);

    return (
            <Sketch setup={setup} className="ee-canvas" mouseDragged={mouseDragged} mousePressed={mousePressed} mouseReleased={mouseReleased} />
    );
};

Canvas.defaultProps = {
    brushColor: undefined,
};

export default Canvas;
