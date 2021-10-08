import React from 'react';
import { ReactP5Wrapper } from 'react-p5-wrapper';
import { Socket } from 'socket.io';
import { sketch } from './Sketch';

interface CanvasProps {
    socket: Socket;
}

const Canvas = ({ socket } : CanvasProps) : JSX.Element => (
    <div>
        <ReactP5Wrapper sketch={sketch} socket={socket} />
    </div>
);

export default Canvas;
