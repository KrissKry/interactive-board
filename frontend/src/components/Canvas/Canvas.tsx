import React from 'react';
import { Socket } from 'socket.io';
import p5Types from 'p5';
import Sketch from 'react-p5';
import { initialFillColor } from '../../helpers/initial';
import { RGBColor } from '../../interfaces/Canvas';

interface CanvasProps {
    socket?: Socket;
}

const Canvas = ({ socket } : CanvasProps) : JSX.Element => {
    let color : RGBColor = initialFillColor;

    const changeColor = () => {
        const newColor : RGBColor = {
            r: 255,
            g: 0,
            b: 0,
        };
        console.log(color, newColor);

        color = newColor;
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(500, 500).parent(canvasParentRef);
        p5.background(200, 200, 200);
        socket?.on('DRAWING', (data) => {
            p5.strokeWeight(10);
            p5.line(data.mouseX, data.mouseY, data.pmouseX, data.pmouseY);
            console.log(data);
        });
    };

    const draw = (p5: p5Types) => {
        p5.fill(color.r, color.g, color.b);
        p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
    };

    const mouseDragged = (p5: p5Types) => {
        p5.fill(0, 255, 0);
        p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
        socket?.emit('DRAWING', {
            mouseX: p5.mouseX,
            mouseY: p5.mouseY,
            // p - previous mouse pos
            pMouseX: p5.pmouseX,
            pMouseY: p5.pmouseY,
        });
    };

    return (
        <>
            <Sketch setup={setup} draw={draw} className="ee-canvas" mouseDragged={mouseDragged} />
            <button type="button" onClick={() => changeColor()}>KOLOOOORRR</button>
        </>
    );
};

Canvas.defaultProps = {
    socket: undefined,
};

export default Canvas;
