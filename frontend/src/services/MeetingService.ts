import { Client, IFrame, IMessage } from '@stomp/stompjs';
import { PixelChanges } from '../interfaces/Canvas';
import { ChatMessageInterface } from '../interfaces/Meeting';

export class MeetingService {
    private static instance: MeetingService;

    public client: Client;

    private constructor() {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/board',
            onConnect: () => {
                console.log('Client connected to ws://');
            },
            onStompError: (frame: IFrame) => {
                console.log('Broker reported error: ', frame.headers.message);
                console.log('Additional details: ', frame.body);
            },
        });

        this.client.activate();
    }

    static getInstance(): MeetingService {
        if (!MeetingService.instance) {
            MeetingService.instance = new MeetingService();
        }

        return MeetingService.instance;
    }

    sendCanvasChanges(changes: PixelChanges) : void {
        // console.log('WYSYŁAM', changes);
        if (this.client.connected) {
            this.client.publish({
                destination: '/api/board/send',
                body: JSON.stringify(changes),
                skipContentLengthHeader: true,
            });
        }
    }

    sendMessage(message: ChatMessageInterface) : void {
        if (this.client.connected) {
            this.client.publish({
                destination: '/api/chat/send',
                body: JSON.stringify(message),
            });
        }
    }

    addSubscription(destination: string, callback: (message: IMessage) => void) : void {
        console.log('Subscribe to', destination);
        this.client.subscribe(destination, (message: IMessage) => callback(message));
    }
}
