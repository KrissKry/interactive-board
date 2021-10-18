/* eslint-disable object-curly-newline */
import React, { useEffect, useState } from 'react';
import p5Types from 'p5';
import Sketch from 'react-p5';
import { IFrame } from '@stomp/stompjs';

import { initialFillColor } from '../../helpers/initial';
import { PixelChanges, RGBColor } from '../../interfaces/Canvas';
import { getComparedPixels, getPixelArea, getPixelCoordinates } from '../../util/Canvas';
import { MeetingService } from '../../services';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { meetingPopChanges, meetingPushChanges } from '../../redux/ducks/meeting';

interface CanvasProps {
    color?: RGBColor;

    brushWidth: number;
}

const Canvas = ({ color, brushWidth } : CanvasProps) : JSX.Element => {
    const [p5Instance, setP5Instance] = useState<p5Types>();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [brushColor, setBrushColor] = useState<RGBColor>(color || initialFillColor);

    const currentChanges = useAppSelector((state) => state.meeting.currentChanges);
    const meetingService = MeetingService.getInstance();
    const dispatch = useAppDispatch();

    const canvasWidth = 500;
    const canvasHeight = 500;

    const mousePressed = () => { setIsDrawing(true); };
    const mouseReleased = () => { setIsDrawing(false); };

    const boardUpdateCallback = (message: IFrame) => {
        const resp: PixelChanges = JSON.parse(message.body);
        const byteFix = 128;
        resp.color.red += byteFix;
        resp.color.green += byteFix;
        resp.color.blue += byteFix;
        dispatch(meetingPushChanges(resp));
    };

    /* subscribe to board updates on connection */
    useEffect(() => {
        if (meetingService.client.connected) meetingService.addSubscription('/board/listen', boardUpdateCallback);
    }, [meetingService.client.connected]);

    /* create canvas and set background + copy p5 reference */
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
        p5.background(200, 200, 200);
        p5.strokeWeight(brushWidth);
        setP5Instance(p5);
    };

    /* draw on mouse drag if not updating */
    const mouseDragged = (p5: p5Types) => {
        if (!isUpdating && isDrawing) {
            // eslint-disable-next-line max-len
            const { startX, startY, deltaX, deltaY } = getPixelCoordinates(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY, brushWidth);

            const prevPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

            p5.stroke(brushColor.r, brushColor.g, brushColor.b);
            p5.strokeWeight(brushWidth);
            p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

            const newPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

            // eslint-disable-next-line max-len
            const pixelsComparison = getComparedPixels(startX, startY, prevPixels, newPixels, deltaX, brushColor);

            if (pixelsComparison.points && pixelsComparison.points.length) {
                meetingService.sendCanvasChanges(pixelsComparison);
            }
        }
    };

    useEffect(() => {
        /* won't update until drawing complete or if no changes are present */
        if (isDrawing || currentChanges.length === 0 || isUpdating) return;

        /* begin updating */
        setIsUpdating(true);

        if (typeof p5Instance !== 'undefined') {
            // eslint-disable-next-line no-restricted-syntax
            for (const change of currentChanges) {
                p5Instance.stroke(change.color.red, change.color.green, change.color.blue);
                p5Instance.strokeWeight(brushWidth);

                // eslint-disable-next-line no-restricted-syntax
                for (const changedPixel of change.points) {
                    p5Instance.point(changedPixel.x, changedPixel.y);
                }
            }
            dispatch(meetingPopChanges());
        }

        /* finish updating */
        setIsUpdating(false);
    }, [currentChanges, isDrawing]);

    return (
            <Sketch setup={setup} className="ee-canvas" mouseDragged={mouseDragged} mousePressed={mousePressed} mouseReleased={mouseReleased} />
    );
};

Canvas.defaultProps = {
    color: undefined,
};

export default Canvas;
