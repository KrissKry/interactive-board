import { Client, IFrame, IMessage } from '@stomp/stompjs';
import axios, { AxiosResponse } from 'axios';
import { PixelChanges } from '../interfaces/Canvas';
import { CanvasEventMessage } from '../interfaces/Canvas/CanvasEvent';
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
    createClient(successCallback: (id: string) => void, login: string, roomId: string, password?: string) : Promise<void> {
        console.log(login, roomId, password);
        this.client = new Client({
            brokerURL: `${process.env.REACT_APP_API_WEBSOCKET}/room`,
            connectHeaders: {
                login,
                roomId,
                roomPassword: password || '',
            },
            onConnect: () => {
                console.log('Client connected to ws://');
                this.connected = true;
                this.id = roomId;
                successCallback(roomId);
            },
            onStompError: (frame: IFrame) => {
                console.log('Broker reported error: ', frame.headers.message);
                console.log('Additional details: ', frame.body);
            },
            onDisconnect: () => {
                this.connected = false;
            },
            onWebSocketClose: (evt) => { console.log('ay', evt); },
            onWebSocketError: (evt) => { console.log('aaa', evt); },
        });

        if (this.client === null) throw new TypeError('Client is null');
        return Promise.resolve();
    }

    activateClient() : void {
        this.client?.activate();
    }

    deactivateClient() : void {
        this.client?.deactivate();
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

    sendCanvasEvent(message: CanvasEventMessage): void {
        if (this.connected && this.client !== null) {
            this.client.publish({
                destination: `/api/board/event/${this.id}`,
                body: JSON.stringify(message),
            });
        }
    }

    addSubscription(destination: string, callback: (message: IMessage) => void) : Promise<string> {
        if (this.connected && this.client !== null) {
            // eslint-disable-next-line max-len
            const sub = this.client.subscribe(destination, (message: IMessage) => callback(message));
            console.log('Subscribe to', destination, 'with id', sub.id);
            return Promise.resolve(sub.id);
        }

        throw new TypeError('Client not connected or client is null');
    }

    // removeSubscription(destination: string) : Promise<void> {
    //     this.client.un
    // }

    // eslint-disable-next-line class-methods-use-this
    static async requestNewMeeting(name: string, password?: string) : Promise<AxiosResponse> {
        const url = `${process.env.REACT_APP_API_HTTP}/api/room/create`;

        const data = {
            // name,
            password,
        };
        // TODO HASHOWANIE HASŁA
        return axios.post(url, data);
    }
}
