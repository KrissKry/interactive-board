import { useEffect, useState } from 'react';
import { Sketch } from 'react-p5-wrapper';
import { Socket } from 'socket.io';
import { initialFillColor } from '../../helpers/initial';
import { RGBColor } from '../../interfaces/Canvas';

export const sketch: Sketch = (p5) => {
    const [width, setWidth] = useState<number>(1);
    const [height, setHeight] = useState<number>(1);
    const [color, setColor] = useState<RGBColor>(initialFillColor);
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        p5.resizeCanvas(width, height);
    }, [width, height]);

    // eslint-disable-next-line no-param-reassign
    p5.setup = () => {
        p5.createCanvas(1, 1);
        socket?.on('DRAWING', (data) => {
            p5.strokeWeight(10);
            p5.line(data.mouseX, data.mouseY, data.pmouseX, data.pmouseY);
        });
    };

    // eslint-disable-next-line no-param-reassign
    p5.updateWithProps = (props) => {
        if (props.width) {
            setWidth(props.width);
        } else if (props.height) {
            setHeight(props.height);
        } else if (props.color) {
            setColor(props.color);
        } else if (props.socket) {
            setSocket(props.socket);
        }
    };

    // eslint-disable-next-line no-param-reassign
    p5.draw = () => p5.noStroke();

    // eslint-disable-next-line no-param-reassign
    p5.mouseDragged = () => {
        p5.strokeWeight(10);

        if (typeof color !== 'undefined') {
            p5.fill(color.r, color.g, color.b, color.a);
        }

        p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);

        socket?.emit('DRAWING', {
            mouseX: p5.mouseX,
            mouseY: p5.mouseY,
            // p - previous mouse pos
            pMouseX: p5.pmouseX,
            pMouseY: p5.pmouseY,
        });
    };
};
