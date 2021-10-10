import React from 'react';
import { Socket } from 'socket.io';
import p5Types from 'p5';
import Sketch from 'react-p5';
import { Client, IFrame, Message } from '@stomp/stompjs';

import { initialFillColor } from '../../helpers/initial';
import { RGBColor } from '../../interfaces/Canvas';

interface CanvasProps {
    socket?: Socket;
}

const Canvas = ({ socket } : CanvasProps) : JSX.Element => {
    let color : RGBColor = initialFillColor;
    let isDrawing = false;

    const mousePressed = () => {
        // console.log('clicked');
        isDrawing = true;
    };

    const mouseReleased = () => {
        // console.log('released');
        isDrawing = false;
    };

    const changeColor = () => {
        const newColor : RGBColor = {
            r: 255,
            g: 0,
            b: 0,
        };
        // console.log(color, newColor);

        color = newColor;
    };

    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(500, 500).parent(canvasParentRef);
        p5.strokeWeight(20);
        p5.background(200, 200, 200);
        socket?.on('DRAWING', (data) => {
            p5.strokeWeight(10);
            p5.line(data.mouseX, data.mouseY, data.pmouseX, data.pmouseY);
            // console.log(data);
        });
    };

    // const draw = (p5: p5Types) => {
    //     p5.fill(color.r, color.g, color.b);
    //     p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
    // };

    // 1. rysuje lokalnie
    // 2. difference z synchronizowanym serwerową - wyciągnięcie kwadratu - małęgo obszaru
    // 3. przesyłam zmiany na serwer
    // 4. serwer wysyła wszystko co zmienione do klientów
    // 5. klient odbiera tablice zmian pikselowych
    // 6. na podstawie tej tablicy edytujemy pojedyncze piksele

    const mouseDragged = (p5: p5Types) => {
        if (isDrawing) {
            // p5.fill(color.r, color.g, color.b);
            p5.stroke(color.r, color.g, color.b);
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
        connectHeaders: {
            chuj: 'xD',
        },
    });
    // client.brokerURL = 'ws://localhost:8080/board';

    client.onConnect = (frame: IFrame) : void => {
        console.log('hehe', frame);
        const resp = client.subscribe('/board/update', (chuj: any) => {
            console.log('mapa', chuj);
        });
        console.log('resp', resp);
    };

    client.onDisconnect = (frame: IFrame) => {
        console.log('Disconnected!');
    };

    client.onStompError = (frame: IFrame) => {
        console.log('Broker reported error: ', frame.headers.message);
        console.log('Additional details: ', frame.body);
    };

    client.onWebSocketError = (evt: any) => {
        console.log(evt);
    };

    client.beforeConnect = () => {
        console.log('beforeConnect');
    };

    client.activate();

    const sendName = () : void => {
        client.publish({
            destination: '/app/updated',
            body: 'CHUJ ALE PATRIOTA',
            skipContentLengthHeader: true,
        });
    };

    return (
        <>
            <Sketch setup={setup} className="ee-canvas" mouseDragged={mouseDragged} mousePressed={mousePressed} mouseReleased={mouseReleased} />
            <button type="button" onClick={() => changeColor()}>Czerwony</button>
            {/* <button type="button" onClick={() => getCanvas()}>Print kanvas</button> */}
            <button type="button" onClick={() => sendName()}>Wyślij imie :DDD</button>
        </>
    );
};

Canvas.defaultProps = {
    socket: undefined,
};

export default Canvas;