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
            brokerURL: 'ws://localhost:8080/room',
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

    sendMessageToMeeting(message: string): void {
        // const url = `localhost:8080`;
        if (this.connected) {
            this.client.publish({
                destination: '/api/chat/send',
                body: JSON.stringify(message),
            });
        }
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

    sendChatMessageWithoutUser(message: string, id: string) : void {
        if (this.connected) {
            this.client.publish({
                destination: `/api/chat/send/${id}`,
                body: message,
            });
        }
    }

    addSubscription(destination: string, callback: (message: IMessage) => void) : void {
        console.log('Subscribe to', destination);
        this.client.subscribe(destination, (message: IMessage) => callback(message));
    }

    static async fetchMeetingDataByID(id: string, password?: string) : Promise<AxiosResponse> {
        // TODO HASHOWANIE HASŁA
        const url = `adres do meeting endpoint/?id=${id}&access=${password}`;

        return axios.get(url);
    }

    // eslint-disable-next-line class-methods-use-this
    static async requestNewMeeting(name: string, password?: string) : Promise<AxiosResponse> {
        // const url = 'tutaj z env';
        const url = 'http://localhost:8080/api/room/create';

        // TODO HASHOWANIE HASŁA
        return axios.post(url, {
            // name,
            // password,
        });
    }
}
