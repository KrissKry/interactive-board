/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from 'react';
import p5Types from 'p5';
import Sketch from 'react-p5';

import { initialFillColor, whiteFillColor } from '../../helpers/initial';
import { CanvasToolMode, PixelChanges, RGBColor } from '../../interfaces/Canvas';
import { getComparedPixels, getPixelArea, getPixelCoordinates } from '../../util/Canvas';
import { PixelUpdate } from '../../interfaces/Canvas/PixelChanges';
import { getPixelAreaFromCanvasArea } from '../../util/Canvas/getPixelArea';

interface CanvasProps {
    backgroundColor: RGBColor;

    /**
     * Optional color of the brush
     */
    brushColor?: RGBColor;

    brushMode: CanvasToolMode;

    brushWidth: number;

    /**
     * Canvas updates queued
     */
    currentChanges: PixelChanges[];

    /**
     * At least 1 Canvas update is waiting to be applied
     */
    changesWaiting: boolean;

    inDrawingMode: boolean;

    /**
     * Canvas initial state (removed after update)
     */
    initialChanges: PixelUpdate[];

    p5Instance?: p5Types;

    /**
     * Called on finished canvas update on initial connection
     */
    cleanupInitialCallback: () => void;

    resetChangesCallback: () => void;

    /**
     * Called every time pixel change is calculated
     */
    // eslint-disable-next-line no-unused-vars
    sendChangesCallback: (changes: PixelChanges) => void;

    // sendEventCallback: (type) => void;
    sendFillEventCallback: () => void;

    // eslint-disable-next-line no-unused-vars
    setP5InstanceCallback: (p5: p5Types) => void;
}

interface pointsInterf {
    x: number;
    y: number;
}

const Canvas = ({
    backgroundColor,
    brushColor,
    brushMode,
    brushWidth,
    currentChanges,
    changesWaiting,
    inDrawingMode,
    initialChanges,
    p5Instance,
    cleanupInitialCallback,
    resetChangesCallback,
    sendChangesCallback,
    sendFillEventCallback,
    setP5InstanceCallback,

} : CanvasProps) : JSX.Element => {
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    // kazdy kolejny punkt zaczyna się w poprzednim (założenie)
    // const [points, setPoints] = useState<pointsInterf[]>([]);
    const points: pointsInterf[] = [];
    // let postFlushPixelsArea: number[] = [];
    const [canvasPixels, setCanvasPixels] = useState<number[]>([]);
    const drawingColor = brushColor || initialFillColor;

    const canvasWidth = 1200;
    const canvasHeight = 750;

    const mousePressed = () => { setIsDrawing(true); };
    const mouseReleased = () => { setIsDrawing(false); };
    const touchStarted = () => setIsDrawing(true);
    const touchEnded = () => setIsDrawing(false);
    /* create canvas and set background + copy p5 reference */
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
        p5.background('white');
        p5.strokeWeight(brushWidth);
        p5.pixelDensity(1);
        setP5InstanceCallback(p5);
    };

    const fillCanvas = (p5: p5Types) => {
        // when 2-d is used and when webGL? prone to bugs
        // eslint-disable-next-line max-len
        if (p5.mouseX >= 0 && p5.mouseY >= 0 && p5.mouseX < canvasWidth && p5.mouseY < canvasHeight) {
            sendFillEventCallback();
        }
    };

    const draw = (p5: p5Types) => {
        // eslint-disable-next-line max-len
        const { startX, startY, deltaX, deltaY } = getPixelCoordinates(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY, brushWidth);

        const prevPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

        if (brushMode === 'PENCIL') p5.stroke(drawingColor.r, drawingColor.g, drawingColor.b);
        else p5.stroke(255, 255, 255);

        p5.strokeWeight(brushWidth);
        p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

        const newPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);
        // eslint-disable-next-line max-len
        const pixelsComparison = getComparedPixels(startX, startY, prevPixels, newPixels, deltaX, brushMode === 'PENCIL' ? drawingColor : whiteFillColor);

        if (pixelsComparison.points && pixelsComparison.points.length) {
            sendChangesCallback(pixelsComparison);
        }
    };

    /* mobile content */
    const pushPoints = (p5: p5Types): void => {
        // no points so move started
        if (!points.length) points.push({ x: p5.pmouseX, y: p5.pmouseY });
        points.push({ x: p5.mouseX, y: p5.mouseY });
    };

    const getBoundingBox = () => {
        const minX = Math.floor(Math.min(...points.map((point) => point.x)) - brushWidth * 5);
        const minY = Math.floor(Math.min(...points.map((point) => point.y)) - brushWidth * 5);
        const maxX = Math.floor(Math.max(...points.map((point) => point.x)) + brushWidth * 5);
        const maxY = Math.floor(Math.max(...points.map((point) => point.y)) + brushWidth * 5);

        return { minX, minY, maxX, maxY };
    };

    const updateCanvasState = (): void => {
        if (typeof p5Instance !== 'undefined') {
            // postFlushPixelsArea = getPixelArea(0, 0, canvasWidth, canvasHeight, p5Instance);
            const pxls = p5Instance.get(0, 0, canvasWidth, canvasHeight);
            pxls.loadPixels();
            setCanvasPixels(pxls.pixels);
            points.length = 0;
        }
    };

    const flushTouch = () => {
        if (!points.length) return;

        const bounds = getBoundingBox();
        const deltaX = bounds.maxX - bounds.minX;
        const deltaY = bounds.maxY - bounds.minY;
        // console.log(bounds.minX, bounds.minY, deltaX, deltaY);
        if (typeof p5Instance !== 'undefined') {
            const prevPixels = getPixelAreaFromCanvasArea(bounds.minX, bounds.minY, deltaX, deltaY, canvasWidth, canvasPixels);
            const newPixels = getPixelArea(bounds.minX, bounds.minY, deltaX, deltaY, p5Instance);
            // console.log('prev', prevPixels.slice(0, 4).toString(), 'new', newPixels.slice(0, 4).toString());
            // console.log(prevPixels.length, newPixels.length, newPixels.length - prevPixels.length);
            const pixelsComparison = getComparedPixels(bounds.minX, bounds.minY, prevPixels, newPixels, deltaX, brushMode === 'PENCIL' ? drawingColor : whiteFillColor);

            if (pixelsComparison.points && pixelsComparison.points.length) {
                sendChangesCallback(pixelsComparison);
            }
            updateCanvasState();
        }
    };

    const touchMoved = (p5: p5Types): void => {
        // console.log('moved', p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
        if (process.env.REACT_APP_MOBILE_MODE === 'true') {
            if (!isUpdating && isDrawing && inDrawingMode) {
                pushPoints(p5);

                if (brushMode === 'PENCIL') p5.stroke(drawingColor.r, drawingColor.g, drawingColor.b);
                else p5.stroke(255, 255, 255);

                p5.strokeWeight(brushWidth);
                p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
            }
        }
    };

    /* draw on mouse drag if not updating */
    const mouseDragged = (p5: p5Types) => {
        if (!isUpdating && isDrawing && inDrawingMode) {
            if (brushMode === 'BUCKET') fillCanvas(p5);
            else draw(p5);
        }
    };

    const updateCanvas = (): void => {
        if (typeof p5Instance !== 'undefined') {
            // eslint-disable-next-line no-restricted-syntax
            for (const change of currentChanges) {
                p5Instance.stroke(change.color.red, change.color.green, change.color.blue);
                p5Instance.strokeWeight(1);

                // eslint-disable-next-line no-restricted-syntax
                for (const changedPixel of change.points) {
                    p5Instance.point(changedPixel.x, changedPixel.y);
                }
            }

            resetChangesCallback();
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        /* won't update until drawing complete or if no changes are present */
        if (isDrawing || !changesWaiting || isUpdating) return;

        /* begin updating */
        setIsUpdating(true);
        // beginChangesCallback();
    }, [changesWaiting, isDrawing, isUpdating]);

    useEffect(() => { if (isUpdating) updateCanvas(); }, [isUpdating]);

    useEffect(() => {
        if (initialChanges.length && typeof p5Instance !== 'undefined') {
            p5Instance.strokeWeight(1);

            // eslint-disable-next-line no-restricted-syntax
            for (const pixel of initialChanges) {
                p5Instance.stroke(pixel.color.red, pixel.color.green, pixel.color.blue);
                p5Instance.point(pixel.point.x, pixel.point.y);
            }

            // updateCanvasState();
            cleanupInitialCallback();
        }
    }, [initialChanges, p5Instance]);

    useEffect(() => {
        if (typeof p5Instance !== 'undefined') {
            updateCanvasState();
        }
    }, [p5Instance]);
    useEffect(() => {
        if (typeof p5Instance !== 'undefined') {
            p5Instance.background(backgroundColor.r, backgroundColor.g, backgroundColor.b);
        }
    }, [backgroundColor]);

    useEffect(() => {
        if (process.env.REACT_APP_MOBILE_MODE === 'true') {
            setInterval(() => {
                flushTouch();
            }, 100);
        }
    });

    return (
        // eslint-disable-next-line max-len
        <Sketch setup={setup} mouseDragged={mouseDragged} mousePressed={mousePressed} mouseReleased={mouseReleased} touchMoved={touchMoved} touchStarted={touchStarted} touchEnded={touchEnded} />
    );
};

Canvas.defaultProps = {
    brushColor: undefined,
};

export default Canvas;
