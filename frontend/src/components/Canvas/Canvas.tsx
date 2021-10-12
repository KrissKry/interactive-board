import React from 'react';
import { Socket } from 'socket.io';
import p5Types from 'p5';
import Sketch from 'react-p5';
import { Client, IFrame, IMessage } from '@stomp/stompjs';

import { initialFillColor } from '../../helpers/initial';
import { RGBColor } from '../../interfaces/Canvas';

interface CanvasProps {
    socket?: Socket;

    color?: RGBColor;

    radius?: number;
}

const Canvas = ({ socket, color, radius } : CanvasProps) : JSX.Element => {
    const brushColor = color || initialFillColor;
    let isDrawing = false;

    const mousePressed = () => {
        isDrawing = true;
    };

    const mouseReleased = () => {
        isDrawing = false;
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(500, 500).parent(canvasParentRef);
        p5.background(200, 200, 200);
        p5.strokeWeight(20);
    };

    // 1. rysuje lokalnie
    // 2. difference z synchronizowanym serwerową - wyciągnięcie kwadratu - małęgo obszaru
    // 3. przesyłam zmiany na serwer
    // 4. serwer wysyła wszystko co zmienione do klientów
    // 5. klient odbiera tablice zmian pikselowych
    // 6. na podstawie tej tablicy edytujemy pojedyncze piksele

    const mouseDragged = (p5: p5Types) => {
        if (isDrawing) {
            // p5.fill(color.r, color.g, color.b);
            p5.stroke(brushColor.r, brushColor.g, brushColor.b);
            p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
            // console.log(x.get(0, 0, 20, 20));
            const pixls = p5.get(0, 0, 10, 10);
            pixls.loadPixels();
            // console.log(pixls.pixels);
            socket?.emit('DRAWING', {
                mouseX: p5.mouseX,
                mouseY: p5.mouseY,
                // p - previous mouse pos
                pMouseX: p5.pmouseX,
                pMouseY: p5.pmouseY,
            });
        }
    };

    /* SOCKET :D */
    // brokerURL: 'ws://localhost:15674/ws',
    // const client = new Client({
    //     brokerURL: 'ws://127.0.0.1:8080/board',
    //     reconnectDelay: 20000,
    //     heartbeatIncoming: 4000,
    //     heartbeatOutgoing: 4000,
    // });
    const client = new Client({
        brokerURL: 'ws://localhost:8080/board',
        onConnect: (frame: IFrame) => {
            client.subscribe('/board/update', (message: IMessage) => {
                console.log('mapa', JSON.parse(message.body));
            });
        },
        onDisconnect: (frame: IFrame) => {

        },
        onStompError: (frame: IFrame) => {
            console.log('Broker reported error: ', frame.headers.message);
            console.log('Additional details: ', frame.body);
        },
    });

    client.activate();

    const normalizeByte = -128;
    const testBody = {
        color: {
            red: 200 + normalizeByte,
            green: 200 + normalizeByte,
            blue: 150 + normalizeByte,
        },
        points: [
            {
                x: 2,
                y: 2,
            },
            {
                x: 3,
                y: 2,
            },
            {
                x: 4,
                y: 2,
            },
            {
                x: 5,
                y: 2,
            },
            {
                x: 6,
                y: 2,
            },
            {
                x: 7,
                y: 2,
            },
        ],
        userId: 123456,
    };

    const sendCoords = () : void => {
        client.publish({
            destination: '/app/updated',
            body: JSON.stringify(testBody),
            skipContentLengthHeader: true,
        });
    };

    return (
        <>
            <Sketch setup={setup} className="ee-canvas" mouseDragged={mouseDragged} mousePressed={mousePressed} mouseReleased={mouseReleased} />
            {/* <button type="button" onClick={() => changeColor()}>Czerwony</button> */}
            <button type="button" onClick={() => sendCoords()}>Wyślij koordynaty</button>
        </>
    );
};

Canvas.defaultProps = {
    socket: undefined,
    color: undefined,
    radius: 1,
};

export default Canvas;
