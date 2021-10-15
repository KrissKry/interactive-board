import { Client, IFrame, IMessage } from '@stomp/stompjs';
import { PixelChanges } from '../interfaces/Canvas';

export class MeetingService {
    private static instance: MeetingService;

    public client: Client;

    private constructor() {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/',
            onConnect: () => {
                console.log('WS Connnected');
            },
            onStompError: (frame: IFrame) => {
                console.log('Broker reported error: ', frame.headers.message);
                console.log('Additional details: ', frame.body);
            },
        });

        this.client.activate();
        console.log('hehe');
    }

    static getInstance(): MeetingService {
        if (!MeetingService.instance) {
            MeetingService.instance = new MeetingService();
        }

        return MeetingService.instance;
    }

    sendCanvasChanges(changes: PixelChanges) : void {
        if (this.client.connected) {
            this.client.publish({
                destination: '/api/board/send',
                body: JSON.stringify(changes),
                skipContentLengthHeader: true,
            });
        }
    }

    addSubscription(destination: string, callback: (message: IMessage) => void) : void {
        console.log('wassup');
        this.client.subscribe(destination, (message: IMessage) => callback(message));
    }
}
