import React, { useEffect, useState } from 'react';
import p5Types from 'p5';
import Sketch from 'react-p5';
import { IFrame } from '@stomp/stompjs';

import { initialFillColor } from '../../helpers/initial';
import { PixelChanges, RGBColor } from '../../interfaces/Canvas';
import { getComparedPixels, getPixelArea, getPixelCoordinates } from '../../util/Canvas';
import { MeetingService } from '../../services';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { meetingCanvasChange } from '../../redux/ducks/meeting';

interface CanvasProps {
    color?: RGBColor;

    brushWidth: number;
}

const Canvas = ({ color, brushWidth } : CanvasProps) : JSX.Element => {
    const brushColor = color || initialFillColor;
    let isDrawing = false;
    const canvasWidth = 500;
    const canvasHeight = 500;
    const meetingService = MeetingService.getInstance();
    const mousePressed = () => { isDrawing = true; };
    const mouseReleased = () => { isDrawing = false; };
    const currentChanges = useAppSelector((state) => state.meeting.currentChanges);
    const dispatch = useAppDispatch();
    const [pp5, setPP5] = useState<p5Types>();

    const boardUpdateCallback = (message: IFrame) => {
        const resp: PixelChanges = JSON.parse(message.body);
        const byteFix = 128;
        resp.color.red += byteFix;
        resp.color.green += byteFix;
        resp.color.blue += byteFix;
        dispatch(meetingCanvasChange(resp));
    };

    useEffect(() => {
        if (meetingService.client.connected) {
            meetingService.addSubscription('/board/listen', boardUpdateCallback);
        }
    }, [meetingService.client.connected]);

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
        p5.background(200, 200, 200);
        p5.strokeWeight(brushWidth);
        setPP5(p5);
    };

    const mouseDragged = (p5: p5Types) => {
        if (isDrawing) {
            const {
                startX, startY, deltaX, deltaY,
            } = getPixelCoordinates(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY, brushWidth);

            const prevPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

            p5.stroke(brushColor.r, brushColor.g, brushColor.b);
            p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

            // eslint-disable-next-line max-len
            const newPixels = getPixelArea(startX, startY, deltaX, deltaY, p5);

            // eslint-disable-next-line max-len
            const pixelsComparison = getComparedPixels(startX, startY, prevPixels, newPixels, deltaX, brushColor);

            if (pixelsComparison.points && pixelsComparison.points.length) {
                meetingService.sendCanvasChanges(pixelsComparison);
            }
        }
    };

    useEffect(() => {
        // eslint-disable-next-line max-len
        const colorChange = [currentChanges.color.red, currentChanges.color.green, currentChanges.color.blue, 255];

        if (typeof pp5 !== 'undefined') {
            // eslint-disable-next-line max-len
            pp5.stroke(currentChanges.color.red, currentChanges.color.green, currentChanges.color.blue);
            pp5.strokeWeight(brushWidth);

            // eslint-disable-next-line no-restricted-syntax
            for (const change of currentChanges.points) {
                pp5.point(change.x, change.y);
            }
        }
    }, [currentChanges]);
    return (
            <Sketch setup={setup} className="ee-canvas" mouseDragged={mouseDragged} mousePressed={mousePressed} mouseReleased={mouseReleased} />
    );
};

Canvas.defaultProps = {
    color: undefined,
};

export default Canvas;
