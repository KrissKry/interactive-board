import { Client, IFrame, IMessage } from '@stomp/stompjs';
import axios, { AxiosResponse } from 'axios';
import { PixelChanges } from '../interfaces/Canvas';
import { ChatMessageInterface } from '../interfaces/Chat';

export class MeetingService {
    private static instance: MeetingService;

    public client: Client;

    connected = false;

    private constructor() {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/board',
            onConnect: () => {
                console.log('Client connected to ws://');
                this.connected = true;
            },
            onStompError: (frame: IFrame) => {
                console.log('Broker reported error: ', frame.headers.message);
                console.log('Additional details: ', frame.body);
            },
            onDisconnect: () => {
                this.connected = false;
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
        if (this.connected) {
            this.client.publish({
                destination: '/api/board/send',
                body: JSON.stringify(changes),
                skipContentLengthHeader: true,
            });
        }
    }

    sendChatMessage(message: ChatMessageInterface) : void {
        if (this.connected) {
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

    // eslint-disable-next-line class-methods-use-this
    async fetchMeetingDataByID(id: string) : Promise<AxiosResponse> {
        const url = `adres do meeting endpoint/${id}`;
        const data = axios.get(url);

        return data;
    }
}
