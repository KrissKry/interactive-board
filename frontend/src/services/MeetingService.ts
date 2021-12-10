import { Client, IFrame, IMessage } from '@stomp/stompjs';
import axios, { AxiosResponse } from 'axios';
import { PixelChanges } from '../interfaces/Canvas';
import { ChatMessageInterface } from '../interfaces/Chat';
import { p2pMessage } from '../interfaces/Meeting/p2p';

export class MeetingService {
    private static instance: MeetingService;

    public client: Client | null = null;

    connected: boolean;

    private id = '';

    private constructor() {
        this.connected = false;
    }

    // eslint-disable-next-line max-len
    createClient(successCallback:() => void, login: string, roomId: string, password?: string) : void {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/room',
            connectHeaders: {
                login,
                roomId,
                roomPassword: password || '',
            },
            onConnect: () => {
                console.log('Client connected to ws://');
                this.connected = true;
                this.id = roomId;
                successCallback();
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
        if (this.connected && this.client !== null) {
            this.client.publish({
                destination: `/api/board/send/${this.id}`,
                body: JSON.stringify(changes),
                skipContentLengthHeader: true,
            });
        }
    }

    sendChatMessage(message: ChatMessageInterface) : void {
        if (this.connected && this.client !== null) {
            this.client.publish({
                destination: `/api/chat/send/${this.id}`,
                body: JSON.stringify(message),
            });
        }
    }

    sendP2PMessage(message: p2pMessage) : void {
        if (this.connected && this.client !== null) {
            this.client.publish({
                destination: `/topic/p2p.listen.${this.id}`,
                body: JSON.stringify(message),
            });
        }
    }

    addSubscription(destination: string, callback: (message: IMessage) => void) : void {
        console.log('Subscribe to', destination);
        if (this.connected && this.client !== null) {
            this.client.subscribe(destination, (message: IMessage) => callback(message));
        }
    }

    // eslint-disable-next-line class-methods-use-this
    static async requestNewMeeting(name: string, password?: string) : Promise<AxiosResponse> {
        const url = 'http://localhost:8080/api/room/create';

        const data = {
            name,
            password,
        };
        // TODO HASHOWANIE HASŁA
        return axios.post(url, data);
    }
}
