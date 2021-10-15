import React, { useEffect, useState } from 'react';
import p5Types from 'p5';
import Sketch from 'react-p5';

import { initialFillColor } from '../../helpers/initial';
import { RGBColor } from '../../interfaces/Canvas';
import { getComparedPixels, getPixelArea } from '../../util/Canvas';
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
    const [pp5, setPP5] = useState<any>();
    // console.log(window.p5);
    // const launch = () => {
        // const pp: p5Types = window.p5;
    // };

    const boardUpdateCallback = () => {
        dispatch(meetingCanvasChange(currentChanges));
    };

    useEffect(() => {
        if (meetingService.client.connected) {
            meetingService.addSubscription('/board/listen', boardUpdateCallback);
        }
    }, [meetingService.client.connected]);

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
        p5.background(200, 200, 200);
        p5.strokeWeight(20);
        setPP5(p5);
    };

    const mouseDragged = (p5: p5Types) => {
        if (isDrawing) {
            // eslint-disable-next-line max-len
            const prevPixels = getPixelArea(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY, brushWidth, p5);

            p5.stroke(brushColor.r, brushColor.g, brushColor.b);
            p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

            // eslint-disable-next-line max-len
            const newPixels = getPixelArea(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY, brushWidth, p5);
            const areaWidth = Math.abs(p5.mouseX - p5.pmouseX) + brushWidth;
            // eslint-disable-next-line max-len
            const pixelsComparison = getComparedPixels(prevPixels, newPixels, areaWidth, brushColor);

            meetingService.sendCanvasChanges(pixelsComparison);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line max-len
        const colorChange = [currentChanges.color.red, currentChanges.color.green, currentChanges.color.blue, 255];

        // eslint-disable-next-line no-restricted-syntax
        for (const change of currentChanges.pixels) {
            pp5.set(change.x, change.y, colorChange);
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
